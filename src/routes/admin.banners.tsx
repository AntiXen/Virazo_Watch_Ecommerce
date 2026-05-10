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
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/banners")({
  component: BannersPage,
});

function BannersPage() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: async () => (await supabase.from("banners").select("*").order("position")).data ?? [],
  });
  const [title, setTitle] = useState(""); const [subtitle, setSubtitle] = useState(""); const [link, setLink] = useState(""); const [cta, setCta] = useState(""); const [file, setFile] = useState<File | null>(null);

  const add = async () => {
    if (!title || !file) return toast.error("Title and image required");
    const url = await uploadImage(file, "banners");
    if (!url) return;
    await supabase.from("banners").insert({ title, subtitle, link_url: link, cta_label: cta, image_url: url });
    setTitle(""); setSubtitle(""); setLink(""); setCta(""); setFile(null);
    qc.invalidateQueries({ queryKey: ["admin-banners"] });
  };
  const toggle = async (id: string, active: boolean) => {
    await supabase.from("banners").update({ is_active: active }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-banners"] });
  };
  const del = async (id: string) => { if (!confirm("Delete?")) return; await supabase.from("banners").delete().eq("id", id); qc.invalidateQueries({ queryKey: ["admin-banners"] }); };

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="font-display text-3xl">Banners & Sliders</h1>
      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <div className="grid md:grid-cols-2 gap-3">
          <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div><Label>Subtitle</Label><Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} /></div>
          <div><Label>Link URL</Label><Input value={link} onChange={(e) => setLink(e.target.value)} /></div>
          <div><Label>CTA Label</Label><Input value={cta} onChange={(e) => setCta(e.target.value)} /></div>
          <div className="md:col-span-2"><Label>Image</Label><Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></div>
        </div>
        <Button onClick={add} className="bg-gradient-gold text-onyx hover:brightness-110">Add Banner</Button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {data.map((b: any) => (
          <div key={b.id} className="bg-card border border-border rounded-xl overflow-hidden">
            <img src={b.image_url} className="w-full h-40 object-cover" alt={b.title} />
            <div className="p-4 space-y-2">
              <div className="font-medium">{b.title}</div>
              <div className="text-xs text-muted-foreground">{b.subtitle}</div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Switch checked={b.is_active} onCheckedChange={(v) => toggle(b.id, v)} /><span className="text-xs">{b.is_active ? "Active" : "Hidden"}</span></div>
                <button onClick={() => del(b.id)} className="p-2 hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
