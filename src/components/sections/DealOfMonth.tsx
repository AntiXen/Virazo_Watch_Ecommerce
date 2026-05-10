import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useProducts } from "@/lib/queries";
import { formatPrice } from "@/lib/utils";


function useCountdown(targetMs: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, targetMs - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff / 3600000) % 24);
  const m = Math.floor((diff / 60000) % 60);
  const s = Math.floor((diff / 1000) % 60);
  return { d, h, m, s };
}

export function DealOfMonth() {
  const { data: products = [] } = useProducts();
  const deal = products.find((p) => p.tags.includes("deal"));
  const target = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 6);
    d.setHours(23, 59, 59, 0);
    return d.getTime();
  })();
  const t = useCountdown(target);

  if (!deal) return null;

  const Box = ({ v, l }: { v: number; l: string }) => (
    <div className="text-center">
      <div className="hairline bg-background/50 backdrop-blur rounded-lg px-3 md:px-5 py-3 md:py-4 min-w-[64px] md:min-w-[80px]">
        <div className="font-display text-3xl md:text-4xl gradient-gold-text">
          {String(v).padStart(2, "0")}
        </div>
      </div>
      <div className="text-[10px] tracking-[0.3em] text-muted-foreground mt-2 uppercase">{l}</div>
    </div>
  );

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-radial-gold opacity-40" />
      <div className="container-luxe relative">
        <div className="hairline rounded-2xl bg-card/50 backdrop-blur shadow-luxe overflow-hidden grid lg:grid-cols-2">
          <div className="relative aspect-square lg:aspect-auto bg-onyx">
            <img
              src={deal.image}
              alt={deal.name}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <span className="absolute top-5 left-5 bg-gradient-gold text-onyx text-xs font-bold tracking-[0.2em] px-3 py-1.5 rounded uppercase shadow-gold">
              Limited Offer
            </span>
          </div>
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <p className="text-xs tracking-[0.4em] text-gold uppercase mb-3">Deal of the Month</p>
            <h2 className="font-display text-4xl md:text-5xl gradient-gold-text leading-tight">
              {deal.name}
            </h2>
            <p className="text-muted-foreground mt-4 max-w-md">{deal.description}</p>
            <div className="mt-6 flex items-baseline gap-3">
              <span className="font-display text-4xl text-foreground">{formatPrice(deal.price)}</span>
              {deal.oldPrice && (
                <span className="text-lg text-muted-foreground line-through">{formatPrice(deal.oldPrice)}</span>
              )}
            </div>
            <div className="mt-8 flex gap-3">
              <Box v={t.d} l="Days" />
              <Box v={t.h} l="Hrs" />
              <Box v={t.m} l="Min" />
              <Box v={t.s} l="Sec" />
            </div>
            <div className="mt-8 flex gap-3">
              <Link
                to="/products/$id"
                params={{ id: deal.id }}
                className="px-7 py-3.5 bg-gradient-gold text-onyx font-semibold tracking-wider text-sm rounded shadow-gold hover:brightness-110 transition"
              >
                CLAIM OFFER
              </Link>
              <Link
                to="/deals"
                className="px-7 py-3.5 hairline tracking-wider text-sm rounded hover:bg-gold/10 transition"
              >
                MORE DEALS
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
