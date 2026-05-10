import { createFileRoute } from "@tanstack/react-router";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/lib/queries";
import { motion } from "framer-motion";

export const Route = createFileRoute("/deals")({
  head: () => ({
    meta: [
      { title: "Exclusive Deals — VIRAZO WATCH" },
      { name: "description", content: "Limited-time offers on premium luxury watches." },
    ],
  }),
  component: Deals,
});

function Deals() {
  const { data: products = [], isLoading } = useProducts();
  const items = products.filter((p) => p.oldPrice);
  
  return (
    // ন্যাভবার থেকে পর্যাপ্ত নিচে নামাতে pt-52 ব্যবহার করা হয়েছে
    <div className="pt-52 pb-24 min-h-screen">
      <div className="container-luxe">
        
        {/* হেডার সেকশন - টাইপোগ্রাফি অনেক বড় এবং পরিষ্কার */}
        <div className="text-center mb-24">
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm md:text-base tracking-[0.6em] text-gold uppercase mb-5 font-black opacity-90"
          >
            Limited Time
          </motion.p>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-display text-7xl md:text-9xl gradient-gold-text leading-tight mb-8"
          >
            Exclusive Deals
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-white/60 text-xl md:text-2xl max-w-2xl mx-auto font-light tracking-wide leading-relaxed"
          >
            Curated offers on collector pieces — while inventory lasts.
          </motion.p>
        </div>

        {/* প্রোডাক্ট গ্রিড */}
        {isLoading ? (
          <p className="text-center text-muted-foreground py-20">Loading deals…</p>
        ) : items.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">No deals available right now. Check back soon!</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {items.map((p, index) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
        )}
        
      </div>
    </div>
  );
}