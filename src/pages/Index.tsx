import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Code2, FileText, Clock, User } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { useTutorials } from "@/hooks/useTutorials";
import { useCodeSnippets } from "@/hooks/useCodeSnippets";

const difficultyColors: Record<string, string> = {
  beginner: "bg-green-500/10 text-green-600 dark:text-green-400",
  intermediate: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  advanced: "bg-red-500/10 text-red-600 dark:text-red-400",
};

const Index = () => {
  const { data: blogs, isLoading: blogsLoading } = useBlogPosts({ published: true });
  const { data: tutorials, isLoading: tutorialsLoading } = useTutorials({ published: true });
  const { data: snippets, isLoading: snippetsLoading } = useCodeSnippets({ published: true });

  const featuredBlogs = blogs?.slice(0, 3) || [];
  const featuredTutorials = tutorials?.slice(0, 3) || [];
  const featuredSnippets = snippets?.slice(0, 4) || [];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container mx-auto px-4 py-24 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4">
              Learn • Build • Share
            </Badge>
            <h1 className="text-4xl font-heading font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Master Development with{" "}
              <span className="text-primary">DevLearn</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Your comprehensive platform for tutorials, code snippets, and developer resources. 
              Learn from experts and level up your skills.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/tutorials">
                  Start Learning
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/code-library">Browse Code Library</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tutorials */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              Featured Tutorials
            </h2>
            <p className="text-muted-foreground mt-1">Step-by-step guides to level up your skills</p>
          </div>
          <Button variant="ghost" asChild>
            <Link to="/tutorials">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {tutorialsLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : featuredTutorials.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredTutorials.map((tutorial) => (
              <Link key={tutorial.id} to={`/tutorials/${tutorial.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow hover:border-primary/50">
                  {tutorial.featured_image && (
                    <div className="aspect-video overflow-hidden rounded-t-lg">
                      <img
                        src={tutorial.featured_image}
                        alt={tutorial.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={difficultyColors[tutorial.difficulty]}>
                        {tutorial.difficulty}
                      </Badge>
                      <span className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {tutorial.estimated_minutes} min
                      </span>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{tutorial.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {tutorial.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {tutorial.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="py-12 text-center">
            <CardContent>
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No tutorials yet. Check back soon!</p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Featured Blog Posts */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                Latest Blog Posts
              </h2>
              <p className="text-muted-foreground mt-1">Insights and articles from our community</p>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/blogs">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {blogsLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : featuredBlogs.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredBlogs.map((blog) => (
                <Link key={blog.id} to={`/blogs/${blog.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow hover:border-primary/50">
                    {blog.featured_image && (
                      <div className="aspect-video overflow-hidden rounded-t-lg">
                        <img
                          src={blog.featured_image}
                          alt={blog.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      {blog.tags && blog.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {blog.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <CardTitle className="text-lg line-clamp-2">{blog.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {blog.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {blog.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        {blog.author?.full_name || "Anonymous"}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="py-12 text-center">
              <CardContent>
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No blog posts yet. Check back soon!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Code Snippets Preview */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
              <Code2 className="h-6 w-6 text-primary" />
              Code Snippets
            </h2>
            <p className="text-muted-foreground mt-1">Ready-to-use code for your projects</p>
          </div>
          <Button variant="ghost" asChild>
            <Link to="/code-library">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {snippetsLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-5 w-1/2 mb-2" />
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : featuredSnippets.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {featuredSnippets.map((snippet) => (
              <Card key={snippet.id} className="hover:shadow-lg transition-shadow hover:border-primary/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-foreground truncate">{snippet.title}</h3>
                    <Badge variant="outline">{snippet.language}</Badge>
                  </div>
                  <pre className="p-3 rounded-lg bg-muted overflow-x-auto max-h-32">
                    <code className="text-xs font-mono">{snippet.code.slice(0, 200)}{snippet.code.length > 200 && '...'}</code>
                  </pre>
                  {snippet.tags && snippet.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {snippet.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="py-12 text-center">
            <CardContent>
              <Code2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No code snippets yet. Check back soon!</p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-heading font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Join our community of developers and access tutorials, code snippets, and resources.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/auth?mode=signup">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
