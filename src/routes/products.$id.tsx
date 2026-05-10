import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Star, ShoppingBag, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { useProduct, useProducts } from "@/lib/queries";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/store/cart";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { formatPrice } from "@/lib/utils";


export const Route = createFileRoute("/products/$id")({
  head: () => ({
    meta: [
      { title: "Product — LUXE Timepieces" },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const { data: product, isLoading } = useProduct(id);
  const { data: allProducts = [] } = useProducts();
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [qty, setQty] = useState(1);
  const add = useCart((s) => s.add);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="pt-32 container-luxe text-center">
        <p className="text-muted-foreground">Loading product…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-32 container-luxe text-center">
        <h1 className="font-display text-4xl gradient-gold-text">Product not found</h1>
        <Link to="/shop" className="text-gold mt-4 inline-block">← Back to shop</Link>
      </div>
    );
  }

  const related = allProducts.filter((p) => p.id !== product.id && p.brand === product.brand).slice(0, 4);
  const relatedFinal = related.length ? related : allProducts.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="pt-28 pb-20">
      <div className="container-luxe">
        <nav className="text-xs text-muted-foreground mb-8 tracking-wider">
          <Link to="/" className="hover:text-gold">HOME</Link> /{" "}
          <Link to="/shop" className="hover:text-gold">SHOP</Link> /{" "}
          <span className="text-gold">{product.name.toUpperCase()}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          <div>
            <div
              className="relative aspect-square overflow-hidden rounded-xl hairline bg-card cursor-zoom-in"
              onMouseEnter={() => setZoom(true)}
              onMouseLeave={() => setZoom(false)}
              onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
              }}
            >
              <img
                src={product.images[active]}
                alt={product.name}
                width={800}
                height={800}
                className="w-full h-full object-cover transition-transform duration-300"
                style={zoom ? { transform: `scale(2)`, transformOrigin: `${pos.x}% ${pos.y}%` } : undefined}
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3 mt-4">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className={`aspect-square rounded-lg overflow-hidden hairline transition ${i === active ? "ring-2 ring-gold" : "opacity-60 hover:opacity-100"}`}
                  >
                    <img src={img} alt="" loading="lazy" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-xs tracking-[0.4em] text-gold uppercase">{product.brand}</p>
            <h1 className="font-display text-4xl md:text-5xl mt-2 leading-tight">{product.name}</h1>
            <div className="flex items-center gap-2 mt-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.round(product.rating) ? "fill-gold text-gold" : "text-muted-foreground"}`} />
              ))}
              <span className="text-sm text-muted-foreground">{product.rating} · {product.reviews} reviews</span>
            </div>

            <div className="mt-6 flex items-baseline gap-4">
              <span className="font-display text-4xl text-gold">{formatPrice(product.price)}</span>
              {product.oldPrice && (
                <span className="text-lg text-muted-foreground line-through">{formatPrice(product.oldPrice)}</span>
              )}
              {product.inStock ? (
                <span className="ml-auto text-xs tracking-wider text-emerald-400 uppercase">In Stock</span>
              ) : (
                <span className="ml-auto text-xs tracking-wider text-destructive uppercase">Sold Out</span>
              )}
            </div>

            <p className="mt-6 text-muted-foreground leading-relaxed">{product.description}</p>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex items-center hairline rounded">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-4 py-3 hover:text-gold">−</button>
                <span className="px-4 min-w-[50px] text-center">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="px-4 py-3 hover:text-gold">+</button>
              </div>
              <button
                onClick={() => {
                  add(product, qty);
                  toast.success("Added to cart", { description: `${product.name} × ${qty}` });
                }}
                className="flex-1 bg-gradient-gold text-onyx font-semibold tracking-wider py-3.5 rounded shadow-gold flex items-center justify-center gap-2 hover:brightness-110 transition"
              >
                <ShoppingBag className="w-4 h-4" /> ADD TO CART
              </button>
            </div>
            <button
              onClick={() => {
                add(product, qty);
                navigate({ to: "/checkout" });
              }}
              className="mt-3 w-full hairline tracking-wider py-3.5 rounded hover:bg-gold/10 transition uppercase text-sm"
            >
              Buy Now →
            </button>

            <div className="mt-8 grid grid-cols-3 gap-3">
              {[
                { Icon: ShieldCheck, t: "Authentic" },
                { Icon: Truck, t: "Free Delivery" },
                { Icon: RotateCcw, t: "7-Day Return" },
              ].map(({ Icon, t }) => (
                <div key={t} className="hairline rounded p-3 text-center">
                  <Icon className="w-5 h-5 text-gold mx-auto" />
                  <p className="text-[11px] tracking-wider mt-1.5 uppercase">{t}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 hairline rounded-xl bg-card p-6">
              <h3 className="font-display text-xl text-gold mb-4">Specifications</h3>
              <dl className="grid grid-cols-2 gap-y-3 text-sm">
                <dt className="text-muted-foreground">Brand</dt>
                <dd>{product.brand}</dd>
                <dt className="text-muted-foreground">Warranty</dt>
                <dd>{product.warranty}</dd>
                {product.specs.map((s) => (
                  <div key={s.label} className="contents">
                    <dt className="text-muted-foreground">{s.label}</dt>
                    <dd>{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        <section className="mt-24">
          <div className="flex items-end justify-between mb-8">
            <h2 className="font-display text-3xl md:text-4xl gradient-gold-text">You May Also Love</h2>
            <Link to="/shop" className="text-sm tracking-[0.2em] text-gold uppercase">View All →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
            {relatedFinal.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      </div>
    </div>
  );
}
