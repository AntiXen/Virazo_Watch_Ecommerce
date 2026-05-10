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
import { uploadImage, slugify } from "@/lib/upload";

export const Route = createFileRoute("/admin/brands")({
  component: BrandsPage,
});

function BrandsPage() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["admin-brands"],
    queryFn: async () => (await supabase.from("brands").select("*").order("name")).data ?? [],
  });
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const add = async () => {
    if (!name) return;
    let logo_url: string | null = null;
    if (logoFile) logo_url = await uploadImage(logoFile, "brands");
    const { error } = await supabase.from("brands").insert({ name, slug: slugify(name), description, logo_url });
    if (error) return toast.error(error.message);
    toast.success("Brand added");
    setName(""); setDescription(""); setLogoFile(null);
    qc.invalidateQueries({ queryKey: ["admin-brands"] });
  };
  const del = async (id: string) => {
    if (!confirm("Delete this brand?")) return;
    const { error } = await supabase.from("brands").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-brands"] });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="font-display text-3xl">Brands</h1>
      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <div className="grid md:grid-cols-2 gap-3">
          <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><Label>Logo (optional)</Label><Input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)} /></div>
          <div className="md:col-span-2"><Label>Description</Label><Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
        </div>
        <Button onClick={add} className="bg-gradient-gold text-onyx hover:brightness-110">Add Brand</Button>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30"><tr><th className="p-3 text-left">Logo</th><th className="p-3 text-left">Name</th><th className="p-3 text-left">Slug</th><th className="p-3"></th></tr></thead>
          <tbody>
            {data.map((b: any) => (
              <tr key={b.id} className="border-t border-border">
                <td className="p-3">{b.logo_url ? <img src={b.logo_url} className="w-10 h-10 object-cover rounded" alt="" /> : <span className="text-muted-foreground">—</span>}</td>
                <td className="p-3 font-medium">{b.name}</td>
                <td className="p-3 text-muted-foreground">{b.slug}</td>
                <td className="p-3 text-right"><button onClick={() => del(b.id)} className="p-2 hover:text-destructive"><Trash2 className="w-4 h-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
