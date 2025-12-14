-- Add preview_image and custom_link columns to code_snippets
ALTER TABLE public.code_snippets 
ADD COLUMN preview_image TEXT,
ADD COLUMN custom_link TEXT;