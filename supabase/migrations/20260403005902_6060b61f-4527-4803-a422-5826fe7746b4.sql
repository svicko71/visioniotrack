
ALTER TABLE public.missing_cases ADD COLUMN national_id text;
ALTER TABLE public.missing_cases ADD COLUMN video_url text;

INSERT INTO storage.buckets (id, name, public) VALUES ('case-videos', 'case-videos', true);

CREATE POLICY "Anyone can view case videos" ON storage.objects FOR SELECT USING (bucket_id = 'case-videos');
CREATE POLICY "Authenticated users can upload case videos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'case-videos' AND auth.role() = 'authenticated');
