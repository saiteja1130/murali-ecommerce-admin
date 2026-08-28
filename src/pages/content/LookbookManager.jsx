import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Plus, Trash2, Edit2, Heart } from 'lucide-react';
export const LookbookManager = () => {
    const { lookbooks, addLookbook, updateLookbook, deleteLookbook, products, showToast } = useAdmin();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [title, setTitle] = useState('');
    const [season, setSeason] = useState('Autumn / Winter 2026');
    const [photographer, setPhotographer] = useState('Hélène Desrosiers, Paris');
    const [image, setImage] = useState('');
    const [description, setDescription] = useState('');
    const resetForm = () => {
        setTitle('');
        setSeason('Autumn / Winter 2026');
        setPhotographer('Hélène Desrosiers, Paris');
        setImage('');
        setDescription('');
        setEditingId(null);
        setIsModalOpen(false);
    };
    const handleEdit = (entry) => {
        setEditingId(entry.id);
        setTitle(entry.title);
        setSeason(entry.season);
        setPhotographer(entry.photographer);
        setImage(entry.image);
        setDescription(entry.description);
        setIsModalOpen(true);
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim() || !image.trim())
            return;
        if (editingId) {
            updateLookbook(editingId, {
                title,
                season,
                photographer,
                image,
                description,
            });
        }
        else {
            addLookbook({
                title,
                season,
                photographer,
                image,
                description,
                linkedProducts: [products[0]?.id || 'p-1'],
                likes: 120,
            });
        }
        resetForm();
    };
    return (<div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E4DC]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-3xl font-bold text-[#1A1A1A]">
              Editorial Lookbook & Runway Archives
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono tracking-widest bg-[#C8A87C]/15 text-[#A68758] font-bold">
              {lookbooks.length} Editorial Stories
            </span>
          </div>
          <p className="text-xs text-[#6B6864] mt-1">
            Curate high-fashion campaigns, photography credits, seasonal themes, and linked runway garments.
          </p>
        </div>

        <button onClick={() => {
            resetForm();
            setIsModalOpen(true);
        }} className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-sm">
          <Plus className="w-3.5 h-3.5 text-[#C8A87C]"/>
          <span>New Lookbook Entry</span>
        </button>
      </div>

      {/* Lookbook Entries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lookbooks.map((entry) => (<div key={entry.id} className="bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden shadow-2xs group hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="relative aspect-4/5 overflow-hidden bg-[#FAF8F5]">
              <img src={entry.image} alt={entry.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#1A1A1A]/80 text-[#C8A87C] font-mono text-[10px] uppercase tracking-wider backdrop-blur-xs">
                {entry.season}
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">
                  {entry.title}
                </h3>
                <p className="text-xs text-[#6B6864] mt-1 line-clamp-2 leading-relaxed">
                  {entry.description}
                </p>
                <div className="text-[11px] text-[#A68758] italic font-serif mt-2">
                  Photo: {entry.photographer}
                </div>
              </div>

              <div className="pt-3 border-t border-[#F2EFE9] flex items-center justify-between text-xs">
                <span className="font-mono text-[#6B6864] flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-[#A5432F]"/>
                  <span>{entry.likes} VIP Saves</span>
                </span>

                <div className="flex items-center gap-1.5">
                  <button onClick={() => handleEdit(entry)} className="p-1.5 rounded-lg hover:bg-[#FAF8F5] text-[#1A1A1A]" title="Edit entry">
                    <Edit2 className="w-4 h-4"/>
                  </button>
                  <button onClick={() => deleteLookbook(entry.id)} className="p-1.5 rounded-lg hover:bg-[#A5432F]/10 text-[#A5432F]" title="Delete entry">
                    <Trash2 className="w-4 h-4"/>
                  </button>
                </div>
              </div>
            </div>
          </div>))}
      </div>

      {/* Add / Edit Lookbook Modal */}
      {isModalOpen && (<div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white max-w-lg w-full p-6 rounded-2xl border border-[#E8E4DC] shadow-2xl space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">
              {editingId ? 'Edit Lookbook Story' : 'Author New Lookbook Entry'}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider mb-1">
                  Editorial Title *
                </label>
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Place Vendôme Twilight Series" className="w-full px-3.5 py-2 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs text-[#1A1A1A]"/>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider mb-1">
                    Season Collection
                  </label>
                  <input type="text" value={season} onChange={(e) => setSeason(e.target.value)} className="w-full px-3.5 py-2 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs text-[#1A1A1A]"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider mb-1">
                    Photographer Credit
                  </label>
                  <input type="text" value={photographer} onChange={(e) => setPhotographer(e.target.value)} className="w-full px-3.5 py-2 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs text-[#1A1A1A]"/>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider mb-1">
                  High-Res Editorial Photo URL *
                </label>
                <input type="url" required value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://images.unsplash.com/..." className="w-full px-3.5 py-2 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs text-[#1A1A1A]"/>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider mb-1">
                  Curatorial Narrative
                </label>
                <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Artistic concept and lighting narrative..." className="w-full px-3.5 py-2 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs text-[#1A1A1A]"/>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#F2EFE9]">
              <button type="button" onClick={resetForm} className="px-4 py-2 rounded-xl text-xs text-[#6B6864] hover:bg-[#F2EFE9]">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-[#1A1A1A] text-white text-xs font-semibold rounded-xl hover:bg-[#333333]">
                Save Lookbook Entry
              </button>
            </div>
          </form>
        </div>)}
    </div>);
};
export default LookbookManager;
