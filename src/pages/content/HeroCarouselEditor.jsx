import React, { useState, useRef } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useHero } from '../../context/HeroContext';
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, Loader2, UploadCloud, Image as ImageIcon, X, Link as LinkIcon } from 'lucide-react';
export const HeroCarouselEditor = () => {
    const { showToast } = useAdmin();
    const { heroSlides, isLoading, addHeroSlide, updateHeroSlide, deleteHeroSlide, reorderHeroSlides } = useHero();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [ctaText, setCtaText] = useState('Explore the Atelier');
    const [ctaLink, setCtaLink] = useState('/collections/autumn-silk');
    const [image, setImage] = useState('');
    const [imageSourceMode, setImageSourceMode] = useState('upload'); // 'upload' | 'url'
    const [isActive, setIsActive] = useState(true);
    const fileInputRef = useRef(null);
    const resetForm = () => {
        setTitle('');
        setSubtitle('');
        setCtaText('Explore the Atelier');
        setCtaLink('/collections/autumn-silk');
        setImage('');
        setImageSourceMode('upload');
        setIsActive(true);
        setEditingId(null);
        setIsModalOpen(false);
    };
    const handleEdit = (slide) => {
        setEditingId(slide.id);
        setTitle(slide.title);
        setSubtitle(slide.subtitle);
        setCtaText(slide.ctaText);
        setCtaLink(slide.ctaLink);
        setImage(slide.image);
        setImageSourceMode(slide.image?.startsWith('data:') ? 'upload' : 'url');
        setIsActive(slide.isActive);
        setIsModalOpen(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            showToast('warning', 'File Size Exceeded', 'Please choose an image under 10MB.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setImage(reader.result);
        };
        reader.readAsDataURL(file);
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim() || !image.trim())
            return;
        if (editingId) {
            updateHeroSlide(editingId, {
                title,
                subtitle,
                ctaText,
                ctaLink,
                image,
                isActive,
            });
        }
        else {
            addHeroSlide({
                title,
                subtitle,
                ctaText,
                ctaLink,
                image,
                order: heroSlides.length + 1,
                isActive,
            });
        }
        resetForm();
    };
    const handleMove = (index, direction) => {
        const targetIdx = direction === 'up' ? index - 1 : index + 1;
        if (targetIdx < 0 || targetIdx >= heroSlides.length)
            return;
        reorderHeroSlides(heroSlides[index], heroSlides[targetIdx]);
    };
    return (<div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E4DC]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-3xl font-bold text-[#1A1A1A]">
              Storefront Hero Carousel
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono tracking-widest bg-[#C8A87C]/15 text-[#A68758] font-bold">
              {heroSlides.length} Curated Slides
            </span>
          </div>
          <p className="text-xs text-[#6B6864] mt-1">
            Configure full-bleed editorial imagery, haute headlines, and seasonal runway callouts.
          </p>
        </div>

        <button onClick={() => {
            resetForm();
            setIsModalOpen(true);
        }} className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-sm">
          <Plus className="w-3.5 h-3.5 text-[#C8A87C]"/>
          <span>New Hero Slide</span>
        </button>
      </div>

      {/* Hero Slides List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-[#A68758]">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p>Loading curated slides...</p>
          </div>
        ) : heroSlides.length === 0 ? (
          <div className="text-center py-12 text-[#6B6864] bg-white rounded-2xl border border-[#E8E4DC]">
            No hero slides created yet. Add one to activate the storefront carousel.
          </div>
        ) : (
          heroSlides.map((slide, idx) => (<div key={slide.id} className="bg-white rounded-2xl border border-[#E8E4DC] p-5 shadow-2xs flex flex-col md:flex-row items-center gap-6 group hover:shadow-md transition-shadow">
            {/* Image Preview */}
            <div className="relative w-full md:w-64 aspect-16/9 rounded-xl overflow-hidden border border-[#E8E4DC] shrink-0 bg-[#FAF8F5]">
              <img src={slide.image} alt={slide.title} className="w-full h-full object-cover"/>
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#1A1A1A]/80 text-white font-mono text-[9px] uppercase tracking-wider backdrop-blur-xs">
                Slide #{idx + 1}
              </div>
            </div>

            {/* Slide Information */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-mono font-bold ${slide.isActive ? 'bg-[#4A7A5E]/15 text-[#4A7A5E]' : 'bg-[#6B6864]/15 text-[#6B6864]'}`}>
                  {slide.isActive ? 'Active on Storefront' : 'Draft'}
                </span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#1A1A1A] mt-1.5">
                {slide.title}
              </h3>
              <p className="text-xs text-[#6B6864] mt-1 leading-relaxed">
                {slide.subtitle}
              </p>
              <div className="mt-3 flex items-center gap-3 text-xs">
                <span className="font-medium text-[#1A1A1A] bg-[#FAF8F5] px-2.5 py-1 rounded-lg border border-[#E8E4DC]">
                  Button: "{slide.ctaText}"
                </span>
                <span className="font-mono text-[#A68758]">{slide.ctaLink}</span>
              </div>
            </div>

            {/* Reorder and Edit Actions */}
            <div className="flex md:flex-col items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#F2EFE9] w-full md:w-auto justify-end">
              <div className="flex items-center gap-1">
                <button onClick={() => handleMove(idx, 'up')} disabled={idx === 0} className="p-2 rounded-lg hover:bg-[#FAF8F5] disabled:opacity-30 text-[#1A1A1A]" title="Move slide up">
                  <ArrowUp className="w-4 h-4"/>
                </button>
                <button onClick={() => handleMove(idx, 'down')} disabled={idx === heroSlides.length - 1} className="p-2 rounded-lg hover:bg-[#FAF8F5] disabled:opacity-30 text-[#1A1A1A]" title="Move slide down">
                  <ArrowDown className="w-4 h-4"/>
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button onClick={() => handleEdit(slide)} className="p-2 rounded-lg hover:bg-[#FAF8F5] text-[#1A1A1A]" title="Edit slide">
                  <Edit2 className="w-4 h-4"/>
                </button>
                <button onClick={() => deleteHeroSlide(slide.id)} className="p-2 rounded-lg hover:bg-[#A5432F]/10 text-[#A5432F]" title="Delete slide">
                  <Trash2 className="w-4 h-4"/>
                </button>
              </div>
            </div>
          </div>))
        )}
      </div>

      {/* Add / Edit Slide Modal */}
      {isModalOpen && (<div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white max-w-lg w-full p-6 rounded-2xl border border-[#E8E4DC] shadow-2xl space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">
              {editingId ? 'Edit Hero Slide' : 'Author New Hero Slide'}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider mb-1">
                  Headline Title *
                </label>
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. The Autumn 2026 Collection" className="w-full px-3.5 py-2 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs text-[#1A1A1A] font-semibold"/>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider mb-1">
                  Editorial Subtitle / Inscription
                </label>
                <textarea rows={2} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Hand-woven silk trenches and structured cashmere silhouettes..." className="w-full px-3.5 py-2 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs text-[#1A1A1A]"/>
              </div>

              {/* Hero Image Upload / URL Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider">
                    Hero Editorial Image *
                  </label>
                  <div className="flex items-center gap-1 bg-[#FAF8F5] p-0.5 rounded-lg border border-[#E8E4DC]">
                    <button
                      type="button"
                      onClick={() => setImageSourceMode('upload')}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors flex items-center gap-1 ${imageSourceMode === 'upload' ? 'bg-[#1A1A1A] text-white shadow-2xs' : 'text-[#6B6864] hover:text-[#1A1A1A]'}`}
                    >
                      <UploadCloud className="w-3 h-3" />
                      <span>Upload File</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageSourceMode('url')}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors flex items-center gap-1 ${imageSourceMode === 'url' ? 'bg-[#1A1A1A] text-white shadow-2xs' : 'text-[#6B6864] hover:text-[#1A1A1A]'}`}
                    >
                      <LinkIcon className="w-3 h-3" />
                      <span>Image URL</span>
                    </button>
                  </div>
                </div>

                {image ? (
                  <div className="relative aspect-16/9 rounded-xl overflow-hidden border border-[#E8E4DC] bg-[#FAF8F5] group">
                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (imageSourceMode === 'upload') {
                            fileInputRef.current?.click();
                          } else {
                            setImage('');
                          }
                        }}
                        className="px-3 py-1.5 bg-white/90 hover:bg-white text-[#1A1A1A] rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Change Image</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setImage('')}
                        className="p-1.5 bg-red-500/90 hover:bg-red-500 text-white rounded-lg text-xs shadow-xs transition-colors"
                        title="Remove Image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : imageSourceMode === 'upload' ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#E8E4DC] hover:border-[#C8A87C] bg-[#F8F6F3]/50 hover:bg-[#FAF8F5] rounded-2xl p-6 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-2"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#E8E4DC] flex items-center justify-center text-[#A68758]">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-[#1A1A1A]">Click to select an image</span>
                      <p className="text-[11px] text-[#6B6864] mt-0.5">PNG, JPG, WEBP or GIF up to 10MB (Base64 file stream)</p>
                    </div>
                  </div>
                ) : (
                  <input
                    type="url"
                    required
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-3.5 py-2 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs text-[#1A1A1A]"
                  />
                )}

                {/* Hidden File Input for Base64 File Reading */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider mb-1">
                    Button Label
                  </label>
                  <input type="text" value={ctaText} onChange={(e) => setCtaText(e.target.value)} className="w-full px-3 py-2 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs text-[#1A1A1A]"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider mb-1">
                    Button Destination
                  </label>
                  <input type="text" value={ctaLink} onChange={(e) => setCtaLink(e.target.value)} className="w-full px-3 py-2 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs font-mono text-[#1A1A1A]"/>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="isActiveSlide" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded text-[#C8A87C] focus:ring-[#C8A87C]"/>
                <label htmlFor="isActiveSlide" className="text-xs font-semibold text-[#1A1A1A]">
                  Display Live in Storefront Hero Carousel
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#F2EFE9]">
              <button type="button" onClick={resetForm} className="px-4 py-2 rounded-xl text-xs text-[#6B6864] hover:bg-[#F2EFE9]">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-[#1A1A1A] text-white text-xs font-semibold rounded-xl hover:bg-[#333333]">
                Save Slide
              </button>
            </div>
          </form>
        </div>)}
    </div>);
};
export default HeroCarouselEditor;
