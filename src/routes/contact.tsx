import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Concierge — VIRAZO WATCH" },
      { name: "description", content: "Personal consultations and support for discerning collectors." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);
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

  const FieldLabel = ({ children }: { children: React.ReactNode }) => (
    <label className="text-[10px] uppercase tracking-[0.3em] text-gold/60 font-black mb-3 block">
      {children}
    </label>
  );

  return (
    <div className="pt-52 pb-32 min-h-screen bg-transparent relative overflow-hidden">
      {/* Subtle Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-radial-gold opacity-10 pointer-events-none" />

      <div className="container-luxe relative z-10">
        
        {/* Minimalist Header */}
        <div className="max-w-4xl mb-24">
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[11px] tracking-[0.6em] text-gold uppercase font-black mb-6 flex items-center gap-4"
          >
            <span className="w-12 h-px bg-gold/30" /> Client Concierge
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-6xl md:text-8xl text-white leading-tight"
          >
            How may we <br />
            <span className="italic text-gold/80">assist you?</span>
          </motion.h1>
        </div>

        <div className="grid lg:grid-cols-12 gap-20">
          
          {/* Left: Contact Info - Minimalist List Style */}
          <div className="lg:col-span-4 space-y-16">
            <div className="space-y-12">
              {[
                { Icon: MapPin, title: "Our Boutique", body: "Gulshan Avenue, Dhaka 1212, Bangladesh" },
                { Icon: Phone, title: "Private Line", body: settings?.phone || "+880 1700 000 000" },
                { Icon: Mail, title: "Email Inquiry", body: settings?.email || "hello@virazo.watch" },
              ].map(({ Icon, title, body }) => (
                <div key={title} className="group cursor-default">
                  <p className="text-[10px] font-black tracking-[0.3em] text-gold/40 uppercase mb-4 group-hover:text-gold transition-colors">{title}</p>
                  <p className="text-xl text-white/80 font-light leading-snug max-w-[240px]">{body}</p>
                  <div className="w-0 group-hover:w-12 h-px bg-gold/50 mt-6 transition-all duration-700" />
                </div>
              ))}
            </div>

            {/* Subtle Map Integration */}
            <div className="rounded-3xl overflow-hidden border border-white/5 grayscale contrast-125 opacity-40 hover:opacity-80 transition-all duration-1000 h-48">
               <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.277552998!2d90.4014793!3d23.7918122!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c70966f6874b%3A0xc3f03b6088e5e6c!2sGulshan%201%2C%20Dhaka!5e0!3m2!1sen!2sbd!4v1650000000000!5m2!1sen!2sbd" 
                className="w-full h-full border-0"
                loading="lazy"
               />
            </div>
          </div>

          {/* Right: The Premium Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-8"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
                toast.success("Enquiry Received", { description: "Our team will respond within 24 hours." });
                (e.target as HTMLFormElement).reset();
              }}
              className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 p-10 md:p-20 rounded-[3rem] shadow-2xl relative overflow-hidden"
            >
              {/* Decorative Corner */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl pointer-events-none" />

              <div className="grid md:grid-cols-2 gap-12 mb-12">
                <div className="space-y-2">
                  <FieldLabel>Full Name</FieldLabel>
                  <input required className="w-full bg-transparent border-b border-white/10 py-4 text-lg font-light text-white focus:outline-none focus:border-gold transition-colors placeholder:text-white/10" placeholder="e.g. James Harrison" />
                </div>
                <div className="space-y-2">
                  <FieldLabel>Email Address</FieldLabel>
                  <input required type="email" className="w-full bg-transparent border-b border-white/10 py-4 text-lg font-light text-white focus:outline-none focus:border-gold transition-colors placeholder:text-white/10" placeholder="your@email.com" />
                </div>
              </div>

              <div className="space-y-12">
                <div className="space-y-2">
                  <FieldLabel>Subject of Interest</FieldLabel>
                  <input required className="w-full bg-transparent border-b border-white/10 py-4 text-lg font-light text-white focus:outline-none focus:border-gold transition-colors placeholder:text-white/10" placeholder="Product Inquiry / Service / Feedback" />
                </div>

                <div className="space-y-2">
                  <FieldLabel>Message</FieldLabel>
                  <textarea required rows={4} className="w-full bg-transparent border-b border-white/10 py-4 text-lg font-light text-white focus:outline-none focus:border-gold transition-colors resize-none placeholder:text-white/10" placeholder="How can our atelier assist you today?" />
                </div>
              </div>

              <div className="mt-16 flex flex-col md:flex-row items-center justify-between gap-8">
                <p className="text-[10px] text-white/20 uppercase tracking-widest max-w-[200px] leading-loose">
                  By submitting this request, you agree to our terms of privacy.
                </p>
                
                <button 
                  disabled={sent}
                  className={`
                    min-w-[240px] py-5 px-10 rounded-full font-black tracking-[0.4em] text-[10px] uppercase transition-all duration-500
                    ${sent 
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20" 
                      : "bg-gradient-gold text-onyx shadow-gold hover:scale-105 active:scale-95"
                    }
                  `}
                >
                  {sent ? "MESSAGE RECEIVED" : "SEND ENQUIRY"}
                </button>
              </div>
            </form>
          </motion.div>

        </div>
      </div>
    </div>
  );
}