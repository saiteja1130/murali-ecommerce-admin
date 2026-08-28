import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { Plus, Edit2, Trash2, Calendar } from 'lucide-react';
export const PromotionList = () => {
    const { promotions, deletePromotion, showToast } = useAdmin();
    const navigate = useNavigate();
    const [filterType, setFilterType] = useState('all');
    const filteredPromos = promotions.filter((p) => {
        if (filterType === 'active')
            return p.isActive;
        if (filterType === 'expired')
            return !p.isActive;
        return true;
    });
    return (<div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E4DC]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-3xl font-bold text-[#1A1A1A]">
              Promotions & Discount Codes
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono tracking-widest bg-[#C8A87C]/15 text-[#A68758] font-bold">
              {promotions.length} Active Codes
            </span>
          </div>
          <p className="text-xs text-[#6B6864] mt-1">
            Manage promotional privileges, discount codes, seasonal courtesies, and conversion rates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin/promotions/campaigns" className="px-3.5 py-2 bg-white hover:bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs font-semibold text-[#1A1A1A] transition-colors flex items-center gap-2 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-[#6B6864]"/>
            <span>Campaign Scheduler</span>
          </Link>
          <Link to="/admin/promotions/new" className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-sm">
            <Plus className="w-3.5 h-3.5 text-[#C8A87C]"/>
            <span>Create Promo Code</span>
          </Link>
        </div>
      </div>

      {/* Promotion Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPromos.map((promo) => (<div key={promo.id} className="bg-white rounded-2xl border border-[#E8E4DC] p-5 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-base font-bold tracking-wider text-[#1A1A1A] bg-[#FAF8F5] px-3 py-1 rounded-lg border border-[#E8E4DC]">
                    {promo.code}
                  </span>
                  <div className="text-xs font-semibold text-[#A68758] mt-2">
                    {promo.discountType === 'percentage'
                ? `${promo.discountValue}% Courtesy Savings`
                : promo.discountType === 'fixed'
                    ? `$${promo.discountValue} Off Total`
                    : 'Complimentary White Glove Courier'}
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono font-semibold ${promo.isActive
                ? 'bg-[#4A7A5E]/15 text-[#4A7A5E]'
                : 'bg-[#6B6864]/15 text-[#6B6864]'}`}>
                  {promo.isActive ? 'Active' : 'Expired'}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-xs text-[#6B6864]">
                <div className="flex justify-between">
                  <span>Minimum Threshold:</span>
                  <span className="font-mono-data text-[#1A1A1A] font-semibold">
                    {promo.minSpend ? `$${promo.minSpend.toLocaleString()}` : 'None'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Redemptions Used:</span>
                  <span className="font-mono-data text-[#1A1A1A] font-semibold">
                    {promo.usageCount} / {promo.usageLimit || '∞'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Valid Until:</span>
                  <span className="font-mono text-[#1A1A1A]">{promo.endDate}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#F2EFE9] flex items-center justify-between">
              <span className="text-[11px] text-[#A68758] font-medium">
                {promo.applicableCategories.join(', ')}
              </span>

              <div className="flex items-center gap-2">
                <button onClick={() => navigate(`/admin/promotions/${promo.id}/edit`)} className="p-1.5 rounded-lg hover:bg-[#FAF8F5] text-[#1A1A1A]" title="Edit promo">
                  <Edit2 className="w-4 h-4"/>
                </button>
                <button onClick={() => deletePromotion(promo.id)} className="p-1.5 rounded-lg hover:bg-[#A5432F]/10 text-[#A5432F]" title="Delete promo">
                  <Trash2 className="w-4 h-4"/>
                </button>
              </div>
            </div>
          </div>))}
      </div>
    </div>);
};
export default PromotionList;
