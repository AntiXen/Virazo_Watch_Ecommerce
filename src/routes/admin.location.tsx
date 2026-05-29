import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { MapPin, Clock, Phone, Globe, Loader2, Save } from "lucide-react";

export const Route = createFileRoute("/admin/location")({
  component: LocationPage,
});

function LocationPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [v, setV] = useState({ 
    name: "", 
    address: "", 
    lat: 23.7925, 
    lng: 90.4078, 
    phone: "",
    hours: "" 
  });

  useEffect(() => {
    const load = async () => {
      const { data: res, error } = await supabase
        .from("content_blocks")
        .select("value")
        .eq("key", "store_location")
        .maybeSingle();
      
      if (res?.value) {
        setV(res.value as any);
      }
      setLoading(false);
    };
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
        const { error } = await supabase.from("content_blocks").upsert({ 
            key: "store_location", 
            value: v as any,
            updated_at: new Date().toISOString()
        });
        if (error) throw error;
        toast.success("Shop information updated live.");
    } catch (err: any) {
        toast.error("Error: " + err.message);
    } finally {
        setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center pt-20"><Loader2 className="animate-spin text-gold" /></div>;

  return (
    <div className="space-y-8 max-w-3xl pb-20">
      <div>
        <h1 className="font-display text-4xl text-white">Visit Our Shop</h1>
        <p className="text-muted-foreground text-sm mt-1">Configure your physical shop details and map coordinates.</p>
      </div>

      <div className="bg-onyx border border-white/5 rounded-[2.5rem] p-10 shadow-2xl space-y-8">
        <div className="grid gap-6">
          <div className="space-y-2">
            <Label className="text-gold/70 text-[10px] uppercase tracking-widest font-black flex items-center gap-2"><Globe size={12}/> Shop Name</Label>
            <Input value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} className="bg-white/5 border-white/10 h-12 focus:border-gold/50" placeholder="e.g. Virazo Watch — Gulshan" />
          </div>

          <div className="space-y-2">
            <Label className="text-gold/70 text-[10px] uppercase tracking-widest font-black flex items-center gap-2"><MapPin size={12}/> Physical Address</Label>
            <Textarea rows={2} value={v.address} onChange={(e) => setV({ ...v, address: e.target.value })} className="bg-white/5 border-white/10 focus:border-gold/50" placeholder="Shop address details..." />
          </div>

          <div className="grid grid-cols-2 gap-4 p-6 bg-white/5 rounded-2xl border border-white/5">
            <div className="space-y-2">
              <Label className="text-white/40 text-[9px] uppercase font-black">Latitude</Label>
              <Input type="number" step="0.000001" value={v.lat} onChange={(e) => setV({ ...v, lat: Number(e.target.value) })} className="bg-black/20 border-white/5 h-10 font-mono text-xs" />
            </div>
            <div className="space-y-2">
              <Label className="text-white/40 text-[9px] uppercase font-black">Longitude</Label>
              <Input type="number" step="0.000001" value={v.lng} onChange={(e) => setV({ ...v, lng: Number(e.target.value) })} className="bg-black/20 border-white/5 h-10 font-mono text-xs" />
            </div>
            <p className="col-span-2 text-[9px] text-gold/40 italic">Note: Use 23.7925 and 90.4078 for Gulshan 1 center.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <Label className="text-gold/70 text-[10px] uppercase tracking-widest font-black flex items-center gap-2"><Phone size={12}/> Contact Phone</Label>
                <Input value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value })} className="bg-white/5 border-white/10 h-12" placeholder="017XXXXXXXX" />
             </div>
             <div className="space-y-2">
                <Label className="text-gold/70 text-[10px] uppercase tracking-widest font-black flex items-center gap-2"><Clock size={12}/> Opening Hours</Label>
                <Input value={v.hours} onChange={(e) => setV({ ...v, hours: e.target.value })} className="bg-white/5 border-white/10 h-12" placeholder="e.g. 10 AM - 9 PM" />
             </div>
          </div>
        </div>

        <Button onClick={save} disabled={saving} className="w-full bg-gradient-gold text-onyx font-black tracking-widest h-14 rounded-2xl shadow-gold hover:scale-[1.01] transition-all">
          {saving ? <Loader2 className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
          PUBLISH SHOP DETAILS
        </Button>
      </div>
    </div>
  );
}