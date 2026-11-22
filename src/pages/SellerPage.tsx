import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Plus,
  Upload,
  Tag,
  DollarSign,
  Layers,
  FileText,
  CheckCircle,
  Store,
  X,
  AlertCircle,
  Edit,
  Trash2,
} from "lucide-react";
import { categories } from "@/lib/mock-data";
import { addProductApi, getProductsApi } from "@/api/productApi";

interface ProductForm {
  productName: string;
  brand: string;
  productPrice: string;
  originalPrice: string;
  category: string;
  cat_id: number;
  description: string;
  seller: string;
  badge: string;
  productStock: boolean;
  freeDelivery: boolean;
  colors: string;
  sizes: string;
  sku: string;
  productStatus:string;
  productRating: string;
  specValue: string;
  specifications: Record<string, string>;
  imageUrl: string;
  productImage: File | null;
  imagePreview: string;
}

const initialForm: ProductForm = {
  productName: "",
  brand: "",
  productPrice: "",
  originalPrice: "",
  category: "",
  cat_id: 0,
  description: "",
  seller: "",
  badge: "",
  productStock: true,
  productStatus:"",
  productRating:"",
  freeDelivery: false,
  colors: "",
  sizes: "",
  sku: "",
  specValue: "",
  specifications: {},
  imageUrl: "",
  productImage: null,
  imagePreview: "",
};

export function SellerPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<ProductForm>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"basic" | "details" | "specs">("basic");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [viewMode, setViewMode] = useState<"form" | "list">("form");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (viewMode === "list") {
      fetchProducts();
    }
  }, [viewMode]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getProductsApi();
      const apiProducts = res?.data?.items || res?.data || (Array.isArray(res) ? res : []);
      setProducts(apiProducts);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: any) => {
    console.log("Edit product", product);
    window.alert("Modify product functionality coming soon!");
  };

  const handleDelete = (productId: any) => {
    console.log("Delete product", productId);
    window.alert("Delete product functionality coming soon!");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const preview = ev.target?.result as string;
      setForm((f) => ({ ...f, productImage: file, imagePreview: preview, imageUrl: "" }));
    };
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setForm((f) => ({ ...f, imageUrl: url, productImage: null, imagePreview: url }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const clearImage = () => {
    setForm((f) => ({ ...f, imageUrl: "", productImage  : null, imagePreview: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const set = (field: keyof ProductForm, value: any) =>
    setForm((f) => ({ ...f, [field]: value }));

  // const addProduct = async () => {

  //   const result = await addProductApi(form);
  //   console.log("Add Product API result:", result);
  
  //   // Here you would typically send `form` data to your backend API to create the product
  //   // For this example, we'll just simulate a successful submission after a short delay
  //   // await new Promise((res) => setTimeout(res, 1000));
  //   setSubmitted(true);
  //   addProduct();

  // }


  const reset = () => {
    setForm(initialForm);
    setError("");
    setActiveTab("basic");
  };
  

  const addSpec = () => {
    if (!form.sku.trim()) return;
    setForm((f) => ({
      ...f,
      specifications: { ...f.specifications, [f.sku.trim()]: f.specValue.trim() },
      sku: "",
      specValue: "",
    }));
  };

  const removeSpec = (key: string) => {
    setForm((f) => {
      const specs = { ...f.specifications };
      delete specs[key];
      return { ...f, specifications: specs };
    });
  };

  const validate = () => {
    if (!form.productName.trim()) return "Product name is required.";
    if (!form.brand.trim()) return "Brand name is required.";
    if (!form.productPrice || isNaN(Number(form.productPrice)) || Number(form.productPrice) <= 0)
      return "Enter a valid selling price.";
    if (!form.originalPrice || isNaN(Number(form.originalPrice)) || Number(form.originalPrice) <= 0)
      return "Enter a valid original price.";
    if (!form.category) return "Please select a category.";
    if (!form.description.trim()) return "Product description is required.";
    if (!form.seller.trim()) return "Seller / shop name is required.";
    return "";
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   const err = validate();
  //   if (err) { setError(err); return; }
  //   setError("");

  //   const price = Number(form.productPrice);
  //   const original = Number(form.originalPrice);
  //   const discount = Math.round(((original - price) / original) * 100);
  //   const cat = categories.find((c) => c.id === form.category);

  //   const newProduct = {
  //     id: `custom-${Date.now()}`,
  //     cat_id: cat?.id,
  //     productName: form.productName.trim(),
  //     brand: form.brand.trim(),
  //     productPrice: price,
  //     productUnit: 1,
  //     originalPrice: original,
  //     discount: Math.max(0, discount),
  //     productRating: 4.6,
  //     reviewCount: 0,
  //     productImage: form.imagePreview || `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop&auto=format&q=80`,
  //    // images: [form.imagePreview || `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop&auto=format&q=80`],
  //     category: form.category,
  //     badge: form.badge.trim() || undefined,
  //     sku : form.sku || "defausku234",
  //     productStock: form.productStock,
  //     productStatus :"available",
  //     freeDelivery: form.freeDelivery,
  //     description: form.description.trim(),
  //     specifications: form.specifications,
  //     seller: form.seller.trim(),
  //     colors: form.colors ? form.colors.split(",").map((c) => c.trim()).filter(Boolean) : undefined,
  //     sizes: form.sizes ? form.sizes.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
  //   };

  //   // Persist to localStorage so ProductsPage can pick it up
  //   //const existing = JSON.parse(localStorage.getItem("sellerProducts") || "[]");
  //   // localStorage.setItem("sellerProducts", JSON.stringify([...existing, newProduct]));
    
   
  //   const result = await addProductApi(newProduct);

  //   if (result.status == "success"){
  //     window.alert(" New Product Listed Successfully")
  //   }
  //   else{
  //     window.alert("faled to list new product")
  //   }
    
  //  console.log("Add Product API result:", result);
  //   setSubmitted(true);
  // };


  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const err = validate();

  if (err) {
    setError(err);
    return;
  }

  // Require an uploaded image
  if (!form.productImage) {
    setError("Please select a product image from your computer.");
    return;
  }

  setError("");

  const cat = categories.find(
    (c) => Number(c.id) === Number(form.category)
  );

  const formData = new FormData();

  // Product information
  formData.append("productName", form.productName.trim());
  formData.append("productPrice", form.productPrice);
  formData.append("description", form.description.trim());
  formData.append("sku", form.sku || `SKU_${Date.now()}`);
  formData.append("cat_id", String(cat?.id ?? ""));
  formData.append("productUnit", "1");
  formData.append("productStock", form.productStock ? "1" : "0");
  formData.append("productStatus", "available");
  formData.append("productRating", "4.6");

  // Actual image File object
  formData.append("image", form.productImage);

  try {
    const result = await addProductApi(formData);

    console.log("Add Product API result:", result);

    if (result.status?.toLowerCase() === "success") {
      window.alert("New Product Listed Successfully!");
      setSubmitted(true);
    } else {
      setError(result.message || "Failed to add product.");
    }
  } catch (error: any) {
    console.error("Add product error:", error);
    setError(
      error.response?.data?.message || "Something went wrong."
    );
  }
};



  if (submitted) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-20 h-20 rounded-full bg-green-500/15 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Product Listed Successfully! 🎉</h2>
          <p className="text-muted-foreground mb-6">
            Your product <strong>"{form.productName}"</strong> has been submitted and is now visible in the store.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { setForm(initialForm); setSubmitted(false); setActiveTab("basic"); }}
            className="px-6 py-2.5 rounded-xl border border-primary text-primary font-medium hover:bg-primary/10 transition-colors"
          >
            Add Another Product
          </button>
          <button
            onClick={() => navigate("/products")}
            className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            View Products
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "basic", label: "Basic Info", icon: <Package className="w-4 h-4" /> },
    { id: "details", label: "Details", icon: <FileText className="w-4 h-4" /> },
    { id: "specs", label: "Specifications", icon: <Layers className="w-4 h-4" /> },
  ] as const;

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
              <Store className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Seller Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage your products on DesiCart</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                viewMode === "list"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card text-foreground hover:bg-muted border border-border/50"
              }`}
            >
              All Listed Products
            </button>
            <button
              type="button"
              onClick={() => setViewMode("form")}
              className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                viewMode === "form"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card text-foreground hover:bg-muted border border-border/50"
              }`}
            >
              List New Product
            </button>
          </div>
        </div>

        {viewMode === "list" ? (
          <div className="bg-card rounded-2xl border shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" /> Your Products
            </h2>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                No products found. Start by listing a new product!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map((p, i) => (
                  <div key={p.id || i} className="border rounded-xl p-4 flex gap-4 items-start bg-background hover:border-primary/30 transition-colors">
                   <img
    src={p.productImage || p.image || p.imageUrl || "https://via.placeholder.com/150"}
    alt={p.productName}
/>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm line-clamp-2" title={p.productName}>
                        {p.productName}
                      </h3>
                      <div className="flex items-center justify-between mt-1.5">
                        <p className="text-sm font-bold text-primary">₹{p.productPrice}</p>
                        {p.category && (
                          <span className="text-[10px] font-medium bg-muted px-2 py-0.5 rounded-full capitalize text-muted-foreground">
                            {p.category}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handleEdit(p)}
                          className="flex-1 flex justify-center items-center gap-1.5 text-xs font-medium bg-blue-500/10 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-500/20 transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" /> Modify
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="flex-1 flex justify-center items-center gap-1.5 text-xs font-medium bg-red-500/10 text-red-600 px-3 py-2 rounded-lg hover:bg-red-500/20 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
          {/* Tab bar */}
          <div className="flex gap-1 bg-muted rounded-xl p-1 mb-6">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === t.id
                    ? "bg-card shadow text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.icon}
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl px-4 py-3 mb-5 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="bg-card rounded-2xl border shadow-sm p-6">
            {/* ── Tab: Basic Info ── */}
            {activeTab === "basic" && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" /> Product Information
                </h2>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Product Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.productName}
                    onChange={(e) => set("productName", e.target.value)}
                    placeholder="e.g. Premium Wireless Noise-Cancelling Headphones"
                    className="w-full h-10 px-4 rounded-xl bg-muted/60 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Brand <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={form.brand}
                      onChange={(e) => set("brand", e.target.value)}
                      placeholder="e.g. SoundMax"
                      className="w-full h-10 px-4 rounded-xl bg-muted/60 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Seller / Shop Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={form.seller}
                      onChange={(e) => set("seller", e.target.value)}
                      placeholder="e.g. SoundMax Official"
                      className="w-full h-10 px-4 rounded-xl bg-muted/60 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Category <span className="text-red-500">*</span></label>
                  <select
                    value={form.category}
                    onChange={(e) => set("category", e.target.value)}
                    className="w-full h-10 px-4 rounded-xl bg-muted/60 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select a category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      <DollarSign className="inline w-3.5 h-3.5 mr-1" />Selling Price (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={form.productPrice}
                      onChange={(e) => set("productPrice", e.target.value)}
                      placeholder="e.g. 4999"
                      className="w-full h-10 px-4 rounded-xl bg-muted/60 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      <Tag className="inline w-3.5 h-3.5 mr-1" />Original / MRP (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={form.originalPrice}
                      onChange={(e) => set("originalPrice", e.target.value)}
                      placeholder="e.g. 8999"
                      className="w-full h-10 px-4 rounded-xl bg-muted/60 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    />
                  </div>
                </div>

                {form.productPrice && form.originalPrice && Number(form.originalPrice) > Number(form.productPrice) && (
                  <div className="text-xs text-green-500 font-medium bg-green-500/10 rounded-lg px-3 py-2">
                    ✅ Discount: {Math.round(((Number(form.originalPrice) - Number(form.productPrice)) / Number(form.originalPrice)) * 100)}% off
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab("details")}
                    className="ml-auto px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Next: Details →
                  </button>
                </div>
              </div>
            )}

            {/* ── Tab: Details ── */}
            {activeTab === "details" && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" /> Product Details
                </h2>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Description <span className="text-red-500">*</span></label>
                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="Describe your product — features, benefits, use cases..."
                    className="w-full px-4 py-3 rounded-xl bg-muted/60 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none"
                  />
                </div>

                {/* ── Image Upload ── */}
                <div>
                  <label className="block text-sm font-medium mb-3">
                    <Upload className="inline w-3.5 h-3.5 mr-1" />Product Image
                  </label>

                  {/* Option A — URL */}
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Paste an image URL</p>
                    <input
                      type="url"
                      value={form.imageUrl}
                      onChange={handleUrlChange}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full h-10 px-4 rounded-xl bg-muted/60 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    />
                  </div>

                  {/* OR divider */}
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs font-semibold text-muted-foreground px-2 py-0.5 rounded-full bg-muted">OR</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  {/* Option B — Local file */}
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Upload from your computer</p>
                    <label
                      htmlFor="product-image-file"
                      className="flex flex-col items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/40 hover:bg-primary/5 transition-all cursor-pointer py-6 group"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Upload className="w-5 h-5 text-primary" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-foreground">
                          {form.productImage ? form.productImage.name : "Click to choose a file"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {form.productImage ? `${(form.productImage.size / 1024).toFixed(1)} KB` : "JPG, PNG, WEBP — max 10 MB"}
                        </p>
                      </div>
                    </label>
                    <input
                      id="product-image-file"
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>

                  {/* Unified preview */}
                  {form.imagePreview && (
                    <div className="mt-4 flex items-start gap-3">
                      <img
                        src={form.imagePreview}
                        alt="Preview"
                        className="h-28 w-28 rounded-xl object-cover border shadow"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                      <div className="flex flex-col gap-1 pt-1">
                        <p className="text-xs font-medium text-green-500">✅ Image ready</p>
                        <p className="text-xs text-muted-foreground">
                          {form.productImage ? "Local file selected" : "URL provided"}
                        </p>
                        <button
                          type="button"
                          onClick={clearImage}
                          className="mt-1 text-xs text-red-500 hover:underline flex items-center gap-1"
                        >
                          <X className="w-3 h-3" /> Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Badge / Label</label>
                  <input
                    type="text"
                    value={form.badge}
                    onChange={(e) => set("badge", e.target.value)}
                    placeholder="e.g. Bestseller, New Launch, Flash Deal"
                    className="w-full h-10 px-4 rounded-xl bg-muted/60 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">sku / Label</label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => set("sku", e.target.value)}
                    placeholder="e.g. Bestseller, New Launch, Flash Deal"
                    className="w-full h-10 px-4 rounded-xl bg-muted/60 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                </div>


                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Colors (comma-separated hex)</label>
                    <input
                      type="text"
                      value={form.colors}
                      onChange={(e) => set("colors", e.target.value)}
                      placeholder="#1a1a2e, #f5f5f5, #ff6b35"
                      className="w-full h-10 px-4 rounded-xl bg-muted/60 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Sizes (comma-separated)</label>
                    <input
                      type="text"
                      value={form.sizes}
                      onChange={(e) => set("sizes", e.target.value)}
                      placeholder="S, M, L, XL or 7, 8, 9, 10"
                      className="w-full h-10 px-4 rounded-xl bg-muted/60 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.productStock}
                      onChange={(e) => set("productStock", e.target.checked)}
                      className="w-4 h-4 accent-primary"
                    />
                    <span className="text-sm font-medium">In Stock</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.freeDelivery}
                      onChange={(e) => set("freeDelivery", e.target.checked)}
                      className="w-4 h-4 accent-primary"
                    />
                    <span className="text-sm font-medium">Free Delivery</span>
                  </label>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveTab("basic")}
                    className="px-5 py-2.5 rounded-xl border text-sm font-medium hover:bg-muted transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("specs")}
                    className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Next: Specs →
                  </button>
                </div>
              </div>
            )}

            {/* ── Tab: Specifications ── */}
            {activeTab === "specs" && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary" /> Specifications
                </h2>
                <p className="text-sm text-muted-foreground -mt-2">
                  Add key-value pairs like "Battery Life → 40 hours" (optional but recommended).
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => set("sku", e.target.value)}
                    placeholder="e.g. Battery Life"
                    className="flex-1 h-10 px-4 rounded-xl bg-muted/60 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSpec(); } }}
                  />
                  <input
                    type="text"
                    value={form.specValue}
                    onChange={(e) => set("specValue", e.target.value)}
                    placeholder="e.g. 40 hours"
                    className="flex-1 h-10 px-4 rounded-xl bg-muted/60 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSpec(); } }}
                  />
                  <button
                    type="button"
                    onClick={addSpec}
                    className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {Object.keys(form.specifications).length > 0 ? (
                  <div className="rounded-xl border overflow-hidden">
                    {Object.entries(form.specifications).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between px-4 py-2.5 border-b last:border-b-0 hover:bg-muted/40 transition-colors">
                        <span className="text-sm font-medium text-muted-foreground">{k}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">{v}</span>
                          <button
                            type="button"
                            onClick={() => removeSpec(k)}
                            className="text-muted-foreground hover:text-red-500 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 rounded-xl border border-dashed text-muted-foreground text-sm">
                    No specifications added yet. Add some above!
                  </div>
                )}

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("details")}
                    className="px-5 py-2.5 rounded-xl border text-sm font-medium hover:bg-muted transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> List Product
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
