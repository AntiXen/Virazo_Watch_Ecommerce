import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import h1 from "@/assets/hero-1.jpg";
import h2 from "@/assets/hero-2.jpg";
import h3 from "@/assets/hero-3.jpg";

const slides = [
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
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % slides.length), 5500);
    return () => clearInterval(t);
  }, []);
  const go = (d: number) => setI((p) => (p + d + slides.length) % slides.length);

  return (
    <section className="relative h-[90vh] min-h-[600px] overflow-hidden">
      {slides.map((s, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ${idx === i ? "opacity-100" : "opacity-0"}`}
        >
          <img
            src={s.img}
            alt={s.title}
            width={1920}
            height={1080}
            {...(idx === 0 ? { fetchPriority: "high" as const } : { loading: "lazy" as const })}
            className="absolute inset-0 w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
          <div className="absolute inset-0 bg-radial-gold opacity-60" />
          <div className="container-luxe relative h-full flex items-center">
            <div className={`max-w-2xl ${idx === i ? "animate-fade-up" : ""}`}>
              <p className="text-xs md:text-sm tracking-[0.4em] text-gold mb-4 uppercase">{s.eyebrow}</p>
              <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] text-balance">
                <span className="gradient-gold-text">{s.title}</span>
              </h1>
              <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-md text-balance">
                {s.sub}
              </p>
              <div className="mt-8 flex gap-3 flex-wrap">
                <Link
                  to={s.href}
                  className="px-7 py-3.5 bg-gradient-gold text-onyx font-semibold tracking-wider text-sm rounded shadow-gold hover:brightness-110 transition"
                >
                  {s.cta}
                </Link>
                <Link
                  to="/brands"
                  className="px-7 py-3.5 hairline text-foreground tracking-wider text-sm rounded hover:bg-gold/10 transition"
                >
                  EXPLORE BRANDS
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={() => go(-1)}
        aria-label="Previous"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 grid place-items-center w-11 h-11 rounded-full hairline bg-background/40 backdrop-blur hover:bg-gold hover:text-onyx transition"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => go(1)}
        aria-label="Next"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 grid place-items-center w-11 h-11 rounded-full hairline bg-background/40 backdrop-blur hover:bg-gold hover:text-onyx transition"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-1 rounded-full transition-all ${idx === i ? "w-10 bg-gold" : "w-5 bg-foreground/30"}`}
          />
        ))}
      </div>
    </section>
  );
}
