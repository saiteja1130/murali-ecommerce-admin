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
  const [ctaText, setCtaText] = useState('Shop Collection');
  const [ctaLink, setCtaLink] = useState('/products');
  const [image, setImage] = useState('');
  const [imageSourceMode, setImageSourceMode] = useState('upload'); // 'upload' | 'url'
  const [isActive, setIsActive] = useState(true);
  const fileInputRef = useRef(null);

  const resetForm = () => {
    setTitle('');
    setSubtitle('');
    setCtaText('Shop Collection');
    setCtaLink('/products');
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
    if (!title.trim() || !image.trim()) return;

    if (editingId) {
      updateHeroSlide(editingId, {
        title,
        subtitle,
        ctaText,
        ctaLink,
        image,
        isActive,
      });
    } else {
      addHeroSlide({
        title,
        subtitle,
        ctaText,
        ctaLink,
        image,
        isActive,
        order: heroSlides.length + 1,
      });
    }
    resetForm();
  };

  const handleMove = (index, direction) => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= heroSlides.length) return;
    const reordered = [...heroSlides];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIdx, 0, moved);
    reorderHeroSlides(reordered);
  };

  return (
    <div className="space-y-6 pb-12 text-[#1D241C]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E4DC]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-3xl font-bold text-[#1D241C]">
              Homepage Hero Banners
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono tracking-widest bg-[#506040]/15 text-[#506040] font-bold">
              {heroSlides.length} Slides
            </span>
          </div>
          <p className="text-xs text-[#687163] mt-1">
            Upload banner images, set headlines, subtitles, and button links for your homepage carousel.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-[#1D241C] hover:bg-[#C69E58] text-white hover:text-[#1D241C] text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Banner Slide</span>
        </button>
      </div>

      {/* Hero Slides List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-[#506040]">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p>Loading banner slides...</p>
          </div>
        ) : heroSlides.length === 0 ? (
          <div className="text-center py-12 text-[#687163] bg-white rounded-2xl border border-[#E8E4DC]">
            No banner slides created yet. Add one to activate your storefront carousel.
          </div>
        ) : (
          heroSlides.map((slide, idx) => (
            <div
              key={slide.id}
              className="bg-white rounded-2xl border border-[#E8E4DC] p-5 shadow-2xs flex flex-col md:flex-row items-center gap-6 group hover:shadow-md transition-shadow"
            >
              {/* Image Preview */}
              <div className="relative w-full md:w-64 aspect-16/9 rounded-xl overflow-hidden border border-[#E8E4DC] shrink-0 bg-[#FAF8F5]">
                <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#1D241C]/80 text-white font-mono text-[9px] uppercase tracking-wider backdrop-blur-xs">
                  Slide #{idx + 1}
                </div>
              </div>

              {/* Slide Information */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] uppercase font-mono font-bold ${
                      slide.isActive
                        ? 'bg-[#506040]/15 text-[#506040]'
                        : 'bg-[#687163]/15 text-[#687163]'
                    }`}
                  >
                    {slide.isActive ? 'Active on Storefront' : 'Draft'}
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#1D241C] mt-1.5">
                  {slide.title}
                </h3>
                <p className="text-xs text-[#687163] mt-1 leading-relaxed">
                  {slide.subtitle}
                </p>
                <div className="mt-3 flex items-center gap-3 text-xs">
                  <span className="font-medium text-[#1D241C] bg-[#FAF8F5] px-2.5 py-1 rounded-lg border border-[#E8E4DC]">
                    Button: "{slide.ctaText}"
                  </span>
                  <span className="font-mono text-[#506040]">{slide.ctaLink}</span>
                </div>
              </div>

              {/* Reorder and Edit Actions */}
              <div className="flex md:flex-col items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#E8E4DC] w-full md:w-auto justify-end">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMove(idx, 'up')}
                    disabled={idx === 0}
                    className="p-2 rounded-lg hover:bg-[#FAF8F5] disabled:opacity-30 text-[#1D241C] cursor-pointer"
                    title="Move slide up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMove(idx, 'down')}
                    disabled={idx === heroSlides.length - 1}
                    className="p-2 rounded-lg hover:bg-[#FAF8F5] disabled:opacity-30 text-[#1D241C] cursor-pointer"
                    title="Move slide down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(slide)}
                    className="p-2 rounded-lg hover:bg-[#FAF8F5] text-[#1D241C] cursor-pointer"
                    title="Edit slide"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteHeroSlide(slide.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-700 cursor-pointer"
                    title="Delete slide"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Slide Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white max-w-lg w-full p-6 rounded-2xl border border-[#E8E4DC] shadow-2xl space-y-4"
          >
            <h3 className="font-serif text-xl font-bold text-[#1D241C]">
              {editingId ? 'Edit Banner Slide' : 'Add New Banner Slide'}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#1D241C] uppercase tracking-wider mb-1">
                  Main Headline Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Elegant Hair Clips & Accessories"
                  className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs text-[#1D241C] font-semibold focus:outline-none focus:border-[#C69E58]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1D241C] uppercase tracking-wider mb-1">
                  Subtitle / Description
                </label>
                <textarea
                  rows={2}
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Describe the collection or special offer..."
                  className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs text-[#1D241C] focus:outline-none focus:border-[#C69E58]"
                />
              </div>

              {/* Hero Image Upload / URL Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-[#1D241C] uppercase tracking-wider">
                    Banner Image *
                  </label>
                  <div className="flex items-center gap-1 bg-[#FAF8F5] p-0.5 rounded-lg border border-[#E8E4DC]">
                    <button
                      type="button"
                      onClick={() => setImageSourceMode('upload')}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                        imageSourceMode === 'upload'
                          ? 'bg-[#1D241C] text-white shadow-2xs'
                          : 'text-[#687163] hover:text-[#1D241C]'
                      }`}
                    >
                      <UploadCloud className="w-3 h-3" />
                      <span>Upload File</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageSourceMode('url')}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                        imageSourceMode === 'url'
                          ? 'bg-[#1D241C] text-white shadow-2xs'
                          : 'text-[#687163] hover:text-[#1D241C]'
                      }`}
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
                        className="px-3 py-1.5 bg-white/90 hover:bg-white text-[#1D241C] rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Change Image</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setImage('')}
                        className="p-1.5 bg-red-600 text-white rounded-lg text-xs shadow-xs transition-colors cursor-pointer"
                        title="Remove Image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : imageSourceMode === 'upload' ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#E8E4DC] hover:border-[#C69E58] bg-[#FAF8F5]/50 hover:bg-[#FAF8F5] rounded-2xl p-6 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-2"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#E8E4DC] flex items-center justify-center text-[#506040]">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-[#1D241C]">Click to choose a banner image</span>
                      <p className="text-[11px] text-[#687163] mt-0.5">PNG, JPG, WEBP up to 10MB</p>
                    </div>
                  </div>
                ) : (
                  <input
                    type="url"
                    required
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs text-[#1D241C] focus:outline-none focus:border-[#C69E58]"
                  />
                )}

                {/* Hidden File Input */}
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
                  <label className="block text-xs font-semibold text-[#1D241C] uppercase tracking-wider mb-1">
                    Button Label
                  </label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs text-[#1D241C] focus:outline-none focus:border-[#C69E58]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1D241C] uppercase tracking-wider mb-1">
                    Button Link
                  </label>
                  <input
                    type="text"
                    value={ctaLink}
                    onChange={(e) => setCtaLink(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs font-mono text-[#1D241C] focus:outline-none focus:border-[#C69E58]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveSlide"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-[#506040] focus:ring-[#506040]"
                />
                <label htmlFor="isActiveSlide" className="text-xs font-semibold text-[#1D241C]">
                  Show Live on Storefront
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E8E4DC]">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-xl text-xs text-[#687163] hover:bg-[#FAF8F5] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#1D241C] hover:bg-[#C69E58] text-white hover:text-[#1D241C] text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Save Slide
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default HeroCarouselEditor;
