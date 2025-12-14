import { useState } from "react";
import { Code, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface CodePreviewProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  rows?: number;
}

export function CodePreview({ 
  value, 
  onChange, 
  label = "Code", 
  placeholder = "// Write your code here...",
  rows = 12 
}: CodePreviewProps) {
  const [mode, setMode] = useState<"code" | "preview">("code");

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          <Button
            type="button"
            variant={mode === "code" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 px-3"
            onClick={() => setMode("code")}
          >
            <Code className="h-3.5 w-3.5 mr-1.5" />
            Code
          </Button>
          <Button
            type="button"
            variant={mode === "preview" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 px-3"
            onClick={() => setMode("preview")}
          >
            <Eye className="h-3.5 w-3.5 mr-1.5" />
            Preview
          </Button>
        </div>
      </div>

      {mode === "code" ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="font-mono text-sm"
        />
      ) : (
        <div className="border border-border rounded-lg p-4 min-h-[200px] bg-muted/30">
          {value ? (
            <pre className="font-mono text-sm whitespace-pre-wrap overflow-x-auto">
              <code>{value}</code>
            </pre>
          ) : (
            <p className="text-muted-foreground text-sm italic">No code to preview</p>
          )}
        </div>
      )}
    </div>
  );
}