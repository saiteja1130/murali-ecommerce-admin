import React, { useState, useRef } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Sparkles, MapPin, Trash2, Save } from 'lucide-react';
export const ShopTheLookEditor = () => {
    const { looks, updateLook, products, showToast } = useAdmin();
    const [activeLookIndex, setActiveLookIndex] = useState(0);
    const activeLook = looks[activeLookIndex] || looks[0];
    const [hotspots, setHotspots] = useState(activeLook ? activeLook.hotspots : []);
    const [selectedHotspotIndex, setSelectedHotspotIndex] = useState(null);
    const [previewHoverIndex, setPreviewHoverIndex] = useState(null);
    const imageContainerRef = useRef(null);
    // Switch look
    const handleSelectLook = (index) => {
        setActiveLookIndex(index);
        setHotspots(looks[index].hotspots);
        setSelectedHotspotIndex(null);
    };
    // Canvas click to add or move hotspot
    const handleImageClick = (e) => {
        if (!imageContainerRef.current)
            return;
        const rect = imageContainerRef.current.getBoundingClientRect();
        const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
        const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
        if (selectedHotspotIndex !== null) {
            // Move selected hotspot
            const updated = hotspots.map((h, i) => i === selectedHotspotIndex ? { ...h, x, y } : h);
            setHotspots(updated);
            showToast('info', 'Pin Repositioned', `Hotspot moved to (${x}%, ${y}%).`);
        }
        else {
            // Add new hotspot pin
            const defaultProduct = products[0];
            const newHotspot = {
                id: `hs-${Date.now()}`,
                productId: defaultProduct.id,
                productName: defaultProduct.name,
                price: defaultProduct.price,
                x,
                y,
                label: defaultProduct.name,
            };
            setHotspots([...hotspots, newHotspot]);
            setSelectedHotspotIndex(hotspots.length);
            showToast('success', 'Pin Added', `Placed at coordinate (${x}%, ${y}%).`);
        }
    };
    const handleUpdateHotspotProduct = (index, productId) => {
        const prod = products.find((p) => p.id === productId);
        if (!prod)
            return;
        const updated = hotspots.map((h, i) => i === index
            ? {
                ...h,
                productId: prod.id,
                productName: prod.name,
                price: prod.price,
                label: prod.name,
            }
            : h);
        setHotspots(updated);
    };
    const handleRemoveHotspot = (index) => {
        setHotspots(hotspots.filter((_, i) => i !== index));
        if (selectedHotspotIndex === index)
            setSelectedHotspotIndex(null);
    };
    const handleSaveLook = () => {
        if (activeLook) {
            updateLook(activeLook.id, { hotspots });
            showToast('success', 'Shop the Look Scene Committed', 'Hotspots updated on customer storefront.');
        }
    };
    return (<div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E4DC]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-3xl font-bold text-[#1A1A1A]">
              Interactive "Shop the Look" Hotspot Studio
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono tracking-widest bg-[#C8A87C]/15 text-[#A68758] font-bold">
              Hotspot Engine
            </span>
          </div>
          <p className="text-xs text-[#6B6864] mt-1">
            Click anywhere on the photoshoot canvas to drop interactive product tags and buyable pins.
          </p>
        </div>

        <button onClick={handleSaveLook} className="px-5 py-2 bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-sm">
          <Save className="w-4 h-4 text-[#C8A87C]"/>
          <span>Save Interactive Scene</span>
        </button>
      </div>

      {/* Look Scene Selector */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 text-xs">
        {looks.map((look, idx) => (<button key={look.id} onClick={() => handleSelectLook(idx)} className={`px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${activeLookIndex === idx
                ? 'bg-[#1A1A1A] text-white shadow-xs'
                : 'bg-white text-[#6B6864] border border-[#E8E4DC] hover:text-[#1A1A1A]'}`}>
            <Sparkles className="w-3.5 h-3.5 text-[#C8A87C]"/>
            <span>{look.title}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#C8A87C]/20 text-[#A68758]">
              {look.hotspots.length} Pins
            </span>
          </button>))}
      </div>

      {/* Main Studio Workspace: Left Canvas & Right Pin Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Interactive Canvas (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between text-xs text-[#6B6864] px-1">
            <span>
              {selectedHotspotIndex !== null
            ? 'Click canvas to reposition selected pin'
            : 'Click image canvas to place a new product pin'}
            </span>
            <span className="font-mono text-[#A68758]">
              {hotspots.length} Hotspots on canvas
            </span>
          </div>

          <div ref={imageContainerRef} onClick={handleImageClick} className="relative rounded-2xl overflow-hidden border-2 border-[#E8E4DC] bg-[#FAF8F5] cursor-crosshair select-none shadow-md group">
            <img src={activeLook.image} alt={activeLook.title} className="w-full h-auto object-cover max-h-[600px] pointer-events-none"/>

            {/* Render Hotspot Pins */}
            {hotspots.map((hs, idx) => {
            const isSelected = selectedHotspotIndex === idx;
            const isHovered = previewHoverIndex === idx;
            return (<div key={hs.id} style={{ left: `${hs.x}%`, top: `${hs.y}%` }} onClick={(e) => {
                    e.stopPropagation();
                    setSelectedHotspotIndex(idx);
                }} onMouseEnter={() => setPreviewHoverIndex(idx)} onMouseLeave={() => setPreviewHoverIndex(null)} className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group/pin">
                  {/* Pin Dot & Pulse Ring */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-lg transition-transform ${isSelected
                    ? 'bg-[#1A1A1A] text-[#C8A87C] scale-125 ring-4 ring-[#C8A87C]'
                    : 'bg-[#C8A87C] text-[#1A1A1A] hover:scale-110 ring-2 ring-white'}`}>
                    {idx + 1}
                  </div>

                  {/* Tooltip Card Preview */}
                  {(isHovered || isSelected) && (<div className="absolute bottom-9 left-1/2 -translate-x-1/2 w-48 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-[#E8E4DC] shadow-xl text-left pointer-events-none animate-in fade-in zoom-in-95 duration-150 z-30">
                      <div className="text-[10px] uppercase font-mono tracking-wider text-[#A68758] font-bold">
                        Linked Piece #{idx + 1}
                      </div>
                      <div className="font-serif font-bold text-xs text-[#1A1A1A] mt-0.5 truncate">
                        {hs.productName}
                      </div>
                      <div className="font-mono-data font-bold text-xs text-[#1A1A1A] mt-1">
                        ${hs.price.toLocaleString()} USD
                      </div>
                      <div className="text-[9px] text-[#6B6864] mt-1">
                        Coordinates: ({hs.x}%, {hs.y}%)
                      </div>
                    </div>)}
                </div>);
        })}
          </div>
        </div>

        {/* Pin Inspector & Product Linker (1 col) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#F2EFE9] pb-3">
              <h3 className="font-serif text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#C8A87C]"/>
                <span>Hotspot Pin Manager</span>
              </h3>
              <button onClick={() => setSelectedHotspotIndex(null)} className="text-xs text-[#A68758] hover:underline">
                Clear Selection
              </button>
            </div>

            {hotspots.length === 0 ? (<div className="py-8 text-center text-xs text-[#6B6864]">
                No pins placed yet. Click anywhere on the photograph to drop your first interactive tag.
              </div>) : (<div className="space-y-3">
                {hotspots.map((hs, idx) => {
                const isSelected = selectedHotspotIndex === idx;
                return (<div key={hs.id} onClick={() => setSelectedHotspotIndex(idx)} className={`p-3.5 rounded-xl border transition-all cursor-pointer ${isSelected
                        ? 'bg-[#FAF8F5] border-[#C8A87C] shadow-xs'
                        : 'border-[#E8E4DC] hover:bg-[#FAF8F5]/50'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#1A1A1A] text-[#C8A87C] font-mono text-[11px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-xs text-[#1A1A1A] truncate">
                            {hs.productName}
                          </span>
                        </div>
                        <button type="button" onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveHotspot(idx);
                    }} className="p-1 text-[#6B6864] hover:text-[#A5432F] rounded">
                          <Trash2 className="w-3.5 h-3.5"/>
                        </button>
                      </div>

                      {/* Config fields when selected */}
                      {isSelected && (<div className="mt-3 pt-3 border-t border-[#E8E4DC] space-y-2.5 animate-in fade-in duration-150">
                          <div>
                            <label className="block text-[10px] font-semibold uppercase text-[#6B6864] mb-1">
                              Linked Garment from Catalog
                            </label>
                            <select value={hs.productId} onChange={(e) => handleUpdateHotspotProduct(idx, e.target.value)} className="w-full px-2.5 py-1.5 bg-white border border-[#E8E4DC] rounded-lg text-xs text-[#1A1A1A]">
                              {products.map((p) => (<option key={p.id} value={p.id}>
                                  {p.name} (₹{p.price})
                                </option>))}
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2 bg-white rounded-lg border border-[#E8E4DC] text-center">
                              <span className="text-[10px] text-[#6B6864] block">X Axis</span>
                              <span className="font-mono font-bold text-[#1A1A1A]">{hs.x}%</span>
                            </div>
                            <div className="p-2 bg-white rounded-lg border border-[#E8E4DC] text-center">
                              <span className="text-[10px] text-[#6B6864] block">Y Axis</span>
                              <span className="font-mono font-bold text-[#1A1A1A]">{hs.y}%</span>
                            </div>
                          </div>
                        </div>)}
                    </div>);
            })}
              </div>)}
          </div>
        </div>
      </div>
    </div>);
};
export default ShopTheLookEditor;
