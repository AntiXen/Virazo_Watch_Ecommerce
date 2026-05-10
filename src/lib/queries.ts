// Centralized React-Query hooks for the storefront.
// Every public-facing page pulls data through these hooks
// so the admin panel controls everything end-to-end.

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { DbProduct, DbBrand, DbReview, DbBanner, DbDeal } from "@/lib/db";
import { resolveImage, effectivePrice } from "@/lib/db";

// ── Product type the storefront UI components expect ───────────────────
export type Product = {
  id: string;
  name: string;
  brand: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  images: string[];
  description: string;
  specs: { label: string; value: string }[];
  warranty: string;
  inStock: boolean;
  tags: string[];
};

// ── Brand type for UI ──────────────────────────────────────────────────
export type Brand = {
  name: string;
  slug: string;
  count: number;
};

// ── Mappers ────────────────────────────────────────────────────────────
function mapProduct(p: DbProduct, brandName: string): Product {
  return {
    id: p.id,
    name: p.name,
    brand: brandName,
    price: effectivePrice(p),
    oldPrice: p.discount_price && p.discount_price > 0 && p.discount_price < p.price
      ? Number(p.price)
      : undefined,
    rating: Number(p.rating ?? 0),
    reviews: Number(p.reviews_count ?? 0),
    image: resolveImage(p.images?.[0]),
    images: (p.images ?? []).map((img) => resolveImage(img)),
    description: p.description ?? "",
    specs: (p.specs ?? []) as { label: string; value: string }[],
    warranty: p.warranty ?? "",
    inStock: p.stock > 0,
    tags: p.tags ?? [],
  };
}

// ── Hooks ──────────────────────────────────────────────────────────────

/** All active products (with brand name resolved). */
export function useProducts() {
  return useQuery<Product[]>({
    queryKey: ["storefront-products"],
    queryFn: async () => {
      const [pRes, bRes] = await Promise.all([
        supabase
          .from("products")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false }),
        supabase.from("brands").select("id,name"),
      ]);
      const brands: Record<string, string> = {};
      (bRes.data ?? []).forEach((b: any) => { brands[b.id] = b.name; });
      return ((pRes.data ?? []) as unknown as DbProduct[]).map((p) =>
        mapProduct(p, brands[p.brand_id ?? ""] ?? "Unknown")
      );
    },
    staleTime: 60_000,
  });
}

/** Single product by ID (UUID). */
export function useProduct(id: string) {
  return useQuery<Product | null>({
    queryKey: ["storefront-product", id],
    queryFn: async () => {
      const { data: p } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (!p) return null;
      let brandName = "Unknown";
      if ((p as any).brand_id) {
        const { data: b } = await supabase
          .from("brands")
          .select("name")
          .eq("id", (p as any).brand_id)
          .maybeSingle();
        if (b) brandName = b.name;
      }
      return mapProduct(p as unknown as DbProduct, brandName);
    },
    staleTime: 60_000,
  });
}

/** All brands with product counts. */
export function useBrands() {
  return useQuery<Brand[]>({
    queryKey: ["storefront-brands"],
    queryFn: async () => {
      const { data: brands } = await supabase
        .from("brands")
        .select("id,name,slug")
        .order("name");
      if (!brands) return [];
      const { data: products } = await supabase
        .from("products")
        .select("brand_id")
        .eq("is_active", true);
      const counts: Record<string, number> = {};
      (products ?? []).forEach((p: any) => {
        counts[p.brand_id] = (counts[p.brand_id] ?? 0) + 1;
      });
      return brands.map((b: any) => ({
        name: b.name,
        slug: b.slug,
        count: counts[b.id] ?? 0,
      }));
    },
    staleTime: 60_000,
  });
}

/** Approved reviews. */
export function useReviews() {
  return useQuery<DbReview[]>({
    queryKey: ["storefront-reviews"],
    queryFn: async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("approved", true)
        .order("created_at", { ascending: false })
        .limit(8);
      return (data ?? []) as unknown as DbReview[];
    },
    staleTime: 60_000,
  });
}

/** Active banners. */
export function useBanners() {
  return useQuery<DbBanner[]>({
    queryKey: ["storefront-banners"],
    queryFn: async () => {
      const { data } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .order("position");
      return (data ?? []) as unknown as DbBanner[];
    },
    staleTime: 60_000,
  });
}

/** Active deals with product info. */
export function useDeals() {
  return useQuery<(DbDeal & { product: Product | null })[]>({
    queryKey: ["storefront-deals"],
    queryFn: async () => {
      const { data: deals } = await supabase
        .from("deals")
        .select("*")
        .eq("is_active", true)
        .order("starts_at", { ascending: false });
      if (!deals || deals.length === 0) return [];

      const productIds = (deals as any[]).map((d) => d.product_id).filter(Boolean);
      const { data: prods } = await supabase
        .from("products")
        .select("*")
        .in("id", productIds);
      const { data: brands } = await supabase.from("brands").select("id,name");

      const brandMap: Record<string, string> = {};
      (brands ?? []).forEach((b: any) => { brandMap[b.id] = b.name; });

      const prodMap: Record<string, Product> = {};
      ((prods ?? []) as unknown as DbProduct[]).forEach((p) => {
        prodMap[p.id] = mapProduct(p, brandMap[p.brand_id ?? ""] ?? "Unknown");
      });

      return (deals as unknown as DbDeal[]).map((d) => ({
        ...d,
        product: prodMap[d.product_id ?? ""] ?? null,
      }));
    },
    staleTime: 60_000,
  });
}
