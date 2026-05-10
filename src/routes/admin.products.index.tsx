import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { resolveImage, type DbProduct } from "@/lib/db";
import { formatPrice } from "@/lib/utils";


export const Route = createFileRoute("/admin/products/")({
  component: ProductsList,
});

function ProductsList() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as DbProduct[];
    },
  });

  const filtered = products.filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || (p.sku ?? "").toLowerCase().includes(q.toLowerCase()));

  const del = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl">Products</h1>
          <p className="text-sm text-muted-foreground">{products.length} total</p>
        </div>
        <Button asChild className="bg-gradient-gold text-onyx hover:brightness-110"><Link to="/admin/products/new"><Plus className="w-4 h-4" /> Add Product</Link></Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or SKU…" className="pl-9" />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="p-3">Product</th><th className="p-3">SKU</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3">Status</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {isLoading ? <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Loading…</td></tr> :
             filtered.length === 0 ? <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No products.</td></tr> :
             filtered.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3"><div className="flex items-center gap-3"><img src={resolveImage(p.images?.[0])} className="w-10 h-10 object-cover rounded" alt="" /><span className="font-medium">{p.name}</span></div></td>
                <td className="p-3 text-muted-foreground">{p.sku ?? "—"}</td>
                <td className="p-3">{formatPrice(p.discount_price ?? p.price)}</td>
                <td className={`p-3 ${p.stock <= p.low_stock_threshold ? "text-destructive" : ""}`}>{p.stock}</td>
                <td className="p-3"><span className={`text-xs px-2 py-1 rounded ${p.is_active ? "bg-gold/10 text-gold" : "bg-muted text-muted-foreground"}`}>{p.is_active ? "Active" : "Hidden"}</span></td>
                <td className="p-3 text-right">
                  <Link to="/admin/products/$id" params={{ id: p.id }} className="inline-flex p-2 hover:text-gold"><Edit className="w-4 h-4" /></Link>
                  <button onClick={() => del(p.id)} className="inline-flex p-2 hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
