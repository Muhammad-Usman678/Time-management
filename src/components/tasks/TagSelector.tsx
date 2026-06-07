"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { cn, contrastText, TAG_COLOR_PRESETS } from "@/lib/utils";
import { useCreateTag, useTags } from "@/hooks/useTags";

export interface TagSelectorProps {
  value: string[];
  onChange: (tagIds: string[]) => void;
}

export function TagSelector({ value, onChange }: TagSelectorProps) {
  const { data: tags = [], isLoading } = useTags();
  const createTag = useCreateTag();

  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(TAG_COLOR_PRESETS[0]);

  function toggle(id: string) {
    onChange(value.includes(id) ? value.filter((t) => t !== id) : [...value, id]);
  }

  function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) return;
    createTag.mutate(
      { name: trimmed, color },
      {
        onSuccess: (tag) => {
          if (!value.includes(tag.id)) onChange([...value, tag.id]);
          setName("");
          setColor(TAG_COLOR_PRESETS[0]);
          setCreating(false);
        },
      }
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner size={16} /> Loading tags…
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => {
            const selected = value.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggle(tag.id)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  !selected && "border-border text-foreground hover:bg-secondary"
                )}
                style={
                  selected
                    ? {
                        backgroundColor: tag.color,
                        borderColor: tag.color,
                        color: contrastText(tag.color),
                      }
                    : undefined
                }
              >
                {selected ? (
                  <Check size={12} />
                ) : (
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: tag.color }}
                    aria-hidden
                  />
                )}
                {tag.name}
              </button>
            );
          })}
          {tags.length === 0 && (
            <span className="text-xs text-muted-foreground">No tags yet.</span>
          )}
        </div>
      )}

      {creating ? (
        <div className="flex flex-col gap-2 rounded-md border border-border p-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tag name"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCreate();
              }
            }}
          />
          <div className="flex items-center gap-1.5">
            {TAG_COLOR_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                aria-label={`Pick color ${preset}`}
                onClick={() => setColor(preset)}
                className={cn(
                  "h-6 w-6 rounded-full border-2 transition-transform outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  color === preset
                    ? "border-foreground scale-110"
                    : "border-transparent"
                )}
                style={{ backgroundColor: preset }}
              />
            ))}
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCreating(false);
                setName("");
              }}
              disabled={createTag.isPending}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleCreate}
              disabled={!name.trim() || createTag.isPending}
            >
              {createTag.isPending && <Spinner size={14} />}
              Add tag
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="self-start text-muted-foreground"
          onClick={() => setCreating(true)}
        >
          <Plus size={14} />
          New tag
        </Button>
      )}
    </div>
  );
}
