import { useState } from "react";
import { Bot, Send, Sparkles, ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface AIHeroSectionProps {
  onOpenChat: () => void;
}

const examplePrompts = [
  "How do I center a div in CSS?",
  "Explain async/await in JavaScript",
  "Best practices for React hooks",
  "Debug my code",
];

export const AIHeroSection = ({ onOpenChat }: AIHeroSectionProps) => {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (prompt?: string) => {
    // Store the prompt for the chat widget to pick up
    const messageToSend = prompt || inputValue;
    if (messageToSend.trim()) {
      localStorage.setItem("pendingAIMessage", messageToSend);
    }
    onOpenChat();
    setInputValue("");
  };

  return (
    <section className="relative overflow-hidden py-16">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-accent/5 to-transparent" />
      <div className="absolute top-10 left-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl animate-pulse-subtle" />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-pulse-subtle" style={{ animationDelay: "1s" }} />
      
      <div className="container relative mx-auto px-4">
        <Card className="max-w-3xl mx-auto border-primary/20 bg-card/80 backdrop-blur-sm shadow-xl animate-fade-in-up">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="p-3 rounded-xl bg-gradient-primary">
                  <Bot className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>
              <Badge className="mb-3 bg-gradient-primary text-primary-foreground border-0">
                <Sparkles className="h-3 w-3 mr-1" />
                AI-Powered Mentor
              </Badge>
              <h2 className="text-3xl font-heading font-bold text-foreground mb-2">
                Meet Your Coding Mentor
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Get instant help with coding questions, debugging, and learning new concepts. 
                Our AI assistant is here to accelerate your learning journey.
              </p>
            </div>

            {/* Input Area */}
            <div className="flex gap-2 mb-6">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything about coding..."
                className="h-12 text-base"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit();
                }}
              />
              <Button 
                onClick={() => handleSubmit()} 
                size="lg" 
                className="h-12 px-6 bg-gradient-primary hover:opacity-90"
              >
                <Send className="h-4 w-4 mr-2" />
                Ask
              </Button>
            </div>

            {/* Example Prompts */}
            <div className="flex flex-wrap gap-2 justify-center">
              <span className="text-sm text-muted-foreground">Try:</span>
              {examplePrompts.map((prompt) => (
                <Button
                  key={prompt}
                  variant="outline"
                  size="sm"
                  className="text-xs hover:bg-primary/10 hover:border-primary/50"
                  onClick={() => handleSubmit(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>

            {/* Full Chat CTA */}
            <div className="mt-6 pt-6 border-t text-center">
              <Button
                variant="ghost"
                className="text-primary group"
                onClick={onOpenChat}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Open Full Chat Experience
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
