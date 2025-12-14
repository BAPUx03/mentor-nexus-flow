import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Calendar, User, ArrowRight, Tag } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBlogPosts } from "@/hooks/useBlogPosts";

export default function Blogs() {
  const { data: blogs, isLoading } = useBlogPosts({ published: true });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-4">
            Developer Blog
          </h1>
          <p className="text-lg text-muted-foreground">
            Insights, tutorials, and updates from the developer community.
          </p>
        </div>

        {/* Blog Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-48 w-full rounded-lg" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : blogs && blogs.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <Link key={blog.id} to={`/blogs/${blog.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow group">
                  {blog.featured_image && (
                    <div className="aspect-video overflow-hidden rounded-t-lg">
                      <img
                        src={blog.featured_image}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    {blog.tags && blog.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {blog.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <h2 className="text-xl font-heading font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {blog.title}
                    </h2>

                    {blog.excerpt && (
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {blog.excerpt}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {blog.author?.full_name || "Anonymous"}
                        </span>
                        {blog.published_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(blog.published_at), "MMM d, yyyy")}
                          </span>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No blog posts published yet.</p>
            <p className="text-muted-foreground text-sm mt-2">Check back soon for new content!</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
