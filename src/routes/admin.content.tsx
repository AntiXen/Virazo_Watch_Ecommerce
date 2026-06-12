import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { AdminPage, AdminTitle, FormCard } from "@/components/ui/admin-ui";

export const Route = createFileRoute("/admin/content")({ component: ContentPage });

function useBlock<T extends Record<string, any>>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  useEffect(() => {
    supabase.from("content_blocks").select("value").eq("key", key).maybeSingle().then(({ data }) => {
      if (data?.value) setValue({ ...initial, ...(data.value as any) });
    });
  }, [key]);
  const save = async () => {
    const { error } = await supabase.from("content_blocks").upsert({ key, value: value as any });
    if (error) return toast.error(error.message);
    toast.success("Saved");
  };
  return { value, setValue, save };
}

function F({ label, value, onChange, rows }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-gray-500 font-semibold">{label}</Label>
      {rows ? (
        <Textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} className="bg-black/[0.02] border-black/[0.08]" />
      ) : (
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="bg-black/[0.02] border-black/[0.08]" />
      )}
    </div>
  );
}

function ContentPage() {
  const about = useBlock("about_page", { title: "", content: "" });
  const policies = useBlock("policies", { shipping: "", returns: "", warranty: "" });
  const home = useBlock("homepage", { hero_title: "", hero_subtitle: "" });
  const footer = useBlock("footer_links", { col1_title: "Shop", col1: [] as { label: string; url: string }[], col2_title: "Support", col2: [] as { label: string; url: string }[] });

  return (
    <AdminPage>
      <AdminTitle sub="Edit homepage text, policies, and footer links">Content & Pages</AdminTitle>
      <Tabs defaultValue="home">
        <TabsList className="bg-black/[0.04] border border-black/[0.06] p-1 rounded-xl mb-5">
          {["home", "about", "policies", "footer"].map((t) => (
            <TabsTrigger key={t} value={t} className="rounded-lg text-xs font-semibold capitalize data-[state=active]:bg-white data-[state=active]:shadow-sm">
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="home">
          <FormCard>
            <F label="Hero Title" value={home.value.hero_title} onChange={(v) => home.setValue({ ...home.value, hero_title: v })} />
            <F label="Hero Subtitle" value={home.value.hero_subtitle} onChange={(v) => home.setValue({ ...home.value, hero_subtitle: v })} rows={3} />
            <Button onClick={home.save} className="bg-gradient-gold text-onyx font-bold hover:brightness-105">Save</Button>
          </FormCard>
        </TabsContent>

        <TabsContent value="about">
          <FormCard>
            <F label="Page Title" value={about.value.title} onChange={(v) => about.setValue({ ...about.value, title: v })} />
            <F label="Content" value={about.value.content} onChange={(v) => about.setValue({ ...about.value, content: v })} rows={8} />
            <Button onClick={about.save} className="bg-gradient-gold text-onyx font-bold hover:brightness-105">Save</Button>
          </FormCard>
        </TabsContent>

        <TabsContent value="policies">
          <FormCard>
            <F label="Shipping Policy" value={policies.value.shipping} onChange={(v) => policies.setValue({ ...policies.value, shipping: v })} rows={4} />
            <F label="Returns Policy" value={policies.value.returns} onChange={(v) => policies.setValue({ ...policies.value, returns: v })} rows={4} />
            <F label="Warranty Policy" value={policies.value.warranty} onChange={(v) => policies.setValue({ ...policies.value, warranty: v })} rows={4} />
            <Button onClick={policies.save} className="bg-gradient-gold text-onyx font-bold hover:brightness-105">Save</Button>
          </FormCard>
        </TabsContent>

        <TabsContent value="footer">
          <FormCard>
            <p className="text-xs text-gray-400">Manage footer navigation columns.</p>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { title: footer.value.col1_title, items: footer.value.col1, setTitle: (v: string) => footer.setValue({ ...footer.value, col1_title: v }), setItems: (v: any) => footer.setValue({ ...footer.value, col1: v }) },
                { title: footer.value.col2_title, items: footer.value.col2, setTitle: (v: string) => footer.setValue({ ...footer.value, col2_title: v }), setItems: (v: any) => footer.setValue({ ...footer.value, col2: v }) },
              ].map((col, ci) => (
                <div key={ci} className="space-y-3">
                  <F label={`Column ${ci + 1} Title`} value={col.title} onChange={col.setTitle} />
                  <div className="space-y-2">
                    {col.items.map((it: any, i: number) => (
                      <div key={i} className="flex gap-2">
                        <Input placeholder="Label" value={it.label} onChange={(e) => { const c = [...col.items]; c[i] = { ...c[i], label: e.target.value }; col.setItems(c); }} className="bg-black/[0.02] border-black/[0.08] h-9 text-xs" />
                        <Input placeholder="URL" value={it.url} onChange={(e) => { const c = [...col.items]; c[i] = { ...c[i], url: e.target.value }; col.setItems(c); }} className="bg-black/[0.02] border-black/[0.08] h-9 text-xs" />
                        <button onClick={() => col.setItems(col.items.filter((_: any, j: number) => j !== i))} className="px-2 text-gray-300 hover:text-red-400 text-lg leading-none">×</button>
                      </div>
                    ))}
                    <button onClick={() => col.setItems([...col.items, { label: "", url: "" }])} className="text-xs text-gold hover:underline">+ Add link</button>
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={footer.save} className="bg-gradient-gold text-onyx font-bold hover:brightness-105">Save</Button>
          </FormCard>
        </TabsContent>
      </Tabs>
    </AdminPage>
  );
}