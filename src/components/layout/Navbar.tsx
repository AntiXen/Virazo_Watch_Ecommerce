import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, ShoppingBag, Menu, X, Tag, Loader2 } from "lucide-react";
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

import logoImg from "@/assets/logo.png"; 
import { useBrands } from "@/lib/queries";
import { formatPrice } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { resolveImage } from "@/lib/db";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const count = useCart((s) => s.items.reduce((n, i) => n + i.qty, 0));
  const path = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();

  const { data: brands = [] } = useBrands();

  // 1. Optimized Server-Side Search Logic (Debounced)
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select("id, name, brand, price, discount_price, images, tags")
          .filter("is_active", "eq", true)
          // Search in name or brand
          .or(`name.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%`)
          .limit(6);

        if (error) throw error;
        setSearchResults(data || []);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms delay to prevent excessive DB hits

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSelectResult = (productId: string) => {
    setSearchOpen(false);
    setSearchQuery("");
    navigate({ to: `/products/${productId}` as any });
  };

  // Keyboard shortcut (Ctrl+K)
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
      {/* Glass Background Bar */}
      <div 
        className={`
          absolute inset-0 w-full h-24 md:h-32 transition-all duration-500 -z-10
          ${scrolled 
            ? "bg-black/80 backdrop-blur-2xl border-b border-gold/10 shadow-2xl" 
            : "bg-black/20 backdrop-blur-md"
          }
        `}
      />

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

      {/* Command Palette Search */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <div className="bg-onyx border border-gold/20 overflow-hidden shadow-2xl">
          <div className="relative">
            <CommandInput 
              value={searchQuery}
              onValueChange={setSearchQuery}
              placeholder="Search timepieces or brands..." 
              className="h-14 text-gold border-none focus:ring-0 placeholder:text-white/30" 
            />
            {isSearching && (
              <div className="absolute right-4 top-4">
                <Loader2 className="w-5 h-5 text-gold animate-spin" />
              </div>
            )}
          </div>
          
          <CommandList className="max-h-[380px] border-t border-white/5 bg-[#0a0a0a] no-scrollbar">
            {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
              <CommandEmpty className="py-12 text-center text-sm text-white/40">
                No timepieces found for "<span className="text-gold">{searchQuery}</span>".
              </CommandEmpty>
            )}
            
            {searchResults.length > 0 && (
              <CommandGroup heading={<span className="text-gold/50 px-2 text-[10px] uppercase tracking-widest">Available Timepieces</span>}>
                {searchResults.map((product) => (
                  <CommandItem 
                    key={product.id} 
                    onSelect={() => handleSelectResult(product.id)}
                    className="flex gap-4 p-3 items-center hover:bg-white/5 cursor-pointer text-white/80 transition-colors"
                  >
                    <img 
                      src={resolveImage(product.images?.[0])} 
                      alt={product.name} 
                      className="w-12 h-12 object-cover rounded-lg border border-white/10" 
                    />
                    <div className="flex flex-col flex-1">
                      <span className="text-[15px] font-medium text-white">{product.name}</span>
                      <span className="text-xs text-white/50 tracking-wider font-light">{product.brand}</span>
                    </div>
                    <div className="text-right">
                       <p className="text-[14px] font-bold text-gold">
                        {formatPrice(product.discount_price ?? product.price)}
                       </p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Default Brand Suggestions */}
            {!searchQuery && (
                <CommandGroup heading={<span className="text-gold/50 px-2 text-[10px] uppercase tracking-widest">Top Brands</span>}>
                  {brands.slice(0, 5).map(brand => (
                      <CommandItem 
                        key={brand.slug}
                        onSelect={() => {
                            setSearchOpen(false);
                            navigate({ to: `/shop` as any, search: { brand: brand.slug } });
                        }}
                        className="hover:bg-white/5 cursor-pointer text-white/80 p-2 pl-3 flex items-center"
                      >
                         <Tag className="w-3 h-3 mr-3 text-gold" /> 
                         <span>{brand.name}</span>
                         <span className="ml-auto text-[10px] text-white/20 uppercase">{brand.count} items</span>
                      </CommandItem>
                  ))}
                </CommandGroup>
            )}
          </CommandList>
          
          <div className="p-3 border-t border-white/5 flex justify-between items-center bg-black/40">
            <p className="text-[10px] text-white/30 uppercase tracking-tighter italic">Official Boutique Search</p>
             <span className="text-[10px] text-white/30 px-1.5 py-0.5 rounded border border-white/10">ESC to close</span>
          </div>
        </div>
      </CommandDialog>

      {/* Mobile Menu */}
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