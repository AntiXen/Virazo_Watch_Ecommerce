import { motion, useScroll, useTransform } from "framer-motion";
import { Award, ShieldCheck, Truck, Sparkles, MoveRight } from "lucide-react";
import { useRef } from "react";

const items = [
  { 
    icon: Award, 
    title: "100% Authentic", 
    desc: "Every timepiece in our collection is strictly authorized, certified, and comes with original documentation.",
    delay: 0.1 
  },
  { 
    icon: ShieldCheck, 
    title: "Global Warranty", 
    desc: "Comprehensive manufacturer-backed coverage recognized by authorized service centers worldwide.",
    delay: 0.2 
  },
  { 
    icon: Truck, 
    title: "Insured Delivery", 
    desc: "Discreet, high-security shipping. Your investment is fully protected from our vault to your doorstep.",
    delay: 0.3 
  },
  { 
    icon: Sparkles, 
    title: "Lifetime Care", 
    desc: "Access to our master watchmakers for complimentary periodic inspections and professional ultrasonic cleaning.",
    delay: 0.4 
  },
];

export function Intro() {
  const containerRef = useRef(null);
  
  return (
    /* Change 1: Set background to transparent so the video at z-[-1] shows through */
    <section ref={containerRef} className="py-24 md:py-40 relative overflow-hidden bg-transparent">
      
      {/* Abstract Gold Glow: Set to low opacity so it enhances the video rather than hiding it */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-gold/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />

      <div className="container-luxe relative z-10">
        <div className="grid lg:grid-cols-12 gap-16 items-start">
          
          {/* Left Side: Branding & Philosophy */}
          <div className="lg:col-span-5 lg:sticky lg:top-40">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
            >
              <div className="flex items-center gap-4 mb-8">
                <span className="w-12 h-px bg-gold/40" />
                <p className="text-[10px] tracking-[0.5em] text-gold uppercase font-black">
                  The Virazo Heritage
                </p>
              </div>

              <h2 className="font-display text-5xl md:text-7xl text-white leading-[1.1] mb-8">
                Time, <span className="italic text-gold/80">refined</span> <br /> 
                into an heirloom.
              </h2>

              <p className="text-white/60 text-lg md:text-xl font-light leading-relaxed mb-10 max-w-md">
                Since 2014, we have served as the silent bridge between legendary watchmakers and discerning collectors. 
                We don't just sell watches; we curate legacies.
              </p>

              <motion.button 
                whileHover={{ x: 10 }}
                className="flex items-center gap-4 text-gold text-xs font-black tracking-[0.3em] uppercase group"
              >
                Learn Our Philosophy <MoveRight className="w-4 h-4 group-hover:text-white transition-colors" />
              </motion.button>
            </motion.div>
          </div>

          {/* Right Side: Feature "Floating" Cards */}
          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-6 md:gap-8 lg:pt-20">
            {items.map((it, idx) => (
              <motion.div
                key={it.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: it.delay }}
                /* Staggered height effect for the luxury look */
                className={`group relative ${idx % 2 !== 0 ? 'lg:translate-y-16' : ''}`}
              >
                {/* 
                   Change 2: Increased backdrop-blur and set bg to a very light translucent white.
                   This makes the cards look like real frosted glass floating over your video.
                */}
                <div className="relative z-10 h-full p-8 md:p-10 rounded-[2.5rem] bg-black/20 backdrop-blur-2xl border border-white/10 transition-all duration-500 group-hover:border-gold/40 group-hover:bg-black/40 shadow-2xl">
                  
                  {/* Icon with Glowing Aura */}
                  <div className="relative w-14 h-14 mb-8">
                    <div className="absolute inset-0 bg-gold/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-gold/20 to-transparent border border-gold/20 flex items-center justify-center text-gold group-hover:scale-110 group-hover:rotate-[10deg] transition-all duration-500">
                      <it.icon strokeWidth={1.2} className="w-6 h-6" />
                    </div>
                  </div>

                  <h3 className="font-display text-2xl text-white mb-4 group-hover:text-gold transition-colors">
                    {it.title}
                  </h3>
                  
                  <p className="text-sm text-white/40 leading-relaxed group-hover:text-white/70 transition-colors font-light">
                    {it.desc}
                  </p>

                  {/* Decorative corner element */}
                  <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0">
                    <div className="w-10 h-10 border-r border-b border-gold/30 rounded-br-2xl" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}