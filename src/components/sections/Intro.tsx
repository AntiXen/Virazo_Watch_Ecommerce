import { motion } from "framer-motion";
import { Award, ShieldCheck, Truck, Sparkles } from "lucide-react";

const items = [
  { icon: Award, title: "100% Authentic", desc: "Every piece authorized & certified." },
  { icon: ShieldCheck, title: "International Warranty", desc: "Manufacturer-backed coverage." },
  { icon: Truck, title: "Free Express Delivery", desc: "Discreet, insured shipping." },
  { icon: Sparkles, title: "Lifetime Servicing", desc: "Care for your timepiece, forever." },
];

export function Intro() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="container-luxe">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* টেক্সট সেকশন এনিমেশন */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <p className="text-xs tracking-[0.4em] text-gold uppercase mb-4">The LUXE Standard</p>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1.05] text-balance">
              Time, <span className="gradient-gold-text italic">elevated</span> <br /> to an art form.
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed text-balance text-base md:text-lg">
              For over a decade, LUXE has been the trusted destination for connoisseurs of fine watchmaking.
              We curate only what we'd wear ourselves — authentic, exquisite, and impossible to forget.
            </p>
          </motion.div>

          {/* কার্ড গ্রিড সেকশন */}
          <div className="grid sm:grid-cols-2 gap-5">
            {items.map((it, index) => (
              <motion.div
                key={it.title}
                // স্ক্রল করার সময় একটার পর একটা ভেসে উঠবে (Staggered Reveal)
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                
                // হোভার করলে জুম এবং উপরে উঠে আসার প্যারালাক্স ইফেক্ট
                whileHover={{ 
                  scale: 1.05, 
                  y: -10,
                  transition: { duration: 0.3 } 
                }}
                className="hairline rounded-xl p-7 bg-card/50 backdrop-blur-sm hover:bg-gold/[0.03] transition-all duration-500 group relative overflow-hidden cursor-pointer"
              >
                {/* কার্ড হোভার গ্লো ইফেক্ট */}
                <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-full bg-gradient-gold grid place-items-center text-onyx mb-5 shadow-gold group-hover:rotate-[360deg] transition-transform duration-700">
                    <it.icon className="w-5 h-5" />
                  </div>
                  
                  <h3 className="font-display text-xl text-gold mb-2 group-hover:translate-x-1 transition-transform">
                    {it.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {it.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}