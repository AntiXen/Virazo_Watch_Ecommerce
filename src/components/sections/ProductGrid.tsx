import { Link } from "@tanstack/react-router";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/queries";
import { motion } from "framer-motion";

export function ProductGrid({
  title,
  eyebrow,
  description,
  products,
  cta,
}: {
  title: string;
  eyebrow: string;
  description?: string;
  products: Product[];
  cta?: { label: string; href: "/shop" | "/new-arrivals" | "/deals" | "/brands" };
}) {
  return (
    <section className="py-16 md:py-24 overflow-hidden bg-transparent">
      <div className="container-luxe">
        
        {/* হেডার সেকশন */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12"
        >
          <div className="space-y-2">
            <p className="text-[10px] md:text-xs tracking-[0.4em] text-gold uppercase font-bold opacity-80">
              {eyebrow}
            </p>
            <h2 className="font-display text-4xl md:text-6xl gradient-gold-text leading-tight">
              {title}
            </h2>
            {description && (
              <p className="text-white/50 mt-4 max-w-xl text-sm md:text-base leading-relaxed">
                {description}
              </p>
            )}
          </div>

          {cta && (
            <Link
              to={cta.href}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-gold/30 text-[10px] md:text-xs tracking-[0.2em] text-gold uppercase hover:bg-gold hover:text-onyx transition-all duration-500 group shadow-lg"
            >
              {cta.label} 
              <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
            </Link>
          )}
        </motion.div>

        {/* প্রোডাক্ট গ্রিড */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-12">
          {products.map((p, index) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 30 }} // x: 50 এর বদলে y: 30 করলে মোবাইল ভিউতে বেশি ভালো লাগে
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ 
                duration: 0.8, 
                delay: index * 0.05, // আরও স্মুথ ডেলি
                ease: [0.21, 0.45, 0.32, 0.9] // কাস্টম বেজিয়ার কার্ভ আরও লাক্সারি ফিল দেয়
              }}
              whileHover={{ 
                y: -12, 
                scale: 1.02,
                transition: { duration: 0.4, ease: "easeOut" } 
              }}
              className="relative group"
            >
              <ProductCard product={p} />
              
              {/* কার্ডের নিচে একটি হালকা গ্লো ইফেক্ট (ঐচ্ছিক) */}
              <div className="absolute inset-0 bg-gold/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}