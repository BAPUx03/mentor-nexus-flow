import { Link } from "react-router-dom";
import { FileText, BookOpen, Code2, Users, TrendingUp, Eye } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { useTutorials } from "@/hooks/useTutorials";
import { useCodeSnippets } from "@/hooks/useCodeSnippets";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data: blogs } = useBlogPosts({ authorId: user?.id });
  const { data: tutorials } = useTutorials({ authorId: user?.id });
  const { data: snippets } = useCodeSnippets({ authorId: user?.id });

  const stats = [
    {
      name: "Blog Posts",
      value: blogs?.length || 0,
      published: blogs?.filter((b) => b.published).length || 0,
      icon: FileText,
      href: "/admin/blogs",
      color: "text-blue-500",
    },
    {
      name: "Tutorials",
      value: tutorials?.length || 0,
      published: tutorials?.filter((t) => t.published).length || 0,
      icon: BookOpen,
      href: "/admin/tutorials",
      color: "text-green-500",
    },
    {
      name: "Code Snippets",
      value: snippets?.length || 0,
      published: snippets?.filter((s) => s.published).length || 0,
      icon: Code2,
      href: "/admin/snippets",
      color: "text-purple-500",
    },
  ];

  return (
    <AdminLayout title="Dashboard" description="Overview of your content and activity">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.name}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.published} published
              </p>
              <Button variant="link" asChild className="px-0 mt-2">
                <Link to={stat.href}>Manage →</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-heading font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/admin/blogs">
              <FileText className="h-4 w-4 mr-2" />
              New Blog Post
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/admin/tutorials">
              <BookOpen className="h-4 w-4 mr-2" />
              New Tutorial
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/admin/snippets">
              <Code2 className="h-4 w-4 mr-2" />
              New Snippet
            </Link>
          </Button>
        </div>
      </div>

      {/* Recent Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Blogs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-heading">Recent Blog Posts</CardTitle>
          </CardHeader>
          <CardContent>
            {blogs && blogs.length > 0 ? (
              <div className="space-y-3">
                {blogs.slice(0, 5).map((blog) => (
                  <div
                    key={blog.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="truncate">
                      <p className="font-medium truncate">{blog.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {blog.published ? "Published" : "Draft"}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/blogs/${blog.slug}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No blog posts yet</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Tutorials */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-heading">Recent Tutorials</CardTitle>
          </CardHeader>
          <CardContent>
            {tutorials && tutorials.length > 0 ? (
              <div className="space-y-3">
                {tutorials.slice(0, 5).map((tutorial) => (
                  <div
                    key={tutorial.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="truncate">
                      <p className="font-medium truncate">{tutorial.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {tutorial.difficulty} • {tutorial.estimated_minutes} min
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/tutorials/${tutorial.slug}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No tutorials yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
