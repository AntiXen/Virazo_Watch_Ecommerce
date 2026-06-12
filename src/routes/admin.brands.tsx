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
import { AdminPage, AdminTitle, FormCard, AdminTable, Th, Td } from "@/components/ui/admin-ui";

export const Route = createFileRoute("/admin/brands")({ component: BrandsPage });

function BrandsPage() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["admin-brands"],
    queryFn: async () => (await supabase.from("brands").select("*").order("name")).data ?? [],
  });
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const add = async () => {
    if (!name) return toast.error("Name is required");
    setSaving(true);
    try {
      let logo_url: string | null = null;
      if (logoFile) logo_url = await uploadImage(logoFile, "brands");
      const { error } = await supabase.from("brands").insert({ name, slug: slugify(name), description, logo_url });
      if (error) throw error;
      toast.success("Brand added");
      setName(""); setDescription(""); setLogoFile(null);
      qc.invalidateQueries({ queryKey: ["admin-brands"] });
    } catch (e: any) { toast.error(e.message); } finally { setSaving(false); }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this brand?")) return;
    const { error } = await supabase.from("brands").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-brands"] });
  };

  return (
    <AdminPage>
      <AdminTitle>Brands</AdminTitle>
      <FormCard>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label className="text-xs text-gray-500 font-semibold">Brand Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="bg-black/[0.02] border-black/[0.08]" /></div>
          <div className="space-y-1.5"><Label className="text-xs text-gray-500 font-semibold">Logo (optional)</Label><Input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)} className="bg-black/[0.02] border-black/[0.08]" /></div>
          <div className="md:col-span-2 space-y-1.5"><Label className="text-xs text-gray-500 font-semibold">Description</Label><Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className="bg-black/[0.02] border-black/[0.08]" /></div>
        </div>
        <Button onClick={add} disabled={saving} className="bg-gradient-gold text-onyx font-bold hover:brightness-105">{saving ? "Adding…" : "Add Brand"}</Button>
      </FormCard>

      <AdminTable>
        <thead><tr><Th>Logo</Th><Th>Name</Th><Th>Slug</Th><Th right></Th></tr></thead>
        <tbody>
          {(data as any[]).map((b) => (
            <tr key={b.id} className="hover:bg-black/[0.01] transition-colors">
              <Td>{b.logo_url ? <img src={b.logo_url} className="w-9 h-9 object-cover rounded-lg border border-black/[0.07]" alt="" /> : <span className="text-gray-300">—</span>}</Td>
              <Td><span className="font-medium text-gray-900">{b.name}</span></Td>
              <Td mono>{b.slug}</Td>
              <Td right><button onClick={() => del(b.id)} className="p-1.5 hover:text-red-400 text-gray-300 transition-colors rounded-lg hover:bg-red-50"><Trash2 size={14} /></button></Td>
            </tr>
          ))}
          {data.length === 0 && <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-400 text-sm">No brands yet.</td></tr>}
        </tbody>
      </AdminTable>
    </AdminPage>
  );
}