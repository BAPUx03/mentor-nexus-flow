import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Plus, GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import type { Tutorial, TutorialStep } from "@/hooks/useTutorials";

const tutorialSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z.string().min(1, "Slug is required").max(200).regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens"),
  description: z.string().max(1000).optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  estimated_minutes: z.coerce.number().min(1).max(600),
  featured_image: z.string().url().optional().or(z.literal("")),
  published: z.boolean(),
});

type TutorialFormData = z.infer<typeof tutorialSchema>;

interface StepData {
  id?: string;
  title: string;
  content: string;
  code_example: string;
}

interface TutorialEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tutorial?: Tutorial | null;
  onSave: (data: TutorialFormData & { tags: string[] }, steps: StepData[]) => void;
  isLoading?: boolean;
}

export function TutorialEditor({ open, onOpenChange, tutorial, onSave, isLoading }: TutorialEditorProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [steps, setSteps] = useState<StepData[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TutorialFormData>({
    resolver: zodResolver(tutorialSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      difficulty: "beginner",
      estimated_minutes: 30,
      featured_image: "",
      published: false,
    },
  });

  const title = watch("title");

  useEffect(() => {
    if (tutorial) {
      reset({
        title: tutorial.title,
        slug: tutorial.slug,
        description: tutorial.description || "",
        difficulty: tutorial.difficulty,
        estimated_minutes: tutorial.estimated_minutes,
        featured_image: tutorial.featured_image || "",
        published: tutorial.published,
      });
      setTags(tutorial.tags || []);
      setSteps(
        tutorial.steps?.map((s) => ({
          id: s.id,
          title: s.title,
          content: s.content,
          code_example: s.code_example || "",
        })) || []
      );
    } else {
      reset({
        title: "",
        slug: "",
        description: "",
        difficulty: "beginner",
        estimated_minutes: 30,
        featured_image: "",
        published: false,
      });
      setTags([]);
      setSteps([]);
    }
  }, [tutorial, reset]);

  useEffect(() => {
    if (!tutorial && title) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      setValue("slug", slug);
    }
  }, [title, tutorial, setValue]);

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const addStep = () => {
    setSteps([...steps, { title: "", content: "", code_example: "" }]);
  };

  const updateStep = (index: number, field: keyof StepData, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const onSubmit = (data: TutorialFormData) => {
    onSave({ ...data, tags, featured_image: data.featured_image || undefined }, steps);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {tutorial ? "Edit Tutorial" : "Create Tutorial"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register("title")} placeholder="Tutorial title" />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" {...register("slug")} placeholder="tutorial-url-slug" />
              {errors.slug && (
                <p className="text-sm text-destructive">{errors.slug.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="What will learners gain from this tutorial?"
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select
                value={watch("difficulty")}
                onValueChange={(v) => setValue("difficulty", v as "beginner" | "intermediate" | "advanced")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_minutes">Duration (minutes)</Label>
              <Input
                id="estimated_minutes"
                type="number"
                {...register("estimated_minutes")}
                min={1}
                max={600}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="featured_image">Featured Image URL</Label>
              <Input
                id="featured_image"
                {...register("featured_image")}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" variant="secondary" onClick={addTag}>
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Steps */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Tutorial Steps</Label>
              <Button type="button" variant="outline" size="sm" onClick={addStep}>
                <Plus className="h-4 w-4 mr-1" />
                Add Step
              </Button>
            </div>

            {steps.map((step, index) => (
              <Card key={index} className="relative">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-2 absolute top-2 right-2">
                    <span className="text-xs text-muted-foreground">Step {index + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeStep(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Step Title</Label>
                    <Input
                      value={step.title}
                      onChange={(e) => updateStep(index, "title", e.target.value)}
                      placeholder="Step title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Content</Label>
                    <Textarea
                      value={step.content}
                      onChange={(e) => updateStep(index, "content", e.target.value)}
                      placeholder="Step content..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Code Example (optional)</Label>
                    <Textarea
                      value={step.code_example}
                      onChange={(e) => updateStep(index, "code_example", e.target.value)}
                      placeholder="// Code example..."
                      rows={4}
                      className="font-mono text-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <Switch
                id="published"
                checked={watch("published")}
                onCheckedChange={(checked) => setValue("published", checked)}
              />
              <Label htmlFor="published">Publish immediately</Label>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : tutorial ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
