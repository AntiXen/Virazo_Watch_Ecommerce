import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — VIRAZO WATCH" },
      { name: "description", content: "Reach our boutique for personal consultations, service, or inquiries." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <div className="pt-48 pb-24 min-h-screen relative overflow-hidden">
      <div className="container-luxe relative z-10">
        
        {/* হেডার সেকশন - টাইপোগ্রাফি বড় করা হয়েছে */}
        <div className="text-center mb-24">
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs md:text-sm tracking-[0.6em] text-gold uppercase mb-4 font-bold opacity-90"
          >
            Get in touch
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-display text-6xl md:text-8xl gradient-gold-text leading-tight"
          >
            Contact Our Shop
          </motion.h1>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 items-stretch">
          
          {/* বাম পাশে: কন্টাক্ট ইনফো এবং গোল্ডেন বর্ডার ম্যাপ */}
          <div className="lg:col-span-5 flex flex-col">
            
            {/* কন্টাক্ট ইনফো কার্ডস */}
            <div className="grid gap-5 mb-10">
              {[
                { Icon: MapPin, title: "Visit Us", body: "House 42, Road 11, Gulshan-1, Dhaka 1212" },
                { Icon: Phone, title: "Call Us", body: "+880 1700 000 000" },
                { Icon: Mail, title: "Email", body: "hello@virazo.co" },
              ].map(({ Icon, title, body }) => (
                <div key={title} className="flex items-center gap-6 p-7 rounded-[2.5rem] bg-black/20 backdrop-blur-3xl border border-white/5 shadow-2xl transition-all hover:border-gold/30 group">
                  <div className="w-14 h-14 rounded-full bg-gold/10 grid place-items-center text-gold shrink-0 border border-gold/20 group-hover:bg-gold group-hover:text-onyx transition-all duration-500">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-black tracking-[0.2em] text-gold uppercase mb-1">{title}</p>
                    <p className="text-lg md:text-xl text-white font-medium leading-tight">{body}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ম্যাপ সেকশন - গোল্ডেন বর্ডার ও ভিজিবিলিটি ফিক্স */}
            <div className="flex-grow rounded-[3rem] overflow-hidden border-2 border-gold/40 shadow-[0_0_30px_rgba(212,175,55,0.15)] relative min-h-[350px] group">
               <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.277552998!2d90.4014793!3d23.7918122!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c70966f6874b%3A0xc3f03b6088e5e6c!2sGulshan%201%2C%20Dhaka!5e0!3m2!1sen!2sbd!4v1650000000000!5m2!1sen!2sbd" 
                className="absolute inset-0 w-full h-full border-0 contrast-[110%] opacity-90 group-hover:opacity-100 transition-all duration-700"
                loading="lazy"
               ></iframe>
               <div className="absolute inset-0 rounded-[3rem] border border-white/10 pointer-events-none"></div>
            </div>
          </div>

          {/* ডান পাশে: কন্টাক্ট ফর্ম - লেবেল ও স্পেসিং ফিক্স */}
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
              toast.success("Message sent", { description: "We'll be in touch within 24 hours." });
              (e.target as HTMLFormElement).reset();
            }}
            className="lg:col-span-7 bg-black/20 backdrop-blur-3xl border border-white/10 p-10 md:p-16 rounded-[4rem] flex flex-col shadow-2xl h-full"
          >
            <div className="flex-grow space-y-12">
                <div className="grid sm:grid-cols-2 gap-10">
                    <div className="flex flex-col gap-4">
                        <label className="text-xs md:text-sm tracking-[0.4em] uppercase text-gold font-black ml-6">Name</label>
                        <input required className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-5 text-base focus:outline-none focus:border-gold/50 transition-all text-white placeholder:text-white/20" placeholder="Your full name" />
                    </div>
                    <div className="flex flex-col gap-4">
                        <label className="text-xs md:text-sm tracking-[0.4em] uppercase text-gold font-black ml-6">Email</label>
                        <input required type="email" className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-5 text-base focus:outline-none focus:border-gold/50 transition-all text-white placeholder:text-white/20" placeholder="your@email.com" />
                    </div>
                </div>
                
                <div className="flex flex-col gap-4">
                    <label className="text-xs md:text-sm tracking-[0.4em] uppercase text-gold font-black ml-6">Subject</label>
                    <input required className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-5 text-base focus:outline-none focus:border-gold/50 transition-all text-white placeholder:text-white/20" placeholder="How can we help?" />
                </div>

                <div className="flex flex-col gap-4">
                    <label className="text-xs md:text-sm tracking-[0.4em] uppercase text-gold font-black ml-6">Message</label>
                    <textarea required rows={7} className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] px-8 py-7 text-base focus:outline-none focus:border-gold/50 transition-all text-white resize-none placeholder:text-white/20" placeholder="Write your message here..." />
                </div>
            </div>

            <div className="flex justify-center pt-12">
                <button className="bg-gradient-gold text-onyx font-black tracking-[0.5em] text-xs px-20 py-5 rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_15px_40px_rgba(212,175,55,0.3)]">
                  {sent ? "MESSAGE SENT ✓" : "SEND MESSAGE"}
                </button>
            </div>
          </motion.form>

        </div>
      </div>
    </div>
  );
}