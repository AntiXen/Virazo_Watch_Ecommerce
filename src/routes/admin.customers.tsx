import { Eye } from "lucide-react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/utils";

export const Route = createFileRoute("/admin/customers")({
  component: CustomersPage,
});

function CustomersPage() {
  const { data = [] } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => {
      const profiles = (await supabase.from("profiles").select("*").order("created_at", { ascending: false })).data ?? [];
      const orders = (await supabase.from("orders").select("id,user_id,customer_email,total,created_at").order("created_at", { ascending: false })).data ?? [];
      
      // Merge profiles with their orders, and also include guest orders as "customers"
      const customerMap = new Map();

      profiles.forEach((p: any) => {
        const userOrders = orders.filter(o => o.user_id === p.id || o.customer_email === p.email);
        customerMap.set(p.email, {
          ...p,
          orderCount: userOrders.length,
          totalSpent: userOrders.reduce((s, o) => s + Number(o.total), 0),
          latestOrderId: userOrders[0]?.id
        });
      });

      // Add guest orders who are not in profiles
      orders.forEach((o: any) => {
        if (!o.customer_email) return;
        if (!customerMap.has(o.customer_email)) {
          const guestOrders = orders.filter(go => go.customer_email === o.customer_email);
          customerMap.set(o.customer_email, {
            id: o.user_id || o.id,
            email: o.customer_email,
            full_name: "Guest Customer",
            orderCount: guestOrders.length,
            totalSpent: guestOrders.reduce((s, o) => s + Number(o.total), 0),
            latestOrderId: guestOrders[0]?.id,
            created_at: o.created_at
          });
        }
      });

      return Array.from(customerMap.values());
    },
  });
  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl">Customers</h1>
      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="text-left p-3">Name</th><th className="text-left p-3">Email</th><th className="text-left p-3">Orders</th><th className="text-left p-3">Spent</th><th className="text-left p-3">Joined</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {data.map((c: any) => (
              <tr key={c.email} className="border-t border-border">
                <td className="p-3 font-medium">{c.full_name ?? "—"}</td>
                <td className="p-3">{c.email}</td>
                <td className="p-3">{c.orderCount}</td>
                <td className="p-3 text-gold">{formatPrice(c.totalSpent)}</td>
                <td className="p-3 text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</td>
                <td className="p-3 text-right">
                  {c.latestOrderId && (
                    <Link to="/admin/orders/$id" params={{ id: c.latestOrderId }} className="p-2 inline-flex hover:text-gold" title="View Latest Invoice">
                      <Eye className="w-4 h-4" />
                    </Link>
                  )}
                </td>
              </tr>
            ))}
            {data.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No customers yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
