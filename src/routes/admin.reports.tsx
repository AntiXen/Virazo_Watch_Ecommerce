import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { formatPrice } from "@/lib/utils";
import { AdminPage, AdminTitle, Card, CardHeader, AdminTable, Th, Td } from "@/components/ui/admin-ui";

export const Route = createFileRoute("/admin/reports")({ component: ReportsPage });

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

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i)); d.setDate(1);
    const key = d.toISOString().slice(0, 7);
    const matched = orders.filter((o: any) => o.created_at.startsWith(key) && o.status !== "cancelled");
    return { m: d.toLocaleDateString(undefined, { month: "short", year: "2-digit" }), revenue: matched.reduce((s: number, o: any) => s + Number(o.total), 0), orders: matched.length };
  });

  const productPerf = Object.values(items.reduce((acc: any, it: any) => {
    const k = it.product_name;
    acc[k] = acc[k] || { name: k, qty: 0, revenue: 0 };
    acc[k].qty += it.quantity;
    acc[k].revenue += it.quantity * Number(it.unit_price);
    return acc;
  }, {})).sort((a: any, b: any) => b.revenue - a.revenue).slice(0, 10);

  return (
    <AdminPage>
      <AdminTitle sub="Revenue and sales performance">Reports</AdminTitle>

      <Card>
        <CardHeader title="Monthly Revenue (Last 6 Months)" />
        <div className="p-6 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={months} barSize={32}>
              <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fill: "rgba(0,0,0,0.35)", fontSize: 11, fontWeight: 600 }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "rgba(0,0,0,0.25)", fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: "#fff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
                formatter={(v: any) => [formatPrice(v), "Revenue"]}
              />
              <Bar dataKey="revenue" fill="#d4a657" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <CardHeader title="Top Products by Revenue" />
        <AdminTable>
          <thead><tr><Th>Product</Th><Th>Units Sold</Th><Th right>Revenue</Th></tr></thead>
          <tbody>
            {(productPerf as any[]).map((p, i) => (
              <tr key={i} className="hover:bg-black/[0.01] transition-colors">
                <Td><span className="font-medium text-gray-900">{p.name}</span></Td>
                <Td><span className="text-gray-600">{p.qty}</span></Td>
                <Td gold right>{formatPrice(p.revenue)}</Td>
              </tr>
            ))}
            {productPerf.length === 0 && <tr><td colSpan={3} className="px-5 py-8 text-center text-gray-400 text-sm">No sales data yet.</td></tr>}
          </tbody>
        </AdminTable>
      </Card>
    </AdminPage>
  );
}