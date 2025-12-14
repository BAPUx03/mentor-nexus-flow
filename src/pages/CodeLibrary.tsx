import { useState } from "react";
import { User, Copy, Check, Bookmark, BookmarkCheck, ExternalLink } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCodeSnippets } from "@/hooks/useCodeSnippets";
import { useSavedItems } from "@/hooks/useSavedItems";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const LANGUAGES = [
  "all",
  "javascript",
  "typescript",
  "python",
  "rust",
  "go",
  "java",
  "csharp",
  "cpp",
  "php",
  "ruby",
  "swift",
  "sql",
  "bash",
];

export default function CodeLibrary() {
  const [language, setLanguage] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: snippets, isLoading } = useCodeSnippets({
    published: true,
    language: language === "all" ? undefined : language,
  });
  const { saveItem, unsaveItem, isItemSaved } = useSavedItems();

  const handleCopy = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveToggle = async (snippetId: string) => {
    if (isItemSaved(snippetId, "code_snippet")) {
      await unsaveItem(snippetId, "code_snippet");
    } else {
      await saveItem(snippetId, "code_snippet");
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-heading font-bold text-foreground mb-2">
              Code Library
            </h1>
            <p className="text-lg text-muted-foreground">
              Reusable code snippets for your projects.
            </p>
          </div>

          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by language" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang === "all" ? "All Languages" : lang.charAt(0).toUpperCase() + lang.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Snippets Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : snippets && snippets.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {snippets.map((snippet) => (
              <Card key={snippet.id} className="flex flex-col overflow-hidden">
                {snippet.preview_image && (
                  <div className="relative h-48 w-full overflow-hidden">
                    <img
                      src={snippet.preview_image}
                      alt={snippet.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg line-clamp-1">{snippet.title}</CardTitle>
                      {snippet.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {snippet.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{snippet.language}</Badge>
                      {snippet.custom_link && (
                        <Button
                          variant="default"
                          size="sm"
                          asChild
                        >
                          <a href={snippet.custom_link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Live
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="relative flex-1 mb-4">
                    <pre className="p-4 rounded-lg bg-muted overflow-x-auto max-h-64 scrollbar-thin">
                      <code className="text-sm font-mono">{snippet.code}</code>
                    </pre>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={() => handleCopy(snippet.code, snippet.id)}
                    >
                      {copiedId === snippet.id ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {snippet.tags && snippet.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {snippet.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="flex items-center text-xs text-muted-foreground">
                      <User className="h-3 w-3 mr-1" />
                      {snippet.author?.full_name || "Anonymous"}
                    </span>
                    {user && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSaveToggle(snippet.id)}
                      >
                        {isItemSaved(snippet.id, "code_snippet") ? (
                          <BookmarkCheck className="h-4 w-4 text-primary" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No code snippets found.</p>
            <p className="text-muted-foreground text-sm mt-2">
              {language !== "all" ? "Try a different language filter." : "Check back soon for new content!"}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
