-- Jalankan sekali di Supabase SQL Editor setelah direct_access.sql.
-- Membatasi data pesanan dan pelanggan tetap hanya untuk halaman admin.

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
