import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/location")({
  component: LocationPage,
});

function LocationPage() {
  const [v, setV] = useState({ name: "", address: "", lat: 0, lng: 0, hours: "" });
  useEffect(() => {
    supabase.from("content_blocks").select("value").eq("key", "store_location").maybeSingle().then(({ data }) => {
      if (data?.value) setV({ ...v, ...(data.value as any) });
    });
  }, []);
  const save = async () => {
    const { error } = await supabase.from("content_blocks").upsert({ key: "store_location", value: v as any });
    if (error) return toast.error(error.message);
    toast.success("Saved");
  };
  return (
    <div className="space-y-5 max-w-2xl">
      <h1 className="font-display text-3xl">Store Location</h1>
      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <div><Label>Store name</Label><Input value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} /></div>
        <div><Label>Address</Label><Textarea rows={2} value={v.address} onChange={(e) => setV({ ...v, address: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Latitude</Label><Input type="number" step="0.0001" value={v.lat} onChange={(e) => setV({ ...v, lat: Number(e.target.value) })} /></div>
          <div><Label>Longitude</Label><Input type="number" step="0.0001" value={v.lng} onChange={(e) => setV({ ...v, lng: Number(e.target.value) })} /></div>
        </div>
        <div><Label>Opening hours</Label><Input value={v.hours} onChange={(e) => setV({ ...v, hours: e.target.value })} /></div>
        <Button onClick={save} className="bg-gradient-gold text-onyx hover:brightness-110">Save</Button>
      </div>
    </div>
  );
}
