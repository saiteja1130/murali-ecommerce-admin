import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useCategory } from '../../context/CategoryContext';
import ConfirmModal from '../../components/ConfirmModal';
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, Sparkles } from 'lucide-react';
export const CategoryManager = () => {
  const { showToast } = useAdmin();
  const { categories, addCategory, updateCategory, deleteCategory } = useCategory();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null); // Now stores File object or existing string URL
  const [imagePreview, setImagePreview] = useState('');
  const [isFeatured, setIsFeatured] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
    setSlug('');
    setDescription('');
    setImage(null);
    setImagePreview('');
    setIsFeatured(true);
    setIsAdding(false);
    setEditingId(null);
  };
  const handleEdit = (cat) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description);
    setImage(cat.image); // This is a URL string
    setImagePreview(cat.image);
    setIsFeatured(cat.isFeatured);
    setIsAdding(true);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim())
      return;
    
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('slug', slug || name.toLowerCase().replace(/ /g, '-'));
    formData.append('description', description);
    formData.append('isFeatured', isFeatured);
    
    if (image instanceof File) {
      formData.append('image', image);
    } else if (image) {
      formData.append('image', image); // string url
    }

    let success = false;
    if (editingId) {
      success = await updateCategory(editingId, formData);
    }
    else {
      formData.append('order', categories.length + 1);
      success = await addCategory(formData);
    }
    
    setIsSubmitting(false);
    
    if (success) {
      resetForm();
    }
  };
  const handleMove = (index, direction) => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= categories.length)
      return;
    const currentCat = categories[index];
    const targetCat = categories[targetIdx];
    updateCategory(currentCat.id, { order: targetCat.order });
    updateCategory(targetCat.id, { order: currentCat.order });
    showToast('info', 'Reordered', `Moved "${currentCat.name}" ${direction}.`);
  };
  return (<div className="space-y-6">
    {/* Header */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E4DC]">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="font-serif text-3xl font-bold text-[#1A1A1A]">
            Categories
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono tracking-widest bg-[#C8A87C]/15 text-[#A68758] font-bold">
            {categories.length} Departments
          </span>
        </div>
        <p className="text-xs text-[#6B6864] mt-1">
          Organize customer navigation, editorial banners, and collection hierarchy.
        </p>
      </div>

      <button onClick={() => {
        resetForm();
        setIsAdding(true);
      }} className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-sm">
        <Plus className="w-3.5 h-3.5 text-[#C8A87C]" />
        <span>Add Department</span>
      </button>
    </div>

    {/* Add / Edit Drawer Modal Form */}
    {isAdding && (<form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-[#C8A87C]/40 shadow-md space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between border-b border-[#F2EFE9] pb-3">
        <h2 className="font-serif text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#C8A87C]" />
          <span>{editingId ? 'Edit Department' : 'Create Department'}</span>
        </h2>
        <button type="button" onClick={resetForm} className="text-xs text-[#6B6864] hover:text-[#1A1A1A]">
          Cancel
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider mb-1">
            Category Name *
          </label>
          <input type="text" required value={name} onChange={(e) => {
            setName(e.target.value);
            if (!editingId)
              setSlug(e.target.value.toLowerCase().replace(/ /g, '-'));
          }} placeholder="e.g. Haute Joaillerie & Objects" className="w-full px-3.5 py-2 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs text-[#1A1A1A] font-medium focus:outline-none focus:border-[#C8A87C]" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider mb-1">
            URL Slug
          </label>
          <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="haute-joaillerie" className="w-full px-3.5 py-2 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs font-mono text-[#6B6864]" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider mb-1">
          Editorial Showcase Description
        </label>
        <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short curation summary shown on header banners..." className="w-full px-3.5 py-2 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs text-[#1A1A1A] focus:outline-none focus:border-[#C8A87C]" />
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider mb-1">
          Banner Photography Image
        </label>
        <div className="flex items-center gap-4">
          <input 
            type="file" 
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                setImage(file);
                setImagePreview(URL.createObjectURL(file));
              }
            }} 
            className="w-full px-3.5 py-2 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs text-[#1A1A1A]" 
          />
          {imagePreview && (
            <img src={imagePreview} alt="Preview" className="w-10 h-10 object-cover rounded-md border border-[#E8E4DC]" />
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <input type="checkbox" id="isFeaturedCat" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="rounded text-[#C8A87C] focus:ring-[#C8A87C]" />
        <label htmlFor="isFeaturedCat" className="text-xs text-[#1A1A1A] font-medium">
          Feature in Storefront Main Navigation Dropdown
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t border-[#F2EFE9]">
        <button type="button" onClick={resetForm} disabled={isSubmitting} className="px-4 py-2 rounded-xl text-xs text-[#6B6864] hover:bg-[#F2EFE9] disabled:opacity-50">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-[#1A1A1A] text-white text-xs font-semibold rounded-xl hover:bg-[#333333] transition-colors disabled:opacity-50 flex items-center gap-2">
          {isSubmitting ? 'Saving...' : 'Save Department'}
        </button>
      </div>
    </form>)}

    {/* Category List */}
    {categories.length === 0 ? (
      <div className="bg-white border border-[#E8E4DC] border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center">
        <Sparkles className="w-8 h-8 text-[#C8A87C] mb-3 opacity-50" />
        <h3 className="font-serif text-lg font-bold text-[#1A1A1A] mb-1">No Departments Found</h3>
        <p className="text-xs text-[#6B6864] mb-4 max-w-md">You haven't created any categories yet. Create your first department to start organizing your catalog.</p>
        <button onClick={() => { resetForm(); setIsAdding(true); }} className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs font-semibold rounded-xl transition-colors">
          Create Department
        </button>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat, idx) => {
        const imgSource = cat.image || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800';

        return (<div key={cat.id} className="bg-white rounded-2xl border border-[#E8E4DC] p-4 shadow-2xs flex flex-col justify-between hover:shadow-md transition-shadow group">
        <div className="flex gap-4">
          <img src={imgSource} alt={cat.name} className="w-24 h-24 rounded-xl object-cover border border-[#E8E4DC] shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-serif text-lg font-bold text-[#1A1A1A] leading-tight">
                {cat.name}
              </h3>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#E8E4DC] text-[#6B6864] shrink-0">
                Order #{idx + 1}
              </span>
            </div>
            <p className="text-xs text-[#6B6864] mt-1 line-clamp-2 leading-relaxed">
              {cat.description}
            </p>
            <div className="text-[11px] font-mono text-[#A68758] mt-2">
              /{cat.slug}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#F2EFE9] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-[#6B6864]">
            <button onClick={() => handleMove(idx, 'up')} disabled={idx === 0} className="p-1 rounded hover:bg-[#F2EFE9] disabled:opacity-30" title="Move up">
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => handleMove(idx, 'down')} disabled={idx === categories.length - 1} className="p-1 rounded hover:bg-[#F2EFE9] disabled:opacity-30" title="Move down">
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] ml-2 font-medium text-[#1A1A1A]">
              {cat.itemCount} Garments linked
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => handleEdit(cat)} className="p-1.5 rounded-lg hover:bg-[#FAF8F5] text-[#1A1A1A]" title="Edit category">
              <Edit2 className="w-4 h-4" />
            </button>
            <button onClick={() => setCategoryToDelete(cat)} className="p-1.5 rounded-lg hover:bg-[#A5432F]/10 text-[#A5432F]" title="Delete category">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>);
      })}
    </div>
    )}

    {/* Delete Confirmation Modal */}
    <ConfirmModal 
      isOpen={!!categoryToDelete}
      onClose={() => setCategoryToDelete(null)}
      onConfirm={() => {
        if (categoryToDelete) {
          deleteCategory(categoryToDelete.id);
          setCategoryToDelete(null);
        }
      }}
      title="Delete Department"
      message={`Are you sure you want to permanently delete the department "${categoryToDelete?.name}"? This action cannot be undone and may affect products linked to it.`}
      confirmText="Yes, Delete"
    />
  </div>);
};
export default CategoryManager;
