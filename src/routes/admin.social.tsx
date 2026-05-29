import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Facebook, Instagram, MessageCircle, Mail, Phone, Loader2, Save, Share2 } from "lucide-react";

export const Route = createFileRoute("/admin/social")({
  component: SocialPage,
});

function SocialPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [v, setV] = useState({ 
    facebook: "", 
    instagram: "", 
    whatsapp: "", 
    email: "", 
    phone: "" 
  });

  // 1. Fetch current settings from Supabase
  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("content_blocks")
        .select("value")
        .eq("key", "site_settings")
        .maybeSingle();
      
      if (data?.value) {
        const val = data.value as any;
        setV({
          facebook: val.facebook || "",
          instagram: val.instagram || "",
          whatsapp: val.whatsapp || "",
          email: val.email || "",
          phone: val.phone || ""
        });
      }
      setLoading(false);
    };
    loadSettings();
  }, []);

  // 2. Save and Merge settings
  const save = async () => {
    setSaving(true);
    try {
      // First, get existing settings so we don't overwrite SEO/Site Name
      const { data: current } = await supabase
        .from("content_blocks")
        .select("value")
        .eq("key", "site_settings")
        .maybeSingle();

      const merged = { ...(current?.value as any || {}), ...v };

      const { error } = await supabase
        .from("content_blocks")
        .upsert({ 
          key: "site_settings", 
          value: merged,
          updated_at: new Date().toISOString() 
        });

      if (error) throw error;
      toast.success("Boutique contact info updated live.");
    } catch (err: any) {
      toast.error("Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center pt-20">
      <Loader2 className="w-8 h-8 text-gold animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 max-w-3xl pb-20">
      <div>
        <h1 className="font-display text-4xl text-white">Social & Contact</h1>
        <p className="text-muted-foreground text-sm mt-1">These details update the Footer, WhatsApp button, and Contact page instantly.</p>
      </div>

      <div className="bg-onyx border border-white/5 rounded-[2.5rem] p-10 shadow-2xl space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
           <Share2 size={120} className="text-gold" />
        </div>

        <div className="grid gap-6 relative z-10">
          {/* Facebook */}
          <div className="space-y-2">
            <Label className="text-gold/70 text-[10px] uppercase tracking-widest font-black flex items-center gap-2">
              <Facebook size={12} /> Facebook URL
            </Label>
            <Input 
              value={v.facebook} 
              onChange={(e) => setV({ ...v, facebook: e.target.value })} 
              className="bg-white/5 border-white/10 h-12 focus:border-gold/50"
              placeholder="https://facebook.com/virazo.watch"
            />
          </div>

          {/* Instagram */}
          <div className="space-y-2">
            <Label className="text-gold/70 text-[10px] uppercase tracking-widest font-black flex items-center gap-2">
              <Instagram size={12} /> Instagram URL
            </Label>
            <Input 
              value={v.instagram} 
              onChange={(e) => setV({ ...v, instagram: e.target.value })} 
              className="bg-white/5 border-white/10 h-12 focus:border-gold/50"
              placeholder="https://instagram.com/virazo.watch"
            />
          </div>

          {/* WhatsApp */}
          <div className="space-y-2">
            <Label className="text-gold/70 text-[10px] uppercase tracking-widest font-black flex items-center gap-2">
              <MessageCircle size={12} /> WhatsApp Number (Include Country Code)
            </Label>
            <Input 
              value={v.whatsapp} 
              onChange={(e) => setV({ ...v, whatsapp: e.target.value })} 
              className="bg-white/5 border-white/10 h-12 focus:border-gold/50 font-mono"
              placeholder="8801700000000"
            />
            <p className="text-[9px] text-white/20 italic">Format: CountryCode + Number (No '+' or spaces)</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
            {/* Email */}
            <div className="space-y-2">
              <Label className="text-gold/70 text-[10px] uppercase tracking-widest font-black flex items-center gap-2">
                <Mail size={12} /> Public Contact Email
              </Label>
              <Input 
                value={v.email} 
                onChange={(e) => setV({ ...v, email: e.target.value })} 
                className="bg-white/5 border-white/10 h-12 focus:border-gold/50"
                placeholder="hello@virazo.watch"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label className="text-gold/70 text-[10px] uppercase tracking-widest font-black flex items-center gap-2">
                <Phone size={12} /> Boutique Phone
              </Label>
              <Input 
                value={v.phone} 
                onChange={(e) => setV({ ...v, phone: e.target.value })} 
                className="bg-white/5 border-white/10 h-12 focus:border-gold/50"
                placeholder="+880 17XX XXXXXX"
              />
            </div>
          </div>
        </div>

        <Button 
          onClick={save} 
          disabled={saving}
          className="w-full bg-gradient-gold text-onyx font-black tracking-widest h-14 rounded-2xl shadow-gold hover:scale-[1.01] active:scale-[0.99] transition-all"
        >
          {saving ? <Loader2 className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
          SAVE BOUTIQUE CHANNELS
        </Button>
      </div>
    </div>
  );
}