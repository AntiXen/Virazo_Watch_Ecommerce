import { createFileRoute, Outlet, Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard, Package, Tag, FolderTree, ShoppingCart, Users, Star,
  Image as ImageIcon, Percent, FileText, MapPin, Share2, Boxes, CreditCard,
  BarChart3, Settings, LogOut, ShieldAlert, Loader2, Bell, Clock
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/brands", label: "Brands", icon: Tag },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/banners", label: "Banners", icon: ImageIcon },
  { to: "/admin/deals", label: "Deals", icon: Percent },
  { to: "/admin/content", label: "Content", icon: FileText },
  { to: "/admin/location", label: "Visit Our Shop", icon: MapPin }, // Updated Label
  { to: "/admin/social", label: "Social Media", icon: Share2 },
  { to: "/admin/inventory", label: "Inventory", icon: Boxes },
  { to: "/admin/payments", label: "Payments", icon: CreditCard },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const nav = useNavigate();
  const qc = useQueryClient();
  const path = useRouterState({ select: (r) => r.location.pathname });

  const { data: pendingOrders = [] } = useQuery({
    queryKey: ["admin-pending-orders"],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, order_number, customer_name, total, created_at")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      return data || [];
    },
    refetchInterval: 30000,
  });

  const acceptOrderQuick = async (orderId: string) => {
    try {
      const { data: items } = await supabase.from("order_items").select("*").eq("order_id", orderId);
      if (items) {
        for (const item of items) {
          await supabase.rpc('reduce_stock', { p_id: item.product_id, q: item.quantity });
        }
      }
      await supabase.from("orders").update({ status: "processing" }).eq("id", orderId);
      toast.success("Order Accepted");
      qc.invalidateQueries({ queryKey: ["admin-pending-orders"] });
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    } catch (err) {
      toast.error("Failed to accept");
    }
  };

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
  }, [loading, user]);

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="w-10 h-10 text-gold animate-spin" /></div>;

  return (
    <div className="min-h-screen flex bg-[#050505] text-white">
      <aside className="w-72 shrink-0 border-r border-white/5 bg-onyx hidden lg:flex flex-col">
        <div className="p-8">
           <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold"><span className="text-onyx font-black text-xl">V</span></div>
              <div><h2 className="font-display text-lg leading-tight">VIRAZO</h2><p className="text-[10px] text-gold font-bold tracking-[0.2em] uppercase">Control Panel</p></div>
           </Link>
        </div>
        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
          {NAV.map((it) => {
            const active = it.to === "/admin" ? path === "/admin" : path.startsWith(it.to);
            const Icon = it.icon;
            return (
              <Link key={it.to} to={it.to} className={`flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-medium transition-all ${active ? "bg-gold text-onyx shadow-gold" : "text-white/60 hover:bg-white/5"}`}><Icon className="w-4 h-4" />{it.label}</Link>
            );
          })}
        </nav>
        <div className="p-6 border-t border-white/5">
          <button onClick={() => signOut()} className="w-full flex items-center justify-between bg-white/5 rounded-xl p-3 text-xs text-white/40 hover:text-red-400">
            <span className="truncate">{user?.email}</span><LogOut size={14} /></button>
        </div>
      </aside>
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        <header className="h-20 border-b border-white/5 bg-onyx flex items-center justify-between px-8 shrink-0">
          <div className="hidden lg:block"><p className="text-[10px] text-white/20 uppercase font-black tracking-widest">Global Overview</p></div>
          <div className="flex items-center gap-6">
            <Popover>
              <PopoverTrigger asChild>
                <button className="relative w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                  <Bell className={`w-5 h-5 ${pendingOrders.length > 0 ? "text-gold animate-bounce" : "text-white/40"}`} />
                  {pendingOrders.length > 0 && <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-[10px] font-black flex items-center justify-center border-2 border-onyx">{pendingOrders.length}</span>}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-onyx border-gold/20 p-0 shadow-2xl rounded-2xl overflow-hidden mr-4">
                <div className="p-4 border-b border-white/5 bg-white/5"><h3 className="font-display text-lg text-gold">New Orders</h3></div>
                <div className="max-h-96 overflow-y-auto">
                  {pendingOrders.length === 0 ? <div className="p-8 text-center text-white/20 text-xs uppercase font-bold tracking-widest">All caught up</div> : pendingOrders.map((po: any) => (
                      <div key={po.id} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors">
                         <div className="flex justify-between items-start mb-1"><span className="font-mono text-[10px] text-gold/50">{po.order_number}</span></div>
                         <p className="text-sm font-bold text-white mb-3">{po.customer_name}</p>
                         <Button onClick={() => acceptOrderQuick(po.id)} className="h-8 w-full bg-gold text-onyx text-[10px] font-black rounded-lg">ACCEPT</Button>
                      </div>
                    ))
                  }
                </div>
              </PopoverContent>
            </Popover>
            <div className="w-10 h-10 rounded-full bg-onyx border border-gold/30 flex items-center justify-center font-black text-gold text-xs">{user?.email?.charAt(0).toUpperCase()}</div>
          </div>
        </header>
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto bg-[#080808]"><Outlet /></main>
      </div>
    </div>
  );
}