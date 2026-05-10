import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { slugify } from "@/lib/upload";

export const Route = createFileRoute("/admin/categories")({
  component: CategoriesPage,
});

function CategoriesPage() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["admin-cats"],
    queryFn: async () => (await supabase.from("categories").select("*").order("name")).data ?? [],
  });
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const add = async () => {
    if (!name) return;
    const { error } = await supabase.from("categories").insert({ name, slug: slugify(name), description });
    if (error) return toast.error(error.message);
    setName(""); setDescription("");
    qc.invalidateQueries({ queryKey: ["admin-cats"] });
  };
  const del = async (id: string) => {
    if (!confirm("Delete?")) return;
    await supabase.from("categories").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-cats"] });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="font-display text-3xl">Categories</h1>
      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div><Label>Description</Label><Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
        <Button onClick={add} className="bg-gradient-gold text-onyx hover:brightness-110">Add Category</Button>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30"><tr><th className="p-3 text-left">Name</th><th className="p-3 text-left">Slug</th><th className="p-3"></th></tr></thead>
          <tbody>
            {data.map((c: any) => (
              <tr key={c.id} className="border-t border-border">
                <td className="p-3 font-medium">{c.name}</td>
                <td className="p-3 text-muted-foreground">{c.slug}</td>
                <td className="p-3 text-right"><button onClick={() => del(c.id)} className="p-2 hover:text-destructive"><Trash2 className="w-4 h-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
