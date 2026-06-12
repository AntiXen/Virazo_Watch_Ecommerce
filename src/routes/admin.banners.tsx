import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { toast } from "sonner";
import { uploadImage } from "@/lib/upload";
import { Trash2, ImageIcon } from "lucide-react";
import { AdminPage, AdminTitle, FormCard, Card, Badge } from "@/components/ui/admin-ui";

export const Route = createFileRoute("/admin/banners")({ component: BannersPage });

function BannersPage() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: async () => (await supabase.from("banners").select("*").order("position")).data ?? [],
  });
  const [title, setTitle] = useState(""); const [subtitle, setSubtitle] = useState("");
  const [link, setLink] = useState(""); const [cta, setCta] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const add = async () => {
    if (!title || !file) return toast.error("Title and image are required");
    setSaving(true);
    try {
      const url = await uploadImage(file, "banners");
      if (!url) throw new Error("Upload failed");
      await supabase.from("banners").insert({ title, subtitle, link_url: link, cta_label: cta, image_url: url });
      setTitle(""); setSubtitle(""); setLink(""); setCta(""); setFile(null);
      qc.invalidateQueries({ queryKey: ["admin-banners"] });
      toast.success("Banner added");
    } catch (e: any) { toast.error(e.message); } finally { setSaving(false); }
  };
  const toggle = async (id: string, active: boolean) => {
    await supabase.from("banners").update({ is_active: active }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-banners"] });
  };
  const del = async (id: string) => {
    if (!confirm("Delete banner?")) return;
    await supabase.from("banners").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-banners"] });
  };

  return (
    <AdminPage>
      <AdminTitle>Banners & Sliders</AdminTitle>
      <FormCard>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label className="text-xs text-gray-500 font-semibold">Title *</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-black/[0.02] border-black/[0.08]" /></div>
          <div className="space-y-1.5"><Label className="text-xs text-gray-500 font-semibold">Subtitle</Label><Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="bg-black/[0.02] border-black/[0.08]" /></div>
          <div className="space-y-1.5"><Label className="text-xs text-gray-500 font-semibold">Link URL</Label><Input value={link} onChange={(e) => setLink(e.target.value)} className="bg-black/[0.02] border-black/[0.08]" placeholder="https://…" /></div>
          <div className="space-y-1.5"><Label className="text-xs text-gray-500 font-semibold">CTA Button Label</Label><Input value={cta} onChange={(e) => setCta(e.target.value)} className="bg-black/[0.02] border-black/[0.08]" placeholder="Shop Now" /></div>
          <div className="md:col-span-2 space-y-1.5"><Label className="text-xs text-gray-500 font-semibold">Banner Image *</Label><Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="bg-black/[0.02] border-black/[0.08]" /></div>
        </div>
        <Button onClick={add} disabled={saving} className="bg-gradient-gold text-onyx font-bold hover:brightness-105">{saving ? "Uploading…" : "Add Banner"}</Button>
      </FormCard>

      <div className="grid md:grid-cols-2 gap-4">
        {(data as any[]).map((b) => (
          <Card key={b.id} className="overflow-hidden">
            <div className="relative">
              <img src={b.image_url} className="w-full h-36 object-cover" alt={b.title} />
              <div className="absolute top-3 right-3">
                <Badge variant={b.is_active ? "success" : "default"}>{b.is_active ? "Active" : "Hidden"}</Badge>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-900 text-sm">{b.title}</p>
                {b.subtitle && <p className="text-xs text-gray-400 mt-0.5">{b.subtitle}</p>}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Switch checked={b.is_active} onCheckedChange={(v) => toggle(b.id, v)} />
                <button onClick={() => del(b.id)} className="p-1.5 hover:text-red-400 text-gray-300 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
          </Card>
        ))}
        {data.length === 0 && (
          <div className="md:col-span-2 flex flex-col items-center justify-center py-12 text-gray-300">
            <ImageIcon size={32} className="mb-2" />
            <p className="text-sm">No banners yet.</p>
          </div>
        )}
      </div>
    </AdminPage>
  );
}