import { useState, useRef, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useCommunityMessages, useSendMessage, useDeleteMessage } from "@/hooks/useCommunityMessages";
import { Send, Trash2, MessageCircle, Users, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Community = () => {
  const { user } = useAuth();
  const { messages, isLoading } = useCommunityMessages();
  const sendMessage = useSendMessage();
  const deleteMessage = useDeleteMessage();
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      await sendMessage.mutateAsync({
        userId: user.id,
        message: newMessage.trim(),
      });
      setNewMessage("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (messageId: string) => {
    try {
      await deleteMessage.mutateAsync(messageId);
      toast({
        title: "Message deleted",
        description: "Your message has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete message.",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Users className="h-4 w-4" />
            Community Chat
          </div>
          <h1 className="text-4xl font-heading font-bold text-foreground mb-4">
            Developer Community
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect with fellow developers, share ideas, ask questions, and learn together.
          </p>
        </div>

        {/* Chat Card */}
        <Card className="border-border/50 shadow-elegant">
          <CardHeader className="border-b border-border/50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                Live Chat
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Live
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Messages Area */}
            <ScrollArea className="h-[500px] p-4" ref={scrollRef}>
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : messages && messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map((msg) => {
                    const isOwn = user?.id === msg.user_id;
                    const profile = msg.profile;
                    
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
                      >
                        <Link to={`/user/${msg.user_id}`}>
                          <Avatar className="h-10 w-10 border-2 border-border hover:border-primary transition-colors">
                            <AvatarImage src={profile?.avatar_url || undefined} />
                            <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs">
                              {getInitials(profile?.full_name)}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                        <div className={`flex-1 max-w-[70%] ${isOwn ? "text-right" : ""}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <Link 
                              to={`/user/${msg.user_id}`}
                              className={`text-sm font-medium text-foreground hover:text-primary transition-colors ${isOwn ? "order-2" : ""}`}
                            >
                              {profile?.full_name || "Anonymous"}
                            </Link>
                            <span className={`text-xs text-muted-foreground ${isOwn ? "order-1" : ""}`}>
                              {format(new Date(msg.created_at), "HH:mm")}
                            </span>
                          </div>
                          <div
                            className={`inline-block rounded-2xl px-4 py-2 ${
                              isOwn
                                ? "bg-primary text-primary-foreground rounded-tr-sm"
                                : "bg-muted text-foreground rounded-tl-sm"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {msg.message}
                            </p>
                          </div>
                          {isOwn && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-1 h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
                              onClick={() => handleDelete(msg.id)}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageCircle className="h-16 w-16 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No messages yet
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Be the first to start the conversation!
                  </p>
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t border-border/50 p-4">
              {user ? (
                <form onSubmit={handleSend} className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1"
                    disabled={sendMessage.isPending}
                  />
                  <Button
                    type="submit"
                    disabled={!newMessage.trim() || sendMessage.isPending}
                    className="bg-gradient-primary"
                  >
                    {sendMessage.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              ) : (
                <div className="text-center py-2">
                  <p className="text-sm text-muted-foreground mb-2">
                    Sign in to join the conversation
                  </p>
                  <Button asChild variant="outline">
                    <Link to="/auth">Sign In</Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Community Guidelines */}
        <div className="mt-8 p-6 rounded-xl bg-muted/50 border border-border/50">
          <h3 className="font-semibold text-foreground mb-3">Community Guidelines</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Be respectful and supportive to fellow developers</li>
            <li>• Keep discussions relevant to development and learning</li>
            <li>• No spam, self-promotion, or inappropriate content</li>
            <li>• Help others when you can — we all learn together!</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default Community;
