import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { formatPrice } from "@/lib/utils";

import { useState } from "react";
import { z } from "zod";
import { CheckCircle2, Banknote } from "lucide-react";
import { useCart } from "@/store/cart";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — LUXE Timepieces" },
      { name: "description", content: "Complete your order with cash on delivery." },
    ],
  }),
  component: Checkout,
});

const schema = z.object({
  name: z.string().trim().min(2, "Name required").max(100),
  phone: z.string().trim().regex(/^[0-9+\s-]{7,20}$/, "Valid phone required"),
  email: z.string().trim().email("Valid email required").max(255),
  address: z.string().trim().min(5, "Address required").max(300),
  city: z.string().trim().min(2, "City required").max(100),
  notes: z.string().trim().max(500).optional(),
});

function Checkout() {
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotal());
  const clear = useCart((s) => s.clear);
  const navigate = useNavigate();
  const [done, setDone] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const shipping = subtotal > 50000 ? 0 : 100;
  const total = subtotal + shipping;

  if (items.length === 0 && !done) {
    return (
      <div className="pt-32 pb-20 container-luxe text-center">
        <h1 className="font-display text-3xl gradient-gold-text">Cart is empty</h1>
        <Link to="/shop" className="text-gold mt-4 inline-block">← Browse Shop</Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="pt-32 pb-20 container-luxe max-w-xl text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-gold grid place-items-center text-onyx shadow-gold">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="font-display text-4xl md:text-5xl gradient-gold-text mt-8">Order Placed</h1>
        <p className="text-muted-foreground mt-4">
          Order <span className="text-gold font-mono">#{done}</span> placed successfully.
          We'll call you shortly to confirm delivery details. Payment will be collected upon delivery.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link to="/" className="px-7 py-3.5 bg-gradient-gold text-onyx font-semibold tracking-wider text-sm rounded shadow-gold">
            BACK TO HOME
          </Link>
          <Link
            to="/invoice/$id"
            params={{ id: placedOrder?.id || "" }}
            className="px-7 py-3.5 hairline tracking-wider text-sm rounded hover:bg-gold/10 transition uppercase"
          >
            View / Download Invoice
          </Link>
        </div>
      </div>
    );
  }

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries());
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      toast.error("Please fix the highlighted fields");
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const { data: userRes } = await supabase.auth.getUser();
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          user_id: userRes.user?.id ?? null,
          customer_name: parsed.data.name,
          customer_email: parsed.data.email,
          customer_phone: parsed.data.phone,
          address: parsed.data.address,
          city: parsed.data.city,
          notes: parsed.data.notes ?? null,
          subtotal,
          shipping,
          total,
          payment_method: "cod",
          payment_status: "unpaid",
          status: "pending",
        })
        .select("id, order_number")
        .single();
      if (error || !order) throw error ?? new Error("Order failed");
      const itemsPayload = items.map((it) => ({
        order_id: order.id,
        product_id: it.id,
        product_name: it.name,
        product_image: it.image,
        quantity: it.qty,
        unit_price: it.price,
      }));
      const { error: itemsErr } = await supabase.from("order_items").insert(itemsPayload);
      if (itemsErr) throw itemsErr;
      clear();
      setPlacedOrder(order);
      setDone(order.order_number);
      setTimeout(() => navigate({ to: "/" }), 30000);
    } catch (err) {
      console.error(err);
      toast.error("Could not place order. Please try again.");
      setSubmitting(false);
    }
  };

  const Field = ({ label, name, type = "text", required = true, full = false }: { label: string; name: string; type?: string; required?: boolean; full?: boolean }) => (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="text-xs tracking-wider uppercase text-gold">{label}{required && " *"}</label>
      <input
        name={name}
        type={type}
        maxLength={name === "address" ? 300 : 255}
        className={`mt-2 w-full bg-background hairline rounded px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-gold ${errors[name] ? "border-destructive" : ""}`}
      />
      {errors[name] && <p className="text-xs text-destructive mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="pt-32 pb-20">
      <div className="container-luxe">
        <h1 className="font-display text-4xl md:text-5xl gradient-gold-text mb-10">Checkout</h1>
        <form onSubmit={submit} className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <div className="hairline rounded-xl bg-card p-7">
              <h2 className="font-display text-2xl text-gold mb-5">Billing & Shipping</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Full Name" name="name" />
                <Field label="Phone" name="phone" type="tel" />
                <Field label="Email" name="email" type="email" full />
                <Field label="Address" name="address" full />
                <Field label="City" name="city" />
                <div>
                  <label className="text-xs tracking-wider uppercase text-gold">Notes</label>
                  <input name="notes" maxLength={500} className="mt-2 w-full bg-background hairline rounded px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-gold" />
                </div>
              </div>
            </div>

            <div className="hairline rounded-xl bg-card p-7">
              <h2 className="font-display text-2xl text-gold mb-5">Payment Method</h2>
              <label className="flex items-center gap-4 hairline rounded-lg p-4 cursor-pointer bg-gold/5">
                <input type="radio" name="payment" defaultChecked className="accent-[oklch(0.78_0.13_80)]" />
                <Banknote className="w-6 h-6 text-gold" />
                <div className="flex-1">
                  <p className="font-display text-lg">Cash on Delivery</p>
                  <p className="text-xs text-muted-foreground">Pay when your timepiece arrives at your door.</p>
                </div>
              </label>
            </div>
          </div>

          <aside className="hairline rounded-xl bg-card p-7 h-fit lg:sticky lg:top-28">
            <h2 className="font-display text-2xl text-gold mb-5">Order Summary</h2>
            <ul className="space-y-3 text-sm">
              {items.map((it) => (
                <li key={it.id} className="flex gap-3">
                  <div className="w-12 h-12 rounded bg-onyx overflow-hidden shrink-0">
                    <img src={it.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate">{it.name}</p>
                    <p className="text-xs text-muted-foreground">Qty {it.qty}</p>
                  </div>
                  <p className="text-sm">{formatPrice(it.price * it.qty)}</p>
                </li>
              ))}
            </ul>
            <div className="border-t border-border my-5" />
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd>{shipping === 0 ? "FREE" : formatPrice(shipping)}</dd></div>
            </dl>
            <div className="border-t border-border my-5" />
            <div className="flex justify-between font-display text-xl">
              <span>Total</span><span className="gradient-gold-text">{formatPrice(total)}</span>
            </div>
            <button type="submit" className="mt-6 w-full bg-gradient-gold text-onyx font-semibold tracking-wider text-sm py-3.5 rounded shadow-gold hover:brightness-110 transition">
              PLACE ORDER (COD)
            </button>
            <p className="text-[11px] text-muted-foreground text-center mt-3">
              By placing the order you agree to our Terms & Privacy Policy.
            </p>
          </aside>
        </form>
      </div>
    </div>
  );
}
