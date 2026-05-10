import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Printer, Download, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import logoImg from "@/assets/logo.png";

export const Route = createFileRoute("/invoice/$id")({
  head: () => ({ title: "Invoice — VIRAZO" }),
  component: PublicInvoice,
});

function PublicInvoice() {
  const { id } = useParams({ from: "/invoice/$id" });
  
  const { data, isLoading } = useQuery({
    queryKey: ["public-invoice", id],
    queryFn: async () => {
      // Fetch order (allow public read for invoice by ID if we have RLS or just trust the ID)
      const order = (await supabase.from("orders").select("*").eq("id", id).single()).data;
      const items = (await supabase.from("order_items").select("*").eq("order_id", id)).data ?? [];
      return { order, items };
    },
  });

  if (isLoading) return <div className="min-h-screen grid place-items-center text-muted-foreground bg-[#0a0a0a]">Loading Invoice...</div>;
  if (!data?.order) return <div className="min-h-screen grid place-items-center text-muted-foreground bg-[#0a0a0a]">Invoice not found.</div>;
  
  const o = data.order;
  const items = data.items;

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-16 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center print:hidden bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500 grid place-items-center text-white shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-emerald-400 text-sm">Order Placed Successfully</p>
              <p className="text-[10px] text-emerald-400/70 uppercase tracking-wider font-mono">#{o.order_number}</p>
            </div>
          </div>
          <Link to="/shop" className="text-white/60 hover:text-white transition p-2">
            <X className="w-6 h-6" />
          </Link>
        </div>

        <div className="flex justify-between items-center print:hidden">
          <Link to="/shop" className="text-gold flex items-center gap-2 text-sm font-medium hover:underline">
            <ArrowLeft className="w-4 h-4" /> Continue Shopping
          </Link>
          <Button onClick={() => window.print()} className="bg-gradient-gold text-onyx hover:brightness-110 gap-2">
            <Printer className="w-4 h-4" /> Print / PDF
          </Button>
        </div>

        <div className="bg-white text-onyx rounded-2xl p-8 md:p-12 shadow-2xl overflow-hidden relative print:p-0 print:shadow-none">
          {/* Watermark for print */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none rotate-[-30deg] hidden print:block">
             <img src={logoImg} alt="" className="w-[500px]" />
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-gray-200 pb-10 mb-10 relative z-10">
            <div>
              <img src={logoImg} alt="Virazo" className="h-16 w-auto mb-4" />
              <div className="text-xs text-gray-500">
                <p className="font-bold text-gray-900">Virazo Watch Ecommerce</p>
                <p>Premium Watch Boutique</p>
                <p>Dhaka, Bangladesh</p>
              </div>
            </div>
            <div className="text-right">
              <h1 className="font-display text-4xl text-onyx mb-2 uppercase tracking-tighter">Invoice</h1>
              <div className="space-y-1">
                <div className="text-sm font-mono font-bold text-gold">#{o.order_number}</div>
                <div className="text-xs text-gray-400">Date: {new Date(o.created_at).toLocaleDateString("en-BD", { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                <div className="mt-2 inline-block px-2 py-0.5 bg-onyx text-gold text-[10px] font-black uppercase rounded">{o.status}</div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-10 mb-10 text-sm relative z-10">
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2 font-bold">Billing To</h3>
              <div className="font-bold text-gray-900 text-base">{o.customer_name}</div>
              <div className="text-gray-500 mt-1 space-y-0.5">
                <p>{o.customer_phone}</p>
                <p>{o.customer_email}</p>
                <p>{o.address}, {o.city}</p>
              </div>
            </div>
            <div className="md:text-right">
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2 font-bold">Payment Method</h3>
              <div className="font-bold text-gray-900">{o.payment_method.toUpperCase()}</div>
              <div className="text-gray-500 mt-1 uppercase text-xs tracking-wider">{o.payment_status}</div>
            </div>
          </div>

          <div className="overflow-x-auto relative z-10">
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
                    <td className="py-4 text-right font-bold text-gray-900">{formatPrice(Number(it.unit_price) * it.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end border-t border-gray-100 pt-8 relative z-10">
            <div className="w-full max-w-[240px] space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900 font-medium">{formatPrice(o.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="text-gray-900 font-medium">{o.shipping === 0 ? "Free" : formatPrice(o.shipping)}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="text-base font-bold text-gray-900">Total Amount</span>
                <span className="text-2xl font-display text-gold">{formatPrice(o.total)}</span>
              </div>
            </div>
          </div>

          {o.notes && (
            <div className="mt-12 p-4 bg-gray-50 rounded-lg border border-gray-100 relative z-10">
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2 font-bold">Additional Notes</h3>
              <p className="text-sm text-gray-600 italic">"{o.notes}"</p>
            </div>
          )}
          
          <div className="mt-16 text-center text-[10px] text-gray-400 uppercase tracking-[0.3em] relative z-10">
            Thank you for choosing Virazo Watch.
          </div>
        </div>
      </div>
    </div>
  );
}
