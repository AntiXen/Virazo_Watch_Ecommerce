import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/deals")({
  component: DealsPage,
});

function DealsPage() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["admin-deals"],
    queryFn: async () => (await supabase.from("deals").select("*, products(name)").order("ends_at")).data ?? [],
  });
  const { data: products = [] } = useQuery({
    queryKey: ["all-products-min"],
    queryFn: async () => (await supabase.from("products").select("id,name").order("name")).data ?? [],
  });

  const [title, setTitle] = useState(""); const [subtitle, setSubtitle] = useState("");
  const [productId, setProductId] = useState(""); const [endsAt, setEndsAt] = useState("");

  const add = async () => {
    if (!title || !endsAt) return toast.error("Title and end date required");
    await supabase.from("deals").insert({ title, subtitle, product_id: productId || null, ends_at: new Date(endsAt).toISOString() });
    setTitle(""); setSubtitle(""); setProductId(""); setEndsAt("");
    qc.invalidateQueries({ queryKey: ["admin-deals"] });
  };
  const toggle = async (id: string, v: boolean) => { await supabase.from("deals").update({ is_active: v }).eq("id", id); qc.invalidateQueries({ queryKey: ["admin-deals"] }); };
  const del = async (id: string) => { if (!confirm("Delete?")) return; await supabase.from("deals").delete().eq("id", id); qc.invalidateQueries({ queryKey: ["admin-deals"] }); };

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="font-display text-3xl">Deals</h1>
      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <div className="grid md:grid-cols-2 gap-3">
          <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div><Label>Subtitle</Label><Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} /></div>
          <div>
            <Label>Product</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{products.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Ends at</Label><Input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} /></div>
        </div>
        <Button onClick={add} className="bg-gradient-gold text-onyx hover:brightness-110">Add Deal</Button>
      </div>
      <div className="space-y-3">
        {data.map((d: any) => (
          <div key={d.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="font-medium">{d.title}</div>
              <div className="text-xs text-muted-foreground">{d.products?.name} • Ends {new Date(d.ends_at).toLocaleString()}</div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={d.is_active} onCheckedChange={(v) => toggle(d.id, v)} />
              <button onClick={() => del(d.id)} className="p-2 hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
