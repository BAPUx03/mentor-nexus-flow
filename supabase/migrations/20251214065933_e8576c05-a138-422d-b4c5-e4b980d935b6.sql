-- Blog posts table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  tags TEXT[] DEFAULT '{}',
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tutorials table
CREATE TABLE public.tutorials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  difficulty TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  estimated_minutes INTEGER DEFAULT 30,
  featured_image TEXT,
  tags TEXT[] DEFAULT '{}',
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tutorial steps/lessons
CREATE TABLE public.tutorial_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tutorial_id UUID NOT NULL REFERENCES public.tutorials(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  code_example TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tutorial_id, step_order)
);

-- Code snippets table
CREATE TABLE public.code_snippets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  code TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'javascript',
  tags TEXT[] DEFAULT '{}',
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorial_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.code_snippets ENABLE ROW LEVEL SECURITY;

-- Blog posts policies
CREATE POLICY "Published blogs are viewable by everyone" ON public.blog_posts
  FOR SELECT USING (published = true);

CREATE POLICY "Authors can view their own blogs" ON public.blog_posts
  FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Authors can create blogs" ON public.blog_posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own blogs" ON public.blog_posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own blogs" ON public.blog_posts
  FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "Admins can manage all blogs" ON public.blog_posts
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Tutorials policies
CREATE POLICY "Published tutorials are viewable by everyone" ON public.tutorials
  FOR SELECT USING (published = true);

CREATE POLICY "Authors can view their own tutorials" ON public.tutorials
  FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Authors can create tutorials" ON public.tutorials
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own tutorials" ON public.tutorials
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own tutorials" ON public.tutorials
  FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "Admins can manage all tutorials" ON public.tutorials
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Tutorial steps policies
CREATE POLICY "Steps of published tutorials are viewable" ON public.tutorial_steps
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.tutorials WHERE id = tutorial_id AND published = true)
  );

CREATE POLICY "Authors can view their tutorial steps" ON public.tutorial_steps
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.tutorials WHERE id = tutorial_id AND author_id = auth.uid())
  );

CREATE POLICY "Authors can manage their tutorial steps" ON public.tutorial_steps
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.tutorials WHERE id = tutorial_id AND author_id = auth.uid())
  );

CREATE POLICY "Admins can manage all tutorial steps" ON public.tutorial_steps
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Code snippets policies
CREATE POLICY "Published snippets are viewable by everyone" ON public.code_snippets
  FOR SELECT USING (published = true);

CREATE POLICY "Authors can view their own snippets" ON public.code_snippets
  FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Authors can create snippets" ON public.code_snippets
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own snippets" ON public.code_snippets
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own snippets" ON public.code_snippets
  FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "Admins can manage all snippets" ON public.code_snippets
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Triggers for updated_at
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tutorials_updated_at
  BEFORE UPDATE ON public.tutorials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tutorial_steps_updated_at
  BEFORE UPDATE ON public.tutorial_steps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_code_snippets_updated_at
  BEFORE UPDATE ON public.code_snippets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();