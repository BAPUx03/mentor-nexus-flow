import { useState } from "react";
import { Plus } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ContentTable } from "@/components/admin/ContentTable";
import { SnippetEditor } from "@/components/admin/SnippetEditor";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { useCodeSnippets, useCodeSnippetMutations, type CodeSnippet } from "@/hooks/useCodeSnippets";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminSnippets() {
  const { user } = useAuth();
  const { data: snippets, isLoading } = useCodeSnippets({ authorId: user?.id });
  const { createSnippet, updateSnippet, deleteSnippet } = useCodeSnippetMutations();

  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedSnippet, setSelectedSnippet] = useState<CodeSnippet | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snippetToDelete, setSnippetToDelete] = useState<CodeSnippet | null>(null);

  const handleCreate = () => {
    setSelectedSnippet(null);
    setEditorOpen(true);
  };

  const handleEdit = (snippet: CodeSnippet) => {
    setSelectedSnippet(snippet);
    setEditorOpen(true);
  };

  const handleDelete = (snippet: CodeSnippet) => {
    setSnippetToDelete(snippet);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (snippetToDelete) {
      deleteSnippet.mutate(snippetToDelete.id);
      setDeleteDialogOpen(false);
      setSnippetToDelete(null);
    }
  };

  const handleTogglePublish = (snippet: CodeSnippet) => {
    updateSnippet.mutate({ id: snippet.id, published: !snippet.published });
  };

  const handleSave = (data: { title: string; description?: string; code: string; language: string; published: boolean; tags: string[] }) => {
    if (selectedSnippet) {
      updateSnippet.mutate({ id: selectedSnippet.id, ...data }, {
        onSuccess: () => setEditorOpen(false),
      });
    } else {
      createSnippet.mutate(data, {
        onSuccess: () => setEditorOpen(false),
      });
    }
  };

  return (
    <AdminLayout title="Code Snippets" description="Share reusable code examples">
      <div className="flex justify-end mb-6">
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Snippet
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : (
        <ContentTable
          items={snippets || []}
          columns={[
            {
              key: "language",
              label: "Language",
              render: (snippet) => (
                <Badge variant="outline">
                  {snippet.language}
                </Badge>
              ),
            },
          ]}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onTogglePublish={handleTogglePublish}
          emptyMessage="No code snippets yet. Create your first one!"
        />
      )}

      <SnippetEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        snippet={selectedSnippet}
        onSave={handleSave}
        isLoading={createSnippet.isPending || updateSnippet.isPending}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Code Snippet</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{snippetToDelete?.title}"? This action cannot be undone.
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
