import { createFileRoute } from "@tanstack/react-router";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/lib/queries";
import { motion } from "framer-motion";
import { Loader2, Percent, Sparkles } from "lucide-react";

export const Route = createFileRoute("/deals")({
  head: () => ({
    meta: [
      { title: "Exclusive Offerings — VIRAZO WATCH" },
      { name: "description", content: "Limited-time opportunities on legendary timepieces." },
    ],
  }),
  component: Deals,
});

function Deals() {
  const { data: products = [], isLoading } = useProducts();
  
  // Filter only products that have an oldPrice (active discounts)
  const dealItems = products.filter((p) => p.oldPrice && p.oldPrice > p.price);

  return (
    <div className="pt-52 pb-32 min-h-screen bg-transparent relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-radial-gold opacity-[0.04] pointer-events-none" />

      <div className="container-luxe relative z-10 px-4 md:px-8">
        
        {/* Header Section - Aligned with Shop & Contact Page */}
        <div className="text-center mb-24">
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[11px] tracking-[0.6em] text-gold uppercase font-black mb-6 flex items-center justify-center gap-4"
          >
            <span className="w-12 h-px bg-gold/30" /> Limited Opportunities
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-6xl md:text-8xl text-white leading-tight"
          >
            Exclusive <span className="italic text-gold/80">Offerings</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-8 text-white/40 text-sm md:text-lg max-w-2xl mx-auto font-light leading-relaxed tracking-wide"
          >
            Curated price adjustments on collector-grade pieces. <br />
            Available only while existing inventory lasts.
          </motion.p>
        </div>

        {/* Info Bar */}
        <div className="flex items-center justify-between border-b border-white/5 pb-8 mb-20 px-2">
            <div className="flex items-center gap-3">
                <Percent size={14} className="text-gold/50" />
                <p className="text-[10px] font-black tracking-[0.2em] text-white/20 uppercase">
                    {dealItems.length} ACTIVE OPPORTUNITIES
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Sparkles size={12} className="text-gold animate-pulse" />
                <span className="text-[10px] font-black tracking-[0.2em] text-gold/60 uppercase italic">
                    Authenticated & Certified
                </span>
            </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
             <Loader2 className="w-10 h-10 text-gold animate-spin" />
             <p className="text-[11px] font-black tracking-[0.4em] text-gold/40 uppercase">Syncing Value</p>
          </div>
        ) : dealItems.length === 0 ? (
          <div className="text-center py-40">
            <p className="font-display text-4xl text-white/10 italic">No active offers at this moment.</p>
            <p className="text-[10px] text-white/30 uppercase tracking-widest mt-4">Check back soon for new adjustments</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-10 gap-y-24">
            {dealItems.map((p, idx) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: idx * 0.05, duration: 0.8 }}
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Subtle Bottom Vignette */}
      <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
}