import { createFileRoute, useNavigate, useParams, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { uploadImage, slugify } from "@/lib/upload";
import { toast } from "sonner";
import { ArrowLeft, X, Upload, Loader2 } from "lucide-react";
import { resolveImage } from "@/lib/db";
import { AdminPage } from "@/components/ui/admin-ui";

export const Route = createFileRoute("/admin/products/$id")({ component: ProductForm });

type Form = {
  name: string; slug: string; sku: string; brand_id: string | null; category_id: string | null;
  description: string; price: number; discount_price: number | null; stock: number; low_stock_threshold: number;
  warranty: string; is_active: boolean; is_featured: boolean; images: string[]; tags: string[];
  specs: { label: string; value: string }[];
};
const empty: Form = {
  name: "", slug: "", sku: "", brand_id: null, category_id: null,
  description: "", price: 0, discount_price: null, stock: 0, low_stock_threshold: 5,
  warranty: "", is_active: true, is_featured: false, images: [], tags: [], specs: [],
};

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-gray-500 font-semibold">{label}</Label>
      {children}
    </div>
  );
}

const inputCls = "bg-black/[0.02] border-black/[0.08] focus:border-gold/40";

function ProductForm() {
  const { id } = useParams({ from: "/admin/products/$id" });
  const isNew = id === "new";
  const nav = useNavigate();
  const [f, setF] = useState<Form>(empty);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { data: brands = [] } = useQuery({ queryKey: ["brands-all"], queryFn: async () => (await supabase.from("brands").select("id,name").order("name")).data ?? [] });
  const { data: cats = [] } = useQuery({ queryKey: ["cats-all"], queryFn: async () => (await supabase.from("categories").select("id,name").order("name")).data ?? [] });

  useEffect(() => {
    if (isNew) return;
    supabase.from("products").select("*").eq("id", id).single().then(({ data }) => {
      if (data) setF({ ...empty, ...(data as any), specs: (data.specs ?? []) as any, images: data.images ?? [], tags: data.tags ?? [] } as Form);
    });
  }, [id, isNew]);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    setUploading(true);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const url = await uploadImage(file, "products");
      if (url) urls.push(url);
    }
    setF((s) => ({ ...s, images: [...s.images, ...urls] }));
    setUploading(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...f, slug: f.slug || slugify(f.name) };
    const { error } = isNew
      ? await supabase.from("products").insert(payload)
      : await supabase.from("products").update(payload).eq("id", id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(isNew ? "Product created" : "Product updated");
    nav({ to: "/admin/products" });
  };

  return (
    <AdminPage>
      <form onSubmit={submit} className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link to="/admin/products" className="w-9 h-9 rounded-xl border border-black/[0.08] flex items-center justify-center text-gray-400 hover:text-gold hover:border-gold/30 transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <h1 className="font-display text-3xl text-gray-900">{isNew ? "New Product" : "Edit Product"}</h1>
        </div>

        {/* Main fields */}
        <div className="bg-white border border-black/[0.07] rounded-2xl shadow-sm p-6 grid md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <F label="Product Name *">
              <Input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value, slug: f.slug || slugify(e.target.value) })} className={inputCls} />
            </F>
          </div>
          <F label="Slug"><Input value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} className={inputCls} /></F>
          <F label="SKU"><Input value={f.sku} onChange={(e) => setF({ ...f, sku: e.target.value })} className={inputCls} /></F>

          <F label="Brand">
            <Select value={f.brand_id ?? ""} onValueChange={(v) => setF({ ...f, brand_id: v || null })}>
              <SelectTrigger className={inputCls}><SelectValue placeholder="Select brand" /></SelectTrigger>
              <SelectContent>{(brands as any[]).map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
            </Select>
          </F>
          <F label="Category">
            <Select value={f.category_id ?? ""} onValueChange={(v) => setF({ ...f, category_id: v || null })}>
              <SelectTrigger className={inputCls}><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>{(cats as any[]).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </F>

          <F label="Price (৳) *"><Input type="number" step="0.01" value={f.price} onChange={(e) => setF({ ...f, price: Number(e.target.value) })} className={inputCls} /></F>
          <F label="Discount Price (৳)"><Input type="number" step="0.01" value={f.discount_price ?? ""} onChange={(e) => setF({ ...f, discount_price: e.target.value === "" ? null : Number(e.target.value) })} className={inputCls} placeholder="Leave blank for none" /></F>
          <F label="Stock"><Input type="number" value={f.stock} onChange={(e) => setF({ ...f, stock: Number(e.target.value) })} className={inputCls} /></F>
          <F label="Low Stock Alert Threshold"><Input type="number" value={f.low_stock_threshold} onChange={(e) => setF({ ...f, low_stock_threshold: Number(e.target.value) })} className={inputCls} /></F>
          <div className="md:col-span-2"><F label="Warranty"><Input value={f.warranty} onChange={(e) => setF({ ...f, warranty: e.target.value })} className={inputCls} placeholder="e.g. 6-month service warranty" /></F></div>
          <div className="md:col-span-2"><F label="Description"><Textarea rows={4} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} className={inputCls} /></F></div>

          {/* Tags */}
          <div className="md:col-span-2 space-y-2">
            <Label className="text-xs text-gray-500 font-semibold">Tags</Label>
            <div className="flex gap-2">
              <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (tagInput.trim()) { setF({ ...f, tags: [...f.tags, tagInput.trim()] }); setTagInput(""); } } }}
                placeholder="new, best-seller, deal…" className={inputCls} />
              <Button type="button" variant="outline" className="border-black/[0.08] shrink-0"
                onClick={() => { if (tagInput.trim()) { setF({ ...f, tags: [...f.tags, tagInput.trim()] }); setTagInput(""); } }}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {f.tags.map((t, i) => (
                <span key={i} className="text-[11px] bg-gold/10 text-gold px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                  {t}
                  <button type="button" onClick={() => setF({ ...f, tags: f.tags.filter((_, j) => j !== i)})}>
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="md:col-span-2 space-y-3">
            <Label className="text-xs text-gray-500 font-semibold">Images</Label>
            <label className={`flex items-center justify-center gap-3 border-2 border-dashed rounded-xl p-8 cursor-pointer transition-colors
              ${uploading ? "border-gold/40 bg-gold/5" : "border-black/[0.08] hover:border-gold/30 hover:bg-black/[0.01]"}`}>
              {uploading ? <Loader2 size={18} className="text-gold animate-spin" /> : <Upload size={18} className="text-gray-400" />}
              <span className="text-sm text-gray-400">{uploading ? "Uploading…" : "Click to upload product images"}</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
            </label>
            {f.images.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {f.images.map((url, i) => (
                  <div key={i} className="relative group">
                    <img src={resolveImage(url)} className="w-24 h-24 object-cover rounded-xl border border-black/[0.07]" alt="" />
                    <button type="button"
                      onClick={() => setF({ ...f, images: f.images.filter((_, j) => j !== i) })}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                      <X size={10} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Specs */}
          <div className="md:col-span-2 space-y-3">
            <Label className="text-xs text-gray-500 font-semibold">Specifications</Label>
            <div className="space-y-2">
              {f.specs.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <Input placeholder="Label e.g. Case Size" value={s.label} onChange={(e) => { const c = [...f.specs]; c[i] = { ...c[i], label: e.target.value }; setF({ ...f, specs: c }); }} className={`${inputCls} flex-1`} />
                  <Input placeholder="Value e.g. 42mm" value={s.value} onChange={(e) => { const c = [...f.specs]; c[i] = { ...c[i], value: e.target.value }; setF({ ...f, specs: c }); }} className={`${inputCls} flex-1`} />
                  <button type="button" onClick={() => setF({ ...f, specs: f.specs.filter((_, j) => j !== i) })} className="w-9 h-9 rounded-xl border border-black/[0.08] flex items-center justify-center text-gray-300 hover:text-red-400 hover:border-red-200 hover:bg-red-50 transition-colors shrink-0">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setF({ ...f, specs: [...f.specs, { label: "", value: "" }] })} className="text-xs text-gold hover:underline font-semibold">+ Add specification</button>
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-3 p-4 bg-black/[0.02] rounded-xl border border-black/[0.05]">
            <Switch checked={f.is_active} onCheckedChange={(v) => setF({ ...f, is_active: v })} />
            <div>
              <p className="text-sm font-semibold text-gray-800">Active</p>
              <p className="text-[10px] text-gray-400">Visible on the storefront</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-black/[0.02] rounded-xl border border-black/[0.05]">
            <Switch checked={f.is_featured} onCheckedChange={(v) => setF({ ...f, is_featured: v })} />
            <div>
              <p className="text-sm font-semibold text-gray-800">Featured</p>
              <p className="text-[10px] text-gray-400">Show in featured sections</p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <Button type="submit" disabled={saving} className="h-11 px-8 bg-gradient-gold text-onyx font-bold hover:brightness-105">
            {saving ? <><Loader2 size={15} className="animate-spin mr-2" />Saving…</> : isNew ? "Create Product" : "Save Changes"}
          </Button>
          <Button type="button" variant="outline" className="h-11 border-black/[0.08]" asChild>
            <Link to="/admin/products">Cancel</Link>
          </Button>
        </div>
      </form>
    </AdminPage>
  );
}