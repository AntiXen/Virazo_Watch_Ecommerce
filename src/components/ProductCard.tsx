import { Link } from "@tanstack/react-router";
import { Star, ShoppingBag, Eye } from "lucide-react";
import type { Product } from "@/lib/queries";
import { useCart } from "@/store/cart";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";


export function ProductCard({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  return (
    <article className="group relative">
      <Link to="/products/$id" params={{ id: product.id }} className="block">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-card hairline">
          {discount > 0 && (
            <span className="absolute top-3 left-3 z-10 bg-gradient-gold text-onyx text-[10px] font-bold tracking-wider px-2 py-1 rounded">
              −{discount}%
            </span>
          )}
          {product.tags.includes("new") && (
            <span className="absolute top-3 right-3 z-10 hairline text-gold text-[10px] tracking-[0.2em] px-2 py-1 rounded uppercase">
              New
            </span>
          )}
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            width={800}
            height={800}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-x-3 bottom-3 flex gap-2 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <button
              onClick={(e) => {
                e.preventDefault();
                add(product);
                toast.success("Added to cart", { description: product.name });
              }}
              className="flex-1 bg-gradient-gold text-onyx text-xs font-semibold tracking-wider py-2.5 rounded flex items-center justify-center gap-1.5 hover:brightness-110 transition"
            >
              <ShoppingBag className="w-3.5 h-3.5" /> ADD
            </button>
            <span className="grid place-items-center w-10 h-10 hairline bg-background/80 backdrop-blur rounded text-gold">
              <Eye className="w-4 h-4" />
            </span>
          </div>
        </div>

        <div className="pt-4">
          <p className="text-[10px] tracking-[0.25em] text-gold uppercase">{product.brand}</p>
          <h3 className="font-display text-lg mt-1 leading-snug group-hover:text-gold transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-1 mt-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${i < Math.round(product.rating) ? "fill-gold text-gold" : "text-muted-foreground"}`}
              />
            ))}
            <span className="text-[11px] text-muted-foreground ml-1">({product.reviews})</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-base font-semibold text-foreground">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <span className="text-xs text-muted-foreground line-through">{formatPrice(product.oldPrice)}</span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
