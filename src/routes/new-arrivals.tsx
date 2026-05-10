import { createFileRoute } from "@tanstack/react-router";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/lib/queries";
import { motion } from "framer-motion";

export const Route = createFileRoute("/new-arrivals")({
  head: () => ({
    meta: [
      { title: "New Arrivals — VIRAZO WATCH" },
      { name: "description", content: "Just landed: the latest luxury watches added to our atelier." },
    ],
  }),
  component: NewArrivals,
});

function NewArrivals() {
  const { data: products = [], isLoading } = useProducts();
  const items = products.filter((p) => p.tags.includes("new"));

  return (
    <div className="pt-52 pb-24 min-h-screen">
      <div className="container-luxe">
        
        {/* হেডার সেকশন */}
        <div className="text-center mb-24">
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm md:text-base tracking-[0.5em] text-gold uppercase mb-5 font-black opacity-90"
          >
            Fresh In
          </motion.p>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-display text-7xl md:text-9xl gradient-gold-text leading-tight mb-8"
          >
            New Arrivals
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-white/60 text-xl md:text-2xl max-w-2xl mx-auto font-light tracking-wide"
          >
            The newest additions to our curated collection.
          </motion.p>
        </div>

        {/* গ্রিড এবং স্কোয়ার কার্ড */}
        {isLoading ? (
          <p className="text-center text-muted-foreground py-20">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">No new arrivals yet. Stay tuned!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-20">
            {items.map((p, index) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col group"
              >
                <div className="relative aspect-square">
                  <ProductCard product={p} />
                  
                  <div className="absolute top-5 right-5 z-10">
                    <span className="bg-gold text-onyx text-[10px] font-black px-4 py-1.5 rounded-sm shadow-xl uppercase tracking-widest">
                      New
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}