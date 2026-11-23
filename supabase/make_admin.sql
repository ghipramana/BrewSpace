-- Jalankan setelah direct_access.sql dan setelah akun admin terdaftar di Supabase Auth.
-- Ganti EMAIL_ADMIN_KAMU dengan email akun yang akan menjadi admin.
INSERT INTO public.admin_users (user_id)
SELECT id
FROM auth.users
WHERE lower(email) = lower('admin.demo@brewspace.com')
ON CONFLICT (user_id) DO NOTHING;
