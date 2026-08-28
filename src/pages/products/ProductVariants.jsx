import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProduct } from '../../context/ProductContext';
import { useAdmin } from '../../context/AdminContext';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

export const ProductVariants = () => {
    const { id } = useParams();
    const { products, updateProduct, fetchProductById } = useProduct();
    const { showToast } = useAdmin();
    const [product, setProduct] = useState(() => products.find((p) => p.id === id));
    const [variants, setVariants] = useState([]);
    const [hasChanges, setHasChanges] = useState(false);
    const [isLoading, setIsLoading] = useState(!product);

    useEffect(() => {
      const load = async () => {
        if (id) {
          try {
            const p = await fetchProductById(id);
            setProduct(p);
            setVariants(p.variants || []);
          } catch (e) {
            console.error(e);
          } finally {
            setIsLoading(false);
          }
        }
      };
      load();
    }, [id]);

    const handleStockChange = (idx, delta) => {
        const v = variants[idx];
        const newStock = Math.max(0, (v.stock || 0) + delta);
        const updated = variants.map((item, i) => (i === idx ? { ...item, stock: newStock } : item));
        setVariants(updated);
        setHasChanges(true);
    };

    const handlePriceChange = (idx, price) => {
        const updated = variants.map((item, i) => (i === idx ? { ...item, price } : item));
        setVariants(updated);
        setHasChanges(true);
    };

    const handleSaveAll = async () => {
        if (product) {
            const formData = new FormData();
            formData.append('variants', JSON.stringify(variants));
            await updateProduct(product.id, formData);
            showToast('success', 'Variant Stock Matrix Saved', 'All SKU inventory levels and prices committed.');
            setHasChanges(false);
        }
    };
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[350px] text-[#A68758] space-y-3">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#6B6864]">Loading variant matrix...</span>
        </div>
      );
    }

    if (!product) {
        return (<div className="p-8 text-center text-[#6B6864]">
        Product not found.{' '}
        <Link to="/admin/products" className="text-[#A68758] underline">
          Return to catalog
        </Link>
      </div>);
    }
    const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
    return (<div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E4DC]">
        <div className="flex items-center gap-3">
          <Link to="/admin/products" className="p-2 rounded-xl bg-white border border-[#E8E4DC] text-[#6B6864] hover:text-[#1A1A1A] hover:bg-[#FAF8F5] transition-colors">
            <ArrowLeft className="w-4 h-4"/>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
                Variant & Inventory Matrix
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono tracking-widest bg-[#C8A87C]/15 text-[#A68758] font-bold">
                {product.name}
              </span>
            </div>
            <p className="text-xs text-[#6B6864] mt-0.5">
              Master SKU: <span className="font-mono text-[#1A1A1A]">{product.sku}</span> • Total Allocated Stock: <span className="font-mono font-bold text-[#1A1A1A]">{totalStock} units</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleSaveAll} disabled={!hasChanges} className="px-5 py-2 bg-[#1A1A1A] hover:bg-[#333333] disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-sm cursor-pointer">
            <Save className="w-4 h-4 text-[#C8A87C]"/>
            <span>Commit Inventory Matrix</span>
          </button>
        </div>
      </div>

      {/* Product Summary Header Card */}
      <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5 shadow-2xs flex items-center gap-4">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} className="w-16 h-20 rounded-xl object-cover border border-[#E8E4DC] shrink-0 bg-[#FAF8F5]"/>
        ) : (
          <div className="w-16 h-20 rounded-xl border border-[#E8E4DC] bg-[#FAF8F5] flex items-center justify-center text-[#A68758] shrink-0 font-serif font-bold text-lg">
            {product.name?.[0]}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-serif text-lg font-bold text-[#1A1A1A]">{product.name}</div>
          <div className="text-xs text-[#6B6864] mt-0.5">{product.categoryName || product.category?.name || 'Department'}</div>
          <div className="flex items-center gap-3 mt-2 text-xs">
            <span className="font-mono font-bold text-[#1A1A1A]">Base: ₹{product.price?.toLocaleString()}</span>
            <span>•</span>
            <span className="text-[#4A7A5E] font-medium">{variants.length} active color/size combinations</span>
          </div>
        </div>
      </div>

      {/* Variant Table Grid */}
      <div className="bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden shadow-2xs">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#E8E4DC] bg-[#FAF8F5] text-[10px] uppercase tracking-wider text-[#6B6864]">
              <th className="py-3.5 px-4 font-semibold">SKU Identifier</th>
              <th className="py-3.5 px-3 font-semibold">Colorway</th>
              <th className="py-3.5 px-3 font-semibold">Size</th>
              <th className="py-3.5 px-3 font-semibold">Unit Price</th>
              <th className="py-3.5 px-3 font-semibold">Available Units</th>
              <th className="py-3.5 px-4 font-semibold text-right">Quick Adjust</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F2EFE9] text-xs">
            {variants.map((v, idx) => (<tr key={v.id} className="hover:bg-[#FAF8F5] transition-colors">
                <td className="py-3.5 px-4 font-mono font-semibold text-[#1A1A1A]">
                  {v.sku}
                </td>
                <td className="py-3.5 px-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full border border-black/15 shrink-0" style={{ backgroundColor: v.colorHex }}/>
                    <span className="font-medium text-[#1A1A1A]">{v.color}</span>
                  </div>
                </td>
                <td className="py-3.5 px-3 font-medium text-[#6B6864]">
                  {v.size}
                </td>
                <td className="py-3.5 px-3">
                  <div className="flex items-center gap-1 font-mono">
                    <span className="text-[#6B6864]">₹</span>
                    <input type="number" value={v.price} onChange={(e) => handlePriceChange(idx, Number(e.target.value))} className="w-24 px-2 py-1 bg-[#F8F6F3] border border-[#E8E4DC] rounded-lg text-xs font-mono font-semibold text-[#1A1A1A]"/>
                  </div>
                </td>
                <td className="py-3.5 px-3">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${v.stock <= 2
                ? 'bg-[#A5432F]/15 text-[#A5432F]'
                : v.stock <= 4
                    ? 'bg-[#B8863F]/15 text-[#B8863F]'
                    : 'bg-[#4A7A5E]/15 text-[#4A7A5E]'}`}>
                    {v.stock} units
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button type="button" onClick={() => handleStockChange(idx, -1)} className="w-7 h-7 rounded-lg bg-[#FAF8F5] border border-[#E8E4DC] hover:bg-[#F2EFE9] text-[#1A1A1A] font-bold text-xs flex items-center justify-center transition-colors" title="Decrease stock by 1">
                      -1
                    </button>
                    <button type="button" onClick={() => handleStockChange(idx, +1)} className="w-7 h-7 rounded-lg bg-[#FAF8F5] border border-[#E8E4DC] hover:bg-[#F2EFE9] text-[#1A1A1A] font-bold text-xs flex items-center justify-center transition-colors" title="Increase stock by 1">
                      +1
                    </button>
                    <button type="button" onClick={() => handleStockChange(idx, +5)} className="px-2 h-7 rounded-lg bg-[#1A1A1A] text-[#C8A87C] font-mono text-[11px] font-semibold flex items-center justify-center hover:bg-[#333333] transition-colors" title="Restock batch of 5">
                      +5 Restock
                    </button>
                  </div>
                </td>
              </tr>))}
          </tbody>
        </table>
      </div>
    </div>);
};
export default ProductVariants;
