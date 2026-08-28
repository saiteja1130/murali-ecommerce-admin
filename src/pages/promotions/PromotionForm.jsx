import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { ArrowLeft, Save } from 'lucide-react';
export const PromotionForm = ({ mode }) => {
    const { id } = useParams();
    const { promotions, addPromotion, updatePromotion, showToast } = useAdmin();
    const navigate = useNavigate();
    const existingPromo = id ? promotions.find((p) => p.id === id) : null;
    const [code, setCode] = useState('');
    const [discountType, setDiscountType] = useState('percentage');
    const [discountValue, setDiscountValue] = useState(15);
    const [minSpend, setMinSpend] = useState(1000);
    const [usageLimit, setUsageLimit] = useState(100);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState('2026-12-31');
    const [isActive, setIsActive] = useState(true);
    const [selectedCats, setSelectedCats] = useState(['All Departments']);
    useEffect(() => {
        if (mode === 'edit' && existingPromo) {
            setCode(existingPromo.code);
            setDiscountType(existingPromo.discountType);
            setDiscountValue(existingPromo.discountValue);
            setMinSpend(existingPromo.minSpend);
            setUsageLimit(existingPromo.usageLimit);
            setStartDate(existingPromo.startDate);
            setEndDate(existingPromo.endDate);
            setIsActive(existingPromo.isActive);
            setSelectedCats(existingPromo.applicableCategories);
        }
    }, [mode, existingPromo]);
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!code.trim()) {
            showToast('danger', 'Code Required', 'Please enter a promotional code.');
            return;
        }
        const payload = {
            code: code.toUpperCase().trim(),
            discountType,
            discountValue: Number(discountValue),
            minSpend: minSpend ? Number(minSpend) : undefined,
            usageLimit: usageLimit ? Number(usageLimit) : undefined,
            startDate,
            endDate,
            isActive,
            applicableCategories: selectedCats,
        };
        if (mode === 'edit' && id) {
            updatePromotion(id, payload);
        }
        else {
            addPromotion(payload);
        }
        navigate('/admin/promotions');
    };
    return (<form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto pb-12">
      <div className="flex items-center justify-between pb-4 border-b border-[#E8E4DC]">
        <div className="flex items-center gap-3">
          <Link to="/admin/promotions" className="p-2 rounded-xl bg-white border border-[#E8E4DC] text-[#6B6864] hover:text-[#1A1A1A] hover:bg-[#FAF8F5] transition-colors">
            <ArrowLeft className="w-4 h-4"/>
          </Link>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
              {mode === 'edit' ? `Edit Code "${existingPromo?.code}"` : 'Issue New Promotion Code'}
            </h1>
            <p className="text-xs text-[#6B6864] mt-0.5">
              Set discount structure, minimum threshold spend, and validity window.
            </p>
          </div>
        </div>

        <button type="submit" className="px-5 py-2 bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-sm">
          <Save className="w-4 h-4 text-[#C8A87C]"/>
          <span>Save Code</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs space-y-5">
        <div>
          <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
            Privilege Voucher Code *
          </label>
          <input type="text" required value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="e.g. VENDOME20 or VIC-ATELIER" className="w-full px-3.5 py-2.5 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-sm font-mono font-bold text-[#1A1A1A] tracking-wider focus:outline-none focus:border-[#C8A87C]"/>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
              Discount Structure
            </label>
            <select value={discountType} onChange={(e) => setDiscountType(e.target.value)} className="w-full px-3.5 py-2.5 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs text-[#1A1A1A] focus:outline-none focus:border-[#C8A87C]">
              <option value="percentage">Percentage Discount (%)</option>
              <option value="fixed">Fixed Rupee Value (₹)</option>
              <option value="free_shipping">Complimentary White Glove Shipping</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
              Discount Value {discountType === 'percentage' ? '(%)' : '(₹ INR)'}
            </label>
            <input type="number" min={1} max={discountType === 'percentage' ? 100 : 10000} value={discountValue} onChange={(e) => setDiscountValue(Number(e.target.value))} className="w-full px-3.5 py-2.5 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs font-mono font-bold text-[#1A1A1A]"/>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
              Minimum Cart Threshold (₹ INR)
            </label>
            <input type="number" value={minSpend || ''} onChange={(e) => setMinSpend(e.target.value ? Number(e.target.value) : undefined)} placeholder="e.g. 1000" className="w-full px-3.5 py-2.5 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs font-mono text-[#1A1A1A]"/>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
              Usage Cap Limit
            </label>
            <input type="number" value={usageLimit || ''} onChange={(e) => setUsageLimit(e.target.value ? Number(e.target.value) : undefined)} placeholder="Leave blank for unlimited" className="w-full px-3.5 py-2.5 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs font-mono text-[#1A1A1A]"/>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
              Activation Date
            </label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3.5 py-2.5 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs font-mono text-[#1A1A1A]"/>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
              Expiration Date
            </label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3.5 py-2.5 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs font-mono text-[#1A1A1A]"/>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input type="checkbox" id="isActivePromo" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded text-[#C8A87C] focus:ring-[#C8A87C]"/>
          <label htmlFor="isActivePromo" className="text-xs font-semibold text-[#1A1A1A]">
            Code is Active and Usable at Checkout
          </label>
        </div>
      </div>
    </form>);
};
export default PromotionForm;
