import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { ArrowLeft, Plus, Calendar, Trash2 } from 'lucide-react';
export const CampaignScheduler = () => {
    const { showToast } = useAdmin();
    const [campaigns, setCampaigns] = useState([
        {
            id: 'cmp-1',
            title: 'Autumn Atelier Launch 2026',
            type: 'Top Announcement Bar',
            headline: 'Complimentary White Glove Courier & Monogramming on all orders over ₹25,000',
            startDate: '2026-08-01',
            endDate: '2026-09-15',
            status: 'Live',
            clicks: 1420,
        },
        {
            id: 'cmp-2',
            title: 'Private Vendôme Salon Invitation',
            type: 'Newsletter Broadcast',
            headline: 'Exclusive Preview: Limited Edition Cashmere Coats (Only 25 Numbered Runs)',
            startDate: '2026-09-01',
            endDate: '2026-09-30',
            status: 'Scheduled',
            clicks: 0,
        },
    ]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [title, setTitle] = useState('');
    const [type, setType] = useState('Top Announcement Bar');
    const [headline, setHeadline] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState('2026-10-01');
    const handleAddCampaign = (e) => {
        e.preventDefault();
        if (!title.trim())
            return;
        const newCmp = {
            id: `cmp-${Date.now()}`,
            title,
            type,
            headline,
            startDate,
            endDate,
            status: 'Scheduled',
            clicks: 0,
        };
        setCampaigns([...campaigns, newCmp]);
        setShowAddModal(false);
        showToast('success', 'Campaign Scheduled', `Campaign "${title}" will launch on ${startDate}.`);
    };
    const handleDelete = (id) => {
        setCampaigns(campaigns.filter((c) => c.id !== id));
        showToast('info', 'Campaign Deleted', 'Scheduled campaign removed.');
    };
    return (<div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E4DC]">
        <div className="flex items-center gap-3">
          <Link to="/admin/promotions" className="p-2 rounded-xl bg-white border border-[#E8E4DC] text-[#6B6864] hover:text-[#1A1A1A] hover:bg-[#FAF8F5] transition-colors">
            <ArrowLeft className="w-4 h-4"/>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-3xl font-bold text-[#1A1A1A]">
                Storefront Campaign Scheduler
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono tracking-widest bg-[#C8A87C]/15 text-[#A68758] font-bold">
                Announcement Matrix
              </span>
            </div>
            <p className="text-xs text-[#6B6864] mt-1">
              Program countdowns, top notification banners, and seasonal broadcast events.
            </p>
          </div>
        </div>

        <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-sm">
          <Plus className="w-3.5 h-3.5 text-[#C8A87C]"/>
          <span>New Campaign</span>
        </button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {campaigns.map((camp) => (<div key={camp.id} className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[#A68758]">
                  {camp.type}
                </span>
                <h3 className="font-serif text-xl font-bold text-[#1A1A1A] mt-1">
                  {camp.title}
                </h3>
              </div>

              <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono font-bold ${camp.status === 'Live'
                ? 'bg-[#4A7A5E]/15 text-[#4A7A5E]'
                : camp.status === 'Scheduled'
                    ? 'bg-[#5B7C99]/15 text-[#5B7C99]'
                    : 'bg-[#6B6864]/15 text-[#6B6864]'}`}>
                {camp.status}
              </span>
            </div>

            <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E4DC] text-xs font-serif italic text-[#1A1A1A] leading-relaxed">
              "{camp.headline}"
            </div>

            <div className="flex items-center justify-between text-xs text-[#6B6864] pt-2 border-t border-[#F2EFE9]">
              <div className="flex items-center gap-1.5 font-mono">
                <Calendar className="w-3.5 h-3.5 text-[#A68758]"/>
                <span>{camp.startDate} &rarr; {camp.endDate}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-[#1A1A1A] font-semibold">{camp.clicks} engagements</span>
                <button onClick={() => handleDelete(camp.id)} className="p-1 text-[#6B6864] hover:text-[#A5432F]">
                  <Trash2 className="w-4 h-4"/>
                </button>
              </div>
            </div>
          </div>))}
      </div>

      {/* Add Campaign Modal */}
      {showAddModal && (<div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleAddCampaign} className="bg-white max-w-md w-full p-6 rounded-2xl border border-[#E8E4DC] shadow-2xl space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">
              Schedule Storefront Campaign
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider mb-1">
                  Campaign Title *
                </label>
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Winter Cashmere Preview" className="w-full px-3 py-2 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs text-[#1A1A1A]"/>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider mb-1">
                  Display Channel
                </label>
                <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-3 py-2 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs text-[#1A1A1A]">
                  <option value="Top Announcement Bar">Top Announcement Bar</option>
                  <option value="Hero Modal Banner">Hero Modal Banner</option>
                  <option value="Newsletter Broadcast">Newsletter Broadcast</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider mb-1">
                  Banner Text / Inscription
                </label>
                <textarea rows={2} value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Banner copy displayed across client storefront..." className="w-full px-3 py-2 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs text-[#1A1A1A]"/>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider mb-1">
                    Start Date
                  </label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs font-mono"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider mb-1">
                    End Date
                  </label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs font-mono"/>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#F2EFE9]">
              <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl text-xs text-[#6B6864] hover:bg-[#F2EFE9]">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-[#1A1A1A] text-white text-xs font-semibold rounded-xl hover:bg-[#333333]">
                Save Schedule
              </button>
            </div>
          </form>
        </div>)}
    </div>);
};
export default CampaignScheduler;
