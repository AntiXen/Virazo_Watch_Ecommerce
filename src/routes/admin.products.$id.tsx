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
import { ArrowLeft, X, Upload } from "lucide-react";
import { resolveImage } from "@/lib/db";

export const Route = createFileRoute("/admin/products/$id")({
  component: ProductForm,
});

type Form = {
  name: string; slug: string; sku: string; brand_id: string | null; category_id: string | null;
  description: string; price: number; discount_price: number | null; stock: number; low_stock_threshold: number;
  warranty: string; is_active: boolean; is_featured: boolean; images: string[]; tags: string[];
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
  const [f, setF] = useState<Form>(empty);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

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
    <form onSubmit={submit} className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link to="/admin/products" className="p-2 hover:text-gold"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="font-display text-3xl">{isNew ? "New Product" : "Edit Product"}</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-5 bg-card border border-border rounded-xl p-5">
        <div className="space-y-2 md:col-span-2"><Label>Name</Label><Input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value, slug: f.slug || slugify(e.target.value) })} /></div>
        <div className="space-y-2"><Label>Slug</Label><Input value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} /></div>
        <div className="space-y-2"><Label>SKU</Label><Input value={f.sku} onChange={(e) => setF({ ...f, sku: e.target.value })} /></div>

        <div className="space-y-2">
          <Label>Brand</Label>
          <Select value={f.brand_id ?? ""} onValueChange={(v) => setF({ ...f, brand_id: v || null })}>
            <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
            <SelectContent>{brands.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={f.category_id ?? ""} onValueChange={(v) => setF({ ...f, category_id: v || null })}>
            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>{cats.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <div className="space-y-2"><Label>Price (৳)</Label><Input type="number" step="0.01" value={f.price} onChange={(e) => setF({ ...f, price: Number(e.target.value) })} /></div>
        <div className="space-y-2"><Label>Discount price (৳)</Label><Input type="number" step="0.01" value={f.discount_price ?? ""} onChange={(e) => setF({ ...f, discount_price: e.target.value === "" ? null : Number(e.target.value) })} /></div>
        <div className="space-y-2"><Label>Stock</Label><Input type="number" value={f.stock} onChange={(e) => setF({ ...f, stock: Number(e.target.value) })} /></div>
        <div className="space-y-2"><Label>Low stock threshold</Label><Input type="number" value={f.low_stock_threshold} onChange={(e) => setF({ ...f, low_stock_threshold: Number(e.target.value) })} /></div>
        <div className="space-y-2 md:col-span-2"><Label>Warranty</Label><Input value={f.warranty} onChange={(e) => setF({ ...f, warranty: e.target.value })} /></div>
        <div className="space-y-2 md:col-span-2"><Label>Description</Label><Textarea rows={4} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>

        <div className="md:col-span-2 space-y-2">
          <Label>Tags</Label>
          <div className="flex gap-2">
            <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="best-seller, new, deal…" />
            <Button type="button" variant="outline" onClick={() => { if (tagInput.trim()) { setF({ ...f, tags: [...f.tags, tagInput.trim()] }); setTagInput(""); } }}>Add</Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {f.tags.map((t, i) => (
              <span key={i} className="text-xs bg-muted px-2 py-1 rounded flex items-center gap-1">
                {t} <button type="button" onClick={() => setF({ ...f, tags: f.tags.filter((_, j) => j !== i) })}><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label>Images</Label>
          <label className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg p-6 cursor-pointer hover:bg-muted/30">
            <Upload className="w-5 h-5" /> <span className="text-sm">{uploading ? "Uploading..." : "Click to upload images"}</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
          </label>
          <div className="flex flex-wrap gap-2 mt-2">
            {f.images.map((url, i) => (
              <div key={i} className="relative">
                <img src={resolveImage(url)} className="w-24 h-24 object-cover rounded border border-border" alt="" />
                <button type="button" onClick={() => setF({ ...f, images: f.images.filter((_, j) => j !== i) })} className="absolute -top-2 -right-2 bg-destructive rounded-full p-1"><X className="w-3 h-3" /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 space-y-3">
          <Label>Specifications</Label>
          {f.specs.map((s, i) => (
            <div key={i} className="flex gap-2">
              <Input placeholder="Label" value={s.label} onChange={(e) => { const c = [...f.specs]; c[i] = { ...c[i], label: e.target.value }; setF({ ...f, specs: c }); }} />
              <Input placeholder="Value" value={s.value} onChange={(e) => { const c = [...f.specs]; c[i] = { ...c[i], value: e.target.value }; setF({ ...f, specs: c }); }} />
              <Button type="button" variant="outline" onClick={() => setF({ ...f, specs: f.specs.filter((_, j) => j !== i) })}><X className="w-4 h-4" /></Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => setF({ ...f, specs: [...f.specs, { label: "", value: "" }] })}>+ Add spec</Button>
        </div>

        <div className="flex items-center gap-3"><Switch checked={f.is_active} onCheckedChange={(v) => setF({ ...f, is_active: v })} /><Label>Active</Label></div>
        <div className="flex items-center gap-3"><Switch checked={f.is_featured} onCheckedChange={(v) => setF({ ...f, is_featured: v })} /><Label>Featured</Label></div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving} className="bg-gradient-gold text-onyx hover:brightness-110">{saving ? "Saving…" : "Save Product"}</Button>
        <Button type="button" variant="outline" asChild><Link to="/admin/products">Cancel</Link></Button>
      </div>
    </form>
  );
}
