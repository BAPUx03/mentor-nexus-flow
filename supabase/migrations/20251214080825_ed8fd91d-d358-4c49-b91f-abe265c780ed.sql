-- Create message reactions table
CREATE TABLE public.message_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.community_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

-- Enable Row Level Security
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

-- Create policies for reactions
CREATE POLICY "Anyone can view reactions" 
ON public.message_reactions 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can add reactions" 
ON public.message_reactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own reactions" 
ON public.message_reactions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create blocked users table for chat
CREATE TABLE public.chat_blocked_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  blocked_by UUID NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.chat_blocked_users ENABLE ROW LEVEL SECURITY;

-- Create policies for blocked users
CREATE POLICY "Anyone can view blocked users" 
ON public.chat_blocked_users 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage blocked users" 
ON public.chat_blocked_users 
FOR ALL 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

-- Enable realtime for reactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;