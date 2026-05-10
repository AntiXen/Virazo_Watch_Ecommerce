import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/inventory")({
  component: InventoryPage,
});

function InventoryPage() {
  const qc = useQueryClient();
  const { data: products = [] } = useQuery({
    queryKey: ["inv-products"],
    queryFn: async () => (await supabase.from("products").select("id,name,sku,stock,low_stock_threshold").order("name")).data ?? [],
  });
  const { data: log = [] } = useQuery({
    queryKey: ["inv-log"],
    queryFn: async () => (await supabase.from("inventory_log").select("*, products(name)").order("created_at", { ascending: false }).limit(50)).data ?? [],
  });

  const [productId, setProductId] = useState(""); const [change, setChange] = useState(0); const [reason, setReason] = useState("");

  const adjust = async () => {
    if (!productId || !change) return;
    const product = products.find((p: any) => p.id === productId) as any;
    const newStock = (product?.stock ?? 0) + change;
    const u = await supabase.from("products").update({ stock: newStock }).eq("id", productId);
    if (u.error) return toast.error(u.error.message);
    await supabase.from("inventory_log").insert({ product_id: productId, change, reason });
    toast.success("Stock updated");
    setChange(0); setReason("");
    qc.invalidateQueries({ queryKey: ["inv-products"] });
    qc.invalidateQueries({ queryKey: ["inv-log"] });
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Inventory</h1>
      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <div className="text-sm font-medium">Adjust stock</div>
        <div className="grid md:grid-cols-4 gap-3">
          <Select value={productId} onValueChange={setProductId}>
            <SelectTrigger><SelectValue placeholder="Product" /></SelectTrigger>
            <SelectContent>{products.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name} (stock: {p.stock})</SelectItem>)}</SelectContent>
          </Select>
          <Input type="number" placeholder="Change (+/-)" value={change} onChange={(e) => setChange(Number(e.target.value))} />
          <Input placeholder="Reason (purchase, sale, audit)" value={reason} onChange={(e) => setReason(e.target.value)} />
          <Button onClick={adjust} className="bg-gradient-gold text-onyx hover:brightness-110">Apply</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-display text-xl mb-3">Stock levels</h2>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-muted-foreground"><th className="p-2">Product</th><th className="p-2">SKU</th><th className="p-2">Stock</th></tr></thead>
            <tbody>{products.map((p: any) => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-2">{p.name}</td>
                <td className="p-2 text-muted-foreground text-xs">{p.sku ?? "—"}</td>
                <td className={`p-2 ${p.stock <= p.low_stock_threshold ? "text-destructive font-semibold" : ""}`}>{p.stock}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-display text-xl mb-3">Inventory history</h2>
          <ul className="space-y-2 text-sm">
            {log.map((l: any) => (
              <li key={l.id} className="flex items-center justify-between border-b border-border/50 pb-2">
                <div>
                  <div>{l.products?.name}</div>
                  <div className="text-xs text-muted-foreground">{l.reason} • {new Date(l.created_at).toLocaleString()}</div>
                </div>
                <span className={l.change > 0 ? "text-gold" : "text-destructive"}>{l.change > 0 ? "+" : ""}{l.change}</span>
              </li>
            ))}
            {log.length === 0 && <li className="text-muted-foreground">No history yet.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
