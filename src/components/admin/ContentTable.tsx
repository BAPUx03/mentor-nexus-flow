import { ReactNode } from "react";
import { format } from "date-fns";
import { MoreHorizontal, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ContentItem {
  id: string;
  title: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  author?: {
    full_name: string | null;
  };
}

interface ContentTableProps<T extends ContentItem> {
  items: T[];
  columns?: { key: keyof T | string; label: string; render?: (item: T) => ReactNode }[];
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  onTogglePublish?: (item: T) => void;
  emptyMessage?: string;
}

export function ContentTable<T extends ContentItem>({
  items,
  columns,
  onEdit,
  onDelete,
  onTogglePublish,
  emptyMessage = "No content found",
}: ContentTableProps<T>) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Status</TableHead>
            {columns?.map((col) => (
              <TableHead key={String(col.key)}>{col.label}</TableHead>
            ))}
            <TableHead>Updated</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium max-w-xs truncate">
                {item.title}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {item.author?.full_name || "Unknown"}
              </TableCell>
              <TableCell>
                <Badge variant={item.published ? "default" : "secondary"}>
                  {item.published ? "Published" : "Draft"}
                </Badge>
              </TableCell>
              {columns?.map((col) => (
                <TableCell key={String(col.key)}>
                  {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key as string] || "")}
                </TableCell>
              ))}
              <TableCell className="text-muted-foreground text-sm">
                {format(new Date(item.updated_at), "MMM d, yyyy")}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover">
                    <DropdownMenuItem onClick={() => onEdit(item)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    {onTogglePublish && (
                      <DropdownMenuItem onClick={() => onTogglePublish(item)}>
                        {item.published ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-2" />
                            Unpublish
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            Publish
                          </>
                        )}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(item)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
