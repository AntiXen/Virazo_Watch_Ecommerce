import { createFileRoute, Link } from "@tanstack/react-router";
import { useBrands, useProducts } from "@/lib/queries";

export const Route = createFileRoute("/brands")({
  head: () => ({
    meta: [
      { title: "Brands — LUXE Timepieces" },
      { name: "description", content: "Authorized retailer of Rolex, Tissot, Seiko, Citizen, G-Shock, and more." },
    ],
  }),
  component: Brands,
});

function Brands() {
  const { data: brands = [] } = useBrands();
  const { data: products = [] } = useProducts();

  return (
    // ন্যাভিগেশন বার থেকে নিচে নামানোর জন্য pt-52 ব্যবহার করা হয়েছে
    <div className="pt-52 pb-24 min-h-screen">
      <div className="container-luxe">
        
        {/* হেডার সেকশন - টাইপোগ্রাফি বড় করা হয়েছে */}
        <div className="text-center mb-24">
          <p className="text-sm md:text-base tracking-[0.6em] text-gold uppercase mb-5 font-bold">
            Maisons
          </p>
          <h1 className="font-display text-7xl md:text-8xl gradient-gold-text leading-tight">
            Iconic Brands We Carry
          </h1>
          <p className="text-white/60 mt-6 text-lg md:text-xl max-w-2xl mx-auto font-light">
            Each brand below is hand-selected and authorized. Click any to explore the collection.
          </p>
        </div>

        {/* গ্রিড সেকশন */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {brands.map((b) => {
            const sample = products.find((p) => p.brand === b.name);
            return (
              <Link
                key={b.slug}
                to="/shop"
                className="group hairline rounded-[2rem] bg-card overflow-hidden hover:shadow-gold transition-all duration-500"
              >
                <div className="aspect-square bg-onyx relative overflow-hidden">
                  {sample && (
                    <img
                      src={sample.image}
                      alt={b.name}
                      loading="lazy"
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  
                  {/* কার্ডের ভেতরের টেক্সট */}
                  <div className="absolute bottom-8 left-8 right-8">
                    <p className="font-display text-3xl md:text-4xl text-white group-hover:text-gold transition-colors">
                      {b.name}
                    </p>
                    <p className="text-xs md:text-sm text-gold/50 tracking-[0.2em] uppercase mt-2 font-bold">
                      {b.count} timepieces
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}