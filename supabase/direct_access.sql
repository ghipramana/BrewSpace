-- Jalankan sekali di Supabase Dashboard > SQL Editor setelah schema.sql.
-- Aplikasi BrewSpace berbicara langsung ke Supabase dari satu PWA.

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.categories, public.products TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT SELECT, UPDATE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items, public.favorites, public.orders TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.order_items TO authenticated;

DROP POLICY IF EXISTS "Authenticated users manage products" ON public.products;
CREATE POLICY "Authenticated users manage products"
ON public.products FOR ALL TO authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users insert own profile" ON public.users;
CREATE POLICY "Users insert own profile"
ON public.users FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

-- Pesanan hanya dapat dibuat untuk akun yang sedang masuk.
DROP POLICY IF EXISTS "Users create own orders" ON public.orders;
CREATE POLICY "Users create own orders"
ON public.orders FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Hak SELECT/INSERT order_items sudah diatur policy di schema.sql.
