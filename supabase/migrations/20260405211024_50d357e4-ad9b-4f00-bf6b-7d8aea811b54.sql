CREATE TABLE public.classifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  image_url TEXT,
  predicted_class TEXT NOT NULL,
  confidence NUMERIC NOT NULL,
  model_used TEXT DEFAULT 'gemini-3-flash-preview',
  all_predictions JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.classifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view classifications" ON public.classifications FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can create classifications" ON public.classifications FOR INSERT TO public WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own classifications" ON public.classifications FOR DELETE TO public USING (auth.uid() = user_id);