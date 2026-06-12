import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Package, ShoppingCart, DollarSign, AlertTriangle,
  Clock, TrendingUp, ChevronRight, Loader2,
  CheckCircle, XCircle, RefreshCw, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, Tooltip,
} from "recharts";
import { formatPrice } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({ component: Dashboard });

// ─── Tiny sparkline used inside each KPI card ─────────────────────────────────
function Spark({ data, color = "#d4a657" }: { data: number[]; color?: string }) {
  const pts = data.map((v, i) => ({ v }));
  return (
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={pts} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`sg-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5}
          fill={`url(#sg-${color.replace("#","")})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── KPI card with embedded sparkline ────────────────────────────────────────
function KpiCard({
  label, value, sub, icon: Icon, accent, danger, sparkData, delta,
}: {
  label: string; value: string; sub?: string; icon: any;
  accent?: boolean; danger?: boolean; sparkData?: number[]; delta?: number;
}) {
  const positive = delta !== undefined && delta >= 0;
  return (
    <div className={`relative flex flex-col justify-between rounded-2xl border overflow-hidden p-5 group transition-all duration-200
      ${danger
        ? "bg-red-50 border-red-200 hover:border-red-300"
        : "bg-white border-black/[0.07] hover:border-gold/30 shadow-sm"}`}>
      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[13px] transition-colors
          ${danger ? "bg-red-100 text-red-400" : "bg-black/5 text-black/30 group-hover:text-gold"}`}>
          <Icon size={15} />
        </div>
        {delta !== undefined && (
          <div className={`flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-md
            ${positive ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"}`}>
            {positive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
            {Math.abs(delta)}%
          </div>
        )}
      </div>

      {/* Value */}
      <div>
        <p className="text-[9px] tracking-[0.2em] text-black/30 uppercase font-black mb-1">{label}</p>
        <p className={`font-display leading-none text-[1.75rem]
          ${danger ? "text-red-400" : accent ? "text-gold" : "text-gray-900"}`}>
          {value}
        </p>
        {sub && <p className="text-[9px] text-black/25 mt-1.5 font-medium">{sub}</p>}
      </div>

      {/* Sparkline flush to bottom */}
      {sparkData && (
        <div className="mt-3 -mx-5 -mb-5">
          <Spark data={sparkData} color={danger ? "#f87171" : accent ? "#d4a657" : "#6b7280"} />
        </div>
      )}
    </div>
  );
}

// ─── Custom chart tooltip ─────────────────────────────────────────────────────
function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gold/30 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-[9px] text-black/40 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-gold font-display text-xl leading-none">{formatPrice(payload[0].value)}</p>
    </div>
  );
}

// ─── Status pill ──────────────────────────────────────────────────────────────
function StatusPill({ status, paymentStatus }: { status: string; paymentStatus?: string }) {
  if (paymentStatus === "refunded") return (
    <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">
      <RefreshCw size={8} /> Refunded
    </span>
  );
  const map: Record<string, string> = {
    delivered:  "text-emerald-400 bg-emerald-500/10",
    processing: "text-blue-400 bg-blue-500/10",
    pending:    "text-amber-400 bg-amber-500/10",
    cancelled:  "text-red-400 bg-red-500/10",
  };
  return (
    <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full ${map[status] || "text-black/40 bg-white/5"}`}>
      {status}
    </span>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const [ordersRes, productsRes] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("products").select("*"),
      ]);
      const orders   = ordersRes.data  || [];
      const products = productsRes.data || [];

      // Revenue excludes cancelled + refunded
      const validOrders = orders.filter(
        o => o.status !== "cancelled" && o.payment_status !== "refunded"
      );
      const netRevenue = validOrders.reduce((s, o) => s + Number(o.total), 0);

      // Build 7-day chart data
      const chartData = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dateStr = d.toISOString().split("T")[0];
        const rev = validOrders
          .filter(o => o.created_at.startsWith(dateStr))
          .reduce((s, o) => s + Number(o.total), 0);
        return { name: d.toLocaleDateString("en-US", { weekday: "short" }), revenue: rev };
      });

      const sparkRevenue = chartData.map(d => d.revenue);

      const pendingCount   = orders.filter(o => o.status === "pending").length;
      const cancelledCount = orders.filter(o => o.status === "cancelled").length;
      const refundedCount  = orders.filter(o => o.payment_status === "refunded").length;
      const deliveredCount = orders.filter(o => o.status === "delivered").length;
      const lowStock       = products.filter(p => p.stock > 0 && p.stock <= p.low_stock_threshold);
      const soldOut        = products.filter(p => p.stock === 0);
      const topProducts    = [...products].sort((a, b) => (b.reviews_count || 0) - (a.reviews_count || 0)).slice(0, 4);

      return {
        totalOrders: orders.length,
        netRevenue,
        pendingCount,
        cancelledCount,
        refundedCount,
        deliveredCount,
        productCount: products.length,
        lowStockCount: lowStock.length,
        soldOutCount: soldOut.length,
        chartData,
        sparkRevenue,
        alertProducts: [...soldOut, ...lowStock].slice(0, 5),
        recentOrders: orders.slice(0, 7),
        topProducts,
        todayRevenue: chartData[6].revenue,
      };
    },
    refetchInterval: 60_000,
  });

  if (isLoading) return (
    <div className="h-[60vh] grid place-items-center">
      <Loader2 className="w-6 h-6 text-gold animate-spin" />
    </div>
  );

  const s = data!;

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">

      {/* ── Page header ────────────────────────────────────────────────────── */}
      <div className="flex items-end justify-between pt-1">
        <div>
          <p className="text-[9px] tracking-[0.3em] text-black/25 uppercase font-black mb-1.5">Virazo Control Panel</p>
          <h1 className="font-display text-[2.25rem] leading-none text-gray-900">Dashboard</h1>
        </div>
        <p className="text-[10px] text-black/25 font-medium hidden sm:block">
          {new Date().toLocaleDateString("en-BD", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      {/* ── KPI grid (6 cards) ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiCard
          label="Net Revenue"   value={formatPrice(s.netRevenue)}
          icon={DollarSign}     accent
          sub="excl. cancelled & refunded"
          sparkData={s.sparkRevenue}
          delta={8}
        />
        <KpiCard
          label="Total Orders"  value={String(s.totalOrders)}
          icon={ShoppingCart}   sub={`${s.pendingCount} pending`}
          sparkData={s.sparkRevenue.map(v => v > 0 ? 1 : 0)}
          delta={12}
        />
        <KpiCard
          label="Today's Sales" value={formatPrice(s.todayRevenue)}
          icon={TrendingUp}     accent
        />
        <KpiCard
          label="Collection"    value={String(s.productCount)}
          icon={Package}        sub={`${s.soldOutCount} sold out`}
        />
        <KpiCard
          label="Low Stock"     value={String(s.lowStockCount)}
          icon={AlertTriangle}  danger={s.lowStockCount > 0}
          sub={s.soldOutCount > 0 ? `${s.soldOutCount} sold out` : undefined}
        />
        <KpiCard
          label="Pending"       value={String(s.pendingCount)}
          icon={Clock}          sub={`${s.cancelledCount} cancelled`}
        />
      </div>

      {/* ── Main chart row ─────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-12 gap-4">

        {/* Revenue chart */}
        <div className="lg:col-span-8 bg-white border border-black/[0.07] rounded-2xl p-6 flex flex-col">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-[9px] tracking-[0.2em] text-black/30 uppercase font-black">Revenue Performance</p>
              <h2 className="font-display text-2xl text-white mt-0.5">Last 7 Days</h2>
            </div>
            <div className="text-right">
              <p className="font-display text-2xl text-gold leading-none">{formatPrice(s.todayRevenue)}</p>
              <p className="text-[9px] text-black/25 uppercase font-black mt-1">Today</p>
            </div>
          </div>

          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={s.chartData} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="mainRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#d4a657" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#d4a657" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name" axisLine={false} tickLine={false}
                  tick={{ fill: "rgba(0,0,0,0.3)", fontSize: 10, fontWeight: 700 }}
                  dy={10}
                />
                <Tooltip content={<ChartTip />} cursor={{ stroke: "rgba(212,166,87,0.12)", strokeWidth: 1 }} />
                <Area
                  type="monotone" dataKey="revenue"
                  stroke="#d4a657" strokeWidth={2}
                  fill="url(#mainRev)" fillOpacity={1}
                  dot={false}
                  activeDot={{ r: 4, fill: "#d4a657", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock alerts panel */}
        <div className="lg:col-span-4 bg-white border border-black/[0.07] rounded-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.07]">
            <h2 className="font-display text-base text-white">Stock Alerts</h2>
            <Link to="/admin/inventory"
              className="text-[9px] font-black text-gold/50 uppercase tracking-widest hover:text-gold transition-colors flex items-center gap-1">
              Manage <ChevronRight size={10} />
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04] px-1 py-1">
            {s.alertProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 opacity-20">
                <CheckCircle size={28} className="mb-2" />
                <p className="text-[9px] uppercase font-black tracking-widest">All stock healthy</p>
              </div>
            ) : s.alertProducts.map((p: any) => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3 hover:bg-black/3 transition-colors rounded-xl group">
                <div className={`w-2 h-2 rounded-full shrink-0 ${p.stock === 0 ? "bg-red-500 animate-pulse" : "bg-amber-400"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-white truncate group-hover:text-gold transition-colors">{p.name}</p>
                  <p className="text-[9px] text-black/30 font-mono">{p.sku || "—"}</p>
                </div>
                <div className="text-right shrink-0">
                  {p.stock === 0 ? (
                    <span className="text-[9px] font-black text-red-400 uppercase tracking-wider">Sold Out</span>
                  ) : (
                    <span className="text-[11px] font-display text-amber-400">{p.stock} <span className="text-[8px] text-black/25 font-black uppercase">left</span></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom row: recent orders + order health ────────────────────────── */}
      <div className="grid lg:grid-cols-12 gap-4">

        {/* Recent orders table */}
        <div className="lg:col-span-8 bg-white border border-black/[0.07] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.07]">
            <h2 className="font-display text-base text-white">Recent Orders</h2>
            <Link to="/admin/orders"
              className="text-[9px] font-black text-gold/50 uppercase tracking-widest hover:text-gold transition-colors flex items-center gap-1">
              View all <ChevronRight size={10} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[9px] uppercase tracking-widest text-black/20 font-black border-b border-black/[0.05]">
                  <th className="px-6 py-3 text-left">Order</th>
                  <th className="px-6 py-3 text-left">Customer</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {s.recentOrders.map((o: any) => {
                  const excluded = o.status === "cancelled" || o.payment_status === "refunded";
                  return (
                    <tr key={o.id} className="border-b border-black/[0.04] hover:bg-black/[0.02] transition-colors group">
                      <td className="px-6 py-3.5">
                        <Link to="/admin/orders/$id" params={{ id: o.id }}
                          className="font-mono text-[10px] text-black/40 group-hover:text-gold transition-colors">
                          {o.order_number || `#${o.id.slice(0, 8)}`}
                        </Link>
                      </td>
                      <td className="px-6 py-3.5 text-[13px] text-gray-900 font-medium">{o.customer_name}</td>
                      <td className={`px-6 py-3.5 text-right font-display text-[15px] ${excluded ? "line-through text-black/20" : "text-gold"}`}>
                        {formatPrice(o.total)}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <StatusPill status={o.status} paymentStatus={o.payment_status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order health breakdown */}
        <div className="lg:col-span-4 bg-white border border-black/[0.07] rounded-2xl overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-black/[0.07]">
            <h2 className="font-display text-base text-white">Order Health</h2>
          </div>
          <div className="flex-1 p-4 space-y-2">
            {[
              { label: "Delivered",  value: s.deliveredCount,  icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10", bar: "bg-emerald-500" },
              { label: "Processing", value: s.totalOrders - s.pendingCount - s.cancelledCount - s.deliveredCount,
                                               icon: TrendingUp,  color: "text-blue-400",    bg: "bg-blue-500/10",    bar: "bg-blue-500" },
              { label: "Pending",    value: s.pendingCount,    icon: Clock,       color: "text-amber-400",  bg: "bg-amber-500/10",   bar: "bg-amber-500" },
              { label: "Cancelled",  value: s.cancelledCount,  icon: XCircle,     color: "text-red-400",    bg: "bg-red-500/10",     bar: "bg-red-500" },
              { label: "Refunded",   value: s.refundedCount,   icon: RefreshCw,   color: "text-blue-300",   bg: "bg-blue-400/10",    bar: "bg-blue-400" },
            ].map(({ label, value, icon: Icon, color, bg, bar }) => {
              const pct = s.totalOrders > 0 ? Math.round((value / s.totalOrders) * 100) : 0;
              return (
                <div key={label} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-lg ${bg} flex items-center justify-center`}>
                        <Icon size={11} className={color} />
                      </div>
                      <span className="text-[11px] text-white/50 font-medium">{label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-black/25">{pct}%</span>
                      <span className={`font-display text-lg leading-none ${color}`}>{value}</span>
                    </div>
                  </div>
                  <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${bar} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-5 py-4 border-t border-black/[0.07]">
            <p className="text-[9px] text-black/20 leading-relaxed">
              Cancelled & refunded orders are excluded from net revenue.
            </p>
          </div>
        </div>
      </div>

      {/* ── Top products ───────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl text-gray-900">Top Performers</h2>
          <Link to="/admin/products"
            className="text-[9px] font-black text-black/25 uppercase tracking-widest hover:text-gold transition-colors flex items-center gap-1">
            Full Catalogue <ChevronRight size={10} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {s.topProducts.map((p: any) => (
            <Link key={p.id} to="/admin/products/$id" params={{ id: p.id }}
              className="group bg-white border border-black/[0.07] rounded-xl overflow-hidden hover:border-gold/30 hover:shadow-sm transition-all flex items-center gap-3 p-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-black/5 shrink-0">
                {p.images?.[0] ? (
                  <img src={p.images[0]} alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-black/10">
                    <Package size={18} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-gray-800 truncate group-hover:text-gold transition-colors leading-tight">{p.name}</p>
                <p className="font-display text-gold text-sm leading-none mt-1">{formatPrice(p.discount_price || p.price)}</p>
                <p className="text-[9px] text-black/25 font-black uppercase mt-0.5">{p.reviews_count || 0} reviews</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}