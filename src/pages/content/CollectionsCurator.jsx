import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Check, Save, Star } from 'lucide-react';
export const CollectionsCurator = () => {
    const { products, showToast } = useAdmin();
    // Curated product IDs for homepage featured grid
    const [featuredProductIds, setFeaturedProductIds] = useState([
        'p-1',
        'p-2',
        'p-3',
        'p-4',
    ]);
    const [atelierSpotlightId, setAtelierSpotlightId] = useState('p-1');
    const toggleFeatured = (id) => {
        if (featuredProductIds.includes(id)) {
            setFeaturedProductIds(featuredProductIds.filter((pId) => pId !== id));
        }
        else {
            if (featuredProductIds.length >= 8) {
                showToast('warning', 'Maximum Limit Reached', 'Homepage supports up to 8 featured garments.');
                return;
            }
            setFeaturedProductIds([...featuredProductIds, id]);
        }
    };
    const handleSaveCurations = () => {
        showToast('success', 'Storefront Merchandising Published', 'Homepage featured grid and spotlight piece updated.');
    };
    return (<div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E4DC]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-3xl font-bold text-[#1A1A1A]">
              Storefront Merchandising & Collections
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono tracking-widest bg-[#C8A87C]/15 text-[#A68758] font-bold">
              {featuredProductIds.length} Selected
            </span>
          </div>
          <p className="text-xs text-[#6B6864] mt-1">
            Handpick runway pieces showcased on the main customer storefront landing page.
          </p>
        </div>

        <button onClick={handleSaveCurations} className="px-5 py-2 bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-sm">
          <Save className="w-4 h-4 text-[#C8A87C]"/>
          <span>Publish Storefront Grid</span>
        </button>
      </div>

      {/* Atelier Spotlight Garment Selector */}
      <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs space-y-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#A68758] uppercase tracking-wider">
            <Star className="w-4 h-4 text-[#C8A87C] fill-[#C8A87C]"/>
            <span>Master Atelier Spotlight Hero Piece</span>
          </div>
          <h2 className="font-serif text-xl font-bold text-[#1A1A1A] mt-1">
            Select Featured Piece for Editorial Backdrop
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.slice(0, 4).map((p) => {
            const isSpotlight = atelierSpotlightId === p.id;
            return (<div key={p.id} onClick={() => setAtelierSpotlightId(p.id)} className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${isSpotlight
                    ? 'bg-[#FAF8F5] border-[#C8A87C] ring-2 ring-[#C8A87C]/40 shadow-xs'
                    : 'border-[#E8E4DC] hover:bg-[#FAF8F5]'}`}>
                <img src={p.images[0]} alt={p.name} className="w-12 h-14 rounded-lg object-cover border border-[#E8E4DC] shrink-0"/>
                <div className="min-w-0">
                  <div className="font-semibold text-xs text-[#1A1A1A] truncate">{p.name}</div>
                  <div className="font-mono-data text-xs text-[#A68758] font-bold mt-0.5">
                    ₹{p.price.toLocaleString()}
                  </div>
                  {isSpotlight && (<span className="text-[10px] uppercase font-mono font-bold text-[#4A7A5E] block mt-1">
                      Active Spotlight
                    </span>)}
                </div>
              </div>);
        })}
        </div>
      </div>

      {/* Featured Garments Selection Grid */}
      <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#F2EFE9] pb-3">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#1A1A1A]">
              "Curated Arrivals" Homepage Grid (Select 4–8)
            </h2>
            <p className="text-xs text-[#6B6864] mt-0.5">
              Click any piece to toggle its visibility on the storefront primary collection grid.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-[#1A1A1A]">
            {featuredProductIds.length} / 8 Selected
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((p) => {
            const isFeatured = featuredProductIds.includes(p.id);
            return (<div key={p.id} onClick={() => toggleFeatured(p.id)} className={`relative rounded-2xl border p-4 cursor-pointer transition-all flex flex-col justify-between group ${isFeatured
                    ? 'bg-[#FAF8F5] border-[#C8A87C] shadow-xs'
                    : 'border-[#E8E4DC] hover:bg-[#FAF8F5]/50'}`}>
                <div>
                  <div className="relative aspect-3/4 rounded-xl overflow-hidden mb-3 bg-[#FAF8F5] border border-[#E8E4DC]">
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover"/>
                    {isFeatured && (<div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#1A1A1A] text-[#C8A87C] flex items-center justify-center shadow-md">
                        <Check className="w-3.5 h-3.5"/>
                      </div>)}
                  </div>

                  <div className="text-xs font-semibold text-[#1A1A1A] line-clamp-1">{p.name}</div>
                  <div className="text-[11px] text-[#6B6864] mt-0.5">{p.category}</div>
                </div>

                <div className="mt-3 pt-2 border-t border-[#F2EFE9] flex items-center justify-between">
                  <span className="font-mono-data font-bold text-xs text-[#1A1A1A]">
                    ₹{p.price.toLocaleString()}
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${isFeatured ? 'bg-[#C8A87C]/20 text-[#A68758] font-bold' : 'text-[#6B6864]'}`}>
                    {isFeatured ? 'Curated' : 'Click to add'}
                  </span>
                </div>
              </div>);
        })}
        </div>
      </div>
    </div>);
};
export default CollectionsCurator;
