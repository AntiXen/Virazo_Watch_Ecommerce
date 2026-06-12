import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Printer, CheckCircle, RefreshCcw, Clock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import logoImg from "@/assets/logo.png";
import { sendOrderConfirmationEmail, sendOrderConfirmationSMS } from "@/lib/email";
import { useState } from "react";

export const Route = createFileRoute("/admin/orders/$id")({
  component: OrderDetail,
});

function OrderDetail() {
  const { id } = useParams({ from: "/admin/orders/$id" });

  // ✅ FIX: All hooks must be called before any conditional returns
  const qc = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-order", id],
    queryFn: async () => {
      const orderRes = await supabase.from("orders").select("*").eq("id", id).single();
      if (orderRes.error) throw orderRes.error;
      const itemsRes = await supabase.from("order_items").select("*").eq("order_id", id);
      return { order: orderRes.data, items: itemsRes.data ?? [] };
    },
  });

  const accept = async () => {
    if (!data?.order || !data.items.length) return;
    setIsProcessing(true);
    try {
      // 1. Inventory Adjustment
      for (const item of data.items) {
        if (!item.product_id) continue;
        const { data: p } = await supabase
          .from("products")
          .select("stock")
          .eq("id", item.product_id)
          .single();
        if (p) {
          const newStock = (p.stock ?? 0) - item.quantity;
          await supabase.from("products").update({ stock: newStock }).eq("id", item.product_id);
          await supabase.from("inventory_log").insert({
            product_id: item.product_id,
            change: -item.quantity,
            reason: `Order Confirmed: ${data.order.order_number}`,
          });
        }
      }

      // 2. Update Order Status
      const { error } = await supabase
        .from("orders")
        .update({ status: "processing" })
        .eq("id", id);
      if (error) throw error;

      // 3. Trigger notifications (fire-and-forget; don't block UI)
      sendOrderConfirmationEmail(data.order).catch(console.error);
      sendOrderConfirmationSMS(data.order).catch(console.error);

      toast.success("Order confirmed, inventory adjusted and customer notified!");
      qc.invalidateQueries({ queryKey: ["admin-order", id] });
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to accept order");
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ FIX: Early returns are now AFTER all hook calls
  if (isLoading)
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-gold">
        <Clock className="animate-spin mr-2" /> Loading…
      </div>
    );
  if (!data?.order)
    return <div className="pt-32 text-center text-muted-foreground">Order not found.</div>;

  const o = data.order;
  const items = data.items;

  return (
    <div className="space-y-5 max-w-3xl mx-auto py-10 print:py-0">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <Link to="/admin/orders" className="p-2 hover:text-gold">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-display text-3xl">Order Details</h1>
        </div>
        <div className="flex gap-2">
          {o.status === "pending" && (
            <Button
              onClick={accept}
              disabled={isProcessing}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              {isProcessing ? "Processing…" : "Accept Order"}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="gap-2"
          >
            <Printer className="w-4 h-4" /> Print Invoice
          </Button>
        </div>
      </div>

      <div className="bg-white text-onyx rounded-2xl p-8 md:p-12 shadow-2xl print:shadow-none print:p-0">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-gray-200 pb-10 mb-10">
          <div>
            <img src={logoImg} alt="Virazo" className="h-20 w-auto mb-4" />
            <div className="text-sm text-gray-500 max-w-[250px]">
              <p className="font-bold text-gray-900">Virazo Watch Ecommerce</p>
              <p>Premium Watch Boutique</p>
              <p>Dhaka, Bangladesh</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="font-display text-4xl text-onyx mb-2 uppercase tracking-tighter">
              Invoice
            </h2>
            <div className="space-y-1">
              <div className="text-sm font-mono font-bold text-gold">#{o.order_number}</div>
              <div className="text-xs text-gray-400">
                Date:{" "}
                {new Date(o.created_at).toLocaleDateString("en-BD", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div className="mt-2 inline-block px-2 py-1 bg-onyx text-gold text-[10px] font-black uppercase rounded">
                {o.status}
              </div>
            </div>
          </div>
        </div>

        {/* Billing */}
        <div className="grid md:grid-cols-2 gap-10 mb-10 text-sm">
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2 font-bold">
              Billing To
            </h3>
            <div className="font-bold text-gray-900 text-base">{o.customer_name}</div>
            <div className="text-gray-500 mt-1 space-y-0.5">
              <p>{o.customer_phone}</p>
              <p>{o.customer_email}</p>
              <p>
                {o.address}, {o.city}
              </p>
            </div>
          </div>
          <div className="md:text-right">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2 font-bold">
              Payment Method
            </h3>
            <div className="font-bold text-gray-900">{o.payment_method?.toUpperCase()}</div>
            <div className="text-gray-500 mt-1 uppercase text-xs tracking-wider">
              {o.payment_status}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm mb-8">
            <thead>
              <tr className="border-b-2 border-gray-100 text-left">
                <th className="py-4 font-bold text-gray-900">Item Description</th>
                <th className="py-4 text-center font-bold text-gray-900">Qty</th>
                <th className="py-4 text-right font-bold text-gray-900">Unit Price</th>
                <th className="py-4 text-right font-bold text-gray-900">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((it: any) => (
                <tr key={it.id}>
                  <td className="py-4 text-gray-700 font-medium">{it.product_name}</td>
                  <td className="py-4 text-center text-gray-500">{it.quantity}</td>
                  <td className="py-4 text-right text-gray-500">{formatPrice(it.unit_price)}</td>
                  <td className="py-4 text-right font-bold text-gray-900">
                    {formatPrice(Number(it.unit_price) * it.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end border-t border-gray-100 pt-8">
          <div className="w-full max-w-[240px] space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900 font-medium">{formatPrice(o.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Shipping</span>
              <span className="text-gray-900 font-medium">
                {o.shipping === 0 ? "Free" : formatPrice(o.shipping)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <span className="text-base font-bold text-gray-900">Total Amount</span>
              <span className="text-2xl font-display text-gold">{formatPrice(o.total)}</span>
            </div>
          </div>
        </div>

        {o.notes && (
          <div className="mt-12 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2 font-bold">
              Additional Notes
            </h3>
            <p className="text-sm text-gray-600 italic">"{o.notes}"</p>
          </div>
        )}

        {/* Warranty & Return Policy */}
        <div className="grid md:grid-cols-2 gap-8 border-t border-gray-100 mt-12 pt-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gold">
              <ShieldCheck size={18} />
              <h4 className="text-[11px] font-black uppercase tracking-widest">
                6-Month Service Warranty
              </h4>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed italic">
              Virazo Watch provides a <strong>6-Month Service Warranty</strong> on the movement.
              Warranty does not cover physical damage, water intrusion, glass breakage, or
              unauthorized repairs.
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gold">
              <RefreshCcw size={18} />
              <h4 className="text-[11px] font-black uppercase tracking-widest">
                7-Day Return Policy
              </h4>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed italic">
              Returns accepted within <strong>7 days</strong> of delivery in original unworn
              condition with all packaging intact. Used or adjusted bracelets cannot be returned.
            </p>
          </div>
        </div>

        <div className="mt-16 text-center text-[10px] text-gray-400 uppercase tracking-[0.3em]">
          Thank you for choosing Virazo Watch.
          <div className="flex justify-center items-center gap-6 opacity-30 mt-3">
            <div className="flex items-center gap-1 text-[9px] font-bold uppercase">
              <ShieldCheck size={12} /> Authentic
            </div>
            <div className="flex items-center gap-1 text-[9px] font-bold uppercase">
              <CheckCircle size={12} /> Inspected
            </div>
            <div className="flex items-center gap-1 text-[9px] font-bold uppercase">
              <RefreshCcw size={12} /> 7-Day Return
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}