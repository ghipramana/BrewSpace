-- Jalankan sekali di Supabase Dashboard > SQL Editor untuk mengaktifkan ulasan.
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name text NOT NULL DEFAULT 'Pelanggan',
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text NOT NULL CHECK (char_length(trim(comment)) BETWEEN 1 AND 1000),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, user_id)
);

ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read product reviews" ON public.product_reviews;
CREATE POLICY "Anyone can read product reviews"
  ON public.product_reviews FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Customers can create their own product review" ON public.product_reviews;
CREATE POLICY "Customers can create their own product review"
  ON public.product_reviews FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Customers can update their own product review" ON public.product_reviews;
CREATE POLICY "Customers can update their own product review"
  ON public.product_reviews FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

GRANT SELECT ON public.product_reviews TO anon, authenticated;
GRANT INSERT, UPDATE ON public.product_reviews TO authenticated;
