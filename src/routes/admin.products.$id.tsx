import { createFileRoute, useNavigate, useParams, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { uploadImage, slugify } from "@/lib/upload";
import { toast } from "sonner";
import { 
  ArrowLeft, X, Upload, Plus, Trash2, Info, Loader2, 
  Zap, Star, Flame, Trophy, MinusCircle, RefreshCw 
} from "lucide-react";
import { resolveImage } from "@/lib/db";

export const Route = createFileRoute("/admin/products/$id")({
  component: ProductForm,
});

type Form = {
  name: string; 
  slug: string; 
  sku: string; 
  brand_id: string | null; 
  category_id: string | null;
  description: string; 
  price: number; 
  discount_price: number | null; 
  stock: number; 
  low_stock_threshold: number;
  warranty: string; 
  is_active: boolean; 
  is_featured: boolean; 
  images: string[]; 
  tags: string[];
  specs: { label: string; value: string }[];
};

const empty: Form = {
  name: "", slug: "", sku: "", brand_id: null, category_id: null,
  description: "", price: 0, discount_price: null, stock: 0, low_stock_threshold: 5,
  warranty: "", is_active: true, is_featured: false, images: [], tags: [],
  specs: [],
};

function ProductForm() {
  const { id } = useParams({ from: "/admin/products/$id" });
  const isNew = id === "new";
  const nav = useNavigate();
  const qc = useQueryClient();
  
  const [f, setF] = useState<Form>(empty);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [placement, setPlacement] = useState<string>("none");
  
  // Track if the user has manually changed the slug or SKU
  const [isSlugManual, setIsSlugManual] = useState(false);

  const { data: brands = [] } = useQuery({
    queryKey: ["brands-all"],
    queryFn: async () => (await supabase.from("brands").select("id,name").order("name")).data ?? [],
  });
  const { data: cats = [] } = useQuery({
    queryKey: ["cats-all"],
    queryFn: async () => (await supabase.from("categories").select("id,name").order("name")).data ?? [],
  });

  useEffect(() => {
    if (isNew) return;
    supabase.from("products").select("*").eq("id", id).single().then(({ data }) => {
      if (data) {
        const productTags = data.tags ?? [];
        if (productTags.includes("new")) setPlacement("new");
        else if (productTags.includes("popular")) setPlacement("popular");
        else if (productTags.includes("best-seller")) setPlacement("best-seller");
        else if (productTags.includes("featured")) setPlacement("featured");
        else setPlacement("none");

        setF({ 
          ...empty, 
          ...(data as any), 
          specs: (data.specs ?? []) as any, 
          images: data.images ?? [], 
          tags: productTags 
        } as Form);
        setIsSlugManual(true); // Don't auto-edit existing products
      }
    });
  }, [id, isNew]);

  // 1. Automatic SKU Generator
  const generateSKU = useCallback((brandId: string | null) => {
    if (!brandId) return;
    const brandName = brands.find(b => b.id === brandId)?.name || "GEN";
    const prefix = brandName.substring(0, 3).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    setF(prev => ({ ...prev, sku: `${prefix}-${random}` }));
  }, [brands]);

  // 2. Handle Name Change (Sync with Slug)
  const handleNameChange = (val: string) => {
    setF(prev => {
      const updates: Partial<Form> = { name: val };
      if (!isSlugManual) {
        updates.slug = slugify(val);
      }
      return { ...prev, ...updates };
    });
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const urls: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const url = await uploadImage(file, "products");
        if (url) urls.push(url);
      }
      setF((s) => ({ ...s, images: [...s.images, ...urls] }));
      toast.success(`${urls.length} image(s) uploaded`);
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name || !f.slug) return toast.error("Name and Slug are mandatory");
    
    setSaving(true);
    const cleanTags = f.tags.filter(t => !["new", "popular", "best-seller", "featured"].includes(t));
    const finalTags = placement !== "none" ? [...cleanTags, placement] : cleanTags;

    const payload = { 
        ...f, 
        tags: finalTags,
        is_featured: placement === "featured"
    };
    
    const { error } = isNew
      ? await supabase.from("products").insert(payload)
      : await supabase.from("products").update(payload).eq("id", id);
    
    setSaving(false);
    if (error) {
        if (error.code === '23505') {
            return toast.error("Duplicate Entry", { description: "The Slug or SKU is already in use. Please modify them." });
        }
        return toast.error(error.message);
    }
    
    toast.success(isNew ? "Product Created" : "Product Updated");
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    nav({ to: "/admin/products" });
  };

  return (
    <form onSubmit={submit} className="space-y-8 max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/products" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-gold transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-display text-4xl text-white">{isNew ? "Curate Watch" : "Edit Timepiece"}</h1>
          </div>
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="outline" className="border-white/10 text-white/60" asChild><Link to="/admin/products">Cancel</Link></Button>
          <Button type="submit" disabled={saving} className="bg-gradient-gold text-onyx font-black px-8 shadow-gold">
            {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : "SAVE PRODUCT"}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-onyx border border-white/5 rounded-[2rem] p-8 shadow-xl space-y-6">
            {/* Product Name */}
            <div className="space-y-2">
              <Label className="text-gold/70 text-[10px] uppercase tracking-widest font-black">Product Name</Label>
              <Input 
                required 
                className="bg-white/5 border-white/10 h-14 text-lg font-display focus:border-gold/50" 
                placeholder="e.g. Rolex Submariner Date" 
                value={f.name} 
                onChange={(e) => handleNameChange(e.target.value)} 
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Unique Slug */}
              <div className="space-y-2">
                <Label className="text-gold/70 text-[10px] uppercase tracking-widest font-black">URL Slug (Unique)</Label>
                <div className="relative">
                    <Input 
                        required
                        className="bg-white/5 border-white/10 font-mono text-xs pr-10" 
                        value={f.slug} 
                        onChange={(e) => {
                            setF({ ...f, slug: e.target.value });
                            setIsSlugManual(true);
                        }} 
                    />
                    {!isSlugManual && <Zap size={14} className="absolute right-3 top-3 text-gold/30 animate-pulse" />}
                </div>
              </div>

              {/* Unique SKU */}
              <div className="space-y-2">
                <Label className="text-gold/70 text-[10px] uppercase tracking-widest font-black">SKU / Serial (Unique)</Label>
                <div className="flex gap-2">
                    <Input 
                        required
                        className="bg-white/5 border-white/10 font-mono text-xs flex-1" 
                        placeholder="AUTO-GEN" 
                        value={f.sku} 
                        onChange={(e) => setF({ ...f, sku: e.target.value })} 
                    />
                    <Button 
                        type="button" 
                        variant="outline" 
                        size="icon" 
                        className="shrink-0 border-white/10 text-gold/50"
                        onClick={() => generateSKU(f.brand_id)}
                        title="Re-generate SKU"
                    >
                        <RefreshCw size={14} />
                    </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gold/70 text-[10px] uppercase tracking-widest font-black">Description</Label>
              <Textarea rows={4} className="bg-white/5 border-white/10" placeholder="Craftsmanship details..." value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
            </div>
          </div>

          {/* Placement Section */}
          <div className="bg-onyx border border-white/5 rounded-[2rem] p-8 shadow-xl">
             <Label className="text-gold/70 text-[10px] uppercase tracking-widest font-black block mb-4">Boutique Placement</Label>
             <ToggleGroup type="single" value={placement} onValueChange={(v) => v && setPlacement(v)} className="justify-start gap-3 flex-wrap">
                <ToggleGroupItem value="new" className="h-16 px-6 rounded-2xl border border-white/5 data-[state=on]:bg-gold data-[state=on]:text-onyx gap-2 flex flex-col items-center">
                    <Zap size={18}/><span className="text-[9px] font-black uppercase tracking-widest">New</span>
                </ToggleGroupItem>
                <ToggleGroupItem value="popular" className="h-16 px-6 rounded-2xl border border-white/5 data-[state=on]:bg-gold data-[state=on]:text-onyx gap-2 flex flex-col items-center">
                    <Flame size={18}/><span className="text-[9px] font-black uppercase tracking-widest">Popular</span>
                </ToggleGroupItem>
                <ToggleGroupItem value="best-seller" className="h-16 px-6 rounded-2xl border border-white/5 data-[state=on]:bg-gold data-[state=on]:text-onyx gap-2 flex flex-col items-center">
                    <Trophy size={18}/><span className="text-[9px] font-black uppercase tracking-widest">Best Seller</span>
                </ToggleGroupItem>
                <ToggleGroupItem value="featured" className="h-16 px-6 rounded-2xl border border-white/5 data-[state=on]:bg-gold data-[state=on]:text-onyx gap-2 flex flex-col items-center">
                    <Star size={18}/><span className="text-[9px] font-black uppercase tracking-widest">Featured</span>
                </ToggleGroupItem>
                <ToggleGroupItem value="none" className="h-16 px-6 rounded-2xl border border-white/5 data-[state=on]:bg-white/10 gap-2 flex flex-col items-center">
                    <MinusCircle size={18}/><span className="text-[9px] font-black uppercase tracking-widest">None</span>
                </ToggleGroupItem>
             </ToggleGroup>
          </div>

          {/* Media & Specs remain same as previous step for copy-paste convenience */}
          <div className="bg-onyx border border-white/5 rounded-[2rem] p-8 shadow-xl">
             <Label className="text-gold/70 text-[10px] uppercase tracking-widest font-black mb-6 block">Gallery</Label>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label className="aspect-square border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gold/5 transition-all">
                  <Upload className="w-6 h-6 text-white/20" />
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
                </label>
                {f.images.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group">
                    <img src={resolveImage(url)} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
                    <button type="button" onClick={() => setF({ ...f, images: f.images.filter((_, j) => j !== i) })} className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100"><X className="w-3 h-3" /></button>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Right Column: Pricing & Brand */}
        <div className="space-y-6">
          <div className="bg-onyx border border-white/5 rounded-[2rem] p-8 shadow-xl space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-gold/70 text-[10px] uppercase tracking-widest font-black">Price (৳)</Label>
                <Input type="number" className="bg-white/5 border-white/10 h-12 font-bold" value={f.price} onChange={(e) => setF({ ...f, price: Number(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-gold/70 text-[10px] uppercase tracking-widest font-black">Discount (৳)</Label>
                <Input type="number" className="bg-white/5 border-gold/20 h-12 text-gold font-bold" value={f.discount_price ?? ""} onChange={(e) => setF({ ...f, discount_price: e.target.value === "" ? null : Number(e.target.value) })} />
              </div>
            </div>
            <div className="pt-4 grid grid-cols-2 gap-4 border-t border-white/5">
                <div className="space-y-1.5"><Label className="text-gold/70 text-[10px] uppercase font-black">Stock</Label><Input type="number" className="bg-white/5 border-white/10" value={f.stock} onChange={(e) => setF({ ...f, stock: Number(e.target.value) })} /></div>
                <div className="space-y-1.5"><Label className="text-gold/70 text-[10px] uppercase font-black">Alert At</Label><Input type="number" className="bg-white/5 border-white/10" value={f.low_stock_threshold} onChange={(e) => setF({ ...f, low_stock_threshold: Number(e.target.value) })} /></div>
            </div>
          </div>

          <div className="bg-onyx border border-white/5 rounded-[2rem] p-8 shadow-xl space-y-6">
            <div className="space-y-2">
              <Label className="text-gold/70 text-[10px] uppercase tracking-widest font-black">Brand Maison</Label>
              <Select value={f.brand_id ?? ""} onValueChange={(v) => {
                  setF({ ...f, brand_id: v || null });
                  if (isNew && !f.sku) generateSKU(v); // Auto SKU on first brand selection
              }}>
                <SelectTrigger className="bg-white/5 border-white/10 h-12"><SelectValue placeholder="Brand" /></SelectTrigger>
                <SelectContent className="bg-onyx border-white/10">{brands.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-gold/70 text-[10px] uppercase tracking-widest font-black">Category</Label>
              <Select value={f.category_id ?? ""} onValueChange={(v) => setF({ ...f, category_id: v || null })}>
                <SelectTrigger className="bg-white/5 border-white/10 h-12"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent className="bg-onyx border-white/10">{cats.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-onyx border border-white/5 rounded-[2rem] p-8 shadow-xl">
            <div className="flex items-center justify-between">
              <div><Label className="text-sm font-bold text-white uppercase tracking-tighter">Live Status</Label></div>
              <Switch checked={f.is_active} onCheckedChange={(v) => setF({ ...f, is_active: v })} className="data-[state=checked]:bg-gold" />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}