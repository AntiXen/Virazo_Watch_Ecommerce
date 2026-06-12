import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { MapPin, Clock, Globe } from "lucide-react";
import { AdminPage, AdminTitle, FormCard } from "@/components/ui/admin-ui";

export const Route = createFileRoute("/admin/location")({ component: LocationPage });

function LocationPage() {
  const [v, setV] = useState({ name: "", address: "", lat: 23.7925, lng: 90.4078, hours: "" });
  useEffect(() => {
    supabase.from("content_blocks").select("value").eq("key", "store_location").maybeSingle().then(({ data }) => {
      if (data?.value) setV((prev) => ({ ...prev, ...(data.value as any) }));
    });
  }, []);
  const save = async () => {
    const { error } = await supabase.from("content_blocks").upsert({ key: "store_location", value: v as any });
    if (error) return toast.error(error.message);
    toast.success("Store details updated");
  };

  return (
    <AdminPage>
      <AdminTitle sub="Configure your physical shop details shown on the website">Store Location</AdminTitle>
      <FormCard className="max-w-xl">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500 font-semibold flex items-center gap-1.5"><Globe size={11} /> Store Name</Label>
            <Input value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} placeholder="e.g. Virazo Watch — Gulshan" className="bg-black/[0.02] border-black/[0.08]" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500 font-semibold flex items-center gap-1.5"><MapPin size={11} /> Address</Label>
            <Textarea rows={2} value={v.address} onChange={(e) => setV({ ...v, address: e.target.value })} placeholder="Full street address…" className="bg-black/[0.02] border-black/[0.08]" />
          </div>
          <div className="grid grid-cols-2 gap-3 p-4 bg-black/[0.02] rounded-xl border border-black/[0.06]">
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-400 font-semibold">Latitude</Label>
              <Input type="number" step="0.000001" value={v.lat} onChange={(e) => setV({ ...v, lat: Number(e.target.value) })} className="font-mono text-xs bg-white border-black/[0.08] h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-400 font-semibold">Longitude</Label>
              <Input type="number" step="0.000001" value={v.lng} onChange={(e) => setV({ ...v, lng: Number(e.target.value) })} className="font-mono text-xs bg-white border-black/[0.08] h-9" />
            </div>
            <p className="col-span-2 text-[10px] text-gray-400 italic">Default: 23.7925 / 90.4078 (Gulshan 1, Dhaka)</p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500 font-semibold flex items-center gap-1.5"><Clock size={11} /> Opening Hours</Label>
            <Input value={v.hours} onChange={(e) => setV({ ...v, hours: e.target.value })} placeholder="e.g. Sat–Thu: 10 AM – 9 PM" className="bg-black/[0.02] border-black/[0.08]" />
          </div>
        </div>
        <Button onClick={save} className="bg-gradient-gold text-onyx font-bold hover:brightness-105 w-full h-11">Save Location</Button>
      </FormCard>
    </AdminPage>
  );
}