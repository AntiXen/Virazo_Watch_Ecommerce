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
import { AdminPage, AdminTitle, AdminTable, Th, Td, Badge } from "@/components/ui/admin-ui";

export const Route = createFileRoute("/admin/products/")({ component: ProductsList });

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

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(q.toLowerCase()) || (p.sku ?? "").toLowerCase().includes(q.toLowerCase())
  );

  const del = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Product deleted");
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  };

  return (
    <AdminPage>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <AdminTitle sub={`${products.length} products total`}>Products</AdminTitle>
        <Button asChild className="bg-gradient-gold text-onyx font-bold hover:brightness-105 gap-2">
          <Link to="/admin/products/new"><Plus size={15} /> Add Product</Link>
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name or SKU…"
          className="pl-9 bg-white border-black/[0.08] h-9"
        />
      </div>

      <AdminTable>
        <thead>
          <tr><Th>Product</Th><Th>SKU</Th><Th>Price</Th><Th>Stock</Th><Th>Status</Th><Th right></Th></tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400 text-sm">Loading…</td></tr>
          ) : filtered.length === 0 ? (
            <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400 text-sm">No products found.</td></tr>
          ) : filtered.map((p) => (
            <tr key={p.id} className="hover:bg-black/[0.01] transition-colors">
              <td className="px-5 py-3.5 border-b border-black/[0.04]">
                <div className="flex items-center gap-3">
                  <img src={resolveImage(p.images?.[0])} className="w-10 h-10 object-cover rounded-lg border border-black/[0.07] shrink-0" alt="" />
                  <span className="font-medium text-gray-900 text-sm">{p.name}</span>
                </div>
              </td>
              <Td mono>{p.sku ?? "—"}</Td>
              <Td gold>{formatPrice(p.discount_price ?? p.price)}</Td>
              <td className="px-5 py-3.5 border-b border-black/[0.04]">
                <span className={`inline-block font-bold text-sm px-2.5 py-0.5 rounded-lg
                  ${p.stock === 0
                    ? "bg-red-50 text-red-500"
                    : p.stock <= p.low_stock_threshold
                      ? "bg-amber-50 text-amber-600"
                      : "bg-emerald-50 text-emerald-600"}`}>
                  {p.stock}
                </span>
              </td>
              <td className="px-5 py-3.5 border-b border-black/[0.04]">
                <Badge variant={p.is_active ? "gold" : "default"}>{p.is_active ? "Active" : "Hidden"}</Badge>
              </td>
              <td className="px-5 py-3.5 border-b border-black/[0.04] text-right">
                <Link to="/admin/products/$id" params={{ id: p.id }} className="p-1.5 inline-flex hover:text-gold text-gray-300 transition-colors rounded-lg hover:bg-gold/5 mr-1">
                  <Edit size={14} />
                </Link>
                <button onClick={() => del(p.id)} className="p-1.5 inline-flex hover:text-red-400 text-gray-300 transition-colors rounded-lg hover:bg-red-50">
                  <Trash2 size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </AdminTable>
    </AdminPage>
  );
}