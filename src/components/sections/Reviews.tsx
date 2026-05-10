import { Star, Quote } from "lucide-react";
import { useReviews } from "@/lib/queries";
import { motion } from "framer-motion"; // ১. ফ্রেমার মোশন ইম্পোর্ট

export function Reviews() {
  const { data: reviews = [] } = useReviews();

  if (reviews.length === 0) return null;

  return (
    <section className="py-20 md:py-28 overflow-hidden">
      <div className="container-luxe">
        <div className="text-center mb-14">
          <p className="text-xs tracking-[0.4em] text-gold uppercase mb-3">Voices of Trust</p>
          <h2 className="font-display text-4xl md:text-5xl gradient-gold-text">What Collectors Say</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {reviews.map((r, index) => (
            <motion.article
              key={r.id}
              // স্ক্রল করার সময় নিচ থেকে আসার এনিমেশন
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              
              // ২. আপনার কাঙ্ক্ষিত জুম এবং প্যারালাক্স ইফেক্ট (Hover Effect)
              whileHover={{ 
                scale: 1.03, // হালকা জুম ইন
                y: -10,      // হালকা উপরে উঠে আসা
                transition: { duration: 0.2 } 
              }}
              className="hairline rounded-xl bg-card p-7 relative hover:shadow-gold transition-shadow cursor-pointer group"
            >
              {/* কোট আইকন এনিমেশন - মাউস নিলে ঘুরবে */}
              <Quote className="absolute top-4 right-4 w-7 h-7 text-gold/20 group-hover:text-gold/40 group-hover:rotate-12 transition-all" />
              
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < r.rating ? "fill-gold text-gold" : "text-muted-foreground"}`} />
                ))}
              </div>

              <p className="text-sm text-foreground/90 leading-relaxed italic">"{r.text}"</p>

              <div className="mt-5 pt-5 border-t border-border">
                <p className="font-display text-base text-gold">{r.author_name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{r.location} · Verified Buyer</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}