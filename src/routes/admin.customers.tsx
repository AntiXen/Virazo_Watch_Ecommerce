import { Eye, Phone, Copy, User } from "lucide-react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/customers")({
  component: CustomersPage,
});

function CustomersPage() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => {
      // Fetch both registered profiles and all orders
      const [profilesRes, ordersRes] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("orders").select("id,user_id,customer_email,customer_name,customer_phone,total,created_at").order("created_at", { ascending: false })
      ]);

      const profiles = profilesRes.data ?? [];
      const orders = ordersRes.data ?? [];
      
      const customerMap = new Map();

      // 1. Process Registered Profiles
      profiles.forEach((p: any) => {
        const userOrders = orders.filter(o => o.user_id === p.id || o.customer_email === p.email);
        customerMap.set(p.email, {
          id: p.id,
          email: p.email,
          full_name: p.full_name || "New Member",
          phone: p.phone || (userOrders[0]?.customer_phone) || "No Phone",
          orderCount: userOrders.length,
          totalSpent: userOrders.reduce((s, o) => s + Number(o.total), 0),
          latestOrderId: userOrders[0]?.id,
          created_at: p.created_at,
          isGuest: false
        });
      });

      // 2. Process Guest Customers (those who ordered but didn't register)
      orders.forEach((o: any) => {
        if (!o.customer_email) return;
        if (!customerMap.has(o.customer_email)) {
          const guestOrders = orders.filter(go => go.customer_email === o.customer_email);
          customerMap.set(o.customer_email, {
            id: o.user_id || o.id,
            email: o.customer_email,
            full_name: o.customer_name || "Guest Customer",
            phone: o.customer_phone || "No Phone",
            orderCount: guestOrders.length,
            totalSpent: guestOrders.reduce((s, o) => s + Number(o.total), 0),
            latestOrderId: guestOrders[0]?.id,
            created_at: o.created_at,
            isGuest: true
          });
        }
      });

      return Array.from(customerMap.values());
    },
  });

  const copyPhone = (phone: string) => {
    if (phone === "No Phone") return;
    navigator.clipboard.writeText(phone);
    toast.success("Phone number copied", { description: phone });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-white">Customer Directory</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your boutique's clientele and purchase history.</p>
      </div>

      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-white/90">
            <thead className="bg-white/5 text-[10px] uppercase tracking-[0.2em] text-gold font-black">
              <tr>
                <th className="p-5 text-left">Customer</th>
                <th className="p-5 text-left">Contact Info</th>
                <th className="p-5 text-center">Orders</th>
                <th className="p-5 text-left">Revenue</th>
                <th className="p-5 text-left">Joined</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr><td colSpan={6} className="p-10 text-center text-gold animate-pulse">Loading Client Database...</td></tr>
              ) : data.map((c: any) => (
                <tr key={c.email} className="hover:bg-white/5 transition-colors group">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${c.isGuest ? 'border-white/10 text-white/20' : 'border-gold/30 text-gold bg-gold/5'}`}>
                         <User size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          {c.full_name}
                          {!c.isGuest && <span className="text-[8px] bg-gold/10 text-gold px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Member</span>}
                        </div>
                        <div className="text-[11px] text-white/30 lowercase">{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <button 
                      onClick={() => copyPhone(c.phone)}
                      className="flex items-center gap-2 group/phone text-white/70 hover:text-gold transition-colors"
                    >
                      <Phone size={14} className="text-gold/40 group-hover/phone:text-gold" />
                      <span className="font-mono text-xs">{c.phone}</span>
                      <Copy size={10} className="opacity-0 group-hover/phone:opacity-100 ml-1" />
                    </button>
                  </td>
                  <td className="p-5 text-center">
                    <span className="bg-white/5 px-3 py-1 rounded-full text-xs font-bold">{c.orderCount}</span>
                  </td>
                  <td className="p-5">
                    <div className="font-bold text-white">{formatPrice(c.totalSpent)}</div>
                    <div className="text-[10px] text-white/20 uppercase font-black tracking-tighter">Total Life Value</div>
                  </td>
                  <td className="p-5 text-white/40 text-xs">
                    {new Date(c.created_at).toLocaleDateString("en-BD", { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="p-5 text-right">
                    {c.latestOrderId && (
                      <Link 
                        to="/admin/orders/$id" 
                        params={{ id: c.latestOrderId }} 
                        className="inline-flex w-10 h-10 items-center justify-center rounded-xl bg-gold/10 text-gold hover:bg-gold hover:text-onyx transition-all shadow-lg"
                        title="View Latest Purchase"
                      >
                        <Eye size={18} />
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
              {data.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={6} className="p-20 text-center text-white/20 italic">
                    No customers found in your database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}