import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, X, Star } from "lucide-react";

export const Route = createFileRoute("/admin/reviews")({
  component: ReviewsPage,
});

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
  };
  const del = async (id: string) => {
    if (!confirm("Delete review?")) return;
    await supabase.from("reviews").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-reviews"] });
  };

  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl">Reviews</h1>
      <div className="space-y-3">
        {data.map((r: any) => (
          <div key={r.id} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="font-medium">{r.author_name} <span className="text-xs text-muted-foreground">— {r.location}</span></div>
                <div className="flex items-center gap-1 text-gold mt-1">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded ${r.approved ? "bg-gold/10 text-gold" : "bg-muted text-muted-foreground"}`}>{r.approved ? "Approved" : "Pending"}</span>
                {!r.approved && <Button size="sm" onClick={() => set(r.id, true)} className="bg-gradient-gold text-onyx"><Check className="w-3 h-3" /> Approve</Button>}
                {r.approved && <Button size="sm" variant="outline" onClick={() => set(r.id, false)}>Unapprove</Button>}
                <Button size="sm" variant="outline" onClick={() => del(r.id)}><X className="w-3 h-3" /></Button>
              </div>
            </div>
            <p className="text-sm text-foreground/80 mt-2">{r.text}</p>
          </div>
        ))}
        {data.length === 0 && <div className="text-muted-foreground">No reviews.</div>}
      </div>
    </div>
  );
}
