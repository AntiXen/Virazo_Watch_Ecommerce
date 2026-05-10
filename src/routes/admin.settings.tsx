import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const [site, setSite] = useState<any>({ site_name: "", tagline: "", seo_title: "", seo_description: "", seo_keywords: "" });
  const [smtp, setSmtp] = useState<any>({ host: "", port: 587, user: "", from: "", enabled: false });
  const [notif, setNotif] = useState<any>({ email_on_order: true, low_stock_alert: true });

  const load = async (key: string, setter: (v: any) => void, def: any) => {
    const { data } = await supabase.from("content_blocks").select("value").eq("key", key).maybeSingle();
    setter({ ...def, ...((data?.value as any) ?? {}) });
  };
  useEffect(() => {
    load("site_settings", setSite, site);
    load("smtp_settings", setSmtp, smtp);
    load("notification_settings", setNotif, notif);
  }, []);

  const save = async (key: string, value: any) => {
    if (key === "site_settings") {
      const current = (await supabase.from("content_blocks").select("value").eq("key", key).maybeSingle()).data?.value as any || {};
      value = { ...current, ...value };
    }
    const { error } = await supabase.from("content_blocks").upsert({ key, value });
    if (error) return toast.error(error.message);
    toast.success("Saved");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="font-display text-3xl">Settings</h1>
      <Tabs defaultValue="site">
        <TabsList><TabsTrigger value="site">Website</TabsTrigger><TabsTrigger value="seo">SEO</TabsTrigger><TabsTrigger value="smtp">SMTP</TabsTrigger><TabsTrigger value="notifications">Notifications</TabsTrigger></TabsList>

        <TabsContent value="site" className="bg-card border border-border rounded-xl p-5 space-y-3">
          <div><Label>Site name</Label><Input value={site.site_name} onChange={(e) => setSite({ ...site, site_name: e.target.value })} /></div>
          <div><Label>Tagline</Label><Input value={site.tagline} onChange={(e) => setSite({ ...site, tagline: e.target.value })} /></div>
          <Button onClick={() => save("site_settings", { site_name: site.site_name, tagline: site.tagline })} className="bg-gradient-gold text-onyx">Save</Button>
        </TabsContent>

        <TabsContent value="seo" className="bg-card border border-border rounded-xl p-5 space-y-3">
          <div><Label>SEO title</Label><Input value={site.seo_title} onChange={(e) => setSite({ ...site, seo_title: e.target.value })} /></div>
          <div><Label>Meta description</Label><Textarea value={site.seo_description} onChange={(e) => setSite({ ...site, seo_description: e.target.value })} /></div>
          <div><Label>Keywords (comma separated)</Label><Input value={site.seo_keywords} onChange={(e) => setSite({ ...site, seo_keywords: e.target.value })} /></div>
          <Button onClick={() => save("site_settings", { seo_title: site.seo_title, seo_description: site.seo_description, seo_keywords: site.seo_keywords })} className="bg-gradient-gold text-onyx">Save</Button>
        </TabsContent>

        <TabsContent value="smtp" className="bg-card border border-border rounded-xl p-5 space-y-3">
          <p className="text-xs text-muted-foreground">Configure your transactional email server. Sending requires connecting an email provider.</p>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>SMTP Host</Label><Input value={smtp.host} onChange={(e) => setSmtp({ ...smtp, host: e.target.value })} /></div>
            <div><Label>Port</Label><Input type="number" value={smtp.port} onChange={(e) => setSmtp({ ...smtp, port: Number(e.target.value) })} /></div>
            <div><Label>Username</Label><Input value={smtp.user} onChange={(e) => setSmtp({ ...smtp, user: e.target.value })} /></div>
            <div><Label>From address</Label><Input value={smtp.from} onChange={(e) => setSmtp({ ...smtp, from: e.target.value })} /></div>
          </div>
          <div className="flex items-center gap-2"><Switch checked={smtp.enabled} onCheckedChange={(v) => setSmtp({ ...smtp, enabled: v })} /><span className="text-sm">Enabled</span></div>
          <Button onClick={() => save("smtp_settings", smtp)} className="bg-gradient-gold text-onyx">Save</Button>
        </TabsContent>

        <TabsContent value="notifications" className="bg-card border border-border rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between"><Label>Email on new order</Label><Switch checked={notif.email_on_order} onCheckedChange={(v) => setNotif({ ...notif, email_on_order: v })} /></div>
          <div className="flex items-center justify-between"><Label>Low stock alerts</Label><Switch checked={notif.low_stock_alert} onCheckedChange={(v) => setNotif({ ...notif, low_stock_alert: v })} /></div>
          <Button onClick={() => save("notification_settings", notif)} className="bg-gradient-gold text-onyx">Save</Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
