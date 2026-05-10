import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { formatPrice } from "@/lib/utils";


export const Route = createFileRoute("/admin/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const { data } = useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      const orders = (await supabase.from("orders").select("total,status,created_at")).data ?? [];
      const items = (await supabase.from("order_items").select("product_name,quantity,unit_price")).data ?? [];
      return { orders, items };
    },
  });
  const orders = data?.orders ?? [];
  const items = data?.items ?? [];

  // Monthly revenue, last 6 months
  const months: { m: string; revenue: number; orders: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(); d.setMonth(d.getMonth() - i); d.setDate(1);
    const key = d.toISOString().slice(0, 7);
    const matched = orders.filter((o: any) => o.created_at.startsWith(key) && o.status !== "cancelled");
    months.push({
      m: d.toLocaleDateString(undefined, { month: "short", year: "2-digit" }),
      revenue: matched.reduce((s: number, o: any) => s + Number(o.total), 0),
      orders: matched.length,
    });
  }

  const productPerf = Object.values(items.reduce((acc: any, it: any) => {
    const k = it.product_name;
    acc[k] = acc[k] || { name: k, qty: 0, revenue: 0 };
    acc[k].qty += it.quantity;
    acc[k].revenue += it.quantity * Number(it.unit_price);
    return acc;
  }, {})).sort((a: any, b: any) => b.revenue - a.revenue).slice(0, 10);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Reports</h1>

      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-display text-xl mb-3">Monthly revenue (last 6)</h2>
        <div className="h-72">
          <ResponsiveContainer><BarChart data={months}><CartesianGrid stroke="rgba(255,255,255,0.05)" /><XAxis dataKey="m" stroke="rgba(255,255,255,0.5)" /><YAxis stroke="rgba(255,255,255,0.5)" /><Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #333" }} /><Bar dataKey="revenue" fill="#d4a657" /></BarChart></ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-display text-xl mb-3">Top products</h2>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs uppercase text-muted-foreground"><th className="p-2">Product</th><th className="p-2">Sold</th><th className="p-2">Revenue</th></tr></thead>
          <tbody>{(productPerf as any[]).map((p: any, i: number) => (
            <tr key={i} className="border-t border-border"><td className="p-2">{p.name}</td><td className="p-2">{p.qty}</td><td className="p-2 text-gold">{formatPrice(p.revenue)}</td></tr>
          ))}{productPerf.length === 0 && <tr><td colSpan={3} className="p-6 text-center text-muted-foreground">No sales yet.</td></tr>}</tbody>
        </table>
      </div>
    </div>
  );
}
