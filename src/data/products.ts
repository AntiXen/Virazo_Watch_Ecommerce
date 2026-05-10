import w1 from "@/assets/watch-1.jpg";
import w2 from "@/assets/watch-2.jpg";
import w3 from "@/assets/watch-3.jpg";
import w4 from "@/assets/watch-4.jpg";
import w5 from "@/assets/watch-5.jpg";
import w6 from "@/assets/watch-6.jpg";
import w7 from "@/assets/watch-7.jpg";
import w8 from "@/assets/watch-8.jpg";

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
  tags: ("best-seller" | "popular" | "new" | "deal")[];
};

export const brands = [
  { name: "Rolex", slug: "rolex", count: 12 },
  { name: "Casio", slug: "casio", count: 28 },
  { name: "Fossil", slug: "fossil", count: 18 },
  { name: "Citizen", slug: "citizen", count: 22 },
  { name: "Seiko", slug: "seiko", count: 19 },
  { name: "Curren", slug: "curren", count: 14 },
  { name: "Naviforce", slug: "naviforce", count: 16 },
  { name: "Tissot", slug: "tissot", count: 9 },
  { name: "G-Shock", slug: "g-shock", count: 24 },
];

const baseSpecs = (movement: string, water: string, size: string) => [
  { label: "Movement", value: movement },
  { label: "Case Size", value: size },
  { label: "Water Resistance", value: water },
  { label: "Case Material", value: "Stainless Steel" },
  { label: "Crystal", value: "Sapphire" },
];

export const products: Product[] = [
  {
    id: "skeleton-gold-01",
    name: "Heritage Skeleton Automatic",
    brand: "Rolex",
    price: 1299,
    oldPrice: 1599,
    rating: 4.9,
    reviews: 128,
    image: w1,
    images: [w1, w2, w3],
    description:
      "An exposed skeleton dial framed in 18k gold-tone steel. Self-winding mechanical movement visible through the front and back, finished by hand.",
    specs: baseSpecs("Automatic Self-winding", "100m", "42mm"),
    warranty: "2 Years International",
    inStock: true,
    tags: ["best-seller", "deal"],
  },
  {
    id: "chrono-noir-02",
    name: "Chronograph Noir Edition",
    brand: "Tissot",
    price: 549,
    rating: 4.7,
    reviews: 86,
    image: w2,
    images: [w2, w1, w5],
    description:
      "Precision chronograph with three counters and matte black dial. A statement piece for the modern gentleman.",
    specs: baseSpecs("Quartz Chronograph", "50m", "41mm"),
    warranty: "1 Year International",
    inStock: true,
    tags: ["best-seller", "popular"],
  },
  {
    id: "rosegold-leather-03",
    name: "Mercer Rose Gold Dress",
    brand: "Fossil",
    price: 229,
    oldPrice: 289,
    rating: 4.6,
    reviews: 204,
    image: w3,
    images: [w3, w8, w6],
    description:
      "Slim profile dress watch with rose gold case and full-grain Italian leather strap. Made for boardrooms and black-tie evenings.",
    specs: baseSpecs("Quartz", "30m", "40mm"),
    warranty: "2 Years",
    inStock: true,
    tags: ["best-seller", "new"],
  },
  {
    id: "shock-tactical-04",
    name: "G-Shock Tactical GA-2100",
    brand: "G-Shock",
    price: 159,
    rating: 4.8,
    reviews: 512,
    image: w4,
    images: [w4, w7],
    description:
      "Carbon core guard structure with shock and mud resistance. Built for explorers, engineered for life.",
    specs: baseSpecs("Tough Solar Quartz", "200m", "45mm"),
    warranty: "2 Years",
    inStock: true,
    tags: ["popular", "best-seller"],
  },
  {
    id: "diver-azure-05",
    name: "Azure Diver Professional",
    brand: "Seiko",
    price: 689,
    oldPrice: 799,
    rating: 4.9,
    reviews: 167,
    image: w5,
    images: [w5, w2],
    description:
      "Professional 300m diver with unidirectional ceramic bezel and signature deep-sea blue sunburst dial.",
    specs: baseSpecs("Automatic", "300m", "44mm"),
    warranty: "3 Years",
    inStock: true,
    tags: ["new", "deal"],
  },
  {
    id: "heritage-roman-06",
    name: "Heritage Roman Classic",
    brand: "Citizen",
    price: 349,
    rating: 4.5,
    reviews: 92,
    image: w6,
    images: [w6, w3],
    description:
      "Pure white enamel dial with hand-painted Roman numerals, set in a polished gold-tone case. Timeless.",
    specs: baseSpecs("Eco-Drive", "50m", "39mm"),
    warranty: "5 Years",
    inStock: true,
    tags: ["popular"],
  },
  {
    id: "stealth-green-07",
    name: "Stealth Lume Field",
    brand: "Naviforce",
    price: 119,
    rating: 4.4,
    reviews: 318,
    image: w7,
    images: [w7, w4],
    description:
      "Matte black tactical chronograph with high-visibility green luminous markers. Built for the field.",
    specs: baseSpecs("Quartz Chronograph", "100m", "44mm"),
    warranty: "1 Year",
    inStock: true,
    tags: ["new"],
  },
  {
    id: "minimalist-rose-08",
    name: "Minimalist Rose 36",
    brand: "Curren",
    price: 99,
    oldPrice: 139,
    rating: 4.3,
    reviews: 421,
    image: w8,
    images: [w8, w3],
    description:
      "A study in restraint. Slim 36mm rose gold case, white dial, calf leather strap. Wear with everything.",
    specs: baseSpecs("Quartz", "30m", "36mm"),
    warranty: "1 Year",
    inStock: true,
    tags: ["new", "popular"],
  },
];

export const reviews = [
  {
    name: "Arman H.",
    location: "Dhaka",
    rating: 5,
    text: "Packaging felt like opening a Rolex box. The Heritage Skeleton is a stunner — exactly as pictured.",
  },
  {
    name: "Sara K.",
    location: "Chittagong",
    rating: 5,
    text: "Bought the Mercer Rose Gold for my husband. Premium feel, fast delivery, COD made it effortless.",
  },
  {
    name: "Rafiq M.",
    location: "Sylhet",
    rating: 4,
    text: "Authentic G-Shock at the best price I found. Customer support replied within minutes.",
  },
  {
    name: "Nadia T.",
    location: "Khulna",
    rating: 5,
    text: "The Azure Diver wears beautifully. You can feel the weight and quality the moment you unbox it.",
  },
];
