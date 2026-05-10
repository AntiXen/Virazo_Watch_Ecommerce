import { Link } from "@tanstack/react-router";
import { useBrands } from "@/lib/queries";
import { motion } from "framer-motion";

export function BrandsStrip() {
  const { data: brands = [] } = useBrands();

  // ইনফিনিট লুপের জন্য ব্র্যান্ড লিস্টটি ডাবল করে নেওয়া হয়েছে
  const infiniteBrands = [...brands, ...brands];

  if (brands.length === 0) return null;

  return (
    <section className="py-20 md:py-28 overflow-hidden bg-black/20">
      <div className="container-luxe">
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.4em] text-gold uppercase mb-3">Maison Selection</p>
          <h2 className="font-display text-4xl md:text-5xl gradient-gold-text">Iconic Brands</h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            From Swiss heritage to Japanese precision — every name we carry is hand-picked and authorized.
          </p>
        </div>
      </div>

      {/* স্লাইডার কন্টেইনার */}
      <div className="relative flex">
        {/* দুই পাশে ফেড ইফেক্ট - যা গ্লাস লুক আরও বাড়িয়ে দেয় */}
        <div className="absolute inset-y-0 left-0 w-24 md:w-48 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-24 md:w-48 bg-gradient-to-l from-background to-transparent z-10" />

        <motion.div 
          className="flex gap-5 px-5"
          animate={{
            x: ["0%", "-50%"] // অর্ধেক পথ গেলেই লুপটি আবার শুরু হবে, ফলে সিমলেস মনে হবে
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 25, // স্পিড কন্ট্রোল (বেশি দিলে ধীরে চলবে)
              ease: "linear",
            }
          }}
        >
          {infiniteBrands.map((b, index) => (
            <Link
              key={`${b.slug}-${index}`}
              to="/brands"
              className="group relative w-36 h-36 md:w-44 md:h-44 flex flex-col items-center justify-center 
                         /* গ্লাস ইফেক্ট (Glassmorphism) */
                         bg-white/[0.03] backdrop-blur-md border border-white/[0.08] 
                         rounded-2xl overflow-hidden transition-all duration-300
                         hover:bg-gold/[0.08] hover:border-gold/30"
            >
              {/* হোভার করলে গ্লো ইফেক্ট */}
              <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative text-center z-20">
                <p className="font-display text-lg md:text-xl text-foreground/90 group-hover:text-gold transition-colors duration-300">
                  {b.name}
                </p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="h-px w-3 bg-gold/30" />
                  <p className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase">
                    {b.count} pcs
                  </p>
                  <span className="h-px w-3 bg-gold/30" />
                </div>
              </div>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}