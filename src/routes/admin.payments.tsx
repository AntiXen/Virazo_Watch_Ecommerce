import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/payments")({
  component: PaymentsPage,
});

function PaymentsPage() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: async () => (await supabase.from("orders").select("id,order_number,customer_name,total,payment_method,payment_status,created_at").order("created_at", { ascending: false })).data ?? [],
  });
  const set = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ payment_status: status as any }).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-payments"] });
  };
  const totals = data.reduce((acc: any, o: any) => {
    acc.total += Number(o.total);
    if (o.payment_status === "paid") acc.paid += Number(o.total);
    return acc;
  }, { total: 0, paid: 0 });

  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl">Payments</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4"><div className="text-xs text-muted-foreground uppercase">Total billed</div><div className="font-display text-2xl mt-2">${totals.total.toLocaleString()}</div></div>
        <div className="bg-card border border-border rounded-xl p-4"><div className="text-xs text-muted-foreground uppercase">Collected</div><div className="font-display text-2xl mt-2 text-gold">${totals.paid.toLocaleString()}</div></div>
        <div className="bg-card border border-border rounded-xl p-4"><div className="text-xs text-muted-foreground uppercase">Outstanding</div><div className="font-display text-2xl mt-2 text-destructive">${(totals.total - totals.paid).toLocaleString()}</div></div>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="text-left p-3">Order</th><th className="text-left p-3">Customer</th><th className="text-left p-3">Method</th><th className="text-left p-3">Total</th><th className="text-left p-3">Status</th></tr></thead>
          <tbody>
            {data.map((o: any) => (
              <tr key={o.id} className="border-t border-border">
                <td className="p-3 font-mono text-xs">{o.order_number}</td>
                <td className="p-3">{o.customer_name}</td>
                <td className="p-3 uppercase text-xs">{o.payment_method}</td>
                <td className="p-3 text-gold">${Number(o.total).toLocaleString()}</td>
                <td className="p-3">
                  <Select value={o.payment_status} onValueChange={(v) => set(o.id, v)}>
                    <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>{["unpaid", "paid", "refunded"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
