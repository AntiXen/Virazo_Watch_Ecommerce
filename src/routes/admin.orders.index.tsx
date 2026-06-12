import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Eye, Plus } from "lucide-react";
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

  // ✅ FIX: Controlled state for the manual order form's Select
  // shadcn/radix Select does NOT participate in native FormData,
  // so we must manage the selected product ID in React state.
  const [selectedProductId, setSelectedProductId] = useState("");

  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () =>
      (
        await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false })
      ).data ?? [],
  });

  const { data: products = [] } = useQuery({
    queryKey: ["admin-products-list"],
    queryFn: async () =>
      (await supabase.from("products").select("id, name, price, stock")).data ?? [],
  });

  const setStatus = async (id: string, status: string) => {
    // ✅ FIX: Optimistic update so the Select shows the new value immediately
    qc.setQueryData(["admin-orders"], (old: any[]) =>
      (old ?? []).map((o) => (o.id === id ? { ...o, status } : o))
    );

    const { error } = await supabase
      .from("orders")
      .update({ status: status as any })
      .eq("id", id);

    if (error) {
      qc.invalidateQueries({ queryKey: ["admin-orders"] }); // roll back
      return toast.error(error.message);
    }
    toast.success("Order status updated");
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  };

  const handleManualOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    // ✅ FIX: Use selectedProductId from state instead of formData.get("productId")
    const productId = selectedProductId;
    const qty = Number(formData.get("qty"));
    const manualPrice = Number(formData.get("manualPrice"));
    const selectedProduct = (products as any[]).find((p) => p.id === productId);

    if (!selectedProduct) {
      toast.error("Please select a product");
      setLoading(false);
      return;
    }
    if (selectedProduct.stock < qty) {
      toast.error("Not enough stock!");
      setLoading(false);
      return;
    }

    try {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            customer_name: formData.get("name"),
            customer_phone: formData.get("phone"),
            customer_email: `${formData
              .get("name")
              ?.toString()
              .toLowerCase()
              .replace(/\s/g, "")}@manual.com`,
            address: "Offline Store Sale",
            city: "Dhaka",
            total: manualPrice * qty,
            subtotal: manualPrice * qty,
            shipping: 0,
            status: "delivered",
            payment_status: "paid",
            payment_method: "offline",
          },
        ])
        .select("id")
        .single();
      if (orderError || !order) throw orderError ?? new Error("Order failed");

      const { error: itemsError } = await supabase.from("order_items").insert([
        {
          order_id: order.id,
          product_id: productId,
          product_name: selectedProduct.name,
          quantity: qty,
          unit_price: manualPrice,
        },
      ]);
      if (itemsError) throw itemsError;

      const { error: stockError } = await supabase
        .from("products")
        .update({ stock: selectedProduct.stock - qty })
        .eq("id", productId);
      if (stockError) throw stockError;

      toast.success("Offline sale recorded & stock updated!");
      setIsModalOpen(false);
      setSelectedProductId(""); // reset select
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      qc.invalidateQueries({ queryKey: ["admin-products-list"] });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h1 className="font-display text-3xl">Orders</h1>

        <Dialog
          open={isModalOpen}
          onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) setSelectedProductId(""); // reset on close
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-gold hover:bg-gold/80 text-black font-semibold">
              <Plus className="w-4 h-4 mr-2" /> Manual Order
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-[#121212] border-border text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display text-gold">
                Create Offline Sale
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleManualOrder} className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Customer Name</label>
                  <Input
                    name="name"
                    className="bg-muted/20 border-border"
                    placeholder="e.g. Amit"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Phone Number</label>
                  <Input
                    name="phone"
                    className="bg-muted/20 border-border"
                    placeholder="017..."
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Select Product</label>
                {/* ✅ FIX: Use value/onValueChange with controlled state */}
                <Select
                  value={selectedProductId}
                  onValueChange={setSelectedProductId}
                  required
                >
                  <SelectTrigger className="bg-muted/20 border-border">
                    <SelectValue placeholder="Choose a watch" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-border">
                    {(products as any[]).map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} (Stock: {p.stock})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Quantity (Pcs)</label>
                  <Input
                    name="qty"
                    type="number"
                    defaultValue="1"
                    min="1"
                    className="bg-muted/20 border-border"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Selling Price (Unit)</label>
                  <Input
                    name="manualPrice"
                    type="number"
                    className="bg-muted/20 border-gold/40 focus:border-gold"
                    placeholder="Enter amount"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gold hover:bg-gold/80 text-black font-bold text-lg h-12"
                disabled={loading || !selectedProductId}
              >
                {loading ? "Processing..." : "Confirm Sale"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-3 text-left">Order #</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Total</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o: any) => (
              <tr key={o.id} className="border-t border-border">
                <td className="p-3 font-mono text-xs">
                  {o.order_number || `#${o.id.slice(0, 8)}`}
                </td>
                <td className="p-3">
                  <div>{o.customer_name}</div>
                  <div className="text-xs text-muted-foreground">{o.customer_phone}</div>
                </td>
                <td className="p-3 text-gold">{formatPrice(o.total)}</td>
                <td className="p-3">
                  {/* ✅ The Select here is fine — it reads from query data and
                      calls setStatus on change, which invalidates + refetches */}
                  <Select value={o.status} onValueChange={(v) => setStatus(o.id, v)}>
                    <SelectTrigger className="w-36 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-3 text-muted-foreground">
                  {new Date(o.created_at).toLocaleDateString()}
                </td>
                <td className="p-3 text-right">
                  <Link
                    to="/admin/orders/$id"
                    params={{ id: o.id }}
                    className="p-2 inline-flex hover:text-gold"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted-foreground">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}