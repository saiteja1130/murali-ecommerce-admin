import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useProduct } from '../../context/ProductContext';
import { useCategory } from '../../context/CategoryContext';
import { useAdmin } from '../../context/AdminContext';
import {
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  Image as ImageIcon,
  Sparkles,
  ShieldCheck,
  Layers,
  UploadCloud,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export const ProductForm = ({ mode }) => {
  const { id } = useParams();
  const { addProduct, updateProduct, fetchProductById } = useProduct();
  const { mainCategories, categories } = useCategory();
  const { showToast } = useAdmin();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [sku, setSku] = useState('');
  const [mainCategory, setMainCategory] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [description, setDescription] = useState('');
  const [isStockAvailable, setIsStockAvailable] = useState(true);

  // Optional Materiality & Atelier Details
  const [composition, setComposition] = useState('');
  const [sustainability, setSustainability] = useState('');
  const [careInstructions, setCareInstructions] = useState('');
  const [dimensions, setDimensions] = useState('');

  // Images state (holds { id, url, file?: File })
  const [images, setImages] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Variants state (empty by default)
  const [variants, setVariants] = useState([]);

  const [isLoadingProduct, setIsLoadingProduct] = useState(mode === 'edit');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered subcategories based on chosen Main Category
  const availableSubcategories = React.useMemo(() => {
    if (!mainCategory) return categories;
    return categories.filter((c) => {
      const mId = c.mainCategory?._id || c.mainCategory?.id || c.mainCategory;
      const mSlug = c.mainCategory?.slug || '';
      return mId === mainCategory || mSlug.toLowerCase() === mainCategory.toLowerCase();
    });
  }, [mainCategory, categories]);

  // Auto-select first main category and subcategory in create mode
  useEffect(() => {
    if (mode === 'create') {
      if (mainCategories.length > 0 && !mainCategory) {
        setMainCategory(mainCategories[0].id || mainCategories[0]._id);
      }
    }
  }, [mainCategories, mainCategory, mode]);

  useEffect(() => {
    if (mode === 'create' && availableSubcategories.length > 0) {
      if (!category || !availableSubcategories.some((c) => (c.id || c._id) === category)) {
        setCategory(availableSubcategories[0].id || availableSubcategories[0]._id);
      }
    }
  }, [availableSubcategories, category, mode]);

  // Load existing data if in edit mode
  useEffect(() => {
    if (mode === 'edit' && id) {
      const loadProduct = async () => {
        setIsLoadingProduct(true);
        try {
          const p = await fetchProductById(id);
          if (p) {
            setName(p.name || '');
            setSlug(p.slug || '');
            setSku(p.sku || '');
            const mainCatId = p.mainCategoryId || p.mainCategory?._id || p.mainCategory || p.category?.mainCategory?._id || p.category?.mainCategory || '';
            setMainCategory(mainCatId);
            setCategory(p.categoryId || p.category?._id || p.category || '');
            setPrice(p.price || 0);
            setOriginalPrice(p.originalPrice || '');
            setDescription(p.description || '');
            setIsStockAvailable(p.isStockAvailable !== false);
            setComposition(p.composition || '');
            setSustainability(p.sustainability || '');
            setCareInstructions(p.careInstructions || '');
            setDimensions(p.dimensions || '');

            if (p.images && Array.isArray(p.images)) {
              setImages(p.images.map((imgUrl, i) => ({ id: `existing-${i}`, url: imgUrl })));
            }

            if (p.variants && Array.isArray(p.variants) && p.variants.length > 0) {
              setVariants(p.variants.map((v, i) => ({
                id: v._id || `var-${i}`,
                sku: v.sku || '',
                color: v.color || '',
                colorHex: v.colorHex || '#1A1A1A',
                size: v.size || '',
                stock: v.stock || 0,
                price: v.price || p.price || 0,
              })));
            }
          }
        } catch (error) {
          showToast('danger', 'Load Failed', 'Could not retrieve product record.');
        } finally {
          setIsLoadingProduct(false);
        }
      };
      loadProduct();
    }
  }, [mode, id]);

  // Auto generate slug and SKU helper from name
  const handleNameChange = (val) => {
    setName(val);
    if (mode === 'create') {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generatedSlug);

      if (!sku) {
        const initials = val
          .split(' ')
          .filter(Boolean)
          .map((w) => w[0].toUpperCase())
          .join('')
          .slice(0, 4);
        setSku(`SMI-${initials || 'PRD'}-${Math.floor(100 + Math.random() * 900)}`);
      }
    }
  };

  // Add variant helper
  const handleAddVariant = () => {
    const newV = {
      id: `v-${Date.now()}`,
      sku: sku ? `${sku}-${variants.length + 1}` : `SKU-${variants.length + 1}`,
      color: '',
      colorHex: '#1A1A1A',
      size: '',
      stock: 0,
      price: price ? Number(price) : 0,
    };
    setVariants([...variants, newV]);
  };

  const handleUpdateVariant = (index, updates) => {
    setVariants(variants.map((v, i) => (i === index ? { ...v, ...updates } : v)));
  };

  const handleRemoveVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  // File Upload Handlers (FormData)
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newImageObjs = files.map((file) => ({
      id: `new-${Date.now()}-${Math.random()}`,
      url: URL.createObjectURL(file),
      file,
    }));

    setImages((prev) => [...prev, ...newImageObjs]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddImageUrl = () => {
    if (newImageUrl.trim()) {
      setImages((prev) => [...prev, { id: `url-${Date.now()}`, url: newImageUrl.trim() }]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetPrimaryImage = (index) => {
    const img = images[index];
    const rest = images.filter((_, i) => i !== index);
    setImages([img, ...rest]);
    showToast('info', 'Primary Cover Updated', 'Main product photo updated.');
  };

  // Submit form via FormData
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim()) {
      showToast('danger', 'Validation Incomplete', 'Product name and SKU are required.');
      return;
    }
    if (!price || Number(price) <= 0) {
      showToast('danger', 'Validation Incomplete', 'Please provide a valid retail price.');
      return;
    }
    if (!category) {
      showToast('danger', 'Category Required', 'Please assign a primary department category.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('slug', slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
      formData.append('sku', sku.trim().toUpperCase());
      if (mainCategory) {
        formData.append('mainCategory', mainCategory);
      }
      formData.append('category', category);
      formData.append('price', price.toString());
      if (originalPrice) {
        formData.append('originalPrice', originalPrice.toString());
      }
      formData.append('description', description);
      formData.append('isStockAvailable', isStockAvailable ? 'true' : 'false');
      formData.append('composition', composition);
      formData.append('sustainability', sustainability);
      formData.append('careInstructions', careInstructions);
      formData.append('dimensions', dimensions);
      formData.append('variants', JSON.stringify(variants));

      // Existing image URLs to retain
      const existingUrls = images.filter((img) => !img.file).map((img) => img.url);
      formData.append('existingImages', JSON.stringify(existingUrls));

      // Newly attached files to upload via Multer
      images.forEach((img) => {
        if (img.file) {
          formData.append('images', img.file);
        }
      });

      if (mode === 'edit' && id) {
        await updateProduct(id, formData);
      } else {
        await addProduct(formData);
      }
      navigate('/admin/products');
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingProduct) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-[#A68758] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-xs font-semibold uppercase tracking-wider text-[#6B6864]">
          Loading product specifications...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-12">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E4DC]">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="p-2 rounded-xl bg-white border border-[#E8E4DC] text-[#6B6864] hover:text-[#1A1A1A] hover:bg-[#FAF8F5] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1D241C]">
                {mode === 'edit' ? `Edit "${name || 'Product'}"` : 'Add New Product'}
              </h1>
            </div>
            <p className="text-xs text-[#687163] mt-0.5">
              Enter product name, pricing, photos, category, and stock quantity.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="px-4 py-2 bg-white hover:bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs font-semibold text-[#687163] transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 bg-[#1D241C] hover:bg-[#C69E58] hover:text-[#1D241C] disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#C69E58]" />
            ) : (
              <Save className="w-4 h-4 text-[#C69E58]" />
            )}
            <span>{mode === 'edit' ? 'Save Changes' : 'Save Product'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left form sections & Right sidebar properties */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information Card */}
          <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs space-y-4">
            <h2 className="font-serif text-lg font-bold text-[#1D241C] border-b border-[#E8E4DC] pb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C69E58]" />
              <span>Product Information</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1D241C] uppercase tracking-wider mb-1.5">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Elegant Hair Clip"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs text-[#1D241C] font-semibold focus:outline-none focus:border-[#C69E58] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1D241C] uppercase tracking-wider mb-1.5">
                    Product SKU *
                  </label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="SMI-CLP-001"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs font-mono text-[#1D241C] focus:outline-none focus:border-[#C69E58]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1D241C] uppercase tracking-wider mb-1.5">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="elegant-hair-clip"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs font-mono text-[#687163] focus:outline-none focus:border-[#C69E58]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1D241C] uppercase tracking-wider mb-1.5">
                  Product Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the product material, design, comfort, and usage..."
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs text-[#1D241C] focus:outline-none focus:border-[#C69E58] focus:bg-white leading-relaxed font-sans"
                />
              </div>
            </div>
          </div>

          {/* Media & Multi-Image Gallery Card */}
          <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E4DC] pb-3">
              <h2 className="font-serif text-lg font-bold text-[#1D241C] flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#C69E58]" />
                <span>Product Photos</span>
              </h2>
              <span className="text-xs text-[#687163]">First photo will be the main image</span>
            </div>

            {/* Existing & newly selected images grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {images.map((img, index) => (
                <div
                  key={img.id || index}
                  className="relative group rounded-xl overflow-hidden border border-[#E8E4DC] bg-[#FAF8F5] aspect-3/4 shadow-2xs"
                >
                  <img src={img.url} alt={`Product ${index}`} className="w-full h-full object-cover" />
                  {index === 0 && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#1A1A1A]/80 text-white text-[9px] uppercase font-mono tracking-wider rounded-md backdrop-blur-xs">
                      Cover
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                    {index !== 0 && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryImage(index)}
                        className="px-2 py-1 bg-white text-[#1A1A1A] text-[10px] font-semibold rounded-md hover:bg-[#FAF8F5] cursor-pointer"
                      >
                        Set Cover
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="p-1.5 bg-[#A5432F] text-white rounded-md hover:bg-red-700 cursor-pointer"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Upload Dropzone Tile */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="aspect-3/4 border-2 border-dashed border-[#E8E4DC] hover:border-[#C8A87C] bg-[#FAF8F5]/50 hover:bg-[#FAF8F5] rounded-xl flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-colors"
              >
                <UploadCloud className="w-6 h-6 text-[#A68758] mb-1" />
                <span className="text-[11px] font-semibold text-[#1A1A1A]">Upload Files</span>
                <span className="text-[9px] text-[#6B6864] mt-0.5">JPG, PNG, WEBP</span>
              </div>
            </div>

            {/* Hidden Multi-file input */}
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />

            {/* Add Image URL alternative */}
            <div className="flex gap-2 pt-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Or paste external image URL..."
                className="flex-1 px-3.5 py-2 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs text-[#1A1A1A] focus:outline-none focus:border-[#C8A87C]"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-4 py-2 bg-[#1A1A1A] text-white text-xs font-semibold rounded-xl hover:bg-[#333333] transition-colors shrink-0 cursor-pointer"
              >
                Add URL
              </button>
            </div>
          </div>

          {/* Color & Size Variant Matrix */}
          <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E4DC] pb-3">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#1D241C] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#C69E58]" />
                  <span>Product Variants (Colors & Sizes)</span>
                </h2>
                <p className="text-xs text-[#687163] mt-0.5">
                  Optional: Add colors, sizes, and stock per variant.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddVariant}
                className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#F2EFE9] border border-[#E8E4DC] text-[#1D241C] text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#C69E58]" />
                <span>Add Variant</span>
              </button>
            </div>

            <div className="space-y-3">
              {variants.length === 0 ? (
                <div className="p-6 text-center border-2 border-dashed border-[#E8E4DC] rounded-xl bg-[#FAF8F5]/50">
                  <Layers className="w-8 h-8 text-[#506040]/50 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-[#1D241C]">No variants added yet</p>
                  <p className="text-[11px] text-[#687163] mt-0.5 mb-3">
                    If your item has multiple colors or sizes, you can add them here.
                  </p>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="px-3.5 py-1.5 bg-[#1D241C] hover:bg-[#C69E58] text-white hover:text-[#1D241C] text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add First Variant</span>
                  </button>
                </div>
              ) : (
                variants.map((v, idx) => (
                  <div
                    key={v.id || idx}
                    className="flex flex-wrap items-center gap-3 p-3 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs"
                  >
                    <div
                      className="w-6 h-6 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: v.colorHex || '#1D241C' }}
                    />

                    <div className="flex-1 min-w-[120px]">
                      <label className="text-[10px] uppercase font-mono text-[#687163]">Color Name</label>
                      <input
                        type="text"
                        value={v.color}
                        placeholder="e.g. Gold / Black"
                        onChange={(e) => handleUpdateVariant(idx, { color: e.target.value })}
                        className="w-full bg-white px-2 py-1 rounded border border-[#E8E4DC] text-xs font-medium"
                      />
                    </div>

                    <div className="w-24">
                      <label className="text-[10px] uppercase font-mono text-[#687163]">Color Hex</label>
                      <input
                        type="text"
                        value={v.colorHex}
                        placeholder="#1D241C"
                        onChange={(e) => handleUpdateVariant(idx, { colorHex: e.target.value })}
                        className="w-full bg-white px-2 py-1 rounded border border-[#E8E4DC] text-xs font-mono"
                      />
                    </div>

                    <div className="w-24">
                      <label className="text-[10px] uppercase font-mono text-[#687163]">Size</label>
                      <input
                        type="text"
                        value={v.size}
                        placeholder="e.g. Medium"
                        onChange={(e) => handleUpdateVariant(idx, { size: e.target.value })}
                        className="w-full bg-white px-2 py-1 rounded border border-[#E8E4DC] text-xs"
                      />
                    </div>

                    <div className="w-20">
                      <label className="text-[10px] uppercase font-mono text-[#687163]">Stock</label>
                      <input
                        type="number"
                        min={0}
                        value={v.stock}
                        onChange={(e) => handleUpdateVariant(idx, { stock: Number(e.target.value) })}
                        className="w-full bg-white px-2 py-1 rounded border border-[#E8E4DC] text-xs font-mono font-bold"
                      />
                    </div>

                    <div className="w-24">
                      <label className="text-[10px] uppercase font-mono text-[#687163]">Price (₹)</label>
                      <input
                        type="number"
                        min={0}
                        value={v.price}
                        onChange={(e) => handleUpdateVariant(idx, { price: Number(e.target.value) })}
                        className="w-full bg-white px-2 py-1 rounded border border-[#E8E4DC] text-xs font-mono"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(idx)}
                      className="p-1.5 text-[#687163] hover:text-red-700 hover:bg-red-50 rounded mt-3.5 cursor-pointer"
                      title="Remove variant"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Optional Material & Details Card */}
          <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs space-y-4">
            <h2 className="font-serif text-lg font-bold text-[#1D241C] border-b border-[#E8E4DC] pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C69E58]" />
                <span>Material & Details (Optional)</span>
              </div>
              <span className="text-[11px] font-mono text-[#506040] uppercase">Optional</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1D241C] uppercase tracking-wider mb-1.5">
                  Material / Fabric
                </label>
                <input
                  type="text"
                  value={composition}
                  onChange={(e) => setComposition(e.target.value)}
                  placeholder="e.g. 100% Premium Cotton / Metal Alloy"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs text-[#1D241C] focus:outline-none focus:border-[#C69E58]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1D241C] uppercase tracking-wider mb-1.5">
                  Quality & Highlights
                </label>
                <input
                  type="text"
                  value={sustainability}
                  onChange={(e) => setSustainability(e.target.value)}
                  placeholder="e.g. Eco-Friendly, Rust-Proof, Lightweight"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs text-[#1D241C] focus:outline-none focus:border-[#C69E58]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1D241C] uppercase tracking-wider mb-1.5">
                    Care Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={careInstructions}
                    onChange={(e) => setCareInstructions(e.target.value)}
                    placeholder="e.g. Keep away from water and direct perfume spray..."
                    className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs text-[#1D241C] focus:outline-none focus:border-[#C69E58]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1D241C] uppercase tracking-wider mb-1.5">
                    Size & Dimensions
                  </label>
                  <textarea
                    rows={2}
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    placeholder="e.g. Length: 8cm, Width: 4cm..."
                    className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs text-[#1D241C] focus:outline-none focus:border-[#C69E58]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col) - Pricing, Category, Stock Availability */}
        <div className="space-y-6">
          {/* Stock Availability Card */}
          <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E4DC] pb-3">
              <div>
                <h3 className="font-serif text-base font-bold text-[#1D241C]">
                  Stock Availability
                </h3>
                <p className="text-[11px] text-[#687163] mt-0.5">
                  Enable or disable purchasing
                </p>
              </div>

              {/* Toggle switch button */}
              <button
                type="button"
                onClick={() => setIsStockAvailable(!isStockAvailable)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isStockAvailable ? 'bg-[#506040]' : 'bg-[#D1CDC7]'
                }`}
                role="switch"
                aria-checked={isStockAvailable}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    isStockAvailable ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                isStockAvailable
                  ? 'bg-[#506040]/10 text-[#506040] border border-[#506040]/20'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {isStockAvailable ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#506040]" />
              ) : (
                <XCircle className="w-4 h-4 shrink-0 text-red-700" />
              )}
              <span>
                {isStockAvailable
                  ? 'In Stock (Available for Purchase)'
                  : 'Out of Stock (Disabled on Storefront)'}
              </span>
            </div>
            <p className="text-[11px] text-[#687163] leading-relaxed">
              When disabled, customers will see this item as "Out of Stock" and won't be able to buy it.
            </p>
          </div>

          {/* Pricing Card */}
          <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs space-y-4">
            <h3 className="font-serif text-base font-bold text-[#1D241C] border-b border-[#E8E4DC] pb-2">
              Pricing (₹ INR)
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#1D241C] uppercase tracking-wider mb-1">
                  Selling Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs font-mono font-bold text-[#1D241C]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1D241C] uppercase tracking-wider mb-1">
                  Original / MRP Price (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder="Optional original price"
                  className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs font-mono text-[#687163]"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Category Card */}
          <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs space-y-4">
            <h3 className="font-serif text-base font-bold text-[#1D241C] border-b border-[#E8E4DC] pb-2">
              Department & Category
            </h3>

            <div className="space-y-4">
              {/* Main Category / Department Selection */}
              <div>
                <label className="block text-xs font-semibold text-[#1D241C] uppercase tracking-wider mb-1">
                  Main Department *
                </label>
                {mainCategories.length === 0 ? (
                  <div className="p-3 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs text-[#687163]">
                    No main departments found. Please create one in the{' '}
                    <Link to="/admin/categories" className="text-[#C69E58] font-semibold underline">
                      Category Manager
                    </Link>
                    .
                  </div>
                ) : (
                  <select
                    value={mainCategory}
                    onChange={(e) => {
                      const newMain = e.target.value;
                      setMainCategory(newMain);
                      // Auto pick first subcategory in new department
                      const subcats = categories.filter((c) => {
                        const mId = c.mainCategory?._id || c.mainCategory?.id || c.mainCategory;
                        return mId === newMain || c.mainCategory?.slug === newMain;
                      });
                      if (subcats.length > 0) {
                        setCategory(subcats[0].id || subcats[0]._id);
                      }
                    }}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs text-[#1D241C] focus:outline-none focus:border-[#C69E58] cursor-pointer"
                  >
                    <option value="" disabled>
                      Select Main Department
                    </option>
                    {mainCategories.map((m) => (
                      <option key={m.id || m._id} value={m.id || m._id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Subcategory Selection */}
              <div>
                <label className="block text-xs font-semibold text-[#1D241C] uppercase tracking-wider mb-1">
                  Subcategory *
                </label>
                {availableSubcategories.length === 0 ? (
                  <div className="p-3 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs text-[#687163]">
                    No subcategories available for this department. Please create one in the{' '}
                    <Link to="/admin/categories" className="text-[#C69E58] font-semibold underline">
                      Category Manager
                    </Link>
                    .
                  </div>
                ) : (
                  <select
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs text-[#1D241C] focus:outline-none focus:border-[#C69E58] cursor-pointer"
                  >
                    <option value="" disabled>
                      Select Subcategory
                    </option>
                    {availableSubcategories.map((c) => (
                      <option key={c.id || c._id} value={c.id || c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default ProductForm;
