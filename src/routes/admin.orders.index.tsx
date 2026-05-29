import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Eye, Plus, ShoppingBag, CheckCircle, Package } from "lucide-react";
import { useState } from "react";
import { formatPrice } from "@/lib/utils";

export const Route = createFileRoute("/admin/orders/")({
  component: OrdersList,
});

const statuses = ["pending", "processing", "delivered", "cancelled"] as const;

function OrdersList() {
  const qc = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`*, order_items (product_name, quantity, product_id)`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: products = [] } = useQuery({
    queryKey: ["admin-products-list"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("id, name, price, stock").eq("is_active", true);
      return data || [];
    },
  });

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status: status as any }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Status updated to ${status}`);
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  };

  // Production "Accept" with automated logging
  const handleAccept = async (o: any) => {
    try {
      setLoading(true);
      
      // Set the "Reason" for the DB Trigger
      await supabase.rpc('set_config', { name: 'app.inventory_log_reason', value: `Sale: Order #${o.order_number}`, is_local: true });

      for (const item of o.order_items) {
        await supabase.rpc('reduce_stock', { p_id: item.product_id, q: item.quantity });
      }

      await supabase.from("orders").update({ status: "processing" }).eq("id", o.id);
      
      toast.success("Order confirmed and stock logged");
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      qc.invalidateQueries({ queryKey: ["inv-log"] }); // Refresh inventory history
    } catch (err) {
      toast.error("Failed to process order");
    } finally {
      setLoading(false);
    }
  };

  // Manual Offline Sale
  const handleManualOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const productId = formData.get("productId") as string;
    const qty = Number(formData.get("qty"));
    const manualPrice = Number(formData.get("manualPrice"));
    const selectedProduct = products.find(p => p.id === productId);

    if (!selectedProduct) return;

    try {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([{
          customer_name: formData.get("name"),
          customer_phone: formData.get("phone"),
          customer_email: `${formData.get("name")?.toString().toLowerCase().replace(/\s/g, '')}@offline.com`,
          address: "In-Store Purchase",
          city: "Dhaka",
          total: manualPrice * qty,
          status: "delivered",
          payment_status: "paid",
          payment_method: "offline",
        }])
        .select("id, order_number").single();

      if (orderError) throw orderError;

      // Log specific reason for trigger
      await supabase.rpc('set_config', { name: 'app.inventory_log_reason', value: `Offline Sale: ${order.order_number}`, is_local: true });
      await supabase.rpc('reduce_stock', { p_id: productId, q: qty });

      await supabase.from("order_items").insert([{ order_id: order.id, product_id: productId, product_name: selectedProduct.name, quantity: qty, unit_price: manualPrice }]);

      toast.success("Offline sale logged");
      setIsModalOpen(false);
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      qc.invalidateQueries({ queryKey: ["inv-log"] });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-display text-4xl text-white">Order Vault</h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gold hover:bg-gold/80 text-onyx font-bold px-6 h-12 shadow-gold"><Plus className="w-5 h-5 mr-2" /> NEW OFFLINE SALE</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-onyx border-gold/20 text-white">
            <DialogHeader><DialogTitle className="text-2xl font-display text-gold">In-Store Transaction</DialogTitle></DialogHeader>
            <form onSubmit={handleManualOrder} className="space-y-5 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><label className="text-[10px] uppercase text-gold/70 font-bold">Customer Name</label><Input name="name" className="bg-white/5 border-white/10" required /></div>
                <div className="space-y-1.5"><label className="text-[10px] uppercase text-gold/70 font-bold">Phone Number</label><Input name="phone" className="bg-white/5 border-white/10" required /></div>
              </div>
              <div className="space-y-1.5"><label className="text-[10px] uppercase text-gold/70 font-bold">Select Watch</label>
                <Select name="productId" required>
                  <SelectTrigger className="bg-white/5 border-white/10 h-12"><SelectValue placeholder="Inventory" /></SelectTrigger>
                  <SelectContent className="bg-onyx border-white/10">{products.map(p => (<SelectItem key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><label className="text-[10px] uppercase text-gold/70 font-bold">Quantity</label><Input name="qty" type="number" defaultValue="1" className="bg-white/5 border-white/10" required /></div>
                <div className="space-y-1.5"><label className="text-[10px] uppercase text-gold/70 font-bold">Price</label><Input name="manualPrice" type="number" className="bg-white/5 border-gold/30" required /></div>
              </div>
              <Button type="submit" className="w-full bg-gradient-gold text-onyx font-black h-12" disabled={loading}>CONFIRM SALE</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-[10px] uppercase text-gold font-black">
            <tr><th className="p-5 text-left">Order #</th><th className="p-5 text-left">Customer</th><th className="p-5 text-left">Watch(es)</th><th className="p-5 text-left">Amount</th><th className="p-5 text-left">Status</th><th className="p-5 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {orders.map((o: any) => (
              <tr key={o.id} className="hover:bg-white/5 transition-colors">
                <td className="p-5 font-mono text-xs text-gold/60">{o.order_number}</td>
                <td className="p-5"><div>{o.customer_name}</div><div className="text-[10px] text-white/30 uppercase">{o.customer_phone}</div></td>
                <td className="p-5 max-w-[200px]">{o.order_items?.map((item: any, i: number) => (<div key={i} className="flex items-center gap-2 mb-1"><Package size={12} className="text-gold/50" /><span className="truncate text-white/80">{item.product_name}</span><span className="text-[10px] text-white/20">x{item.quantity}</span></div>))}</td>
                <td className="p-5 font-bold text-white">{formatPrice(o.total)}</td>
                <td className="p-5">
                  <Select value={o.status} onValueChange={(v) => setStatus(o.id, v)}>
                    <SelectTrigger className={`w-32 h-8 text-[10px] font-black uppercase rounded-full border-none ${o.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-400' : o.status === 'cancelled' ? 'bg-red-500/20 text-red-400' : 'bg-gold/20 text-gold'}`}><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-onyx">{statuses.map(s => <SelectItem key={s} value={s} className="text-[10px] uppercase">{s}</SelectItem>)}</SelectContent>
                  </Select>
                </td>
                <td className="p-5 text-right">
                  <div className="flex justify-end gap-2">
                    {o.status === 'pending' && (<Button size="sm" onClick={() => handleAccept(o)} className="h-8 bg-emerald-600 text-white text-[10px] font-black">ACCEPT</Button>)}
                    <Link to="/admin/orders/$id" params={{ id: o.id }} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-gold hover:text-onyx transition-all"><Eye size={14} /></Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}