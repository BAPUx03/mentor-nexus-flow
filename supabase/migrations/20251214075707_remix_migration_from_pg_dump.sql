CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role text) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: blog_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    author_id uuid NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    excerpt text,
    content text NOT NULL,
    featured_image text,
    tags text[] DEFAULT '{}'::text[],
    published boolean DEFAULT false,
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: code_snippets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.code_snippets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    author_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    code text NOT NULL,
    language text DEFAULT 'javascript'::text NOT NULL,
    tags text[] DEFAULT '{}'::text[],
    published boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    content_type text NOT NULL,
    content_id uuid NOT NULL,
    comment_text text NOT NULL,
    parent_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT comments_content_type_check CHECK ((content_type = ANY (ARRAY['blog'::text, 'tutorial'::text])))
);


--
-- Name: material_purchases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.material_purchases (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    material_id uuid NOT NULL,
    transaction_id text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    admin_notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    approved_at timestamp with time zone,
    approved_by uuid,
    CONSTRAINT material_purchases_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])))
);


--
-- Name: materials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.materials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    category text NOT NULL,
    external_link text NOT NULL,
    thumbnail_url text,
    is_paid boolean DEFAULT false NOT NULL,
    price numeric(10,2) DEFAULT 0,
    upi_id text,
    qr_code_url text,
    author_id uuid NOT NULL,
    published boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT materials_category_check CHECK ((category = ANY (ARRAY['editing'::text, 'video'::text, 'graphics'::text, 'apps'::text, 'other'::text])))
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    email text,
    full_name text,
    avatar_url text,
    bio text,
    skills text[],
    interests text[],
    skill_level text,
    learning_goals text[],
    onboarding_completed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT profiles_skill_level_check CHECK ((skill_level = ANY (ARRAY['beginner'::text, 'intermediate'::text, 'advanced'::text])))
);


--
-- Name: saved_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.saved_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    item_type text NOT NULL,
    item_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT saved_items_item_type_check CHECK ((item_type = ANY (ARRAY['blog'::text, 'tutorial'::text, 'code_snippet'::text, 'api'::text])))
);


--
-- Name: tutorial_steps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tutorial_steps (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tutorial_id uuid NOT NULL,
    step_order integer NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    code_example text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: tutorials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tutorials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    author_id uuid NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    description text,
    difficulty text DEFAULT 'beginner'::text NOT NULL,
    estimated_minutes integer DEFAULT 30,
    featured_image text,
    tags text[] DEFAULT '{}'::text[],
    published boolean DEFAULT false,
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT tutorials_difficulty_check CHECK ((difficulty = ANY (ARRAY['beginner'::text, 'intermediate'::text, 'advanced'::text])))
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role text DEFAULT 'user'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT user_roles_role_check CHECK ((role = ANY (ARRAY['user'::text, 'admin'::text, 'super_admin'::text])))
);


--
-- Name: blog_posts blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (id);


--
-- Name: blog_posts blog_posts_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_slug_key UNIQUE (slug);


--
-- Name: code_snippets code_snippets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.code_snippets
    ADD CONSTRAINT code_snippets_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: material_purchases material_purchases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.material_purchases
    ADD CONSTRAINT material_purchases_pkey PRIMARY KEY (id);


--
-- Name: materials materials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.materials
    ADD CONSTRAINT materials_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: saved_items saved_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_items
    ADD CONSTRAINT saved_items_pkey PRIMARY KEY (id);


--
-- Name: saved_items saved_items_user_id_item_type_item_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_items
    ADD CONSTRAINT saved_items_user_id_item_type_item_id_key UNIQUE (user_id, item_type, item_id);


--
-- Name: tutorial_steps tutorial_steps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tutorial_steps
    ADD CONSTRAINT tutorial_steps_pkey PRIMARY KEY (id);


--
-- Name: tutorial_steps tutorial_steps_tutorial_id_step_order_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tutorial_steps
    ADD CONSTRAINT tutorial_steps_tutorial_id_step_order_key UNIQUE (tutorial_id, step_order);


--
-- Name: tutorials tutorials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tutorials
    ADD CONSTRAINT tutorials_pkey PRIMARY KEY (id);


--
-- Name: tutorials tutorials_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tutorials
    ADD CONSTRAINT tutorials_slug_key UNIQUE (slug);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_key UNIQUE (user_id);


--
-- Name: idx_comments_content; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_comments_content ON public.comments USING btree (content_type, content_id);


--
-- Name: idx_comments_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_comments_user ON public.comments USING btree (user_id);


--
-- Name: idx_material_purchases_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_material_purchases_status ON public.material_purchases USING btree (status);


--
-- Name: idx_materials_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_materials_category ON public.materials USING btree (category);


--
-- Name: blog_posts update_blog_posts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: code_snippets update_code_snippets_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_code_snippets_updated_at BEFORE UPDATE ON public.code_snippets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: comments update_comments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: materials update_materials_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON public.materials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: tutorial_steps update_tutorial_steps_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_tutorial_steps_updated_at BEFORE UPDATE ON public.tutorial_steps FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: tutorials update_tutorials_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_tutorials_updated_at BEFORE UPDATE ON public.tutorials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: blog_posts blog_posts_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: code_snippets code_snippets_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.code_snippets
    ADD CONSTRAINT code_snippets_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: comments comments_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.comments(id) ON DELETE CASCADE;


--
-- Name: comments comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: material_purchases material_purchases_material_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.material_purchases
    ADD CONSTRAINT material_purchases_material_id_fkey FOREIGN KEY (material_id) REFERENCES public.materials(id) ON DELETE CASCADE;


--
-- Name: material_purchases material_purchases_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.material_purchases
    ADD CONSTRAINT material_purchases_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: saved_items saved_items_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_items
    ADD CONSTRAINT saved_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: tutorial_steps tutorial_steps_tutorial_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tutorial_steps
    ADD CONSTRAINT tutorial_steps_tutorial_id_fkey FOREIGN KEY (tutorial_id) REFERENCES public.tutorials(id) ON DELETE CASCADE;


--
-- Name: tutorials tutorials_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tutorials
    ADD CONSTRAINT tutorials_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: blog_posts Admins can manage all blogs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all blogs" ON public.blog_posts USING ((public.has_role(auth.uid(), 'admin'::text) OR public.has_role(auth.uid(), 'super_admin'::text)));


--
-- Name: comments Admins can manage all comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all comments" ON public.comments USING ((public.has_role(auth.uid(), 'admin'::text) OR public.has_role(auth.uid(), 'super_admin'::text)));


--
-- Name: materials Admins can manage all materials; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all materials" ON public.materials USING ((public.has_role(auth.uid(), 'admin'::text) OR public.has_role(auth.uid(), 'super_admin'::text)));


--
-- Name: code_snippets Admins can manage all snippets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all snippets" ON public.code_snippets USING ((public.has_role(auth.uid(), 'admin'::text) OR public.has_role(auth.uid(), 'super_admin'::text)));


--
-- Name: tutorial_steps Admins can manage all tutorial steps; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all tutorial steps" ON public.tutorial_steps USING ((public.has_role(auth.uid(), 'admin'::text) OR public.has_role(auth.uid(), 'super_admin'::text)));


--
-- Name: tutorials Admins can manage all tutorials; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all tutorials" ON public.tutorials USING ((public.has_role(auth.uid(), 'admin'::text) OR public.has_role(auth.uid(), 'super_admin'::text)));


--
-- Name: material_purchases Admins can update purchases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update purchases" ON public.material_purchases FOR UPDATE USING ((public.has_role(auth.uid(), 'admin'::text) OR public.has_role(auth.uid(), 'super_admin'::text)));


--
-- Name: material_purchases Admins can view all purchases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all purchases" ON public.material_purchases FOR SELECT USING ((public.has_role(auth.uid(), 'admin'::text) OR public.has_role(auth.uid(), 'super_admin'::text)));


--
-- Name: user_roles Admins can view all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.user_roles user_roles_1
  WHERE ((user_roles_1.user_id = auth.uid()) AND (user_roles_1.role = ANY (ARRAY['admin'::text, 'super_admin'::text]))))));


--
-- Name: comments Anyone can view comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view comments" ON public.comments FOR SELECT USING (true);


--
-- Name: comments Authenticated users can create comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can create comments" ON public.comments FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: blog_posts Authors can create blogs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authors can create blogs" ON public.blog_posts FOR INSERT WITH CHECK ((auth.uid() = author_id));


--
-- Name: code_snippets Authors can create snippets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authors can create snippets" ON public.code_snippets FOR INSERT WITH CHECK ((auth.uid() = author_id));


--
-- Name: tutorials Authors can create tutorials; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authors can create tutorials" ON public.tutorials FOR INSERT WITH CHECK ((auth.uid() = author_id));


--
-- Name: blog_posts Authors can delete their own blogs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authors can delete their own blogs" ON public.blog_posts FOR DELETE USING ((auth.uid() = author_id));


--
-- Name: code_snippets Authors can delete their own snippets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authors can delete their own snippets" ON public.code_snippets FOR DELETE USING ((auth.uid() = author_id));


--
-- Name: tutorials Authors can delete their own tutorials; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authors can delete their own tutorials" ON public.tutorials FOR DELETE USING ((auth.uid() = author_id));


--
-- Name: tutorial_steps Authors can manage their tutorial steps; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authors can manage their tutorial steps" ON public.tutorial_steps USING ((EXISTS ( SELECT 1
   FROM public.tutorials
  WHERE ((tutorials.id = tutorial_steps.tutorial_id) AND (tutorials.author_id = auth.uid())))));


--
-- Name: blog_posts Authors can update their own blogs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authors can update their own blogs" ON public.blog_posts FOR UPDATE USING ((auth.uid() = author_id));


--
-- Name: code_snippets Authors can update their own snippets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authors can update their own snippets" ON public.code_snippets FOR UPDATE USING ((auth.uid() = author_id));


--
-- Name: tutorials Authors can update their own tutorials; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authors can update their own tutorials" ON public.tutorials FOR UPDATE USING ((auth.uid() = author_id));


--
-- Name: blog_posts Authors can view their own blogs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authors can view their own blogs" ON public.blog_posts FOR SELECT USING ((auth.uid() = author_id));


--
-- Name: materials Authors can view their own materials; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authors can view their own materials" ON public.materials FOR SELECT USING ((auth.uid() = author_id));


--
-- Name: code_snippets Authors can view their own snippets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authors can view their own snippets" ON public.code_snippets FOR SELECT USING ((auth.uid() = author_id));


--
-- Name: tutorials Authors can view their own tutorials; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authors can view their own tutorials" ON public.tutorials FOR SELECT USING ((auth.uid() = author_id));


--
-- Name: tutorial_steps Authors can view their tutorial steps; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authors can view their tutorial steps" ON public.tutorial_steps FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.tutorials
  WHERE ((tutorials.id = tutorial_steps.tutorial_id) AND (tutorials.author_id = auth.uid())))));


--
-- Name: profiles Public profiles are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);


--
-- Name: blog_posts Published blogs are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Published blogs are viewable by everyone" ON public.blog_posts FOR SELECT USING ((published = true));


--
-- Name: materials Published materials are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Published materials are viewable by everyone" ON public.materials FOR SELECT USING ((published = true));


--
-- Name: code_snippets Published snippets are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Published snippets are viewable by everyone" ON public.code_snippets FOR SELECT USING ((published = true));


--
-- Name: tutorials Published tutorials are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Published tutorials are viewable by everyone" ON public.tutorials FOR SELECT USING ((published = true));


--
-- Name: tutorial_steps Steps of published tutorials are viewable; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Steps of published tutorials are viewable" ON public.tutorial_steps FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.tutorials
  WHERE ((tutorials.id = tutorial_steps.tutorial_id) AND (tutorials.published = true)))));


--
-- Name: user_roles Super admins can manage roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins can manage roles" ON public.user_roles USING ((EXISTS ( SELECT 1
   FROM public.user_roles user_roles_1
  WHERE ((user_roles_1.user_id = auth.uid()) AND (user_roles_1.role = 'super_admin'::text)))));


--
-- Name: material_purchases Users can create purchases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create purchases" ON public.material_purchases FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: comments Users can delete their own comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own comments" ON public.comments FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: saved_items Users can delete their own saved items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own saved items" ON public.saved_items FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: saved_items Users can save items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can save items" ON public.saved_items FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: comments Users can update their own comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own comments" ON public.comments FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: material_purchases Users can view their own purchases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own purchases" ON public.material_purchases FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_roles Users can view their own role; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own role" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: saved_items Users can view their own saved items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own saved items" ON public.saved_items FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: blog_posts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

--
-- Name: code_snippets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.code_snippets ENABLE ROW LEVEL SECURITY;

--
-- Name: comments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

--
-- Name: material_purchases; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.material_purchases ENABLE ROW LEVEL SECURITY;

--
-- Name: materials; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: saved_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;

--
-- Name: tutorial_steps; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tutorial_steps ENABLE ROW LEVEL SECURITY;

--
-- Name: tutorials; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tutorials ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


