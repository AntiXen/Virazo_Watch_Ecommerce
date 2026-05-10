import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/content")({
  component: ContentPage,
});

function useBlock<T extends Record<string, any>>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    supabase.from("content_blocks").select("value").eq("key", key).maybeSingle().then(({ data }) => {
      if (data?.value) setValue({ ...initial, ...(data.value as any) });
      setLoaded(true);
    });
  }, [key]);
  const save = async () => {
    const { error } = await supabase.from("content_blocks").upsert({ key, value: value as any });
    if (error) return toast.error(error.message);
    toast.success("Saved");
  };
  return { value, setValue, loaded, save };
}

function ContentPage() {
  const about = useBlock("about_page", { title: "", content: "" });
  const policies = useBlock("policies", { shipping: "", returns: "", warranty: "" });
  const home = useBlock("homepage", { hero_title: "", hero_subtitle: "" });
  const footer = useBlock("footer_links", { col1_title: "Shop", col1: [] as { label: string; url: string }[], col2_title: "Support", col2: [] as { label: string; url: string }[] });

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="font-display text-3xl">Content & Pages</h1>
      <Tabs defaultValue="home">
        <TabsList><TabsTrigger value="home">Homepage</TabsTrigger><TabsTrigger value="about">About</TabsTrigger><TabsTrigger value="policies">Policies</TabsTrigger><TabsTrigger value="footer">Footer</TabsTrigger></TabsList>

        <TabsContent value="home" className="bg-card border border-border rounded-xl p-5 space-y-3">
          <div><Label>Hero Title</Label><Input value={home.value.hero_title} onChange={(e) => home.setValue({ ...home.value, hero_title: e.target.value })} /></div>
          <div><Label>Hero Subtitle</Label><Textarea value={home.value.hero_subtitle} onChange={(e) => home.setValue({ ...home.value, hero_subtitle: e.target.value })} /></div>
          <Button onClick={home.save} className="bg-gradient-gold text-onyx hover:brightness-110">Save</Button>
        </TabsContent>

        <TabsContent value="about" className="bg-card border border-border rounded-xl p-5 space-y-3">
          <div><Label>Title</Label><Input value={about.value.title} onChange={(e) => about.setValue({ ...about.value, title: e.target.value })} /></div>
          <div><Label>Content</Label><Textarea rows={8} value={about.value.content} onChange={(e) => about.setValue({ ...about.value, content: e.target.value })} /></div>
          <Button onClick={about.save} className="bg-gradient-gold text-onyx hover:brightness-110">Save</Button>
        </TabsContent>

        <TabsContent value="policies" className="bg-card border border-border rounded-xl p-5 space-y-3">
          <div><Label>Shipping</Label><Textarea rows={3} value={policies.value.shipping} onChange={(e) => policies.setValue({ ...policies.value, shipping: e.target.value })} /></div>
          <div><Label>Returns</Label><Textarea rows={3} value={policies.value.returns} onChange={(e) => policies.setValue({ ...policies.value, returns: e.target.value })} /></div>
          <div><Label>Warranty</Label><Textarea rows={3} value={policies.value.warranty} onChange={(e) => policies.setValue({ ...policies.value, warranty: e.target.value })} /></div>
          <Button onClick={policies.save} className="bg-gradient-gold text-onyx hover:brightness-110">Save</Button>
        </TabsContent>

        <TabsContent value="footer" className="bg-card border border-border rounded-xl p-5 space-y-3">
          <p className="text-sm text-muted-foreground">Footer link columns (JSON-style editor).</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Column 1 title</Label>
              <Input value={footer.value.col1_title} onChange={(e) => footer.setValue({ ...footer.value, col1_title: e.target.value })} />
              <LinkList items={footer.value.col1} onChange={(v) => footer.setValue({ ...footer.value, col1: v })} />
            </div>
            <div className="space-y-2">
              <Label>Column 2 title</Label>
              <Input value={footer.value.col2_title} onChange={(e) => footer.setValue({ ...footer.value, col2_title: e.target.value })} />
              <LinkList items={footer.value.col2} onChange={(v) => footer.setValue({ ...footer.value, col2: v })} />
            </div>
          </div>
          <Button onClick={footer.save} className="bg-gradient-gold text-onyx hover:brightness-110">Save</Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LinkList({ items, onChange }: { items: { label: string; url: string }[]; onChange: (v: { label: string; url: string }[]) => void }) {
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="flex gap-2">
          <Input placeholder="Label" value={it.label} onChange={(e) => { const c = [...items]; c[i] = { ...c[i], label: e.target.value }; onChange(c); }} />
          <Input placeholder="URL" value={it.url} onChange={(e) => { const c = [...items]; c[i] = { ...c[i], url: e.target.value }; onChange(c); }} />
          <Button type="button" variant="outline" onClick={() => onChange(items.filter((_, j) => j !== i))}>×</Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, { label: "", url: "" }])}>+ Add link</Button>
    </div>
  );
}
