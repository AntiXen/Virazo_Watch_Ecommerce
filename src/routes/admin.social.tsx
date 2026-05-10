import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/social")({
  component: SocialPage,
});

function SocialPage() {
  const [v, setV] = useState({ facebook: "", instagram: "", whatsapp: "", email: "", phone: "" });
  useEffect(() => {
    supabase.from("content_blocks").select("value").eq("key", "site_settings").maybeSingle().then(({ data }) => {
      if (data?.value) setV({ ...v, ...(data.value as any) });
    });
  }, []);
  const save = async () => {
    const current = (await supabase.from("content_blocks").select("value").eq("key", "site_settings").maybeSingle()).data?.value as any || {};
    const merged = { ...current, ...v };
    const { error } = await supabase.from("content_blocks").upsert({ key: "site_settings", value: merged });
    if (error) return toast.error(error.message);
    toast.success("Saved");
  };
  return (
    <div className="space-y-5 max-w-2xl">
      <h1 className="font-display text-3xl">Social & Contact</h1>
      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <div><Label>Facebook URL</Label><Input value={v.facebook} onChange={(e) => setV({ ...v, facebook: e.target.value })} /></div>
        <div><Label>Instagram URL</Label><Input value={v.instagram} onChange={(e) => setV({ ...v, instagram: e.target.value })} /></div>
        <div><Label>WhatsApp number (with country code)</Label><Input value={v.whatsapp} onChange={(e) => setV({ ...v, whatsapp: e.target.value })} /></div>
        <div><Label>Contact email</Label><Input value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} /></div>
        <div><Label>Contact phone</Label><Input value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value })} /></div>
        <Button onClick={save} className="bg-gradient-gold text-onyx hover:brightness-110">Save</Button>
      </div>
    </div>
  );
}
