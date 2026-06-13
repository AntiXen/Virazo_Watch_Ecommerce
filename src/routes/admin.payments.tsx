import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";
import { DollarSign, TrendingDown, Wallet } from "lucide-react";
import { AdminPage, AdminTitle, AdminTable, Th, Td } from "@/components/ui/admin-ui";

export const Route = createFileRoute("/admin/payments")({ component: PaymentsPage });

const paymentStatuses = ["unpaid", "paid", "refunded"] as const;

const statusStyle: Record<string, string> = {
  paid:     "bg-emerald-50 text-emerald-600 border-emerald-100",
  unpaid:   "bg-amber-50 text-amber-600 border-amber-100",
  refunded: "bg-blue-50 text-blue-500 border-blue-100",
};

function PaymentsPage() {
  const qc = useQueryClient();

  const { data = [] } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: async () =>
      (await supabase.from("orders").select("id,order_number,customer_name,total,payment_method,payment_status,created_at").order("created_at", { ascending: false })).data ?? [],
  });

  const updatePaymentStatus = async (id: string, status: string) => {
    // Optimistic update
    qc.setQueryData(["admin-payments"], (old: any[]) =>
      (old ?? []).map((o) => (o.id === id ? { ...o, payment_status: status } : o))
    );
    const { error } = await supabase.from("orders").update({ payment_status: status as any }).eq("id", id);
    if (error) {
      qc.invalidateQueries({ queryKey: ["admin-payments"] });
      return toast.error(error.message);
    }
    toast.success("Payment status updated");
    qc.invalidateQueries({ queryKey: ["admin-payments"] });
  };

  const totals = (data as any[]).reduce(
    (acc: any, o: any) => {
      acc.total += Number(o.total);
      if (o.payment_status === "paid") acc.paid += Number(o.total);
      return acc;
    },
    { total: 0, paid: 0 }
  );

  const stats = [
    { label: "Total Billed",  value: formatPrice(totals.total),                  icon: Wallet,      accent: false },
    { label: "Collected",     value: formatPrice(totals.paid),                    icon: DollarSign,  accent: true  },
    { label: "Outstanding",   value: formatPrice(totals.total - totals.paid),     icon: TrendingDown, danger: true  },
  ];

  return (
    <AdminPage>
      <AdminTitle>Payments</AdminTitle>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, accent, danger }) => (
          <div key={label} className={`bg-white border rounded-2xl p-5 shadow-sm
            ${danger ? "border-red-100" : "border-black/[0.07]"}`}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center
                ${danger ? "bg-red-50 text-red-400" : accent ? "bg-gold/10 text-gold" : "bg-black/5 text-black/30"}`}>
                <Icon size={15} />
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest text-black/30">{label}</p>
            </div>
            <p className={`font-display text-2xl leading-none
              ${danger ? "text-red-500" : accent ? "text-gold" : "text-gray-900"}`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      <AdminTable>
        <thead>
          <tr><Th>Order</Th><Th>Customer</Th><Th>Method</Th><Th>Total</Th><Th>Status</Th></tr>
        </thead>
        <tbody>
          {(data as any[]).map((o: any) => (
            <tr key={o.id} className="hover:bg-black/[0.01] transition-colors">
              <Td mono>{o.order_number}</Td>
              <Td><span className="font-medium text-gray-900">{o.customer_name}</span></Td>
              <Td><span className="text-[10px] font-black uppercase text-gray-400">{o.payment_method}</span></Td>
              <Td gold>{formatPrice(Number(o.total))}</Td>
              <td className="px-5 py-3.5 border-b border-black/[0.04]">
                <Select value={o.payment_status} onValueChange={(v) => updatePaymentStatus(o.id, v)}>
                  <SelectTrigger className={`w-28 h-8 text-[11px] font-bold border rounded-lg
                    ${o.payment_status === "paid"     ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      o.payment_status === "refunded" ? "bg-blue-50 text-blue-600 border-blue-200" :
                                                        "bg-amber-50 text-amber-700 border-amber-200"}`}>
                    <SelectValue>{o.payment_status}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {paymentStatuses.map((s) => (
                      <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400 text-sm">No payment records found.</td></tr>
          )}
        </tbody>
      </AdminTable>
    </AdminPage>
  );
}