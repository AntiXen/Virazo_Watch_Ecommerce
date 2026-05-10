import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, MessageCircle, MapPin, Phone, Mail } from "lucide-react";

// লোগোটি ইমপোর্ট করে নেওয়া হলো
import logo from "@/assets/logo.png"; 

export function Footer() {
  return (
    <footer className="bg-[#050505] border-t border-white/5 mt-32">
      <div className="container-luxe py-20 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
        
        {/* ব্র্যান্ড সেকশন - লোগো বড় করা হয়েছে */}
        <div className="space-y-8">
          <Link to="/" className="inline-block group">
            <img 
              src={logo} 
              alt="VIRAZO WATCH" 
              className="h-24 w-auto object-contain transition-transform group-hover:scale-105" 
            />
          </Link>
          
          <p className="text-[16px] text-white/70 leading-relaxed font-light max-w-xs">
            Curating the world's most distinguished timepieces since 2014. Authentic. Authorized. Iconic.
          </p>
          
          {/* সোশ্যাল আইকন */}
          <div className="flex gap-4">
            {[
              { icon: Facebook, label: "Facebook", href: "#" },
              { icon: Instagram, label: "Instagram", href: "#" },
              { icon: MessageCircle, label: "WhatsApp", href: "https://wa.me/8801700000000" }
            ].map((social) => (
              <a 
                key={social.label}
                href={social.href} 
                className="w-12 h-12 grid place-items-center rounded-full border border-white/10 text-white/50 hover:border-gold hover:text-gold transition-all duration-300"
                aria-label={social.label}
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links - টাইটেল আরও ভিজিবল করা হয়েছে */}
        <div>
          <h4 className="text-[15px] font-black tracking-[0.4em] text-gold mb-8 uppercase opacity-100 shadow-sm">
            Quick Links
          </h4>
          <ul className="space-y-4">
            {["Shop All", "Brands", "New Arrivals", "Deals", "About Us"].map((item) => (
              <li key={item}>
                <Link 
                  to={item === "Shop All" ? "/shop" : `/${item.toLowerCase().replace(/\s+/g, "-")}`} 
                  className="text-[17px] text-white/80 hover:text-gold hover:translate-x-1 inline-block transition-all duration-300 font-medium"
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Customer Care - টাইটেল আরও ভিজিবল করা হয়েছে */}
        <div>
          <h4 className="text-[15px] font-black tracking-[0.4em] text-gold mb-8 uppercase opacity-100 shadow-sm">
            Customer Care
          </h4>
          <ul className="space-y-4">
            {["Privacy Policy", "Return Policy", "Terms & Conditions", "Shipping Info", "Contact Us"].map((item) => (
              <li key={item}>
                <Link 
                  to={item === "Contact Us" ? "/contact" : "#"} 
                  className="text-[17px] text-white/80 hover:text-gold hover:translate-x-1 inline-block transition-all duration-300 font-medium"
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Visit Boutique - টাইটেল আরও ভিজিবল করা হয়েছে */}
        <div>
          <h4 className="text-[15px] font-black tracking-[0.4em] text-gold mb-8 uppercase opacity-100 shadow-sm">
            Visit Boutique
          </h4>
          <ul className="space-y-6">
            <li className="flex gap-4 group">
              <MapPin className="w-5 h-5 text-gold shrink-0 group-hover:scale-110 transition-transform mt-1" />
              <span className="text-[17px] text-white/80 leading-snug">Gulshan Avenue, <br />Dhaka 1212</span>
            </li>
            <li className="flex gap-4 group">
              <Phone className="w-5 h-5 text-gold shrink-0 group-hover:scale-110 transition-transform" />
              <span className="text-[17px] text-white/80">+880 1700 000 000</span>
            </li>
            <li className="flex gap-4 group">
              <Mail className="w-5 h-5 text-gold shrink-0 group-hover:scale-110 transition-transform" />
              <span className="text-[17px] text-white/80 font-medium">hello@virazo.watch</span>
            </li>
            <li className="text-[12px] tracking-[0.2em] text-white/50 pt-4 border-t border-white/5 uppercase font-bold">
              Mon–Sat · 10:00 — 21:00
            </li>
          </ul>
        </div>
      </div>

      {/* কপিরাইট সেকশন */}
      <div className="border-t border-white/5">
        <div className="container-luxe py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[14px] text-white/30 tracking-wider">
            © {new Date().getFullYear()} <span className="text-white/60 font-bold tracking-widest uppercase">Virazo Watch</span>. All rights reserved.
          </p>
          <p className="text-[11px] text-gold/40 tracking-[0.4em] uppercase font-black">
            Crafted with precision
          </p>
        </div>
      </div>
    </footer>
  );
}