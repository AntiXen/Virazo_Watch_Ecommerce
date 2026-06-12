import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

export const Route = createFileRoute("/admin/payments")({
  component: PaymentsPage,
});

const paymentStatuses = ["unpaid", "paid", "refunded"] as const;

function PaymentsPage() {
  const qc = useQueryClient();

  const { data = [] } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: async () =>
      (
        await supabase
          .from("orders")
          .select(
            "id,order_number,customer_name,total,payment_method,payment_status,created_at"
          )
          .order("created_at", { ascending: false })
      ).data ?? [],
  });

  const updatePaymentStatus = async (id: string, status: string) => {
    // ✅ FIX: Optimistic update — immediately update the cache so the
    // Select reflects the new value without waiting for a network round-trip.
    qc.setQueryData(["admin-payments"], (old: any[]) =>
      (old ?? []).map((o) => (o.id === id ? { ...o, payment_status: status } : o))
    );

    const { error } = await supabase
      .from("orders")
      .update({ payment_status: status as any })
      .eq("id", id);

    if (error) {
      // Roll back the optimistic update on error
      qc.invalidateQueries({ queryKey: ["admin-payments"] });
      return toast.error(error.message);
    }

    // ✅ FIX: Added missing success toast
    toast.success("Payment status updated");
    // Refetch to ensure the cache is in sync with the server
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

  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl">Payments</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs text-muted-foreground uppercase">Total Billed</div>
          <div className="font-display text-2xl mt-2">{formatPrice(totals.total)}</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs text-muted-foreground uppercase">Collected</div>
          <div className="font-display text-2xl mt-2 text-gold">{formatPrice(totals.paid)}</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs text-muted-foreground uppercase">Outstanding</div>
          <div className="font-display text-2xl mt-2 text-destructive">
            {formatPrice(totals.total - totals.paid)}
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left p-3">Order</th>
              <th className="text-left p-3">Customer</th>
              <th className="text-left p-3">Method</th>
              <th className="text-left p-3">Total</th>
              <th className="text-left p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {(data as any[]).map((o: any) => (
              <tr key={o.id} className="border-t border-border">
                <td className="p-3 font-mono text-xs">{o.order_number}</td>
                <td className="p-3">{o.customer_name}</td>
                <td className="p-3 uppercase text-xs">{o.payment_method}</td>
                <td className="p-3 text-gold">{formatPrice(Number(o.total))}</td>
                <td className="p-3">
                  {/* ✅ FIX: value comes from (optimistically updated) query cache,
                      so the Select shows the correct value immediately after change */}
                  <Select
                    value={o.payment_status}
                    onValueChange={(v) => updatePaymentStatus(o.id, v)}
                  >
                    <SelectTrigger className="w-32 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentStatuses.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  No payment records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}