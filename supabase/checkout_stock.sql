-- Jalankan sekali di Supabase Dashboard > SQL Editor setelah tabel BrewSpace tersedia.
-- Checkout dibuat sebagai satu transaksi: validasi stok, kurangi stok, simpan pesanan,
-- simpan item pesanan, dan (untuk checkout keranjang) kosongkan keranjang.
-- Skrip ini juga memberi admin akses baca seluruh pesanan dan profil pelanggan.

ALTER TABLE public.orders ALTER COLUMN payment_method SET DEFAULT 'QRIS';

CREATE OR REPLACE FUNCTION public.checkout_order(
  p_order_number TEXT,
  p_shipping_address TEXT,
  p_shipping_phone TEXT,
  p_payment_method TEXT,
  p_notes TEXT,
  p_items JSONB,
  p_clear_cart BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_order public.orders%ROWTYPE;
  v_product public.products%ROWTYPE;
  v_product_id UUID;
  v_quantity INTEGER;
  v_item JSONB;
  v_prepared_item JSONB;
  v_prepared_items JSONB := '[]'::JSONB;
  v_subtotal NUMERIC(12, 2) := 0;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Masuk ke akun sebelum membuat pesanan.';
  END IF;
  IF EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = v_user_id) THEN
    RAISE EXCEPTION 'Akun admin hanya untuk mengelola toko dan tidak dapat memesan produk.';
  END IF;

  IF COALESCE(BTRIM(p_order_number), '') = '' THEN
    RAISE EXCEPTION 'Nomor pesanan tidak valid.';
  END IF;
  IF COALESCE(BTRIM(p_shipping_address), '') = '' OR COALESCE(BTRIM(p_shipping_phone), '') = '' THEN
    RAISE EXCEPTION 'Alamat pengiriman dan nomor telepon wajib diisi.';
  END IF;
  IF jsonb_typeof(p_items) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'Format item pesanan tidak valid.';
  END IF;
  IF jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Keranjang belanja masih kosong.';
  END IF;

  -- Kunci setiap produk saat diperiksa agar dua checkout bersamaan tidak memakai stok yang sama.
  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items) AS entries(value) LOOP
    IF COALESCE(v_item->>'product_id', '') = '' THEN
      RAISE EXCEPTION 'Produk pesanan tidak valid.';
    END IF;
    IF COALESCE(v_item->>'quantity', '') !~ '^[0-9]+$' THEN
      RAISE EXCEPTION 'Jumlah produk harus berupa bilangan bulat positif.';
    END IF;

    v_product_id := (v_item->>'product_id')::UUID;
    v_quantity := (v_item->>'quantity')::INTEGER;
    IF v_quantity < 1 THEN
      RAISE EXCEPTION 'Jumlah produk harus minimal 1.';
    END IF;

    SELECT * INTO v_product
    FROM public.products
    WHERE id = v_product_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Produk tidak ditemukan. Muat ulang katalog lalu coba lagi.';
    END IF;
    IF v_product.stock < v_quantity THEN
      RAISE EXCEPTION 'Stok % tidak cukup. Tersedia %, diminta %.',
        v_product.name, v_product.stock, v_quantity;
    END IF;

    UPDATE public.products
    SET stock = stock - v_quantity
    WHERE id = v_product.id;

    v_subtotal := v_subtotal + (v_product.price * v_quantity);
    v_prepared_items := v_prepared_items || jsonb_build_array(jsonb_build_object(
      'product_id', v_product.id,
      'product_name', v_product.name,
      'price', v_product.price,
      'quantity', v_quantity,
      'grind_option', COALESCE(NULLIF(v_item->>'grind_option', ''), 'Biji Utuh'),
      'subtotal', v_product.price * v_quantity
    ));
  END LOOP;

  INSERT INTO public.orders (
    order_number, user_id, total_amount, status, shipping_address,
    shipping_phone, payment_method, notes
  ) VALUES (
    p_order_number,
    v_user_id,
    v_subtotal + 15000,
    'Diproses',
    p_shipping_address,
    p_shipping_phone,
    COALESCE(NULLIF(p_payment_method, ''), 'QRIS'),
    NULLIF(p_notes, '')
  ) RETURNING * INTO v_order;

  FOR v_prepared_item IN SELECT value FROM jsonb_array_elements(v_prepared_items) AS entries(value) LOOP
    INSERT INTO public.order_items (
      order_id, product_id, product_name, price, quantity, grind_option, subtotal
    ) VALUES (
      v_order.id,
      (v_prepared_item->>'product_id')::UUID,
      v_prepared_item->>'product_name',
      (v_prepared_item->>'price')::NUMERIC,
      (v_prepared_item->>'quantity')::INTEGER,
      v_prepared_item->>'grind_option',
      (v_prepared_item->>'subtotal')::NUMERIC
    );
  END LOOP;

  IF p_clear_cart THEN
    DELETE FROM public.cart_items WHERE user_id = v_user_id;
  END IF;

  RETURN to_jsonb(v_order);
END;
$$;

REVOKE ALL ON FUNCTION public.checkout_order(TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, BOOLEAN) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.checkout_order(TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, BOOLEAN) TO authenticated;

DROP POLICY IF EXISTS "Admins read all orders" ON public.orders;
CREATE POLICY "Admins read all orders"
ON public.orders FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Admins read all order items" ON public.order_items;
CREATE POLICY "Admins read all order items"
ON public.order_items FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.orders
    JOIN public.admin_users ON admin_users.user_id = auth.uid()
    WHERE orders.id = order_items.order_id
  )
);

DROP POLICY IF EXISTS "Admins read all customer profiles" ON public.users;
CREATE POLICY "Admins read all customer profiles"
ON public.users FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid()
  )
);
