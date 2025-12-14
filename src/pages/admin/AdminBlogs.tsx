import { useState } from "react";
import { Plus } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ContentTable } from "@/components/admin/ContentTable";
import { BlogEditor } from "@/components/admin/BlogEditor";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useBlogPosts, useBlogPostMutations, type BlogPost } from "@/hooks/useBlogPosts";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminBlogs() {
  const { user } = useAuth();
  const { data: blogs, isLoading } = useBlogPosts({ authorId: user?.id });
  const { createPost, updatePost, deletePost } = useBlogPostMutations();

  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);

  const handleCreate = () => {
    setSelectedPost(null);
    setEditorOpen(true);
  };

  const handleEdit = (post: BlogPost) => {
    setSelectedPost(post);
    setEditorOpen(true);
  };

  const handleDelete = (post: BlogPost) => {
    setPostToDelete(post);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (postToDelete) {
      deletePost.mutate(postToDelete.id);
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    }
  };

  const handleTogglePublish = (post: BlogPost) => {
    updatePost.mutate({ id: post.id, published: !post.published });
  };

  const handleSave = (data: { title: string; slug: string; excerpt?: string; content: string; featured_image?: string; published: boolean; tags: string[] }) => {
    if (selectedPost) {
      updatePost.mutate({ id: selectedPost.id, ...data }, {
        onSuccess: () => setEditorOpen(false),
      });
    } else {
      createPost.mutate(data, {
        onSuccess: () => setEditorOpen(false),
      });
    }
  };

  return (
    <AdminLayout title="Blog Posts" description="Create and manage your blog content">
      <div className="flex justify-end mb-6">
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : (
        <ContentTable
          items={blogs || []}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onTogglePublish={handleTogglePublish}
          emptyMessage="No blog posts yet. Create your first one!"
        />
      )}

      <BlogEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        post={selectedPost}
        onSave={handleSave}
        isLoading={createPost.isPending || updatePost.isPending}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{postToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
