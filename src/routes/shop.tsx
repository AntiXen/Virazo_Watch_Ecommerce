import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { useProducts, useBrands } from "@/lib/queries";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, ChevronDown, Check, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "The Atelier — VIRAZO WATCH" },
      { name: "description", content: "Explore our curated collection of legendary timepieces." },
    ],
  }),
  component: Shop,
});

function Shop() {
  const [activeBrand, setActiveBrand] = useState<string>("all");
  const [sort, setSort] = useState<"featured" | "low" | "high">("featured");

  const { data: products = [], isLoading } = useProducts();
  const { data: brands = [] } = useBrands();

  const sortOptions = [
    { label: "Featured", value: "featured" },
    { label: "Price: Low - High", value: "low" },
    { label: "Price: High - Low", value: "high" },
  ] as const;

  let filtered = activeBrand === "all" 
    ? products 
    : products.filter((p) => p.brand.toLowerCase() === activeBrand.toLowerCase());

  filtered = [...filtered].sort((a, b) =>
    sort === "low" ? a.price - b.price : sort === "high" ? b.price - a.price : 0
  );

  return (
    <div className="pt-52 pb-32 min-h-screen bg-transparent relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-radial-gold opacity-[0.03] pointer-events-none" />

      <div className="container-luxe relative z-10 px-4 md:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-24">
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[11px] tracking-[0.6em] text-gold uppercase font-black mb-6 flex items-center justify-center gap-4"
          >
            <span className="w-12 h-px bg-gold/30" /> The Atelier
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-6xl md:text-8xl text-white leading-tight"
          >
            Shop All <span className="italic text-gold/80">Timepieces</span>
          </motion.h1>
        </div>

        {/* Filter Bar - No Scrollbar, Premium Interaction */}
        <div className="flex flex-col gap-12 mb-20">
          
          <div className="relative group">
            {/* Horizontal Brands - Scrollbar Hidden */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mask-fade-edges">
              <button
                onClick={() => setActiveBrand("all")}
                className={`relative px-8 py-3 text-[10px] font-black tracking-[0.2em] uppercase transition-all rounded-full shrink-0 ${
                  activeBrand === "all" ? "text-onyx" : "text-white/40 hover:text-white"
                }`}
              >
                <span className="relative z-10">All Collections</span>
                {activeBrand === "all" && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute inset-0 bg-gradient-gold rounded-full"
                    transition={{ type: "spring", bounce: 0.1, duration: 0.6 }}
                  />
                )}
              </button>

              {brands.map((b) => (
                <button
                  key={b.slug}
                  onClick={() => setActiveBrand(b.name.toLowerCase())}
                  className={`relative px-8 py-3 text-[10px] font-black tracking-[0.2em] uppercase transition-all rounded-full shrink-0 whitespace-nowrap ${
                    activeBrand === b.name.toLowerCase() ? "text-onyx" : "text-white/40 hover:text-white"
                  }`}
                >
                  <span className="relative z-10">{b.name}</span>
                  {activeBrand === b.name.toLowerCase() && (
                    <motion.div 
                      layoutId="active-pill"
                      className="absolute inset-0 bg-gradient-gold rounded-full"
                      transition={{ type: "spring", bounce: 0.1, duration: 0.6 }}
                    />
                  )}
                </button>
              ))}
            </div>
            
            {/* Bottom Hairline */}
            <div className="absolute bottom-0 left-0 w-full h-px bg-white/5" />
          </div>

          {/* Custom Sort UI */}
          <div className="flex items-center justify-between px-2">
             <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-gold/40 animate-pulse" />
                <p className="text-[10px] font-black tracking-[0.2em] text-white/20 uppercase">
                  {filtered.length} CURATED MODELS
                </p>
             </div>
             
             {/* Luxury Dropdown */}
             <DropdownMenu>
                <DropdownMenuTrigger className="outline-none">
                  <div className="flex items-center gap-4 group cursor-pointer hover:text-gold transition-all">
                    <SlidersHorizontal size={14} className="text-gold" />
                    <span className="text-[11px] font-black tracking-[0.2em] text-white/70 uppercase group-hover:text-gold">
                      SORT: {sortOptions.find(o => o.value === sort)?.label}
                    </span>
                    <ChevronDown size={14} className="text-white/20 group-hover:text-gold transition-colors" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-onyx border-white/10 rounded-2xl min-w-[200px] p-2 shadow-2xl backdrop-blur-xl">
                  {sortOptions.map((option) => (
                    <DropdownMenuItem 
                      key={option.value}
                      onClick={() => setSort(option.value as any)}
                      className="flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer text-[10px] font-black uppercase tracking-widest text-white/60 hover:bg-gold/10 hover:text-gold focus:bg-gold/10 focus:text-gold transition-all"
                    >
                      {option.label}
                      {sort === option.value && <Check size={12} className="text-gold" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
             </DropdownMenu>
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
             <Loader2 className="w-10 h-10 text-gold animate-spin" />
             <p className="text-[11px] font-black tracking-[0.4em] text-gold/40 uppercase">Inventory Syncing</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-40">
            <p className="font-display text-4xl text-white/10 italic">No timepieces matched your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-10 gap-y-24">
            {filtered.map((p, idx) => (
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

      {/* Global CSS to hide that scrollbar */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .mask-fade-edges {
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
      `}</style>
    </div>
  );
}