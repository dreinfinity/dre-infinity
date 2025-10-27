import { useState } from "react";
import { useCashTags } from "@/hooks/useCashTags";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";

export function TagManager() {
  const { tags, createTag, deleteTag, creating } = useCashTags();
  const [newTag, setNewTag] = useState({ name: "", color: "#3b82f6" });

  const handleCreate = () => {
    if (!newTag.name.trim()) return;
    createTag(newTag);
    setNewTag({ name: "", color: "#3b82f6" });
  };

  const colorOptions = [
    { value: "#3b82f6", label: "Azul" },
    { value: "#10b981", label: "Verde" },
    { value: "#f59e0b", label: "Laranja" },
    { value: "#ef4444", label: "Vermelho" },
    { value: "#8b5cf6", label: "Roxo" },
    { value: "#ec4899", label: "Rosa" },
  ];

  return (
    <GlassCard className="p-6">
      <h3 className="font-semibold text-lg mb-4">Gerenciar Etiquetas</h3>
      
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="tag-name">Nome da Etiqueta</Label>
            <Input
              id="tag-name"
              value={newTag.name}
              onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
              placeholder="Ex: Marketing Digital"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>
          <div className="w-32">
            <Label htmlFor="tag-color">Cor</Label>
            <select
              id="tag-color"
              value={newTag.color}
              onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {colorOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button onClick={handleCreate} disabled={creating || !newTag.name.trim()}>
              <Plus className="w-4 h-4 mr-2" />
              Criar
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag.id}
              style={{ backgroundColor: tag.color }}
              className="text-white flex items-center gap-1 px-3 py-1"
            >
              {tag.name}
              <button
                onClick={() => deleteTag(tag.id)}
                className="ml-1 hover:opacity-70"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
