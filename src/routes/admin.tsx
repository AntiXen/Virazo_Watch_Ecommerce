import {
  createFileRoute, Outlet, Link, useRouterState, useNavigate,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard, Package, Tag, FolderTree, ShoppingCart, Users, Star,
  Image as ImageIcon, Percent, FileText, MapPin, Share2, Boxes, CreditCard,
  BarChart3, Settings, LogOut, Loader2, Bell, ShieldAlert, Menu, X, ChevronRight,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Virazo Watch" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin",            label: "Dashboard",       icon: LayoutDashboard, section: null },
  { to: "/admin/products",   label: "Products",        icon: Package,         section: "Catalogue" },
  { to: "/admin/brands",     label: "Brands",          icon: Tag,             section: null },
  { to: "/admin/categories", label: "Categories",      icon: FolderTree,      section: null },
  { to: "/admin/orders",     label: "Orders",          icon: ShoppingCart,    section: "Sales" },
  { to: "/admin/payments",   label: "Payments",        icon: CreditCard,      section: null },
  { to: "/admin/inventory",  label: "Inventory",       icon: Boxes,           section: null },
  { to: "/admin/customers",  label: "Customers",       icon: Users,           section: "Community" },
  { to: "/admin/reviews",    label: "Reviews",         icon: Star,            section: null },
  { to: "/admin/banners",    label: "Banners",         icon: ImageIcon,       section: "Content" },
  { to: "/admin/deals",      label: "Deals",           icon: Percent,         section: null },
  { to: "/admin/content",    label: "Pages",           icon: FileText,        section: null },
  { to: "/admin/location",   label: "Store Location",  icon: MapPin,          section: null },
  { to: "/admin/social",     label: "Social Media",    icon: Share2,          section: null },
  { to: "/admin/reports",    label: "Reports",         icon: BarChart3,       section: "System" },
  { to: "/admin/settings",   label: "Settings",        icon: Settings,        section: null },
] as const;

function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const nav = useNavigate();
  const qc = useQueryClient();
  const path = useRouterState({ select: (r) => r.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: pendingOrders = [] } = useQuery({
    queryKey: ["admin-pending-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, customer_name, total, created_at")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 5000,
    enabled: !!user && isAdmin,
  });

  const handleAcceptQuick = async (orderId: string, orderNum: string) => {
    qc.setQueryData(["admin-pending-orders"], (old: any) =>
      old?.filter((o: any) => o.id !== orderId)
    );
    const tid = toast.loading(`Accepting #${orderNum}…`);
    try {
      const { data: items } = await supabase.from("order_items").select("*").eq("order_id", orderId);
      if (items) {
        for (const item of items) {
          if (!item.product_id) continue;
          const { data: p } = await supabase.from("products").select("stock").eq("id", item.product_id).single();
          if (p) {
            await supabase.from("products").update({ stock: Math.max(0, (p.stock ?? 0) - item.quantity) }).eq("id", item.product_id);
            await supabase.from("inventory_log").insert({ product_id: item.product_id, change: -item.quantity, reason: `Quick Accept: #${orderNum}` });
          }
        }
      }
      const { error, data: updated } = await supabase.from("orders").update({ status: "processing" }).eq("id", orderId).select();
      if (error || !updated?.length) throw new Error("DB rejected update.");
      toast.success(`Order #${orderNum} accepted`, { id: tid });
      qc.invalidateQueries({ queryKey: ["admin-pending-orders"] });
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    } catch (err: any) {
      qc.invalidateQueries({ queryKey: ["admin-pending-orders"] });
      toast.error(err.message, { id: tid });
    }
  };

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
  }, [loading, user, nav]);

  if (loading) return (
    <div className="min-h-screen bg-[#050505] grid place-items-center">
      <Loader2 className="w-8 h-8 text-gold animate-spin" />
    </div>
  );

  if (!user) return null;

  if (!isAdmin) return (
    <div className="min-h-screen grid place-items-center px-4 bg-[#050505]">
      <div className="max-w-sm text-center bg-[#0d0d0d] border border-white/10 rounded-2xl p-10">
        <ShieldAlert className="w-10 h-10 text-gold mx-auto mb-4" />
        <h1 className="font-display text-2xl text-white">Admins only</h1>
        <p className="text-white/40 mt-2 text-sm">Your account doesn't have admin access.</p>
        <Link to="/" className="inline-block mt-6 text-gold text-sm underline">Back to site</Link>
      </div>
    </div>
  );

  // ── Sidebar content (shared between desktop + mobile drawer) ──────────────
  const SidebarContent = () => {
    let lastSection: string | null = "INIT";
    return (
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="px-6 py-7 border-b border-white/5">
          <Link to="/" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
            <div className="w-9 h-9 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold shrink-0">
              <span className="text-onyx font-black text-base">V</span>
            </div>
            <div>
              <p className="font-display text-base leading-tight text-white tracking-wide">VIRAZO</p>
              <p className="text-[9px] text-gold/50 tracking-[0.25em] uppercase font-bold mt-0.5">Control Panel</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {NAV.map((it) => {
            const active = it.to === "/admin" ? path === "/admin" : path.startsWith(it.to);
            const Icon = it.icon;
            const showSection = it.section && it.section !== lastSection;
            if (it.section) lastSection = it.section;

            return (
              <div key={it.to}>
                {showSection && (
                  <p className="text-[8px] tracking-[0.25em] text-white/15 font-black uppercase px-4 pt-5 pb-2">
                    {it.section}
                  </p>
                )}
                <Link
                  to={it.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 group
                    ${active
                      ? "bg-gold text-onyx font-semibold shadow-md shadow-gold/20"
                      : "text-white/40 hover:text-white hover:bg-white/5"
                    }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${active ? "text-onyx" : "text-white/25 group-hover:text-white/70"}`} />
                  {it.label}
                  {active && <ChevronRight className="w-3 h-3 ml-auto opacity-60" />}
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-5 border-t border-white/5">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center font-black text-gold text-[11px] shrink-0">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <p className="text-[10px] text-white/25 truncate flex-1">{user?.email}</p>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-[12px] text-white/30 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-colors"
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex bg-[#050505] text-white">

      {/* ── Desktop sidebar ── */}
      <aside className="w-64 shrink-0 border-r border-white/[0.06] bg-[#080808] hidden lg:flex flex-col h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* ── Mobile drawer overlay ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-[#080808] border-r border-white/[0.06] z-10">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── Main area ── */}
      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">

        {/* Top bar */}
        <header className="h-16 border-b border-black/[0.06] bg-white flex items-center justify-between px-6 shrink-0">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden w-9 h-9 rounded-xl bg-black/5 flex items-center justify-center text-black/40 hover:text-black transition-colors"
          >
            <Menu size={16} />
          </button>

          {/* Desktop breadcrumb */}
          <div className="hidden lg:block">
            <p className="text-[10px] tracking-[0.25em] text-black/30 uppercase font-black">
              {NAV.find(n => n.to === "/admin" ? path === "/admin" : path.startsWith(n.to))?.label ?? "Dashboard"}
            </p>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Pending orders bell */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="relative w-9 h-9 rounded-xl bg-black/5 flex items-center justify-center hover:bg-black/8 transition-colors">
                  <Bell className={`w-4 h-4 ${pendingOrders.length > 0 ? "text-gold" : "text-black/30"}`} />
                  {pendingOrders.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-black flex items-center justify-center border-2 border-[#080808]">
                      {pendingOrders.length}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-[#0d0d0d] border border-white/10 p-0 shadow-2xl rounded-2xl overflow-hidden mr-2">
                <div className="px-5 py-4 border-b border-white/[0.06]">
                  <h3 className="font-display text-base text-white">Pending Orders</h3>
                  {pendingOrders.length > 0 && (
                    <p className="text-[10px] text-white/30 mt-0.5">{pendingOrders.length} awaiting action</p>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-white/[0.04]">
                  {pendingOrders.length === 0 ? (
                    <div className="py-10 text-center text-white/15 text-[11px] uppercase font-black tracking-widest">
                      All caught up
                    </div>
                  ) : (pendingOrders as any[]).map((po: any) => (
                    <div key={po.id} className="px-5 py-4 hover:bg-white/3 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-[13px] font-bold text-white">{po.customer_name}</p>
                          <p className="text-[10px] text-white/25 font-mono mt-0.5">#{po.order_number}</p>
                        </div>
                        <Link
                          to="/admin/orders/$id"
                          params={{ id: po.id }}
                          className="text-[9px] text-gold/50 hover:text-gold font-black uppercase tracking-wider"
                        >
                          View →
                        </Link>
                      </div>
                      <Button
                        onClick={() => handleAcceptQuick(po.id, po.order_number)}
                        className="h-8 w-full bg-gold hover:bg-gold/80 text-onyx text-[10px] font-black rounded-lg"
                      >
                        ACCEPT ORDER
                      </Button>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Avatar */}
            <div className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center font-black text-gold text-[12px]">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-[#f5f5f0] p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}