import { MapPin, Phone, Clock } from "lucide-react";

export function StoreLocation() {
  return (
    <section className="py-20 md:py-28">
      <div className="container-luxe">
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.4em] text-gold uppercase mb-3">Visit Us</p>
          <h2 className="font-display text-4xl md:text-5xl gradient-gold-text">Our Boutique</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Step inside and experience the timepieces up close. Personal consultations available by appointment.
          </p>
        </div>

        <div className="hairline rounded-2xl overflow-hidden grid lg:grid-cols-5 bg-card shadow-luxe">
          <div className="lg:col-span-3 aspect-video lg:aspect-auto bg-onyx">
            <iframe
              title="Boutique location"
              src="https://www.openstreetmap.org/export/embed.html?bbox=90.4070%2C23.7900%2C90.4250%2C23.8050&layer=mapnik"
              className="w-full h-full grayscale contrast-125 opacity-90"
              loading="lazy"
            />
          </div>
          <div className="lg:col-span-2 p-8 md:p-10 flex flex-col justify-center gap-6">
            <div>
              <h3 className="font-display text-2xl text-gold mb-1">LUXE Flagship — Gulshan</h3>
              <p className="text-sm text-muted-foreground">Our signature boutique in the heart of the city.</p>
            </div>
            <div className="space-y-4">
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold">Address</p>
                  <p className="text-sm text-muted-foreground">House 42, Road 11, Gulshan-1, Dhaka 1212</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Phone className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold">Phone</p>
                  <p className="text-sm text-muted-foreground">+880 1700 000 000</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Clock className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold">Working Hours</p>
                  <p className="text-sm text-muted-foreground">Mon – Sat: 10:00 — 21:00<br />Sunday: 14:00 — 20:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
