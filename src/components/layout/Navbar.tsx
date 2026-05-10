import { Link, useRouterState, useNavigate } from "@tanstack/react-router"; // useNavigate যোগ করা হয়েছে
import { useEffect, useState, useMemo } from "react"; // useMemo যোগ করা হয়েছে
import { Search, ShoppingBag, Menu, X, Tag } from "lucide-react"; // Tag আইকন যোগ করা হয়েছে
import { useCart } from "@/store/cart";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CommandDialog, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from "@/components/ui/command";

// লোগো এবং প্রোডাক্ট ডাটা ইম্পোর্ট
import logoImg from "@/assets/logo.png"; 
import { useProducts, useBrands } from "@/lib/queries";
import { formatPrice } from "@/lib/utils";


const links = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/brands", label: "Brands" },
  { to: "/new-arrivals", label: "New Arrivals" },
  { to: "/deals", label: "Deals" },
  { to: "/contact", label: "Contact" },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // সার্চ কুয়েরি স্টেট
  
  const count = useCart((s) => s.items.reduce((n, i) => n + i.qty, 0));
  const path = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate(); // নেভিগেশনের জন্য

  const { data: products = [] } = useProducts();
  const { data: brands = [] } = useBrands();

  // ১. সার্চ লজিক: useMemo ব্যবহার করে পারফরম্যান্স অপ্টিমাইজ করা হয়েছে
  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase().trim();

    return products.filter((product) => {
      return (
        product.name.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.tags.some((tag) => tag.toLowerCase().includes(query)) // ট্যাগ দিয়েও সার্চ করা যাবে
      );
    }).slice(0, 10); // সর্বোচ্চ ১০টি রেজাল্ট দেখাবে
  }, [searchQuery, products]);

  // রেজাল্টে ক্লিক করলে ডিটেইলস পেজে যাওয়ার ফাংশন
  const handleSelectResult = (productId: string) => {
    setSearchOpen(false); // সার্চ বক্স বন্ধ হবে
    setSearchQuery(""); // কুয়েরি ক্লিয়ার হবে
    navigate({ to: `/products/${productId}` as any }); // ডিটেইলস পেজে যাবে
  };

  // কিবোর্ড শর্টকাট (Ctrl+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full z-[100]">
      {/* গ্লাস ব্যাকগ্রাউন্ড বার */}
      <div 
        className={`
          absolute inset-0 w-full h-24 md:h-32 transition-all duration-500 -z-10
          ${scrolled 
            ? "bg-black/80 backdrop-blur-2xl border-b border-gold/10 shadow-2xl" 
            : "bg-black/20 backdrop-blur-md"
          }
        `}
      />

      {/* ন্যাভবার কন্টেন্ট */}
      <div className="container-luxe h-24 md:h-32 flex items-center justify-between relative px-6 md:px-10">
        <div className="flex-shrink-0">
          <Link to="/">
            <img 
              src={logoImg} 
              alt="Virazo" 
              className="h-16 md:h-24 w-auto object-contain transition-transform hover:scale-105" 
            />
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-6 px-6 py-2.5 rounded-full border border-gold/30 bg-black/40 backdrop-blur-sm shadow-lg"
        >
          <nav className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="px-4 py-1.5 text-[11px] font-bold tracking-[0.2em] uppercase transition-all relative group"
                activeProps={{ className: "text-gold" }}
                inactiveProps={{ className: "text-white/70 hover:text-white" }}
              >
                <span className="relative z-10">{l.label}</span>
                {path === l.to && (
                  <motion.div 
                    layoutId="nav-pill-active"
                    className="absolute inset-0 bg-white/5 rounded-full"
                    transition={{ type: "spring", duration: 0.6 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4 pl-2 border-l border-white/10 ml-2">
            <button 
              onClick={() => setSearchOpen(true)}
              className="text-white/70 hover:text-gold transition-colors p-1"
            >
              <Search className="w-4 h-4" />
            </button>
            
            <Link to="/cart" className="relative text-white/70 hover:text-gold transition-colors p-1">
              <ShoppingBag className="w-4 h-4" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold text-onyx text-[8px] font-black rounded-full w-3.5 h-3.5 flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>

            <button
              className="lg:hidden text-white"
              onClick={() => setOpen(!open)}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </motion.div>

        <div className="hidden lg:block w-24" /> 
      </div>

      {/* ২. কমান্ড প্যালেট সেকশন - এখন ফুলি ফাংশনাল */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <div className="bg-onyx border border-gold/20 overflow-hidden shadow-2xl">
          <CommandInput 
            value={searchQuery}
            onValueChange={setSearchQuery} // টাইপ করা টেক্সট এখানে স্টোর হবে
            placeholder="Search luxury timepieces, brands or tags..." 
            className="h-14 text-gold border-none focus:ring-0 placeholder:text-white/30" 
          />
          
          <CommandList className="max-h-[350px] border-t border-white/5 bg-[#0a0a0a]">
            {searchQuery.trim() && (
              <CommandEmpty className="py-12 text-center text-sm text-white/40">
                No timepieces found for "<span className="text-gold">{searchQuery}</span>".
              </CommandEmpty>
            )}
            
            {/* ৩. সার্চ রেজাল্ট ম্যাপিং (ঘড়ির ছবিসহ) */}
            {filteredResults.length > 0 && (
              <CommandGroup heading={<span className="text-gold/50 px-2 text-[10px] uppercase tracking-widest">Matched Timepieces</span>}>
                {filteredResults.map((product) => (
                  <CommandItem 
                    key={product.id} 
                    onSelect={() => handleSelectResult(product.id)} // সিলেক্ট করলে ডিটেইলস পেজে যাবে
                    className="flex gap-4 p-3 items-center hover:bg-white/5 cursor-pointer text-white/80 transition-colors"
                  >
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-12 h-12 object-cover rounded-lg border border-white/10" 
                    />
                    <div className="flex flex-col flex-1">
                      <span className="text-[15px] font-medium text-white">{product.name}</span>
                      <span className="text-xs text-white/50 tracking-wider font-light">{product.brand}</span>
                    </div>
                    <div className="text-right">
                       <p className="text-[14px] font-bold text-gold">{formatPrice(product.price)}</p>
                       {product.oldPrice && <p className="text-[10px] text-white/40 line-through">{formatPrice(product.oldPrice)}</p>}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* ৪. প্রি-সেট ব্র্যান্ড সাজেশন (ডাটাবেস থেকে) */}
            {!searchQuery.trim() && (
                <CommandGroup heading={<span className="text-gold/50 px-2 text-[10px] uppercase tracking-widest">Top Brands</span>}>
                  {brands.slice(0, 5).map(brand => (
                      <CommandItem 
                        key={brand.slug}
                        onSelect={() => {
                            setSearchOpen(false);
                            navigate({ to: `/brands` as any, search: { brand: brand.slug } }); // ব্র্যান্ড পেজে নিয়ে যাবে
                        }}
                        className="hover:bg-white/5 cursor-pointer text-white/80 p-2 pl-3"
                      >
                         <Tag className="w-3 h-3 mr-3 text-gold" /> {brand.name} ({brand.count} watches)
                      </CommandItem>
                  ))}
                </CommandGroup>
            )}
          </CommandList>
          
          <div className="p-3 border-t border-white/5 flex justify-between items-center bg-black/40">
            <p className="text-[10px] text-white/30 uppercase tracking-tighter">Search by Virazo Watch • {products.length} Items</p>
             <span className="text-[10px] text-white/30 px-1.5 py-0.5 rounded border border-white/10">ESC to close</span>
          </div>
        </div>
      </CommandDialog>

      {/* মোবাইল মেনু */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-black/95 backdrop-blur-3xl border-b border-gold/20 overflow-hidden lg:hidden"
          >
            <nav className="flex flex-col items-center py-10 gap-6">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="text-sm font-bold uppercase tracking-[0.3em] text-white/60 hover:text-gold"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}