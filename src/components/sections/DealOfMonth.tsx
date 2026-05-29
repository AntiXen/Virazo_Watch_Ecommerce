import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useDeals } from "@/lib/queries";
import { formatPrice } from "@/lib/utils";
import { ShoppingBag, Clock, Loader2 } from "lucide-react";

/**
 * Countdown Timer Hook
 * Calculates time remaining until the deal's 'ends_at' date.
 */
function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, target - now);

      setTimeLeft({
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff / (1000 * 60 * 60)) % 24),
        m: Math.floor((diff / (1000 * 60)) % 60),
        s: Math.floor((diff / 1000) % 60),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

export function DealOfMonth() {
  // Fetch active deals from DB
  const { data: deals = [], isLoading } = useDeals();
  
  // Pick the most recent active deal
  const activeDeal = deals.length > 0 ? deals[0] : null;
  const product = activeDeal?.product;
  
  // Initialize countdown with deal end date
  const t = useCountdown(activeDeal?.ends_at || new Date().toISOString());

  if (isLoading) return null; // Hide while loading
  if (!activeDeal || !product) return null; // Hide section if no active deal in Admin

  const Box = ({ v, l }: { v: number; l: string }) => (
    <div className="text-center group">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-4 md:px-6 py-4 min-w-[70px] md:min-w-[90px] shadow-2xl transition-all group-hover:border-gold/30">
        <div className="font-display text-3xl md:text-5xl text-white font-bold tracking-tighter">
          {String(v).padStart(2, "0")}
        </div>
      </div>
      <div className="text-[9px] tracking-[0.4em] text-gold/60 mt-3 uppercase font-black">{l}</div>
    </div>
  );

  return (
    <section className="py-24 md:py-32 relative overflow-hidden bg-transparent">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="container-luxe relative z-10">
        <div className="relative rounded-[3rem] bg-black/20 backdrop-blur-3xl border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.5)] overflow-hidden grid lg:grid-cols-12 items-stretch">
          
          {/* Left: Product Showcase */}
          <div className="lg:col-span-5 relative group min-h-[400px]">
            <img
              src={product.image}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent lg:bg-gradient-to-r" />
            
            <div className="absolute top-8 left-8">
               <span className="bg-gradient-gold text-onyx text-[10px] font-black tracking-[0.2em] px-5 py-2.5 rounded-full uppercase shadow-gold animate-pulse">
                Exclusive Deal
              </span>
            </div>
          </div>

          {/* Right: Deal Information */}
          <div className="lg:col-span-7 p-10 md:p-20 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-6">
               <span className="w-8 h-px bg-gold/50" />
               <p className="text-[10px] tracking-[0.5em] text-gold uppercase font-black">
                 {activeDeal.title || "Deal of the Month"}
               </p>
            </div>
            
            <h2 className="font-display text-5xl md:text-7xl text-white leading-tight mb-6">
              {product.name}
            </h2>
            
            <p className="text-white/40 text-lg font-light leading-relaxed mb-10 max-w-lg">
              {activeDeal.subtitle || product.description}
            </p>

            {/* Pricing Section */}
            <div className="flex items-baseline gap-6 mb-12">
              <span className="font-display text-5xl md:text-6xl text-gold font-bold">
                {formatPrice(product.price)}
              </span>
              {product.oldPrice && (
                <span className="text-xl md:text-2xl text-white/20 line-through decoration-gold/30">
                  {formatPrice(product.oldPrice)}
                </span>
              )}
            </div>

            {/* Countdown Grid */}
            <div className="flex gap-4 md:gap-6 mb-12">
              <Box v={t.d} l="Days" />
              <Box v={t.h} l="Hours" />
              <Box v={t.m} l="Mins" />
              <Box v={t.s} l="Secs" />
            </div>

            {/* Call to Action */}
            <div className="flex flex-wrap gap-5">
              <Link
                to="/products/$id"
                params={{ id: product.id }}
                className="px-12 py-5 bg-gradient-gold text-onyx font-black tracking-widest text-xs rounded-full shadow-gold hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
              >
                <ShoppingBag size={16} /> CLAIM THIS PIECE
              </Link>
              
              <Link
                to="/deals"
                className="px-12 py-5 border border-white/20 text-white font-black tracking-widest text-xs rounded-full hover:bg-white/5 transition-all flex items-center gap-3"
              >
                <Clock size={16} /> ALL DEALS
              </Link>
            </div>
          </div>

          {/* Decorative Background Icon */}
          <div className="absolute -bottom-10 -right-10 opacity-[0.03] text-white pointer-events-none">
             <ShoppingBag size={300} />
          </div>
        </div>
      </div>
    </section>
  );
}