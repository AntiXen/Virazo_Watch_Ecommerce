import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { Boxes, History, ArrowUpRight, ArrowDownRight, Package } from "lucide-react";

export const Route = createFileRoute("/admin/inventory")({
  component: InventoryPage,
});

function InventoryPage() {
  const qc = useQueryClient();
  const [productId, setProductId] = useState(""); 
  const [change, setChange] = useState(0); 
  const [reason, setReason] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: products = [] } = useQuery({
    queryKey: ["inv-products"],
    queryFn: async () => (await supabase.from("products").select("id,name,sku,stock,low_stock_threshold").order("name")).data ?? [],
  });

  const { data: log = [] } = useQuery({
    queryKey: ["inv-log"],
    queryFn: async () => (await supabase.from("inventory_log").select("*, products(name)").order("created_at", { ascending: false }).limit(50)).data ?? [],
  });

  const adjust = async () => {
    if (!productId || change === 0) return toast.error("Select a product and amount");
    setIsUpdating(true);
    
    try {
      const product = products.find((p: any) => p.id === productId);
      const newStock = (product?.stock ?? 0) + change;
      
      // Set the custom reason for the DB Trigger
      await supabase.rpc('set_config', { name: 'app.inventory_log_reason', value: reason || 'Manual Correction', is_local: true });

      const { error } = await supabase.from("products").update({ stock: newStock }).eq("id", productId);
      if (error) throw error;

      toast.success("Stock updated successfully");
      setChange(0); setReason("");
      qc.invalidateQueries({ queryKey: ["inv-products"] });
      qc.invalidateQueries({ queryKey: ["inv-log"] });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="font-display text-4xl text-white">Inventory Atelier</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage stock levels and track movement history.</p>
      </div>

      {/* Adjustment Console */}
      <div className="bg-onyx border border-white/5 rounded-[2rem] p-8 shadow-xl">
        <div className="flex items-center gap-2 mb-6">
           <Boxes className="text-gold w-5 h-5" />
           <h2 className="text-[10px] uppercase tracking-[0.2em] text-gold font-black">Stock Adjustment Console</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          <Select value={productId} onValueChange={setProductId}>
            <SelectTrigger className="bg-white/5 border-white/10 h-12 text-white">
               <SelectValue placeholder="Select Timepiece" />
            </SelectTrigger>
            <SelectContent className="bg-onyx border-white/10">
               {products.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name} (Current: {p.stock})</SelectItem>)}
            </SelectContent>
          </Select>
          <Input type="number" placeholder="Adjustment (+/-)" className="bg-white/5 border-white/10 h-12" value={change || ''} onChange={(e) => setChange(Number(e.target.value))} />
          <Input placeholder="Reason (e.g. New Shipment)" className="bg-white/5 border-white/10 h-12" value={reason} onChange={(e) => setReason(e.target.value)} />
          <Button onClick={adjust} disabled={isUpdating} className="bg-gradient-gold text-onyx font-black h-12 shadow-gold">
             {isUpdating ? 'UPDATING...' : 'APPLY CHANGE'}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Stock List */}
        <div className="lg:col-span-7 bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] overflow-hidden shadow-xl">
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
             <h2 className="font-display text-xl text-white">Live Stock Levels</h2>
             <Package size={18} className="text-white/20" />
          </div>
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-widest text-gold/60 font-black">
               <tr><th className="p-4 text-left">Product</th><th className="p-4 text-left">SKU</th><th className="p-4 text-right">Qty</th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
               {products.map((p: any) => (
                <tr key={p.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-medium text-white">{p.name}</td>
                  <td className="p-4 text-xs font-mono text-white/30">{p.sku || '—'}</td>
                  <td className="p-4 text-right">
                    <span className={`font-bold text-base px-3 py-1 rounded-lg ${p.stock <= p.low_stock_threshold ? "bg-red-500/20 text-red-400 animate-pulse" : "text-emerald-400"}`}>
                       {p.stock}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* History Log */}
        <div className="lg:col-span-5 bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] overflow-hidden shadow-xl">
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
             <h2 className="font-display text-xl text-white">Movement History</h2>
             <History size={18} className="text-white/20" />
          </div>
          <div className="max-h-[500px] overflow-y-auto no-scrollbar p-6 space-y-4">
            {log.map((l: any) => (
              <div key={l.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-gold/20 transition-all">
                <div className="flex-1 pr-4">
                  <p className="text-sm font-bold text-white group-hover:text-gold transition-colors">{l.products?.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-white/40 uppercase font-black tracking-tighter">{l.reason}</span>
                    <span className="text-[10px] text-white/20">•</span>
                    <span className="text-[10px] text-white/20 font-medium">{new Date(l.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className={`flex items-center gap-1 font-black text-sm ${l.change > 0 ? "text-emerald-400" : "text-red-400"}`}>
                   {l.change > 0 ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}
                   {Math.abs(l.change)}
                </div>
              </div>
            ))}
            {log.length === 0 && <p className="text-center text-white/20 py-10 italic">No movement recorded.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}