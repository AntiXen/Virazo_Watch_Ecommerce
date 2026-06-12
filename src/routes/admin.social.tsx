import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Facebook, Instagram, Phone, Mail, MessageCircle } from "lucide-react";
import { AdminPage, AdminTitle, FormCard } from "@/components/ui/admin-ui";

export const Route = createFileRoute("/admin/social")({ component: SocialPage });

function SocialPage() {
  const [v, setV] = useState({ facebook: "", instagram: "", whatsapp: "", email: "", phone: "" });
  useEffect(() => {
    supabase.from("content_blocks").select("value").eq("key", "site_settings").maybeSingle().then(({ data }) => {
      if (data?.value) setV((prev) => ({ ...prev, ...(data.value as any) }));
    });
  }, []);
  const save = async () => {
    const current = (await supabase.from("content_blocks").select("value").eq("key", "site_settings").maybeSingle()).data?.value as any || {};
    const { error } = await supabase.from("content_blocks").upsert({ key: "site_settings", value: { ...current, ...v } });
    if (error) return toast.error(error.message);
    toast.success("Saved");
  };

  const fields = [
    { key: "facebook", label: "Facebook URL", icon: Facebook, placeholder: "https://facebook.com/yourpage" },
    { key: "instagram", label: "Instagram URL", icon: Instagram, placeholder: "https://instagram.com/yourhandle" },
    { key: "whatsapp", label: "WhatsApp Number", icon: MessageCircle, placeholder: "8801XXXXXXXXX" },
    { key: "email", label: "Contact Email", icon: Mail, placeholder: "hello@virazo.com" },
    { key: "phone", label: "Contact Phone", icon: Phone, placeholder: "017XXXXXXXX" },
  ];

  return (
    <AdminPage>
      <AdminTitle sub="Links and contact info shown on your website">Social & Contact</AdminTitle>
      <FormCard className="max-w-xl">
        <div className="space-y-4">
          {fields.map(({ key, label, icon: Icon, placeholder }) => (
            <div key={key} className="space-y-1.5">
              <Label className="text-xs text-gray-500 font-semibold flex items-center gap-1.5"><Icon size={11} />{label}</Label>
              <Input
                value={(v as any)[key]}
                onChange={(e) => setV({ ...v, [key]: e.target.value })}
                placeholder={placeholder}
                className="bg-black/[0.02] border-black/[0.08]"
              />
            </div>
          ))}
        </div>
        <Button onClick={save} className="bg-gradient-gold text-onyx font-bold hover:brightness-105 w-full h-11">Save All</Button>
      </FormCard>
    </AdminPage>
  );
}