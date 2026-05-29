import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useBanners } from "@/lib/queries";

// Default Fallback Slides (Used if Admin Panel is empty)
import h1 from "@/assets/hero-1.jpg";
import h2 from "@/assets/hero-2.jpg";
import h3 from "@/assets/hero-3.jpg";

const DEFAULT_SLIDES = [
  {
    img: h1,
    eyebrow: "Heritage Collection",
    title: "Where Time Meets Mastery",
    sub: "Hand-finished automatics, exposed mechanics, eternal craft.",
    cta: "Shop Now",
    href: "/shop",
  },
  {
    img: h2,
    eyebrow: "Mercer Series",
    title: "Refined In Every Detail",
    sub: "Rose gold, midnight leather, restraint perfected.",
    cta: "Explore Collection",
    href: "/brands",
  },
  {
    img: h3,
    eyebrow: "Diver Professional",
    title: "Engineered For The Depths",
    sub: "300m water-resistant. Sapphire crystal. Built to last generations.",
    cta: "Discover",
    href: "/new-arrivals",
  },
];

export function Hero() {
  const [i, setI] = useState(0);
  const { data: dbBanners = [], isLoading } = useBanners();

  // Map database banners to the UI format, or use defaults if DB is empty
  const slides = dbBanners.length > 0 
    ? dbBanners.map(b => ({
        img: b.image_url,
        eyebrow: "Limited Edition", // Default eyebrow for DB banners
        title: b.title,
        sub: b.subtitle || "",
        cta: b.cta_label || "Explore Now",
        href: b.link_url || "/shop"
      }))
    : DEFAULT_SLIDES;

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setI((p) => (p + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [slides.length]);

  const go = (d: number) => setI((p) => (p + d + slides.length) % slides.length);

  if (isLoading) {
    return (
      <div className="relative h-[90vh] min-h-[600px] bg-onyx flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-gold animate-spin" />
      </div>
    );
  }

  return (
    <section className="relative h-[90vh] min-h-[600px] overflow-hidden bg-[#050505]">
      {slides.map((s, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === i ? "opacity-100 z-10" : "opacity-0 z-0"}`}
        >
          {/* Banner Image */}
          <img
            src={s.img}
            alt={s.title}
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[6000ms] ${idx === i ? "scale-110" : "scale-100"}`}
          />
          
          {/* Premium Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-radial-gold opacity-40" />
          
          <div className="container-luxe relative h-full flex items-center">
            <div className={`max-w-2xl transition-all duration-1000 delay-300 ${idx === i ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
              <p className="text-xs md:text-sm tracking-[0.5em] text-gold mb-5 uppercase font-black">
                {s.eyebrow}
              </p>
              <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] text-balance mb-6">
                <span className="gradient-gold-text">{s.title}</span>
              </h1>
              <p className="text-base md:text-xl text-white/60 max-w-md text-balance font-light leading-relaxed mb-10">
                {s.sub}
              </p>
              
              <div className="flex gap-4 flex-wrap">
                <Link
                  to={s.href as any}
                  className="px-10 py-4 bg-gradient-gold text-onyx font-black tracking-widest text-xs rounded-full shadow-gold hover:scale-105 transition-all"
                >
                  {s.cta.toUpperCase()}
                </Link>
                <Link
                  to="/shop"
                  className="px-10 py-4 border border-white/20 text-white font-black tracking-widest text-xs rounded-full hover:bg-white/5 transition-all"
                >
                  VIEW ALL
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => go(-1)}
            aria-label="Previous"
            className="absolute left-6 top-1/2 -translate-y-1/2 z-30 grid place-items-center w-12 h-12 rounded-full border border-white/10 bg-black/20 backdrop-blur hover:bg-gold hover:text-onyx transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Next"
            className="absolute right-6 top-1/2 -translate-y-1/2 z-30 grid place-items-center w-12 h-12 rounded-full border border-white/10 bg-black/20 backdrop-blur hover:bg-gold hover:text-onyx transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Progress Indicators */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-30">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setI(idx)}
                className={`h-1 rounded-full transition-all duration-500 ${idx === i ? "w-12 bg-gold" : "w-6 bg-white/20"}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}