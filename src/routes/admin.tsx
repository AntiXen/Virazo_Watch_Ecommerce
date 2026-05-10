import { createFileRoute, Outlet, Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard, Package, Tag, FolderTree, ShoppingCart, Users, Star,
  Image as ImageIcon, Percent, FileText, MapPin, Share2, Boxes, CreditCard,
  BarChart3, Settings, LogOut, ShieldAlert,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — LUXE Timepieces" }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

const NAV: { to: string; label: string; icon: any }[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/brands", label: "Brands", icon: Tag },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/banners", label: "Banners", icon: ImageIcon },
  { to: "/admin/deals", label: "Deals", icon: Percent },
  { to: "/admin/content", label: "Content / Pages", icon: FileText },
  { to: "/admin/location", label: "Store Location", icon: MapPin },
  { to: "/admin/social", label: "Social Media", icon: Share2 },
  { to: "/admin/inventory", label: "Inventory", icon: Boxes },
  { to: "/admin/payments", label: "Payments", icon: CreditCard },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const nav = useNavigate();
  const path = useRouterState({ select: (r) => r.location.pathname });

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
  }, [loading, user, nav]);

  if (loading) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;
  }
  if (!user) return null;
  if (!isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center px-4">
        <div className="max-w-md text-center bg-card border border-border rounded-xl p-8">
          <ShieldAlert className="w-12 h-12 text-gold mx-auto mb-3" />
          <h1 className="font-display text-2xl">Admins only</h1>
          <p className="text-muted-foreground mt-2 text-sm">Your account doesn't have admin access.</p>
          <Link to="/" className="inline-block mt-4 text-gold underline text-sm">Back to site</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 shrink-0 border-r border-border bg-card/40 hidden md:flex flex-col">
        <div className="px-5 py-5 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-gold grid place-items-center">
              <span className="text-onyx font-display text-sm font-bold">L</span>
            </div>
            <div>
              <div className="font-display text-base gradient-gold-text leading-none">LUXE Admin</div>
              <div className="text-[10px] tracking-widest text-muted-foreground mt-1">CONTROL PANEL</div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          {NAV.map((it) => {
            const active = it.to === "/admin" ? path === "/admin" : path.startsWith(it.to);
            const Icon = it.icon;
            return (
              <Link
                key={it.to}
                to={it.to}
                className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${
                  active ? "bg-gold/10 text-gold" : "text-foreground/75 hover:bg-muted/40 hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {it.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-3">
          <div className="text-xs text-muted-foreground truncate mb-2">{user.email}</div>
          <button
            onClick={() => { signOut(); nav({ to: "/" }); }}
            className="w-full flex items-center justify-center gap-2 text-sm py-2 rounded border border-border hover:bg-muted/40"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>
      <div className="flex-1 min-w-0">
        <header className="md:hidden border-b border-border px-4 py-3 flex items-center justify-between">
          <span className="font-display gradient-gold-text">LUXE Admin</span>
          <button onClick={() => { signOut(); nav({ to: "/" }); }} className="text-xs text-muted-foreground">Sign out</button>
        </header>
        <main className="p-5 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
