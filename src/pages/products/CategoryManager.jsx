import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useCategory } from '../../context/CategoryContext';
import ConfirmModal from '../../components/ConfirmModal';
import {
  Plus,
  Edit2,
  Trash2,
  Layers,
  FolderTree,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronRight,
  Upload,
} from 'lucide-react';

export const CategoryManager = () => {
  const { showToast } = useAdmin();
  const {
    mainCategories,
    categories,
    addMainCategory,
    updateMainCategory,
    deleteMainCategory,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useCategory();

  const [activeTab, setActiveTab] = useState('subcategories'); // 'main' | 'subcategories'
  const [selectedMainCatFilter, setSelectedMainCatFilter] = useState('all');

  // Modal / Form state for Main Category
  const [isMainModalOpen, setIsMainModalOpen] = useState(false);
  const [editingMainId, setEditingMainId] = useState(null);
  const [mainName, setMainName] = useState('');
  const [mainSlug, setMainSlug] = useState('');
  const [mainDescription, setMainDescription] = useState('');
  const [mainImage, setMainImage] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState('');
  const [mainIsActive, setMainIsActive] = useState(true);

  // Modal / Form state for Subcategory
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [editingSubId, setEditingSubId] = useState(null);
  const [subParentMainCat, setSubParentMainCat] = useState('');
  const [subName, setSubName] = useState('');
  const [subSlug, setSubSlug] = useState('');
  const [subDescription, setSubDescription] = useState('');
  const [subImage, setSubImage] = useState(null);
  const [subImagePreview, setSubImagePreview] = useState('');
  const [subIsFeatured, setSubIsFeatured] = useState(true);

  // Confirm delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'main' | 'sub', item: object }
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Main Category Form Handlers ---
  const openAddMainCategory = () => {
    setEditingMainId(null);
    setMainName('');
    setMainSlug('');
    setMainDescription('');
    setMainImage(null);
    setMainImagePreview('');
    setMainIsActive(true);
    setIsMainModalOpen(true);
  };

  const openEditMainCategory = (mCat) => {
    setEditingMainId(mCat.id || mCat._id);
    setMainName(mCat.name);
    setMainSlug(mCat.slug);
    setMainDescription(mCat.description || '');
    setMainImage(mCat.image || '');
    setMainImagePreview(mCat.image || '');
    setMainIsActive(mCat.isActive !== false);
    setIsMainModalOpen(true);
  };

  const handleMainSubmit = async (e) => {
    e.preventDefault();
    if (!mainName.trim()) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('name', mainName.trim());
    formData.append('slug', mainSlug || mainName.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    formData.append('description', mainDescription);
    formData.append('isActive', mainIsActive);

    if (mainImage instanceof File) {
      formData.append('image', mainImage);
    } else if (typeof mainImage === 'string') {
      formData.append('image', mainImage);
    }

    let success = false;
    if (editingMainId) {
      success = await updateMainCategory(editingMainId, formData);
    } else {
      formData.append('order', mainCategories.length + 1);
      success = await addMainCategory(formData);
    }

    setIsSubmitting(false);
    if (success) {
      setIsMainModalOpen(false);
    }
  };

  // --- Subcategory Form Handlers ---
  const openAddSubcategory = () => {
    setEditingSubId(null);
    setSubParentMainCat(mainCategories[0]?.id || mainCategories[0]?._id || '');
    setSubName('');
    setSubSlug('');
    setSubDescription('');
    setSubImage(null);
    setSubImagePreview('');
    setSubIsFeatured(true);
    setIsSubModalOpen(true);
  };

  const openEditSubcategory = (subCat) => {
    setEditingSubId(subCat.id || subCat._id);
    setSubParentMainCat(
      subCat.mainCategory?._id || subCat.mainCategory?.id || subCat.mainCategory || mainCategories[0]?.id || ''
    );
    setSubName(subCat.name);
    setSubSlug(subCat.slug);
    setSubDescription(subCat.description || '');
    setSubImage(subCat.image || '');
    setSubImagePreview(subCat.image || '');
    setSubIsFeatured(subCat.isFeatured !== false);
    setIsSubModalOpen(true);
  };

  const handleSubSubmit = async (e) => {
    e.preventDefault();
    if (!subName.trim()) return;
    if (!subParentMainCat) {
      showToast('danger', 'Validation Error', 'Please select a parent main category');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('name', subName.trim());
    formData.append('slug', subSlug || subName.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    formData.append('mainCategory', subParentMainCat);
    formData.append('description', subDescription);
    formData.append('isFeatured', subIsFeatured);

    if (subImage instanceof File) {
      formData.append('image', subImage);
    } else if (typeof subImage === 'string') {
      formData.append('image', subImage);
    }

    let success = false;
    if (editingSubId) {
      success = await updateCategory(editingSubId, formData);
    } else {
      formData.append('order', categories.length + 1);
      success = await addCategory(formData);
    }

    setIsSubmitting(false);
    if (success) {
      setIsSubModalOpen(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'main') {
      await deleteMainCategory(deleteTarget.item.id || deleteTarget.item._id);
    } else {
      await deleteCategory(deleteTarget.item.id || deleteTarget.item._id);
    }
    setDeleteTarget(null);
  };

  // Filtered subcategories
  const filteredSubcategories = categories.filter((cat) => {
    if (selectedMainCatFilter === 'all') return true;
    const catMainId = cat.mainCategory?._id || cat.mainCategory?.id || cat.mainCategory;
    const catMainSlug = cat.mainCategory?.slug || '';
    return catMainId === selectedMainCatFilter || catMainSlug.toLowerCase() === selectedMainCatFilter.toLowerCase();
  });

  const getParentMainName = (cat) => {
    if (cat.mainCategory && typeof cat.mainCategory === 'object') {
      return cat.mainCategory.name;
    }
    const found = mainCategories.find(
      (m) => (m.id || m._id) === cat.mainCategory || m.slug === cat.mainCategory
    );
    return found ? found.name : '—';
  };

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/uploads')) return `http://localhost:5000${url}`;
    return url;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E4DC]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-3xl font-bold text-[#1A1A1A]">
              Category & Department Architecture
            </h1>
          </div>
          <p className="text-xs text-[#6B6864] mt-1">
            Manage top-level departments (e.g. Women, Kids) and hierarchical subcategories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'main' ? (
            <button
              onClick={openAddMainCategory}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#C8A87C]" />
              <span>Add Main Category</span>
            </button>
          ) : (
            <button
              onClick={openAddSubcategory}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#C8A87C]" />
              <span>Add Subcategory</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-[#E8E4DC] gap-4">
        <button
          onClick={() => setActiveTab('subcategories')}
          className={`flex items-center gap-2 pb-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'subcategories'
              ? 'border-[#1A1A1A] text-[#1A1A1A]'
              : 'border-transparent text-[#6B6864] hover:text-[#1A1A1A]'
          }`}
        >
          <FolderTree className="w-4 h-4 text-[#C8A87C]" />
          <span>Subcategories ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('main')}
          className={`flex items-center gap-2 pb-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'main'
              ? 'border-[#1A1A1A] text-[#1A1A1A]'
              : 'border-transparent text-[#6B6864] hover:text-[#1A1A1A]'
          }`}
        >
          <Layers className="w-4 h-4 text-[#C8A87C]" />
          <span>Main Categories / Departments ({mainCategories.length})</span>
        </button>
      </div>

      {/* TAB 1: MAIN CATEGORIES */}
      {activeTab === 'main' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E8E4DC] rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#1A1A1A]">
                <thead className="bg-[#FAF8F5] text-[#6B6864] uppercase font-mono tracking-wider text-[10px] border-b border-[#E8E4DC]">
                  <tr>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Slug</th>
                    <th className="py-3 px-4">Subcategories</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E4DC]">
                  {mainCategories.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[#6B6864]">
                        No main categories created yet. Click "Add Main Category" to get started.
                      </td>
                    </tr>
                  ) : (
                    mainCategories.map((mCat) => {
                      const count = categories.filter((c) => {
                        const mId = c.mainCategory?._id || c.mainCategory?.id || c.mainCategory;
                        return mId === (mCat.id || mCat._id) || c.mainCategory?.slug === mCat.slug;
                      }).length;

                      return (
                        <tr key={mCat.id || mCat._id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {mCat.image ? (
                                <img
                                  src={getImageUrl(mCat.image)}
                                  alt={mCat.name}
                                  className="w-10 h-10 rounded-lg object-cover border border-[#E8E4DC]"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-[#FAF8F5] border border-[#E8E4DC] flex items-center justify-center text-[#A68758]">
                                  <Layers className="w-5 h-5" />
                                </div>
                              )}
                              <div>
                                <span className="font-serif font-bold text-sm text-[#1A1A1A] block">
                                  {mCat.name}
                                </span>
                                {mCat.description && (
                                  <span className="text-[11px] text-[#6B6864] line-clamp-1">
                                    {mCat.description}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-[#6B6864]">
                            {mCat.slug}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FAF8F5] border border-[#E8E4DC] text-[#1A1A1A]">
                              {count} subcategories
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {mCat.isActive !== false ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3" /> Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
                                <XCircle className="w-3 h-3" /> Inactive
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditMainCategory(mCat)}
                                className="p-1.5 hover:bg-[#FAF8F5] text-[#6B6864] hover:text-[#1A1A1A] rounded-lg transition-colors cursor-pointer"
                                title="Edit Main Category"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteTarget({ type: 'main', item: mCat })}
                                className="p-1.5 hover:bg-rose-50 text-[#6B6864] hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                                title="Delete Main Category"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SUBCATEGORIES */}
      {activeTab === 'subcategories' && (
        <div className="space-y-4">
          {/* Main Category Filter Bar */}
          <div className="flex items-center justify-between flex-wrap gap-3 bg-white p-3.5 border border-[#E8E4DC] rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6B6864]">
                Filter Department:
              </span>
              <select
                value={selectedMainCatFilter}
                onChange={(e) => setSelectedMainCatFilter(e.target.value)}
                className="text-xs font-medium bg-[#FAF8F5] border border-[#E8E4DC] rounded-lg px-3 py-1.5 text-[#1A1A1A] focus:outline-none focus:border-[#C8A87C]"
              >
                <option value="all">All Departments ({categories.length})</option>
                {mainCategories.map((m) => (
                  <option key={m.id || m._id} value={m.id || m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-xs font-mono text-[#6B6864]">
              Showing {filteredSubcategories.length} of {categories.length} subcategories
            </span>
          </div>

          <div className="bg-white border border-[#E8E4DC] rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#1A1A1A]">
                <thead className="bg-[#FAF8F5] text-[#6B6864] uppercase font-mono tracking-wider text-[10px] border-b border-[#E8E4DC]">
                  <tr>
                    <th className="py-3 px-4">Subcategory</th>
                    <th className="py-3 px-4">Parent Department</th>
                    <th className="py-3 px-4">Slug</th>
                    <th className="py-3 px-4">Featured</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E4DC]">
                  {filteredSubcategories.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[#6B6864]">
                        No subcategories found. Click "Add Subcategory" to create one.
                      </td>
                    </tr>
                  ) : (
                    filteredSubcategories.map((subCat) => (
                      <tr key={subCat.id || subCat._id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {subCat.image ? (
                              <img
                                src={getImageUrl(subCat.image)}
                                alt={subCat.name}
                                className="w-10 h-10 rounded-lg object-cover border border-[#E8E4DC]"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-[#FAF8F5] border border-[#E8E4DC] flex items-center justify-center text-[#A68758]">
                                <FolderTree className="w-5 h-5" />
                              </div>
                            )}
                            <div>
                              <span className="font-semibold text-sm text-[#1A1A1A] block">
                                {subCat.name}
                              </span>
                              {subCat.description && (
                                <span className="text-[11px] text-[#6B6864] line-clamp-1">
                                  {subCat.description}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#FAF8F5] border border-[#E8E4DC] text-[#1A1A1A]">
                            <Layers className="w-3.5 h-3.5 text-[#C8A87C]" />
                            {getParentMainName(subCat)}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-[#6B6864]">
                          {subCat.slug}
                        </td>
                        <td className="py-3 px-4">
                          {subCat.isFeatured !== false ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> Yes
                            </span>
                          ) : (
                            <span className="text-neutral-400 text-xs">No</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditSubcategory(subCat)}
                              className="p-1.5 hover:bg-[#FAF8F5] text-[#6B6864] hover:text-[#1A1A1A] rounded-lg transition-colors cursor-pointer"
                              title="Edit Subcategory"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget({ type: 'sub', item: subCat })}
                              className="p-1.5 hover:bg-rose-50 text-[#6B6864] hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                              title="Delete Subcategory"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: CREATE / EDIT MAIN CATEGORY --- */}
      {isMainModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-[#E8E4DC] max-w-lg w-full p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DC]">
              <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">
                {editingMainId ? 'Edit Main Category / Department' : 'Create Main Category / Department'}
              </h3>
              <button
                onClick={() => setIsMainModalOpen(false)}
                className="text-[#6B6864] hover:text-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleMainSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] mb-1">
                  Department Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Women, Kids, Men"
                  value={mainName}
                  onChange={(e) => {
                    setMainName(e.target.value);
                    if (!editingMainId) {
                      setMainSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }
                  }}
                  className="w-full text-xs bg-[#FAF8F5] border border-[#E8E4DC] rounded-lg px-3 py-2 text-[#1A1A1A] focus:outline-none focus:border-[#C8A87C]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] mb-1">
                  Slug (URL Key) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. women, kids"
                  value={mainSlug}
                  onChange={(e) => setMainSlug(e.target.value)}
                  className="w-full text-xs font-mono bg-[#FAF8F5] border border-[#E8E4DC] rounded-lg px-3 py-2 text-[#1A1A1A] focus:outline-none focus:border-[#C8A87C]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Short summary for banners and SEO..."
                  value={mainDescription}
                  onChange={(e) => setMainDescription(e.target.value)}
                  className="w-full text-xs bg-[#FAF8F5] border border-[#E8E4DC] rounded-lg px-3 py-2 text-[#1A1A1A] focus:outline-none focus:border-[#C8A87C]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] mb-1">
                  Image Upload or URL
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-3 py-2 bg-[#FAF8F5] border border-[#E8E4DC] rounded-lg text-xs font-semibold text-[#1A1A1A] hover:border-[#C8A87C] cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-[#C8A87C]" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setMainImage(file);
                          setMainImagePreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </label>
                  {mainImagePreview && (
                    <img
                      src={getImageUrl(mainImagePreview)}
                      alt="Preview"
                      className="w-10 h-10 rounded-lg object-cover border border-[#E8E4DC]"
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="mainActiveCheck"
                  checked={mainIsActive}
                  onChange={(e) => setMainIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-[#1A1A1A] accent-[#1A1A1A]"
                />
                <label htmlFor="mainActiveCheck" className="text-xs font-semibold text-[#1A1A1A] cursor-pointer">
                  Active (Visible in Storefront navigation)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E8E4DC]">
                <button
                  type="button"
                  onClick={() => setIsMainModalOpen(false)}
                  className="px-4 py-2 border border-[#E8E4DC] text-xs font-semibold text-[#6B6864] rounded-lg hover:bg-[#FAF8F5] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-black transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingMainId ? 'Update Department' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: CREATE / EDIT SUBCATEGORY --- */}
      {isSubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-[#E8E4DC] max-w-lg w-full p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DC]">
              <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">
                {editingSubId ? 'Edit Subcategory' : 'Create Subcategory'}
              </h3>
              <button
                onClick={() => setIsSubModalOpen(false)}
                className="text-[#6B6864] hover:text-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] mb-1">
                  Parent Main Category *
                </label>
                <select
                  required
                  value={subParentMainCat}
                  onChange={(e) => setSubParentMainCat(e.target.value)}
                  className="w-full text-xs font-medium bg-[#FAF8F5] border border-[#E8E4DC] rounded-lg px-3 py-2 text-[#1A1A1A] focus:outline-none focus:border-[#C8A87C]"
                >
                  <option value="" disabled>
                    Select parent department
                  </option>
                  {mainCategories.map((m) => (
                    <option key={m.id || m._id} value={m.id || m._id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] mb-1">
                  Subcategory Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jewelry, Girls Dresses, Footwear"
                  value={subName}
                  onChange={(e) => {
                    setSubName(e.target.value);
                    if (!editingSubId) {
                      setSubSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }
                  }}
                  className="w-full text-xs bg-[#FAF8F5] border border-[#E8E4DC] rounded-lg px-3 py-2 text-[#1A1A1A] focus:outline-none focus:border-[#C8A87C]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] mb-1">
                  Slug (URL Key) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. jewelry, girls-dresses"
                  value={subSlug}
                  onChange={(e) => setSubSlug(e.target.value)}
                  className="w-full text-xs font-mono bg-[#FAF8F5] border border-[#E8E4DC] rounded-lg px-3 py-2 text-[#1A1A1A] focus:outline-none focus:border-[#C8A87C]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Short description..."
                  value={subDescription}
                  onChange={(e) => setSubDescription(e.target.value)}
                  className="w-full text-xs bg-[#FAF8F5] border border-[#E8E4DC] rounded-lg px-3 py-2 text-[#1A1A1A] focus:outline-none focus:border-[#C8A87C]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] mb-1">
                  Image Upload or URL
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-3 py-2 bg-[#FAF8F5] border border-[#E8E4DC] rounded-lg text-xs font-semibold text-[#1A1A1A] hover:border-[#C8A87C] cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-[#C8A87C]" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setSubImage(file);
                          setSubImagePreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </label>
                  {subImagePreview && (
                    <img
                      src={getImageUrl(subImagePreview)}
                      alt="Preview"
                      className="w-10 h-10 rounded-lg object-cover border border-[#E8E4DC]"
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="subFeaturedCheck"
                  checked={subIsFeatured}
                  onChange={(e) => setSubIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-[#1A1A1A] accent-[#1A1A1A]"
                />
                <label htmlFor="subFeaturedCheck" className="text-xs font-semibold text-[#1A1A1A] cursor-pointer">
                  Featured (Show in featured categories list)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E8E4DC]">
                <button
                  type="button"
                  onClick={() => setIsSubModalOpen(false)}
                  className="px-4 py-2 border border-[#E8E4DC] text-xs font-semibold text-[#6B6864] rounded-lg hover:bg-[#FAF8F5] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#1A1A1A] text-white text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-black transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingSubId ? 'Update Subcategory' : 'Create Subcategory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CONFIRM DELETE MODAL --- */}
      {deleteTarget && (
        <ConfirmModal
          isOpen={!!deleteTarget}
          title={`Delete ${deleteTarget.type === 'main' ? 'Main Category' : 'Subcategory'}`}
          message={`Are you sure you want to delete "${deleteTarget.item.name}"? This action cannot be undone.`}
          confirmText="Delete Permanently"
          confirmType="danger"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};
export default CategoryManager;
