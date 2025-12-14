-- Create storage bucket for content uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('content', 'content', true);

-- Create RLS policies for content bucket
CREATE POLICY "Admins can upload content" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'content' AND 
  (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
);

CREATE POLICY "Admins can update content" 
ON storage.objects 
FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'content' AND 
  (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
);

CREATE POLICY "Admins can delete content" 
ON storage.objects 
FOR DELETE 
TO authenticated
USING (
  bucket_id = 'content' AND 
  (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
);

CREATE POLICY "Content is publicly viewable" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'content');