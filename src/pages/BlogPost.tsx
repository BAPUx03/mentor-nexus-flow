import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { Calendar, User, ArrowLeft, Bookmark, BookmarkCheck, Share2 } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useBlogPost } from "@/hooks/useBlogPosts";
import { useSavedItems } from "@/hooks/useSavedItems";
import { useAuth } from "@/contexts/AuthContext";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { data: blog, isLoading } = useBlogPost(slug || "");
  const { user } = useAuth();
  const { saveItem, unsaveItem, isItemSaved } = useSavedItems();

  const isSaved = blog ? isItemSaved(blog.id, "blog") : false;

  const handleSaveToggle = async () => {
    if (!blog) return;
    if (isSaved) {
      await unsaveItem(blog.id, "blog");
    } else {
      await saveItem(blog.id, "blog");
    }
  };

  const handleShare = async () => {
    if (navigator.share && blog) {
      await navigator.share({
        title: blog.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="aspect-video w-full mb-8 rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!blog) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-heading font-bold mb-4">Blog post not found</h1>
          <p className="text-muted-foreground mb-8">
            The post you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/blogs">Back to Blogs</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <article className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Back Link */}
        <Link
          to="/blogs"
          className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blogs
        </Link>

        {/* Header */}
        <header className="mb-8">
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {blog.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <h1 className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
            {blog.title}
          </h1>

          {blog.excerpt && (
            <p className="text-xl text-muted-foreground mb-6">{blog.excerpt}</p>
          )}

          {/* Author & Meta */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={blog.author?.avatar_url || undefined} />
                <AvatarFallback>
                  {blog.author?.full_name?.charAt(0) || "A"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">
                  {blog.author?.full_name || "Anonymous"}
                </p>
                {blog.published_at && (
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(blog.published_at), "MMMM d, yyyy")}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {user && (
                <Button variant="outline" size="icon" onClick={handleSaveToggle}>
                  {isSaved ? (
                    <BookmarkCheck className="h-4 w-4 text-primary" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                </Button>
              )}
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {blog.featured_image && (
          <div className="aspect-video overflow-hidden rounded-xl mb-8">
            <img
              src={blog.featured_image}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          {blog.content.split("\n").map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </article>
    </Layout>
  );
}
