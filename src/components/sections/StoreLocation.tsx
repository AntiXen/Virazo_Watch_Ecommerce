import { MapPin, Phone, Clock, Loader2, Navigation } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function StoreLocation() {
  const [shopData, setShopData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShopInfo = async () => {
        const { data: res } = await supabase
          .from("content_blocks")
          .select("value")
          .eq("key", "store_location")
          .maybeSingle();
        
        if (res?.value) {
            setShopData(res.value);
        } else {
            // Default Fallback for first-time setup
            setShopData({
                name: "Virazo Watch Shop",
                address: "Gulshan Avenue, Dhaka 1212",
                lat: 23.7925,
                lng: 90.4078,
                phone: "+880 1700 000 000",
                hours: "10:00 AM — 09:00 PM"
            });
        }
        setLoading(false);
    };
    fetchShopInfo();
  }, []);

  if (loading || !shopData) return null;

  // Calculate the Viewport for the map based on Admin Coordinates
  const zoom = 0.005;
  const bbox = `${shopData.lng - zoom}%2C${shopData.lat - zoom}%2C${shopData.lng + zoom}%2C${shopData.lat + zoom}`;

  return (
    <section className="py-24 md:py-32 bg-transparent relative overflow-hidden">
      <div className="container-luxe relative z-10">
        <div className="text-center mb-16">
          <p className="text-[10px] tracking-[0.6em] text-gold uppercase mb-4 font-black">Experience the Collection</p>
          <h2 className="font-display text-5xl md:text-7xl text-white">Visit Our Shop</h2>
        </div>

        <div className="relative rounded-[3rem] bg-black/20 backdrop-blur-3xl border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.4)] overflow-hidden grid lg:grid-cols-12 items-stretch">
          
          {/* 
              MAP CONTAINER 
              - pointer-events-none: Prevents scroll-zoom and accidental panning.
              - select-none: Prevents text selection inside the iframe.
          */}
          <div className="lg:col-span-7 aspect-video lg:aspect-auto bg-onyx relative group pointer-events-none select-none">
            <iframe
              title="Shop Location"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${shopData.lat}%2C${shopData.lng}`}
              className="w-full h-full grayscale contrast-[1.2] opacity-70 group-hover:opacity-90 group-hover:grayscale-0 transition-all duration-1000"
              loading="lazy"
            />
            {/* Subtle Overlay to make the map look even more integrated with the luxury theme */}
            <div className="absolute inset-0 bg-gold/5 mix-blend-color" />
          </div>

          {/* Details Side */}
          <div className="lg:col-span-5 p-10 md:p-16 flex flex-col justify-center bg-black/40 relative z-20">
            <div className="mb-10">
              <h3 className="font-display text-3xl text-gold mb-3">{shopData.name}</h3>
              <p className="text-sm text-white/40 leading-relaxed font-light">
                Our flagship destination in the heart of the city. 
                Step inside to experience the world's most distinguished timepieces up close.
              </p>
            </div>

            <div className="space-y-8">
              {/* Address */}
              <div className="flex gap-5 group">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gold shrink-0 transition-all group-hover:border-gold/50 group-hover:bg-gold/10">
                   <MapPin size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/30 font-black mb-1">Location</p>
                  <p className="text-base text-white/80 leading-snug">{shopData.address}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex gap-5 group">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gold shrink-0 transition-all group-hover:border-gold/50 group-hover:bg-gold/10">
                   <Phone size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/30 font-black mb-1">Direct Line</p>
                  <p className="text-lg text-white font-mono">{shopData.phone}</p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex gap-5 group">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gold shrink-0 transition-all group-hover:border-gold/50 group-hover:bg-gold/10">
                   <Clock size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/30 font-black mb-1">Opening Hours</p>
                  <p className="text-sm text-white/80 font-medium whitespace-pre-line">{shopData.hours}</p>
                </div>
              </div>
            </div>

            {/* Functional Button (Remains Clickable) */}
            <div className="mt-12 pt-8 border-t border-white/5">
                <button 
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${shopData.lat},${shopData.lng}`, '_blank')}
                  className="flex items-center gap-3 text-[10px] font-black text-gold uppercase tracking-[0.4em] hover:text-white transition-all group"
                >
                  <Navigation size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  GET DIRECTIONS
                </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}