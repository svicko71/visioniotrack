
ALTER TABLE public.missing_cases 
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS gender text DEFAULT 'unknown';
