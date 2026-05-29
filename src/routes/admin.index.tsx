import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Package, ShoppingCart, DollarSign, AlertTriangle, 
  Clock, TrendingUp, ChevronRight, ArrowUpRight, Loader2 
} from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, CartesianGrid, AreaChart, Area 
} from "recharts";
import { formatPrice } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function StatCard({ label, value, icon: Icon, accent, trend }: { label: string; value: string; icon: any; accent?: boolean; trend?: string }) {
  return (
    <div className="bg-onyx border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-gold/20 transition-all">
      <div className="flex items-center justify-between relative z-10">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-gold transition-colors">
          <Icon size={20} />
        </div>
        {trend && (
           <div className="flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
              <ArrowUpRight size={10} /> {trend}
           </div>
        )}
      </div>
      <div className="mt-5 relative z-10">
        <p className="text-[10px] tracking-[0.2em] text-white/30 uppercase font-black">{label}</p>
        <h3 className={`text-3xl font-display mt-1 ${accent ? "text-gold" : "text-white"}`}>{value}</h3>
      </div>
      <div className="absolute -bottom-2 -right-2 opacity-[0.02] text-white pointer-events-none group-hover:scale-110 transition-transform">
         <Icon size={80} />
      </div>
    </div>
  );
}

function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const [ordersRes, productsRes] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("products").select("*"),
      ]);

      const orders = ordersRes.data || [];
      const products = productsRes.data || [];

      // 1. Calculate Summary Stats
      const totalRevenue = orders
        .filter(o => o.status !== "cancelled")
        .reduce((sum, o) => sum + Number(o.total), 0);
      
      const pendingCount = orders.filter(o => o.status === "pending").length;
      const lowStockProducts = products.filter(p => p.stock <= p.low_stock_threshold);
      
      // 2. Generate 7-Day Revenue Data
      const chartData = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        
        const dayRevenue = orders
          .filter(o => o.created_at.startsWith(dateStr) && o.status !== "cancelled")
          .reduce((sum, o) => sum + Number(o.total), 0);

        chartData.push({
          name: d.toLocaleDateString('en-US', { weekday: 'short' }),
          revenue: dayRevenue,
        });
      }

      // 3. Get Top Selling Products (Sorted by reviews_count as popularity proxy)
      const topProducts = [...products]
        .sort((a, b) => (b.reviews_count || 0) - (a.reviews_count || 0))
        .slice(0, 5);

      return {
        totalOrders: orders.length,
        totalRevenue,
        pendingCount,
        productCount: products.length,
        lowStockCount: lowStockProducts.length,
        topReviewedCount: products.length > 0 ? Math.max(...products.map(p => p.reviews_count || 0)) : 0,
        chartData,
        lowStockProducts: lowStockProducts.slice(0, 5),
        topProducts
      };
    },
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) return (
    <div className="h-full flex items-center justify-center">
       <Loader2 className="w-8 h-8 text-gold animate-spin" />
    </div>
  );

  const stats = data!;

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      <div>
        <h1 className="font-display text-4xl text-white">Boutique Overview</h1>
        <p className="text-white/40 text-sm mt-1 uppercase tracking-widest font-medium">Real-time performance analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        <StatCard label="Total Orders" value={stats.totalOrders.toString()} icon={ShoppingCart} trend="+12%" />
        <StatCard label="Net Revenue" value={formatPrice(stats.totalRevenue)} icon={DollarSign} accent trend="+8%" />
        <StatCard label="Awaiting Action" value={stats.pendingCount.toString()} icon={Clock} />
        <StatCard label="Collection Size" value={stats.productCount.toString()} icon={Package} />
        <StatCard label="Low Inventory" value={stats.lowStockCount.toString()} icon={AlertTriangle} />
        <StatCard label="Max Reviews" value={stats.topReviewedCount.toString()} icon={TrendingUp} />
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-8 bg-onyx border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-display text-2xl text-white">Revenue Performance</h2>
              <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Last 7 Days Activity</p>
            </div>
            <div className="text-right">
               <p className="text-2xl font-display text-gold font-bold">{formatPrice(stats.chartData[6].revenue)}</p>
               <p className="text-[9px] text-white/20 uppercase font-black">Today's Sales</p>
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4a657" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#d4a657" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 'bold'}} 
                  dy={15}
                />
                <YAxis 
                  hide 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(212,166,87,0.2)', borderRadius: '15px' }}
                  itemStyle={{ color: '#d4a657', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#d4a657" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Sidebar */}
        <div className="lg:col-span-4 bg-onyx border border-white/5 rounded-[2.5rem] p-8 shadow-2xl flex flex-col">
          <div className="flex items-center justify-between mb-8">
             <h2 className="font-display text-2xl text-white">Stock Alerts</h2>
             <Link to="/admin/inventory" className="text-[10px] font-black text-gold uppercase tracking-tighter hover:underline">Manage All</Link>
          </div>
          
          <div className="space-y-4 flex-1">
            {stats.lowStockProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-10">
                 <ShieldCheck size={48} className="mb-4" />
                 <p className="text-xs uppercase font-black tracking-widest">Inventory Secure</p>
              </div>
            ) : (
              stats.lowStockProducts.map((p) => (
                <div key={p.id} className="bg-white/5 rounded-2xl p-4 flex items-center justify-between border border-white/5 hover:border-red-500/30 transition-all group">
                   <div className="flex-1 pr-3">
                      <p className="text-sm font-bold text-white truncate group-hover:text-red-400 transition-colors">{p.name}</p>
                      <p className="text-[10px] text-white/30 uppercase font-black mt-1">SKU: {p.sku || 'N/A'}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-lg font-display text-red-400 font-bold leading-none">{p.stock}</p>
                      <p className="text-[8px] text-white/20 uppercase font-black">Left</p>
                   </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-white/5">
             <div className="p-4 bg-gold/5 rounded-2xl border border-gold/10">
                <p className="text-[10px] text-gold font-black uppercase tracking-widest mb-1">Stock Strategy</p>
                <p className="text-[11px] text-white/40 leading-relaxed italic">Items reaching alert thresholds should be restocked within 48 hours to maintain sales velocity.</p>
             </div>
          </div>
        </div>
      </div>

      {/* Top Products Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
           <h2 className="font-display text-3xl text-white">Curated Popularity</h2>
           <Link to="/admin/products" className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-widest hover:text-gold transition-colors">
              Full Inventory <ChevronRight size={14} />
           </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {stats.topProducts.map((p) => (
            <div key={p.id} className="bg-onyx border border-white/5 rounded-[2rem] p-6 shadow-xl group hover:border-gold/30 transition-all">
              <div className="aspect-square rounded-2xl overflow-hidden bg-black/40 mb-4 border border-white/5 relative">
                 <img src={p.images?.[0] || ''} alt={p.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                 <div className="absolute top-3 right-3">
                    <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-gold border border-gold/20">
                       <TrendingUp size={14} />
                    </div>
                 </div>
              </div>
              <p className="text-xs font-bold text-white truncate group-hover:text-gold transition-colors">{p.name}</p>
              <div className="flex items-center justify-between mt-3">
                 <p className="text-lg font-display text-gold font-bold">{formatPrice(p.discount_price || p.price)}</p>
                 <p className="text-[10px] text-white/30 font-black uppercase">{p.reviews_count || 0} Reviews</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Simple internal ShieldCheck icon placeholder
function ShieldCheck({ size, className }: { size: number; className?: string }) {
  return (
    <svg 
      width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" 
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>
    </svg>
  );
}