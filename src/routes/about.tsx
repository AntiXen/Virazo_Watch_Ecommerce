import { createFileRoute } from "@tanstack/react-router";
import { Award, Heart, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — LUXE Timepieces" },
      { name: "description", content: "Our story: a decade of curating authentic luxury watches for connoisseurs." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="pt-32 pb-20">
      <div className="container-luxe">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-xs tracking-[0.4em] text-gold uppercase mb-3">Our Story</p>
          <h1 className="font-display text-5xl md:text-6xl gradient-gold-text leading-tight">
            A Decade of Devotion to Time
          </h1>
          <p className="mt-6 text-muted-foreground leading-relaxed text-balance">
            LUXE began in 2014 with a single conviction: a watch is not an accessory — it is an heirloom.
            What started as a private boutique on Gulshan Avenue has grown into the trusted destination
            for collectors across the region. Yet our promise remains unchanged: every piece we sell is
            authentic, every customer is treated as a guest, and every transaction is built on trust.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            { icon: Award, title: "Authorized Retailer", desc: "Direct relationships with the world's finest watchmakers." },
            { icon: ShieldCheck, title: "Certified Authentic", desc: "Every timepiece comes with international warranty and authenticity papers." },
            { icon: Heart, title: "White-Glove Service", desc: "From consultation to after-sale care, we treat every collector like family." },
          ].map((it) => (
            <div key={it.title} className="hairline rounded-xl bg-card p-8 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-gradient-gold grid place-items-center text-onyx shadow-gold mb-5">
                <it.icon className="w-6 h-6" />
              </div>
              <h3 className="font-display text-2xl text-gold">{it.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
