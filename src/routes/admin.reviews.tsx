import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, X, Star } from "lucide-react";
import { AdminPage, AdminTitle, Card, Badge } from "@/components/ui/admin-ui";

export const Route = createFileRoute("/admin/reviews")({ component: ReviewsPage });

function ReviewsPage() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => (await supabase.from("reviews").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const set = async (id: string, approved: boolean) => {
    const { error } = await supabase.from("reviews").update({ approved }).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-reviews"] });
    toast.success(approved ? "Review approved" : "Review unapproved");
  };
  const del = async (id: string) => {
    if (!confirm("Delete review?")) return;
    await supabase.from("reviews").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-reviews"] });
  };

  return (
    <AdminPage>
      <AdminTitle sub={`${data.length} reviews`}>Reviews</AdminTitle>
      <div className="space-y-3">
        {(data as any[]).map((r) => (
          <Card key={r.id} className="p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{r.author_name}</span>
                  {r.location && <span className="text-xs text-gray-400">— {r.location}</span>}
                  <Badge variant={r.approved ? "gold" : "default"}>{r.approved ? "Approved" : "Pending"}</Badge>
                </div>
                <div className="flex items-center gap-0.5 mt-1.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} className={i < r.rating ? "fill-gold text-gold" : "text-gray-200"} />
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-3 leading-relaxed">{r.text}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!r.approved && (
                  <Button size="sm" onClick={() => set(r.id, true)} className="h-8 bg-gradient-gold text-onyx font-bold text-xs hover:brightness-105">
                    <Check size={12} className="mr-1" /> Approve
                  </Button>
                )}
                {r.approved && (
                  <Button size="sm" variant="outline" onClick={() => set(r.id, false)} className="h-8 text-xs border-black/10 hover:bg-black/5">
                    Unapprove
                  </Button>
                )}
                <button onClick={() => del(r.id)} className="p-2 hover:text-red-400 text-gray-300 hover:bg-red-50 rounded-lg transition-colors">
                  <X size={14} />
                </button>
              </div>
            </div>
          </Card>
        ))}
        {data.length === 0 && <p className="text-center text-gray-400 py-10 text-sm">No reviews yet.</p>}
      </div>
    </AdminPage>
  );
}