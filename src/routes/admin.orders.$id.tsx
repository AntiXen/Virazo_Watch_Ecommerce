import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Printer, CheckCircle, Package, Clock, ShieldCheck, RefreshCcw, FileWarning, Mail, Phone } from "lucide-react";
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

  const acceptOrder = async () => {
    if (!data?.order || !data.items.length) return;
    setIsProcessing(true);
    try {
      for (const item of data.items) {
        if (item.product_id) {
          await supabase.rpc('reduce_stock', { p_id: item.product_id, q: item.quantity });
          await supabase.from("inventory_log").insert({
            product_id: item.product_id,
            change: -item.quantity,
            reason: `Order Confirmed: ${data.order.order_number}`
          });
        }
      }
      await supabase.from("orders").update({ status: "processing" }).eq("id", id);
      sendOrderConfirmationEmail(data.order).catch(console.error);
      sendOrderConfirmationSMS(data.order).catch(console.error);
      toast.success("Order accepted and inventory updated.");
      qc.invalidateQueries({ queryKey: ["admin-order", id] });
    } catch (err: any) {
      toast.error("Process Failed", { description: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gold"><Clock className="animate-spin mr-2" /> Loading...</div>;
  if (!data?.order) return <div className="pt-32 text-center text-white/50">Order not found.</div>;

  const o = data.order;
  const items = data.items;

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-6 print:py-0 print:max-w-full">
      {/* Top Header Actions */}
      <div className="flex items-center justify-between print:hidden">
        <Link to="/admin/orders" className="flex items-center gap-2 text-white/60 hover:text-gold transition-colors text-sm font-bold">
          <ArrowLeft size={16} /> BACK TO ORDERS
        </Link>
        <div className="flex gap-3">
          {o.status === "pending" && (
            <Button onClick={acceptOrder} disabled={isProcessing} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg">
              {isProcessing ? "PROCESSING..." : "ACCEPT ORDER"}
            </Button>
          )}
          <Button variant="outline" onClick={() => window.print()} className="border-white/20 text-white hover:bg-white/5">
            <Printer className="w-4 h-4 mr-2" /> PRINT INVOICE
          </Button>
        </div>
      </div>

      {/* Luxury Invoice Card */}
      <div className="bg-white text-onyx p-10 md:p-14 shadow-2xl relative print:shadow-none print:p-0">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b-4 border-onyx pb-8 mb-10">
          <div>
            <img src={logoImg} alt="Virazo Watch" className="h-20 w-auto mb-4" />
            <h1 className="text-3xl font-display font-bold tracking-tight">VIRAZO WATCH</h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Authentic Timepieces & Heritage</p>
          </div>
          <div className="text-right">
            <h2 className="text-6xl font-display font-black text-gray-200 leading-none mb-4">INVOICE</h2>
            <p className="font-mono text-lg font-bold text-gold">#{o.order_number}</p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Date: {new Date(o.created_at).toLocaleDateString("en-BD", { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        {/* Addresses */}
        <div className="grid grid-cols-2 gap-10 mb-12">
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gold border-b border-gray-100 pb-2">Issued By</h3>
            <div className="text-sm">
              <p className="font-bold text-lg">Virazo Watch</p>
              <p className="text-gray-500">House 42, Road 11, Gulshan-1</p>
              <p className="text-gray-500">Dhaka 1212, Bangladesh</p>
              <p className="text-gray-500 flex items-center gap-1 mt-2"><Phone size={12}/> +880 1700 000 000</p>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gold border-b border-gray-100 pb-2">Billed To</h3>
            <div className="text-sm">
              <p className="font-bold text-lg">{o.customer_name}</p>
              <p className="text-gray-900 font-medium">{o.customer_phone}</p>
              <p className="text-gray-500">{o.customer_email}</p>
              <p className="text-gray-500 mt-1">{o.address}, {o.city}</p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full text-sm mb-10">
          <thead>
            <tr className="bg-onyx text-white">
              <th className="py-4 px-4 text-left uppercase tracking-widest text-[10px]">Item Description</th>
              <th className="py-4 px-4 text-center uppercase tracking-widest text-[10px]">Qty</th>
              <th className="py-4 px-4 text-right uppercase tracking-widest text-[10px]">Unit Price</th>
              <th className="py-4 px-4 text-right uppercase tracking-widest text-[10px]">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((it: any) => (
              <tr key={it.id}>
                <td className="py-5 px-4 font-bold text-gray-800">{it.product_name}</td>
                <td className="py-5 px-4 text-center text-gray-500">{it.quantity}</td>
                <td className="py-5 px-4 text-right text-gray-500">{formatPrice(it.unit_price)}</td>
                <td className="py-5 px-4 text-right font-bold text-gray-900">{formatPrice(Number(it.unit_price) * it.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Calculations */}
        <div className="flex justify-end mb-16">
          <div className="w-full max-w-[280px] space-y-3 bg-gray-50 p-6 rounded-2xl">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span className="font-medium text-gray-900">{formatPrice(o.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Shipping</span>
              <span className="font-medium text-gray-900">{o.shipping === 0 ? "FREE" : formatPrice(o.shipping)}</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <span className="text-xs font-black uppercase tracking-tighter">Grand Total</span>
              <span className="text-3xl font-display font-bold text-gold">{formatPrice(o.total)}</span>
            </div>
            <div className="pt-2 text-[10px] text-right text-gray-400 font-bold uppercase italic">
              Method: {o.payment_method.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Production Ready Policies Section */}
        <div className="grid md:grid-cols-2 gap-8 border-t-2 border-gray-100 pt-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gold">
               <ShieldCheck size={18} />
               <h4 className="text-[11px] font-black uppercase tracking-widest">6-Month Service Warranty</h4>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed italic">
              Virazo Watch provides a <strong>6-Month Service Warranty</strong> on the movement of this timepiece from the date of purchase. 
              Please note that warranty claims are <strong>strictly not applicable</strong> in cases of physical damage, water intrusion (on non-diver models), 
              glass breakage, or unauthorized third-party repairs.
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gold">
               <RefreshCcw size={18} />
               <h4 className="text-[11px] font-black uppercase tracking-widest">7-Day Return Policy</h4>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed italic">
              We accept returns within <strong>7 days</strong> of delivery. To qualify, the timepiece must be in its 
              original unworn condition, with all factory stickers, tags, and original packaging intact. 
              Used or adjusted bracelets cannot be returned.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center border-t border-gray-50 pt-10">
          <p className="text-[10px] text-gray-300 uppercase tracking-[0.5em] font-bold mb-4">Thank you for choosing Virazo Watch</p>
          <div className="flex justify-center items-center gap-6 opacity-30 grayscale">
             <div className="flex items-center gap-1 text-[9px] font-bold uppercase"><ShieldCheck size={12}/> Authentic</div>
             <div className="flex items-center gap-1 text-[9px] font-bold uppercase"><CheckCircle size={12}/> Inspected</div>
             <div className="flex items-center gap-1 text-[9px] font-bold uppercase"><RefreshCcw size={12}/> 7-Day Return</div>
          </div>
        </div>

        {/* Print Only Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-35deg] opacity-[0.03] pointer-events-none hidden print:block">
           <h2 className="text-[150px] font-black">VIRAZO</h2>
        </div>

      </div>
    </div>
  );
}