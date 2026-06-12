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
import { AdminPage, AdminTitle, FormCard, AdminTable, Th, Td } from "@/components/ui/admin-ui";

export const Route = createFileRoute("/admin/categories")({ component: CategoriesPage });

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
    toast.success("Category added");
  };
  const del = async (id: string) => {
    if (!confirm("Delete?")) return;
    await supabase.from("categories").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-cats"] });
  };

  return (
    <AdminPage>
      <AdminTitle>Categories</AdminTitle>
      <FormCard>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label className="text-xs text-gray-500 font-semibold">Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="bg-black/[0.02] border-black/[0.08]" /></div>
          <div className="space-y-1.5"><Label className="text-xs text-gray-500 font-semibold">Description</Label><Textarea rows={1} value={description} onChange={(e) => setDescription(e.target.value)} className="bg-black/[0.02] border-black/[0.08]" /></div>
        </div>
        <Button onClick={add} className="bg-gradient-gold text-onyx font-bold hover:brightness-105">Add Category</Button>
      </FormCard>
      <AdminTable>
        <thead><tr><Th>Name</Th><Th>Slug</Th><Th right></Th></tr></thead>
        <tbody>
          {(data as any[]).map((c) => (
            <tr key={c.id} className="hover:bg-black/[0.01] transition-colors">
              <Td><span className="font-medium text-gray-900">{c.name}</span></Td>
              <Td mono>{c.slug}</Td>
              <Td right><button onClick={() => del(c.id)} className="p-1.5 hover:text-red-400 text-gray-300 transition-colors rounded-lg hover:bg-red-50"><Trash2 size={14} /></button></Td>
            </tr>
          ))}
          {data.length === 0 && <tr><td colSpan={3} className="px-5 py-8 text-center text-gray-400 text-sm">No categories yet.</td></tr>}
        </tbody>
      </AdminTable>
    </AdminPage>
  );
}