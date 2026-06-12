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
import { Trash2, Tag } from "lucide-react";
import { AdminPage, AdminTitle, FormCard, Card, Badge } from "@/components/ui/admin-ui";

export const Route = createFileRoute("/admin/deals")({ component: DealsPage });

function DealsPage() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["admin-deals"], queryFn: async () => (await supabase.from("deals").select("*, products(name)").order("ends_at")).data ?? [] });
  const { data: products = [] } = useQuery({ queryKey: ["all-products-min"], queryFn: async () => (await supabase.from("products").select("id,name").order("name")).data ?? [] });
  const [title, setTitle] = useState(""); const [subtitle, setSubtitle] = useState("");
  const [productId, setProductId] = useState(""); const [endsAt, setEndsAt] = useState("");

  const add = async () => {
    if (!title || !endsAt) return toast.error("Title and end date required");
    await supabase.from("deals").insert({ title, subtitle, product_id: productId || null, ends_at: new Date(endsAt).toISOString() });
    setTitle(""); setSubtitle(""); setProductId(""); setEndsAt("");
    qc.invalidateQueries({ queryKey: ["admin-deals"] });
    toast.success("Deal added");
  };
  const toggle = async (id: string, v: boolean) => { await supabase.from("deals").update({ is_active: v }).eq("id", id); qc.invalidateQueries({ queryKey: ["admin-deals"] }); };
  const del = async (id: string) => { if (!confirm("Delete?")) return; await supabase.from("deals").delete().eq("id", id); qc.invalidateQueries({ queryKey: ["admin-deals"] }); };

  return (
    <AdminPage>
      <AdminTitle>Deals</AdminTitle>
      <FormCard>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label className="text-xs text-gray-500 font-semibold">Title *</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-black/[0.02] border-black/[0.08]" /></div>
          <div className="space-y-1.5"><Label className="text-xs text-gray-500 font-semibold">Subtitle</Label><Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="bg-black/[0.02] border-black/[0.08]" /></div>
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500 font-semibold">Linked Product</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger className="bg-black/[0.02] border-black/[0.08] h-10"><SelectValue placeholder="Optional" /></SelectTrigger>
              <SelectContent>{(products as any[]).map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label className="text-xs text-gray-500 font-semibold">Ends At *</Label><Input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className="bg-black/[0.02] border-black/[0.08]" /></div>
        </div>
        <Button onClick={add} className="bg-gradient-gold text-onyx font-bold hover:brightness-105">Add Deal</Button>
      </FormCard>

      <div className="space-y-3">
        {(data as any[]).map((d) => {
          const expired = new Date(d.ends_at) < new Date();
          return (
            <Card key={d.id} className="p-4 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center shrink-0"><Tag size={15} className="text-gold" /></div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{d.title}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {d.products?.name && <span>{d.products.name} · </span>}
                    Ends {new Date(d.ends_at).toLocaleString()}
                    {expired && <span className="ml-2 text-red-400 font-bold">Expired</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={d.is_active ? "gold" : "default"}>{d.is_active ? "Active" : "Off"}</Badge>
                <Switch checked={d.is_active} onCheckedChange={(v) => toggle(d.id, v)} />
                <button onClick={() => del(d.id)} className="p-1.5 hover:text-red-400 text-gray-300 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
              </div>
            </Card>
          );
        })}
        {data.length === 0 && <p className="text-center text-gray-400 py-8 text-sm">No deals yet.</p>}
      </div>
    </AdminPage>
  );
}