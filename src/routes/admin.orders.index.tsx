import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, Plus } from "lucide-react";
import { useState } from "react";
import { formatPrice } from "@/lib/utils";
import { AdminPage, AdminTitle, AdminTable, Th, Td, Badge } from "@/components/ui/admin-ui";

export const Route = createFileRoute("/admin/orders/")({ component: OrdersList });

const statuses = ["pending", "processing", "delivered", "cancelled"] as const;

const statusVariant: Record<string, any> = {
  delivered:  "success",
  processing: "default",
  pending:    "warning",
  cancelled:  "danger",
};

function OrdersList() {
  const qc = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");

  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => (await supabase.from("orders").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const { data: products = [] } = useQuery({
    queryKey: ["admin-products-list"],
    queryFn: async () => (await supabase.from("products").select("id, name, price, stock")).data ?? [],
  });

  const setStatus = async (id: string, status: string) => {
    qc.setQueryData(["admin-orders"], (old: any[]) =>
      (old ?? []).map((o) => (o.id === id ? { ...o, status } : o))
    );
    const { error } = await supabase.from("orders").update({ status: status as any }).eq("id", id);
    if (error) { qc.invalidateQueries({ queryKey: ["admin-orders"] }); return toast.error(error.message); }
    toast.success("Order status updated");
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  };

  const handleManualOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const qty = Number(formData.get("qty"));
    const manualPrice = Number(formData.get("manualPrice"));
    const selectedProduct = (products as any[]).find((p) => p.id === selectedProductId);
    if (!selectedProduct) { toast.error("Please select a product"); setLoading(false); return; }
    if (selectedProduct.stock < qty) { toast.error("Not enough stock!"); setLoading(false); return; }
    try {
      const { data: order, error: orderError } = await supabase.from("orders").insert([{
        customer_name: formData.get("name"), customer_phone: formData.get("phone"),
        customer_email: `${formData.get("name")?.toString().toLowerCase().replace(/\s/g, "")}@manual.com`,
        address: "Offline Store Sale", city: "Dhaka",
        total: manualPrice * qty, subtotal: manualPrice * qty, shipping: 0,
        status: "delivered", payment_status: "paid", payment_method: "offline",
      }]).select("id").single();
      if (orderError || !order) throw orderError ?? new Error("Order failed");
      await supabase.from("order_items").insert([{ order_id: order.id, product_id: selectedProductId, product_name: selectedProduct.name, quantity: qty, unit_price: manualPrice }]);
      await supabase.from("products").update({ stock: selectedProduct.stock - qty }).eq("id", selectedProductId);
      toast.success("Offline sale recorded & stock updated!");
      setIsModalOpen(false);
      setSelectedProductId("");
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      qc.invalidateQueries({ queryKey: ["admin-products-list"] });
    } catch (error: any) {
      toast.error(error.message);
    } finally { setLoading(false); }
  };

  return (
    <AdminPage>
      <div className="flex items-center justify-between">
        <AdminTitle sub={`${orders.length} total orders`}>Orders</AdminTitle>

        <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if (!open) setSelectedProductId(""); }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-gold text-onyx font-bold hover:brightness-105 gap-2">
              <Plus size={15} /> Manual Order
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px] bg-white border-black/10">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl text-gray-900">Offline Sale</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleManualOrder} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-500 font-semibold">Customer Name</Label>
                  <Input name="name" className="bg-black/[0.02] border-black/[0.08]" placeholder="e.g. Amit" required />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-500 font-semibold">Phone</Label>
                  <Input name="phone" className="bg-black/[0.02] border-black/[0.08]" placeholder="017…" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500 font-semibold">Product</Label>
                <Select value={selectedProductId} onValueChange={setSelectedProductId} required>
                  <SelectTrigger className="bg-black/[0.02] border-black/[0.08]">
                    <SelectValue placeholder="Choose a watch" />
                  </SelectTrigger>
                  <SelectContent>
                    {(products as any[]).map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-500 font-semibold">Quantity</Label>
                  <Input name="qty" type="number" defaultValue="1" min="1" className="bg-black/[0.02] border-black/[0.08]" required />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-500 font-semibold">Unit Price (৳)</Label>
                  <Input name="manualPrice" type="number" className="bg-black/[0.02] border-black/[0.08]" placeholder="Amount" required />
                </div>
              </div>
              <Button type="submit" className="w-full h-11 bg-gradient-gold text-onyx font-bold hover:brightness-105" disabled={loading || !selectedProductId}>
                {loading ? "Processing…" : "Confirm Sale"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <AdminTable>
        <thead>
          <tr><Th>Order #</Th><Th>Customer</Th><Th>Total</Th><Th>Status</Th><Th>Date</Th><Th right></Th></tr>
        </thead>
        <tbody>
          {(orders as any[]).map((o: any) => (
            <tr key={o.id} className="hover:bg-black/[0.01] transition-colors">
              <Td mono>{o.order_number || `#${o.id.slice(0, 8)}`}</Td>
              <td className="px-5 py-3.5 border-b border-black/[0.04]">
                <p className="font-medium text-gray-900 text-sm">{o.customer_name}</p>
                <p className="text-[10px] text-gray-400">{o.customer_phone}</p>
              </td>
              <Td gold>{formatPrice(o.total)}</Td>
              <td className="px-5 py-3.5 border-b border-black/[0.04]">
                <Select value={o.status} onValueChange={(v) => setStatus(o.id, v)}>
                  <SelectTrigger className={`w-32 h-8 text-[11px] font-bold border rounded-lg
                    ${o.status === "delivered"  ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      o.status === "processing" ? "bg-blue-50 text-blue-700 border-blue-200" :
                      o.status === "cancelled"  ? "bg-red-50 text-red-600 border-red-200" :
                                                  "bg-amber-50 text-amber-700 border-amber-200"}`}>
                    <SelectValue>{o.status}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => (
                      <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </td>
              <Td muted>{new Date(o.created_at).toLocaleDateString()}</Td>
              <Td right>
                <Link to="/admin/orders/$id" params={{ id: o.id }} className="p-1.5 inline-flex hover:text-gold text-gray-300 transition-colors rounded-lg hover:bg-gold/5">
                  <Eye size={14} />
                </Link>
              </Td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400 text-sm">No orders yet.</td></tr>
          )}
        </tbody>
      </AdminTable>
    </AdminPage>
  );
}