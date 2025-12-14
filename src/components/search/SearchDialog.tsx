import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Search, X, FileText, BookOpen, Code2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { useTutorials } from "@/hooks/useTutorials";
import { useCodeSnippets } from "@/hooks/useCodeSnippets";
import { cn } from "@/lib/utils";

type ContentType = "all" | "blogs" | "tutorials" | "snippets";

interface SearchResult {
  id: string;
  type: "blog" | "tutorial" | "snippet";
  title: string;
  description?: string;
  slug?: string;
  language?: string;
  tags?: string[];
}

export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ContentType>("all");
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: blogs, isLoading: blogsLoading } = useBlogPosts({ published: true });
  const { data: tutorials, isLoading: tutorialsLoading } = useTutorials({ published: true });
  const { data: snippets, isLoading: snippetsLoading } = useCodeSnippets({ published: true });

  const isLoading = blogsLoading || tutorialsLoading || snippetsLoading;

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (!open) {
      setQuery("");
      setFilter("all");
    }
  }, [open]);

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  // Filter and search results
  const searchResults: SearchResult[] = [];

  if (query.trim()) {
    const q = query.toLowerCase();

    if (filter === "all" || filter === "blogs") {
      blogs?.forEach((blog) => {
        if (
          blog.title.toLowerCase().includes(q) ||
          blog.excerpt?.toLowerCase().includes(q) ||
          blog.tags?.some((tag) => tag.toLowerCase().includes(q))
        ) {
          searchResults.push({
            id: blog.id,
            type: "blog",
            title: blog.title,
            description: blog.excerpt || undefined,
            slug: blog.slug,
            tags: blog.tags || undefined,
          });
        }
      });
    }

    if (filter === "all" || filter === "tutorials") {
      tutorials?.forEach((tutorial) => {
        if (
          tutorial.title.toLowerCase().includes(q) ||
          tutorial.description?.toLowerCase().includes(q) ||
          tutorial.tags?.some((tag) => tag.toLowerCase().includes(q))
        ) {
          searchResults.push({
            id: tutorial.id,
            type: "tutorial",
            title: tutorial.title,
            description: tutorial.description || undefined,
            slug: tutorial.slug,
            tags: tutorial.tags || undefined,
          });
        }
      });
    }

    if (filter === "all" || filter === "snippets") {
      snippets?.forEach((snippet) => {
        if (
          snippet.title.toLowerCase().includes(q) ||
          snippet.description?.toLowerCase().includes(q) ||
          snippet.language.toLowerCase().includes(q) ||
          snippet.tags?.some((tag) => tag.toLowerCase().includes(q))
        ) {
          searchResults.push({
            id: snippet.id,
            type: "snippet",
            title: snippet.title,
            description: snippet.description || undefined,
            language: snippet.language,
            tags: snippet.tags || undefined,
          });
        }
      });
    }
  }

  const getResultIcon = (type: "blog" | "tutorial" | "snippet") => {
    switch (type) {
      case "blog":
        return <FileText className="h-4 w-4 text-primary" />;
      case "tutorial":
        return <BookOpen className="h-4 w-4 text-accent" />;
      case "snippet":
        return <Code2 className="h-4 w-4 text-success" />;
    }
  };

  const getResultLink = (result: SearchResult) => {
    switch (result.type) {
      case "blog":
        return `/blogs/${result.slug}`;
      case "tutorial":
        return `/tutorials/${result.slug}`;
      case "snippet":
        return `/code-library`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="sr-only">Search content</DialogTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search blogs, tutorials, snippets..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-10 h-12 text-lg border-0 border-b rounded-none focus-visible:ring-0"
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="p-4 border-b border-border">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as ContentType)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="blogs">
                <FileText className="h-3 w-3 mr-1" />
                Blogs
              </TabsTrigger>
              <TabsTrigger value="tutorials">
                <BookOpen className="h-3 w-3 mr-1" />
                Tutorials
              </TabsTrigger>
              <TabsTrigger value="snippets">
                <Code2 className="h-3 w-3 mr-1" />
                Code
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="max-h-96 overflow-y-auto scrollbar-thin">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : query.trim() === "" ? (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Start typing to search...</p>
              <p className="text-sm mt-2">
                Press <kbd className="px-2 py-0.5 bg-muted rounded text-xs">⌘K</kbd> anytime to open
              </p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No results found for "{query}"</p>
              <p className="text-sm mt-2">Try a different search term or filter</p>
            </div>
          ) : (
            <div className="p-2">
              {searchResults.map((result, index) => (
                <Link
                  key={`${result.type}-${result.id}`}
                  to={getResultLink(result)}
                  onClick={() => onOpenChange(false)}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg transition-all hover:bg-muted group",
                    "animate-fade-in-up"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="mt-0.5">{getResultIcon(result.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                      {result.title}
                    </p>
                    {result.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                        {result.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs capitalize">
                        {result.type}
                      </Badge>
                      {result.language && (
                        <Badge variant="secondary" className="text-xs">
                          {result.language}
                        </Badge>
                      )}
                      {result.tags?.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 border-t border-border bg-muted/30 text-xs text-muted-foreground flex items-center justify-between">
          <span>
            {searchResults.length} result{searchResults.length !== 1 && "s"}
          </span>
          <span className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 bg-background rounded border border-border">↵</kbd>
            to select
            <kbd className="px-1.5 py-0.5 bg-background rounded border border-border">esc</kbd>
            to close
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function SearchButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          "relative h-9 w-full justify-start text-sm text-muted-foreground md:w-64",
          className
        )}
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 mr-2" />
        <span className="hidden lg:inline-flex">Search...</span>
        <span className="lg:hidden">Search</span>
        <kbd className="pointer-events-none absolute right-2 hidden h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <SearchDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
