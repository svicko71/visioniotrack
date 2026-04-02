
-- Create missing_cases table
CREATE TABLE public.missing_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  age TEXT,
  last_seen TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'found', 'urgent')),
  photo_url TEXT,
  reported_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.missing_cases ENABLE ROW LEVEL SECURITY;

-- Everyone can view cases
CREATE POLICY "Anyone can view cases" ON public.missing_cases FOR SELECT USING (true);

-- Authenticated users can create cases
CREATE POLICY "Authenticated users can create cases" ON public.missing_cases FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own cases
CREATE POLICY "Users can update own cases" ON public.missing_cases FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own cases
CREATE POLICY "Users can delete own cases" ON public.missing_cases FOR DELETE USING (auth.uid() = user_id);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_missing_cases_updated_at
  BEFORE UPDATE ON public.missing_cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for case photos
INSERT INTO storage.buckets (id, name, public) VALUES ('case-photos', 'case-photos', true);

-- Storage policies
CREATE POLICY "Case photos are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'case-photos');

CREATE POLICY "Authenticated users can upload case photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'case-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own case photos" ON storage.objects FOR DELETE USING (bucket_id = 'case-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
