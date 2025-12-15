import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Plus, Trash2 } from "lucide-react";
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
import { ImageUpload } from "./ImageUpload";
import { CodePreview } from "./CodePreview";
import type { Tutorial, TutorialStep } from "@/hooks/useTutorials";

const tutorialSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z.string().min(1, "Slug is required").max(200).regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens"),
  description: z.string().max(1000).optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  estimated_minutes: z.coerce.number().min(1).max(600),
  featured_image: z.string().optional().or(z.literal("")),
  external_link: z.string().optional().or(z.literal("")),
  is_paid: z.boolean(),
  price: z.coerce.number().min(0).optional(),
  upi_id: z.string().optional().or(z.literal("")),
  qr_code_url: z.string().optional().or(z.literal("")),
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
  const [featuredImage, setFeaturedImage] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");

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
      external_link: "",
      is_paid: false,
      price: 0,
      upi_id: "",
      qr_code_url: "",
      published: false,
    },
  });

  const isPaid = watch("is_paid");

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
        external_link: tutorial.external_link || "",
        is_paid: tutorial.is_paid || false,
        price: tutorial.price || 0,
        upi_id: tutorial.upi_id || "",
        qr_code_url: tutorial.qr_code_url || "",
        published: tutorial.published,
      });
      setTags(tutorial.tags || []);
      setFeaturedImage(tutorial.featured_image || "");
      setQrCodeUrl(tutorial.qr_code_url || "");
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
        external_link: "",
        is_paid: false,
        price: 0,
        upi_id: "",
        qr_code_url: "",
        published: false,
      });
      setTags([]);
      setFeaturedImage("");
      setQrCodeUrl("");
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

  const handleImageChange = (url: string) => {
    setFeaturedImage(url);
    setValue("featured_image", url);
  };

  const handleQrCodeChange = (url: string) => {
    setQrCodeUrl(url);
    setValue("qr_code_url", url);
  };

  const onSubmit = (data: TutorialFormData) => {
    onSave({ ...data, tags, featured_image: featuredImage || undefined, qr_code_url: qrCodeUrl || undefined }, steps);
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
          </div>

          <ImageUpload
            value={featuredImage}
            onChange={handleImageChange}
            label="Featured Image"
            folder="tutorials"
          />

          {/* External Link */}
          <div className="space-y-2">
            <Label htmlFor="external_link">External Link (Google Drive, Mega, etc.)</Label>
            <Input
              id="external_link"
              {...register("external_link")}
              placeholder="https://drive.google.com/..."
            />
          </div>

          {/* Paid Tutorial Settings */}
          <div className="space-y-4 p-4 border border-border rounded-lg">
            <div className="flex items-center gap-2">
              <Switch
                id="is_paid"
                checked={isPaid}
                onCheckedChange={(checked) => setValue("is_paid", checked)}
              />
              <Label htmlFor="is_paid">This is a paid tutorial</Label>
            </div>

            {isPaid && (
              <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    {...register("price")}
                    min={0}
                    placeholder="99"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="upi_id">UPI ID</Label>
                  <Input
                    id="upi_id"
                    {...register("upi_id")}
                    placeholder="example@upi"
                  />
                </div>

                <ImageUpload
                  value={qrCodeUrl}
                  onChange={handleQrCodeChange}
                  label="Payment QR Code"
                  folder="tutorials"
                />
              </div>
            )}
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

                  <CodePreview
                    value={step.code_example}
                    onChange={(value) => updateStep(index, "code_example", value)}
                    label="Code Example (optional)"
                    placeholder="// Code example..."
                    rows={6}
                  />
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