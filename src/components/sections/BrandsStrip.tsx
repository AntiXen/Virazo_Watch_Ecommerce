import { Link } from "@tanstack/react-router";
import { useBrands } from "@/lib/queries";
import { motion } from "framer-motion";
import { Award } from "lucide-react";

export function BrandsStrip() {
  const { data: brands = [] } = useBrands();

  // Create a triple-length list to ensure the infinite scroll has no gaps
  const infiniteBrands = [...brands, ...brands, ...brands];

  if (brands.length === 0) return null;

  return (
    <section className="py-24 bg-transparent overflow-hidden">
      <div className="container-luxe">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 px-4">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-px bg-gold/50" />
              <p className="text-[10px] tracking-[0.4em] text-gold uppercase font-black">
                Maison Portfolio
              </p>
            </div>
            <h2 className="font-display text-4xl md:text-6xl text-white leading-tight">
              Iconic Names in <br />
              <span className="italic text-gold/80">Horology.</span>
            </h2>
          </div>
          <p className="text-white/40 text-sm md:text-base max-w-xs font-light leading-relaxed">
            From Swiss heritage to Japanese precision — every name we carry is hand-picked and authorized.
          </p>
        </div>
      </div>

      {/* The Infinite Marquee Container */}
      <div className="relative flex items-center">
        {/* Left and Right "Vignette" Fades - Creates depth over the video */}
        <div className="absolute inset-y-0 left-0 w-32 md:w-64 bg-gradient-to-r from-background to-transparent z-20 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 md:w-64 bg-gradient-to-l from-background to-transparent z-20 pointer-events-none" />

        <motion.div 
          className="flex gap-6 py-4"
          animate={{
            x: ["0%", "-33.333%"] // Moves through one third of the triple list
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 35, // Adjust speed: higher = slower
              ease: "linear",
            }
          }}
        >
          {infiniteBrands.map((b, index) => (
            <Link
              key={`${b.slug}-${index}`}
              to="/shop"
              search={{ brand: b.slug }}
              className="group relative w-48 md:w-64 flex-shrink-0"
            >
              {/* Premium Glass Card */}
              <div className="relative h-32 md:h-40 bg-white/[0.03] backdrop-blur-md border border-white/5 rounded-2xl flex flex-col items-center justify-center p-6 transition-all duration-500 group-hover:border-gold/30 group-hover:bg-white/[0.06] group-hover:-translate-y-2">
                
                {/* Brand Name */}
                <span className="font-display text-2xl md:text-3xl text-white group-hover:text-gold transition-colors duration-500">
                  {b.name}
                </span>

                {/* Sub-details */}
                <div className="mt-3 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <span className="h-px w-4 bg-gold/30" />
                  <p className="text-[10px] text-gold tracking-[0.2em] uppercase font-black">
                    {b.count} models
                  </p>
                  <span className="h-px w-4 bg-gold/30" />
                </div>

                {/* Hover Glow */}
                <div className="absolute inset-0 bg-gold/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          ))}
        </motion.div>
      </div>

      {/* Bottom Branding Bar */}
      <div className="container-luxe mt-20">
         <div className="flex justify-center items-center gap-8 opacity-20 grayscale transition-all hover:grayscale-0 hover:opacity-50">
            <div className="flex items-center gap-2 text-[10px] font-bold text-white uppercase tracking-widest italic">
               <Award size={14} className="text-gold" /> Authorized Partner
            </div>
            <span className="w-1 h-1 rounded-full bg-white/40" />
            <div className="text-[10px] font-bold text-white uppercase tracking-widest italic">
               Direct Sourcing
            </div>
            <span className="w-1 h-1 rounded-full bg-white/40" />
            <div className="text-[10px] font-bold text-white uppercase tracking-widest italic">
               Certified Authentic
            </div>
         </div>
      </div>
    </section>
  );
}