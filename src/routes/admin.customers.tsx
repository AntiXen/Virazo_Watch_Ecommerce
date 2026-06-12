import { Eye } from "lucide-react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/utils";
import { AdminPage, AdminTitle, AdminTable, Th, Td } from "@/components/ui/admin-ui";

export const Route = createFileRoute("/admin/customers")({ component: CustomersPage });

function CustomersPage() {
  const { data = [] } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => {
      const profiles = (await supabase.from("profiles").select("*").order("created_at", { ascending: false })).data ?? [];
      const orders = (await supabase.from("orders").select("id,user_id,customer_email,total,created_at").order("created_at", { ascending: false })).data ?? [];
      const customerMap = new Map();
      profiles.forEach((p: any) => {
        const userOrders = orders.filter((o: any) => o.user_id === p.id || o.customer_email === p.email);
        customerMap.set(p.email, { ...p, orderCount: userOrders.length, totalSpent: userOrders.reduce((s: number, o: any) => s + Number(o.total), 0), latestOrderId: userOrders[0]?.id });
      });
      orders.forEach((o: any) => {
        if (!o.customer_email || customerMap.has(o.customer_email)) return;
        const guestOrders = orders.filter((go: any) => go.customer_email === o.customer_email);
        customerMap.set(o.customer_email, { id: o.user_id || o.id, email: o.customer_email, full_name: "Guest", orderCount: guestOrders.length, totalSpent: guestOrders.reduce((s: number, o: any) => s + Number(o.total), 0), latestOrderId: guestOrders[0]?.id, created_at: o.created_at });
      });
      return Array.from(customerMap.values());
    },
  });

  return (
    <AdminPage>
      <AdminTitle sub={`${data.length} total customers`}>Customers</AdminTitle>
      <AdminTable>
        <thead><tr><Th>Name</Th><Th>Email</Th><Th>Orders</Th><Th>Spent</Th><Th>Joined</Th><Th right></Th></tr></thead>
        <tbody>
          {(data as any[]).map((c) => (
            <tr key={c.email} className="hover:bg-black/[0.01] transition-colors">
              <Td><span className="font-medium text-gray-900">{c.full_name ?? "—"}</span></Td>
              <Td muted>{c.email}</Td>
              <Td><span className="font-semibold text-gray-700">{c.orderCount}</span></Td>
              <Td gold>{formatPrice(c.totalSpent)}</Td>
              <Td muted>{new Date(c.created_at).toLocaleDateString()}</Td>
              <Td right>
                {c.latestOrderId && (
                  <Link to="/admin/orders/$id" params={{ id: c.latestOrderId }} className="p-1.5 inline-flex hover:text-gold text-gray-300 transition-colors rounded-lg hover:bg-gold/5">
                    <Eye size={14} />
                  </Link>
                )}
              </Td>
            </tr>
          ))}
          {data.length === 0 && <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400 text-sm">No customers yet.</td></tr>}
        </tbody>
      </AdminTable>
    </AdminPage>
  );
}