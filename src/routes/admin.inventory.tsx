import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowUpRight, ArrowDownRight, Boxes } from "lucide-react";
import { AdminPage, AdminTitle, Card, CardHeader, AdminTable, Th, Td } from "@/components/ui/admin-ui";

export const Route = createFileRoute("/admin/inventory")({ component: InventoryPage });

function InventoryPage() {
  const qc = useQueryClient();
  const [productId, setProductId] = useState("");
  const [change, setChange] = useState<number | "">("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: products = [] } = useQuery({
    queryKey: ["inv-products"],
    queryFn: async () => (await supabase.from("products").select("id,name,sku,stock,low_stock_threshold").order("name")).data ?? [],
  });
  const { data: log = [] } = useQuery({
    queryKey: ["inv-log"],
    queryFn: async () => (await supabase.from("inventory_log").select("*, products(name)").order("created_at", { ascending: false }).limit(50)).data ?? [],
  });

  const adjust = async () => {
    if (!productId || !change) return toast.error("Select a product and enter an amount");
    setSaving(true);
    try {
      const product = (products as any[]).find((p) => p.id === productId);
      const newStock = Math.max(0, (product?.stock ?? 0) + Number(change));
      const { error } = await supabase.from("products").update({ stock: newStock }).eq("id", productId);
      if (error) throw error;
      await supabase.from("inventory_log").insert({ product_id: productId, change: Number(change), reason: reason || "Manual adjustment" });
      toast.success("Stock updated");
      setChange(""); setReason("");
      qc.invalidateQueries({ queryKey: ["inv-products"] });
      qc.invalidateQueries({ queryKey: ["inv-log"] });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminPage>
      <AdminTitle sub="Adjust stock levels and review movement history">Inventory</AdminTitle>

      {/* Adjustment bar */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Boxes size={14} className="text-gold" />
          <p className="text-[10px] font-black uppercase tracking-widest text-black/40">Stock Adjustment</p>
        </div>
        <div className="grid md:grid-cols-4 gap-3">
          <Select value={productId} onValueChange={setProductId}>
            <SelectTrigger className="h-10 bg-black/[0.03] border-black/[0.08]">
              <SelectValue placeholder="Select product" />
            </SelectTrigger>
            <SelectContent>
              {(products as any[]).map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name} (stock: {p.stock})</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="Change e.g. +10 or -3"
            value={change}
            onChange={(e) => setChange(e.target.value === "" ? "" : Number(e.target.value))}
            className="h-10 bg-black/[0.03] border-black/[0.08]"
          />
          <Input
            placeholder="Reason (New shipment, Audit…)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="h-10 bg-black/[0.03] border-black/[0.08]"
          />
          <Button
            onClick={adjust}
            disabled={saving}
            className="h-10 bg-gradient-gold text-onyx font-bold hover:brightness-105"
          >
            {saving ? "Applying…" : "Apply Change"}
          </Button>
        </div>
      </Card>

      {/* Tables side by side */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Stock levels */}
        <Card>
          <CardHeader title="Live Stock Levels" />
          <AdminTable>
            <thead>
              <tr><Th>Product</Th><Th>SKU</Th><Th right>Qty</Th></tr>
            </thead>
            <tbody>
              {(products as any[]).map((p) => (
                <tr key={p.id} className="hover:bg-black/[0.01] transition-colors">
                  <Td>{p.name}</Td>
                  <Td mono>{p.sku ?? "—"}</Td>
                  <td className="px-5 py-3.5 text-right border-b border-black/[0.04]">
                    <span className={`inline-block font-bold text-sm px-2.5 py-0.5 rounded-lg
                      ${p.stock === 0
                        ? "bg-red-50 text-red-500"
                        : p.stock <= p.low_stock_threshold
                          ? "bg-amber-50 text-amber-600"
                          : "bg-emerald-50 text-emerald-600"}`}>
                      {p.stock}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </AdminTable>
        </Card>

        {/* Movement history */}
        <Card>
          <CardHeader title="Movement History" />
          <div className="divide-y divide-black/[0.05] max-h-[420px] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {(log as any[]).map((l) => (
              <div key={l.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-black/[0.01] transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-800">{l.products?.name}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{l.reason} · {new Date(l.created_at).toLocaleDateString()}</p>
                </div>
                <div className={`flex items-center gap-1 font-bold text-sm ${l.change > 0 ? "text-emerald-500" : "text-red-400"}`}>
                  {l.change > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {Math.abs(l.change)}
                </div>
              </div>
            ))}
            {log.length === 0 && (
              <p className="px-6 py-8 text-center text-gray-400 text-sm">No movement recorded yet.</p>
            )}
          </div>
        </Card>
      </div>
    </AdminPage>
  );
}