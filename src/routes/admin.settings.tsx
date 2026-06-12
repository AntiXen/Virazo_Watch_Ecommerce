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
import { AdminPage, AdminTitle, FormCard } from "@/components/ui/admin-ui";

export const Route = createFileRoute("/admin/settings")({ component: SettingsPage });

function SettingsPage() {
  const [site, setSite] = useState<any>({ site_name: "", tagline: "", seo_title: "", seo_description: "", seo_keywords: "" });
  const [smtp, setSmtp] = useState<any>({ host: "", port: 587, user: "", from: "", enabled: false });
  const [notif, setNotif] = useState<any>({ email_on_order: true, low_stock_alert: true });
  const [saving, setSaving] = useState(false);

  const load = async (key: string, setter: (v: any) => void, def: any) => {
    const { data } = await supabase.from("content_blocks").select("value").eq("key", key).maybeSingle();
    setter({ ...def, ...((data?.value as any) ?? {}) });
  };
  useEffect(() => { load("site_settings", setSite, site); load("smtp_settings", setSmtp, smtp); load("notification_settings", setNotif, notif); }, []);

  const save = async (key: string, value: any) => {
    setSaving(true);
    try {
      if (key === "site_settings") {
        const current = (await supabase.from("content_blocks").select("value").eq("key", key).maybeSingle()).data?.value as any || {};
        value = { ...current, ...value };
      }
      const { error } = await supabase.from("content_blocks").upsert({ key, value });
      if (error) throw error;
      toast.success("Saved successfully");
    } catch (e: any) { toast.error(e.message); } finally { setSaving(false); }
  };

  const field = (label: string, value: string, onChange: (v: string) => void, placeholder = "") => (
    <div className="space-y-1.5">
      <Label className="text-xs text-gray-500 font-semibold">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="bg-black/[0.02] border-black/[0.08]" />
    </div>
  );

  return (
    <AdminPage>
      <AdminTitle sub="Configure your store settings">Settings</AdminTitle>
      <Tabs defaultValue="site">
        <TabsList className="bg-black/[0.04] border border-black/[0.06] p-1 rounded-xl mb-5">
          {["site", "seo", "smtp", "notifications"].map((t) => (
            <TabsTrigger key={t} value={t} className="rounded-lg text-xs font-semibold capitalize data-[state=active]:bg-white data-[state=active]:shadow-sm">
              {t === "smtp" ? "SMTP" : t.charAt(0).toUpperCase() + t.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="site">
          <FormCard>
            <div className="grid md:grid-cols-2 gap-4">
              {field("Site Name", site.site_name, (v) => setSite({ ...site, site_name: v }), "Virazo Watch")}
              {field("Tagline", site.tagline, (v) => setSite({ ...site, tagline: v }), "Premium Timepieces")}
            </div>
            <Button disabled={saving} onClick={() => save("site_settings", { site_name: site.site_name, tagline: site.tagline })} className="bg-gradient-gold text-onyx font-bold hover:brightness-105">Save</Button>
          </FormCard>
        </TabsContent>

        <TabsContent value="seo">
          <FormCard>
            <div className="space-y-4">
              {field("SEO Title", site.seo_title, (v) => setSite({ ...site, seo_title: v }))}
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500 font-semibold">Meta Description</Label>
                <Textarea value={site.seo_description} onChange={(e) => setSite({ ...site, seo_description: e.target.value })} rows={3} className="bg-black/[0.02] border-black/[0.08]" />
              </div>
              {field("Keywords (comma separated)", site.seo_keywords, (v) => setSite({ ...site, seo_keywords: v }))}
            </div>
            <Button disabled={saving} onClick={() => save("site_settings", { seo_title: site.seo_title, seo_description: site.seo_description, seo_keywords: site.seo_keywords })} className="bg-gradient-gold text-onyx font-bold hover:brightness-105">Save</Button>
          </FormCard>
        </TabsContent>

        <TabsContent value="smtp">
          <FormCard>
            <p className="text-xs text-gray-400 bg-black/[0.02] border border-black/[0.06] rounded-xl px-4 py-3">Configure your transactional email server. Requires a provider like Resend or SendGrid.</p>
            <div className="grid grid-cols-2 gap-4">
              {field("SMTP Host", smtp.host, (v) => setSmtp({ ...smtp, host: v }), "smtp.resend.com")}
              {field("Port", String(smtp.port), (v) => setSmtp({ ...smtp, port: Number(v) }), "587")}
              {field("Username", smtp.user, (v) => setSmtp({ ...smtp, user: v }))}
              {field("From Address", smtp.from, (v) => setSmtp({ ...smtp, from: v }), "orders@yourdomain.com")}
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Switch checked={smtp.enabled} onCheckedChange={(v) => setSmtp({ ...smtp, enabled: v })} />
              <span className="text-sm text-gray-600">Enable email sending</span>
            </div>
            <Button disabled={saving} onClick={() => save("smtp_settings", smtp)} className="bg-gradient-gold text-onyx font-bold hover:brightness-105">Save</Button>
          </FormCard>
        </TabsContent>

        <TabsContent value="notifications">
          <FormCard>
            <div className="space-y-4">
              {[
                { label: "Email on new order", key: "email_on_order" },
                { label: "Low stock alerts", key: "low_stock_alert" },
              ].map(({ label, key }) => (
                <div key={key} className="flex items-center justify-between py-3 border-b border-black/[0.05] last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{label}</p>
                  </div>
                  <Switch checked={notif[key]} onCheckedChange={(v) => setNotif({ ...notif, [key]: v })} />
                </div>
              ))}
            </div>
            <Button disabled={saving} onClick={() => save("notification_settings", notif)} className="bg-gradient-gold text-onyx font-bold hover:brightness-105">Save</Button>
          </FormCard>
        </TabsContent>
      </Tabs>
    </AdminPage>
  );
}