import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { useProducts, useBrands } from "@/lib/queries";
import { motion } from "framer-motion";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop All Watches — LUXE Timepieces" },
      { name: "description", content: "Browse our full collection of luxury and premium watches from top brands." },
    ],
  }),
  component: Shop,
});

function Shop() {
  const [brand, setBrand] = useState<string>("all");
  const [sort, setSort] = useState<"featured" | "low" | "high">("featured");

  const { data: products = [], isLoading } = useProducts();
  const { data: brands = [] } = useBrands();

  let filtered = brand === "all" ? products : products.filter((p) => p.brand.toLowerCase() === brand);
  filtered = [...filtered].sort((a, b) =>
    sort === "low" ? a.price - b.price : sort === "high" ? b.price - a.price : 0
  );

  return (
    <div className="pt-48 pb-20"> 
      <div className="container-luxe">
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.4em] text-gold uppercase mb-3">The Atelier</p>
          <h1 className="font-display text-5xl md:text-7xl gradient-gold-text">Shop All Timepieces</h1>
        </div>

        {/* নতুন ইন্টিগ্রেটেড পিল ফিল্টার বার */}
        <div className="flex justify-center mb-16">
          <div className="flex items-center gap-2 p-1.5 rounded-full bg-black/20 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-x-auto no-scrollbar max-w-full">
            
            {/* ব্র্যান্ড বাটনগুলো */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setBrand("all")}
                className={`relative px-5 py-2 text-[10px] font-bold tracking-widest uppercase transition-all rounded-full ${
                  brand === "all" ? "text-onyx" : "text-white/60 hover:text-white"
                }`}
              >
                <span className="relative z-10">All</span>
                {brand === "all" && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute inset-0 bg-gradient-gold rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>

              {brands.map((b) => (
                <button
                  key={b.slug}
                  onClick={() => setBrand(b.name.toLowerCase())}
                  className={`relative px-5 py-2 text-[10px] font-bold tracking-widest uppercase transition-all rounded-full ${
                    brand === b.name.toLowerCase() ? "text-onyx" : "text-white/60 hover:text-white"
                  }`}
                >
                  <span className="relative z-10">{b.name}</span>
                  {brand === b.name.toLowerCase() && (
                    <motion.div 
                      layoutId="active-pill"
                      className="absolute inset-0 bg-gradient-gold rounded-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* ছোট ডিভাইডার */}
            <div className="w-[1px] h-6 bg-white/10 mx-2 flex-shrink-0" />

            {/* সর্টিং অপশন - পিলের ভেতরেই */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="bg-transparent text-white/80 px-4 py-2 text-[10px] font-bold tracking-widest rounded-full uppercase outline-none cursor-pointer hover:text-gold transition-colors"
            >
              <option value="featured" className="bg-onyx">Sort: Featured</option>
              <option value="low" className="bg-onyx">Price: Low - High</option>
              <option value="high" className="bg-onyx">Price: High - Low</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <p className="text-center text-muted-foreground py-20">Loading watches…</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">No watches match these filters.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-12">
            {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
