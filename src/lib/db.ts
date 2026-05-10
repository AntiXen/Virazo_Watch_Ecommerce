// DB types for storefront/admin
export type DbBrand = { id: string; name: string; slug: string; logo_url: string | null; description: string | null };
export type DbCategory = { id: string; name: string; slug: string; description: string | null };
export type DbProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  brand_id: string | null;
  category_id: string | null;
  description: string | null;
  price: number;
  discount_price: number | null;
  stock: number;
  low_stock_threshold: number;
  rating: number | null;
  reviews_count: number | null;
  warranty: string | null;
  specs: { label: string; value: string }[];
  images: string[];
  tags: string[];
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
};
export type DbOrder = {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  address: string;
  city: string;
  notes: string | null;
  subtotal: number;
  shipping: number;
  total: number;
  status: "pending" | "processing" | "delivered" | "cancelled";
  payment_method: string;
  payment_status: "unpaid" | "paid" | "refunded";
  created_at: string;
};
export type DbReview = { id: string; product_id: string | null; author_name: string; location: string | null; rating: number; text: string; approved: boolean; created_at: string };
export type DbBanner = { id: string; title: string; subtitle: string | null; image_url: string; link_url: string | null; cta_label: string | null; position: number; is_active: boolean };
export type DbDeal = { id: string; product_id: string | null; title: string; subtitle: string | null; starts_at: string; ends_at: string; is_active: boolean };

// Map seeded /src/assets paths to imported asset URLs at runtime
import w1 from "@/assets/watch-1.jpg";
import w2 from "@/assets/watch-2.jpg";
import w3 from "@/assets/watch-3.jpg";
import w4 from "@/assets/watch-4.jpg";
import w5 from "@/assets/watch-5.jpg";
import w6 from "@/assets/watch-6.jpg";
import w7 from "@/assets/watch-7.jpg";
import w8 from "@/assets/watch-8.jpg";

const localMap: Record<string, string> = {
  "/src/assets/watch-1.jpg": w1, "/src/assets/watch-2.jpg": w2,
  "/src/assets/watch-3.jpg": w3, "/src/assets/watch-4.jpg": w4,
  "/src/assets/watch-5.jpg": w5, "/src/assets/watch-6.jpg": w6,
  "/src/assets/watch-7.jpg": w7, "/src/assets/watch-8.jpg": w8,
};
const fallback = w1;
export function resolveImage(url?: string | null): string {
  if (!url) return fallback;
  return localMap[url] ?? url;
}
export function productImage(p: Pick<DbProduct, "images">): string {
  return resolveImage(p.images?.[0]);
}
export function effectivePrice(p: Pick<DbProduct, "price" | "discount_price">): number {
  return p.discount_price && p.discount_price > 0 ? Number(p.discount_price) : Number(p.price);
}
