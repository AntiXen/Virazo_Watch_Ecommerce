import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/utils";


export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Cart — LUXE Timepieces" },
      { name: "description", content: "Review your selected timepieces before checkout." },
    ],
  }),
  component: Cart,
});

function Cart() {
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const subtotal = useCart((s) => s.subtotal());
  const shipping = subtotal > 0 ? (subtotal > 50000 ? 0 : 100) : 0;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="pt-32 pb-20 container-luxe text-center">
        <ShoppingBag className="w-16 h-16 text-gold mx-auto opacity-50" />
        <h1 className="font-display text-4xl gradient-gold-text mt-6">Your cart awaits</h1>
        <p className="text-muted-foreground mt-3">Discover timepieces worthy of your collection.</p>
        <Link to="/shop" className="inline-block mt-8 px-7 py-3.5 bg-gradient-gold text-onyx font-semibold tracking-wider text-sm rounded shadow-gold">
          BROWSE SHOP
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20">
      <div className="container-luxe">
        <h1 className="font-display text-4xl md:text-5xl gradient-gold-text mb-10">Your Cart</h1>
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-4">
            {items.map((it) => (
              <div key={it.id} className="hairline rounded-xl bg-card p-4 flex gap-4">
                <Link to="/products/$id" params={{ id: it.id }} className="w-24 h-24 rounded-lg overflow-hidden bg-onyx shrink-0">
                  <img src={it.image} alt={it.name} className="w-full h-full object-cover" />
                </Link>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] tracking-[0.25em] text-gold uppercase">{it.brand}</p>
                  <Link to="/products/$id" params={{ id: it.id }} className="font-display text-lg hover:text-gold block truncate">
                    {it.name}
                  </Link>
                  <p className="text-gold font-semibold mt-1">{formatPrice(it.price)}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center hairline rounded">
                      <button onClick={() => setQty(it.id, it.qty - 1)} className="px-3 py-1.5 hover:text-gold"><Minus className="w-3 h-3" /></button>
                      <span className="px-3 text-sm">{it.qty}</span>
                      <button onClick={() => setQty(it.id, it.qty + 1)} className="px-3 py-1.5 hover:text-gold"><Plus className="w-3 h-3" /></button>
                    </div>
                    <button onClick={() => remove(it.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="hairline rounded-xl bg-card p-7 h-fit lg:sticky lg:top-28">
            <h2 className="font-display text-2xl text-gold mb-5">Order Summary</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd>{shipping === 0 ? "FREE" : formatPrice(shipping)}</dd></div>
              {subtotal < 50000 && (
                <p className="text-xs text-muted-foreground italic">Spend {formatPrice(50000 - subtotal)} more for free shipping.</p>
              )}
            </dl>
            <div className="border-t border-border my-5" />
            <div className="flex justify-between font-display text-xl">
              <span>Total</span><span className="gradient-gold-text">{formatPrice(total)}</span>
            </div>
            <Link to="/checkout" className="mt-6 block text-center bg-gradient-gold text-onyx font-semibold tracking-wider text-sm py-3.5 rounded shadow-gold hover:brightness-110 transition">
              CHECKOUT (COD)
            </Link>
            <Link to="/shop" className="mt-3 block text-center text-xs tracking-wider text-muted-foreground hover:text-gold uppercase">
              ← Continue Shopping
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
