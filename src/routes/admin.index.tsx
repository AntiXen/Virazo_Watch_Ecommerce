import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Package, ShoppingCart, DollarSign, AlertTriangle, Clock, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { formatPrice } from "@/lib/utils";


export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function Stat({ label, value, icon: Icon, accent }: { label: string; value: string; icon: any; accent?: boolean }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between">
        <div className="text-xs tracking-wider text-muted-foreground uppercase">{label}</div>
        <Icon className={`w-5 h-5 ${accent ? "text-gold" : "text-muted-foreground"}`} />
      </div>
      <div className="mt-3 font-display text-3xl">{value}</div>
    </div>
  );
}

function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const [orders, products] = await Promise.all([
        supabase.from("orders").select("id,total,status,created_at").order("created_at", { ascending: false }),
        supabase.from("products").select("id,name,stock,low_stock_threshold,price,images,reviews_count"),
      ]);
      return { orders: orders.data ?? [], products: products.data ?? [] };
    },
  });

  if (isLoading) return <div className="text-muted-foreground">Loading dashboard…</div>;
  const orders = data?.orders ?? [];
  const products = data?.products ?? [];

  const totalRevenue = orders.filter(o => o.status !== "cancelled").reduce((s, o) => s + Number(o.total), 0);
  const pending = orders.filter(o => o.status === "pending").length;
  const lowStock = products.filter(p => p.stock <= p.low_stock_threshold);
  const top = [...products].sort((a, b) => (b.reviews_count ?? 0) - (a.reviews_count ?? 0)).slice(0, 5);

  // last 7 days revenue
  const days: { d: string; revenue: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const rev = orders
      .filter(o => o.created_at.slice(0, 10) === key && o.status !== "cancelled")
      .reduce((s, o) => s + Number(o.total), 0);
    days.push({ d: d.toLocaleDateString(undefined, { weekday: "short" }), revenue: rev });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your store performance.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Stat label="Total Orders" value={String(orders.length)} icon={ShoppingCart} />
        <Stat label="Total Sales" value={formatPrice(totalRevenue)} icon={DollarSign} accent />
        <Stat label="Pending" value={String(pending)} icon={Clock} />
        <Stat label="Products" value={String(products.length)} icon={Package} />
        <Stat label="Low Stock" value={String(lowStock.length)} icon={AlertTriangle} />
        <Stat label="Top Reviewed" value={String(top[0]?.reviews_count ?? 0)} icon={TrendingUp} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl">Revenue — last 7 days</h2>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={days}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="d" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #333" }} />
                <Line type="monotone" dataKey="revenue" stroke="#d4a657" strokeWidth={2} dot={{ fill: "#d4a657" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="font-display text-xl mb-4">Low Stock Alerts</h2>
          {lowStock.length === 0 ? (
            <p className="text-sm text-muted-foreground">All products well stocked.</p>
          ) : (
            <ul className="space-y-3">
              {lowStock.slice(0, 6).map((p) => (
                <li key={p.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">{p.name}</span>
                  <span className="text-destructive font-semibold">{p.stock} left</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-display text-xl mb-4">Top Products</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {top.map((p) => (
            <div key={p.id} className="border border-border rounded-lg p-3">
              <div className="text-sm font-medium truncate">{p.name}</div>
              <div className="text-xs text-muted-foreground">{p.reviews_count ?? 0} reviews</div>
              <div className="text-gold mt-1">{formatPrice(p.price)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
