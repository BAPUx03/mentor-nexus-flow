import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  BookOpen, 
  Code2, 
  FileText, 
  Clock, 
  User, 
  Sparkles,
  Zap,
  Users,
  Star
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { useTutorials } from "@/hooks/useTutorials";
import { useCodeSnippets } from "@/hooks/useCodeSnippets";

const difficultyColors: Record<string, string> = {
  beginner: "bg-success/10 text-success border-success/20",
  intermediate: "bg-warning/10 text-warning border-warning/20",
  advanced: "bg-destructive/10 text-destructive border-destructive/20",
};

const stats = [
  { icon: BookOpen, value: "50+", label: "Tutorials" },
  { icon: Code2, value: "200+", label: "Snippets" },
  { icon: Users, value: "5K+", label: "Developers" },
  { icon: Star, value: "4.9", label: "Rating" },
];

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
      <section className="relative overflow-hidden hero-pattern">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse-subtle" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent/15 rounded-full blur-3xl animate-pulse-subtle" style={{ animationDelay: '1s' }} />
        
        <div className="container relative mx-auto px-4 py-24 lg:py-36">
          <div className="mx-auto max-w-4xl text-center">
            <div className="animate-fade-in-down">
              <Badge className="mb-6 bg-gradient-primary text-primary-foreground border-0 px-4 py-1.5 text-sm font-medium shadow-glow">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Learn • Build • Master
              </Badge>
            </div>
            
            <h1 className="text-5xl font-heading font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl animate-fade-in-up">
              Level Up Your{" "}
              <span className="text-gradient">Development</span>{" "}
              Skills
            </h1>
            
            <p className="mt-8 text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto animate-fade-in-up stagger-2">
              Discover tutorials, code snippets, and developer resources crafted by experts. 
              Join thousands of developers accelerating their learning journey.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up stagger-3">
              <Button size="lg" className="h-12 px-8 text-base bg-gradient-primary hover:opacity-90 transition-opacity glow-sm group" asChild>
                <Link to="/tutorials">
                  Start Learning
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base border-primary/30 hover:bg-primary/5" asChild>
                <Link to="/code-library">
                  <Code2 className="mr-2 h-4 w-4" />
                  Browse Code Library
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up stagger-4">
              {stats.map((stat, index) => (
                <div 
                  key={stat.label}
                  className="flex flex-col items-center p-4 rounded-xl bg-card/50 backdrop-blur border border-border/50 card-hover"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <stat.icon className="h-6 w-6 text-primary mb-2" />
                  <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tutorials */}
      <section className="container mx-auto px-4 py-20">
        <div className="flex items-center justify-between mb-10">
          <div className="animate-fade-in-up">
            <h2 className="text-3xl font-heading font-bold text-foreground flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              Featured Tutorials
            </h2>
            <p className="text-muted-foreground mt-2">Step-by-step guides to level up your skills</p>
          </div>
          <Button variant="ghost" className="group" asChild>
            <Link to="/tutorials">
              View All
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        {tutorialsLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
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
            {featuredTutorials.map((tutorial, index) => (
              <Link 
                key={tutorial.id} 
                to={`/tutorials/${tutorial.slug}`}
                className="group animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Card className="h-full overflow-hidden card-hover border-border/50 hover:border-primary/50">
                  {tutorial.featured_image ? (
                    <div className="aspect-video overflow-hidden bg-muted">
                      <img
                        src={tutorial.featured_image}
                        alt={tutorial.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-primary/50" />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={difficultyColors[tutorial.difficulty]} variant="outline">
                        {tutorial.difficulty}
                      </Badge>
                      <span className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {tutorial.estimated_minutes} min
                      </span>
                    </div>
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                      {tutorial.title}
                    </CardTitle>
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
          <Card className="py-16 text-center border-dashed">
            <CardContent>
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground text-lg">No tutorials yet</p>
              <p className="text-sm text-muted-foreground mt-1">Check back soon for new content!</p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Featured Blog Posts */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-subtle" />
        <div className="container relative mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div className="animate-fade-in-up">
              <h2 className="text-3xl font-heading font-bold text-foreground flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <FileText className="h-6 w-6 text-accent" />
                </div>
                Latest Blog Posts
              </h2>
              <p className="text-muted-foreground mt-2">Insights and articles from our community</p>
            </div>
            <Button variant="ghost" className="group" asChild>
              <Link to="/blogs">
                View All
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          {blogsLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
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
              {featuredBlogs.map((blog, index) => (
                <Link 
                  key={blog.id} 
                  to={`/blogs/${blog.slug}`}
                  className="group animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Card className="h-full overflow-hidden card-hover border-border/50 hover:border-accent/50 bg-card">
                    {blog.featured_image ? (
                      <div className="aspect-video overflow-hidden bg-muted">
                        <img
                          src={blog.featured_image}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-accent/10 to-primary/10 flex items-center justify-center">
                        <FileText className="h-12 w-12 text-accent/50" />
                      </div>
                    )}
                    <CardHeader>
                      {blog.tags && blog.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {blog.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <CardTitle className="text-lg line-clamp-2 group-hover:text-accent transition-colors">
                        {blog.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {blog.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {blog.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        {blog.author?.full_name || "Anonymous"}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="py-16 text-center border-dashed bg-card">
              <CardContent>
                <FileText className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground text-lg">No blog posts yet</p>
                <p className="text-sm text-muted-foreground mt-1">Check back soon for new content!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Code Snippets Preview */}
      <section className="container mx-auto px-4 py-20">
        <div className="flex items-center justify-between mb-10">
          <div className="animate-fade-in-up">
            <h2 className="text-3xl font-heading font-bold text-foreground flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Code2 className="h-6 w-6 text-success" />
              </div>
              Code Snippets
            </h2>
            <p className="text-muted-foreground mt-2">Ready-to-use code for your projects</p>
          </div>
          <Button variant="ghost" className="group" asChild>
            <Link to="/code-library">
              View All
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
            {featuredSnippets.map((snippet, index) => (
              <Card 
                key={snippet.id} 
                className="card-hover border-border/50 hover:border-success/50 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-foreground truncate">{snippet.title}</h3>
                    <Badge variant="outline" className="text-xs border-success/30 text-success">
                      {snippet.language}
                    </Badge>
                  </div>
                  <pre className="p-4 rounded-lg bg-muted/50 overflow-x-auto max-h-32 scrollbar-thin border border-border/50">
                    <code className="text-xs font-mono text-muted-foreground">{snippet.code.slice(0, 200)}{snippet.code.length > 200 && '...'}</code>
                  </pre>
                  {snippet.tags && snippet.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
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
          <Card className="py-16 text-center border-dashed">
            <CardContent>
              <Code2 className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground text-lg">No code snippets yet</p>
              <p className="text-sm text-muted-foreground mt-1">Check back soon for new content!</p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-95" />
        <div className="absolute inset-0 bg-gradient-glow opacity-50" />
        
        <div className="container relative mx-auto px-4 py-20 text-center">
          <div className="animate-fade-in-up">
            <Zap className="h-12 w-12 mx-auto mb-6 text-primary-foreground/80" />
            <h2 className="text-4xl font-heading font-bold text-primary-foreground mb-4">
              Ready to Start Learning?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto text-lg">
              Join our community of developers and access tutorials, code snippets, and resources to accelerate your growth.
            </p>
            <Button 
              size="lg" 
              variant="secondary" 
              className="h-12 px-8 text-base font-semibold shadow-xl group"
              asChild
            >
              <Link to="/auth?mode=signup">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
