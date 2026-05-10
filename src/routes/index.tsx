import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/sections/Hero";
import { Intro } from "@/components/sections/Intro";
import { BrandsStrip } from "@/components/sections/BrandsStrip";
import { ProductGrid } from "@/components/sections/ProductGrid";
import { DealOfMonth } from "@/components/sections/DealOfMonth";
import { Reviews } from "@/components/sections/Reviews";
import { StoreLocation } from "@/components/sections/StoreLocation";
import { useProducts } from "@/lib/queries";

export const Route = createFileRoute("/")(
  {
  component: Index,
});

function Index() {
  const { data: products = [], isLoading } = useProducts();

  // ডাটা ফিল্টারিং
  const newArrivals = products.filter((p) => p.tags.includes("new")).slice(0, 4);
  const popular = products.filter((p) => p.tags.includes("popular")).slice(0, 4);
  const bestSellers = products.filter((p) => p.tags.includes("best-seller")).slice(0, 4);
  
  const featured = products.filter((p) => p.tags.includes("featured")).length > 0 
    ? products.filter((p) => p.tags.includes("featured")).slice(0, 4)
    : products.slice(4, 8); 

  return (
    <>
      <Hero />
      <Intro />
      <BrandsStrip />

      {/* ১. New Arrivals - এখন সবার আগে */}
      <ProductGrid
        eyebrow="Just Landed"
        title="New Arrivals"
        description="The latest additions to our curated atelier."
        products={newArrivals}
        cta={{ label: "See All New", href: "/new-arrivals" }}
      />

      {/* ২. Most Popular - দ্বিতীয় স্থানে */}
      <ProductGrid
        eyebrow="Trending Now"
        title="Most Popular"
        products={popular}
        cta={{ label: "Shop Popular", href: "/shop" }}
      />

      {/* ৩. Best Sellers - তৃতীয় স্থানে */}
      <ProductGrid
        eyebrow="Most Coveted"
        title="Best Sellers"
        description="The pieces our collectors return for, again and again."
        products={bestSellers}
        cta={{ label: "View All", href: "/shop" }}
      />

      <DealOfMonth />

      {/* ৪. Featured - সব শেষে */}
      <ProductGrid
        eyebrow="Selected for You"
        title="Featured"
        description="Handpicked timepieces showcasing exquisite craftsmanship."
        products={featured}
        cta={{ label: "Explore More", href: "/shop" }}
      />

      <Reviews />
      <StoreLocation />
    </>
  );
}