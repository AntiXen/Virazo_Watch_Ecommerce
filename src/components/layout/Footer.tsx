import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, MessageCircle, MapPin, Phone, Mail, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png"; 

export function Footer() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    supabase
      .from("content_blocks")
      .select("value")
      .eq("key", "site_settings")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) setSettings(data.value);
      });
  }, []);

  const socialLinks = [
    { icon: Facebook, label: "Facebook", href: settings?.facebook || "#" },
    { icon: Instagram, label: "Instagram", href: settings?.instagram || "#" },
    { icon: MessageCircle, label: "WhatsApp", href: `https://wa.me/${settings?.whatsapp || "8801700000000"}` }
  ];

  return (
    <footer className="bg-[#050505] border-t border-white/5 mt-32 relative overflow-hidden">
      <div className="container-luxe py-20 grid gap-12 md:grid-cols-2 lg:grid-cols-4 relative z-10">
        
        {/* Brand Section */}
        <div className="space-y-8">
          <Link to="/" className="inline-block group">
            <img 
              src={logo} 
              alt="VIRAZO WATCH" 
              className="h-20 w-auto object-contain transition-transform group-hover:scale-105" 
            />
          </Link>
          
          <p className="text-[15px] text-white/50 leading-relaxed font-light max-w-xs">
            {settings?.tagline || "Curating the world's most distinguished timepieces since 2014. Authentic. Authorized. Iconic."}
          </p>
          
          <div className="flex gap-4">
            {socialLinks.map((social) => (
              <a 
                key={social.label}
                href={social.href}
                target="_blank" 
                rel="noreferrer"
                className="w-12 h-12 grid place-items-center rounded-full border border-white/10 text-white/50 hover:border-gold hover:text-gold hover:bg-gold/5 transition-all duration-500"
                aria-label={social.label}
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-[11px] font-black tracking-[0.4em] text-gold mb-8 uppercase opacity-100">
            Navigation
          </h4>
          <ul className="space-y-4">
            {["Shop All", "Brands", "New Arrivals", "Deals", "About Us"].map((item) => (
              <li key={item}>
                <Link 
                  to={item === "Shop All" ? "/shop" : `/${item.toLowerCase().replace(/\s+/g, "-")}`} 
                  className="text-[15px] text-white/70 hover:text-gold hover:translate-x-1 inline-block transition-all duration-300"
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="text-[11px] font-black tracking-[0.4em] text-gold mb-8 uppercase opacity-100">
            Concierge
          </h4>
          <ul className="space-y-4">
            {["Privacy Policy", "Return Policy", "Terms & Conditions", "Shipping Info", "Contact Us"].map((item) => (
              <li key={item}>
                <Link 
                  to={item === "Contact Us" ? "/contact" : "#"} 
                  className="text-[15px] text-white/70 hover:text-gold hover:translate-x-1 inline-block transition-all duration-300"
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Visit Boutique */}
        <div>
          <h4 className="text-[11px] font-black tracking-[0.4em] text-gold mb-8 uppercase opacity-100">
            Visit Boutique
          </h4>
          <ul className="space-y-6">
            <li className="flex gap-4 group">
              <MapPin className="w-5 h-5 text-gold/40 shrink-0 group-hover:text-gold transition-colors mt-1" />
              <span className="text-[15px] text-white/70 leading-snug font-light">Gulshan Avenue, <br />Dhaka 1212, Bangladesh</span>
            </li>
            <li className="flex gap-4 group">
              <Phone className="w-5 h-5 text-gold/40 shrink-0 group-hover:text-gold transition-colors" />
              <span className="text-[15px] text-white/70 font-mono">{settings?.phone || "+880 1700 000 000"}</span>
            </li>
            <li className="flex gap-4 group">
              <Mail className="w-5 h-5 text-gold/40 shrink-0 group-hover:text-gold transition-colors" />
              <span className="text-[15px] text-white/70 font-light lowercase">{settings?.email || "hello@virazo.watch"}</span>
            </li>
            <li className="text-[10px] tracking-[0.2em] text-white/30 pt-4 border-t border-white/5 uppercase font-bold">
              Open Mon–Sat · 10:00 — 21:00
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/5 bg-black/40 backdrop-blur-md">
        <div className="container-luxe py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-white/20 tracking-wider font-light">
            © {new Date().getFullYear()} <span className="text-white/40 font-bold tracking-widest uppercase">Virazo Watch</span>. All rights reserved.
          </p>
          <p className="text-[9px] text-gold/30 tracking-[0.5em] uppercase font-black">
            Mastery in Every Second
          </p>
        </div>
      </div>
    </footer>
  );
}