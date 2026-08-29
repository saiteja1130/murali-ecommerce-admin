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
  const [selectedCats, setSelectedCats] = useState(['All Categories']);

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
      setSelectedCats(existingPromo.applicableCategories || ['All Categories']);
    }
  }, [mode, existingPromo]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!code.trim()) {
      showToast('danger', 'Code Required', 'Please enter a coupon code.');
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
    } else {
      addPromotion(payload);
    }
    navigate('/admin/promotions');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto pb-12 text-[#1D241C]">
      <div className="flex items-center justify-between pb-4 border-b border-[#E8E4DC]">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/promotions"
            className="p-2 rounded-xl bg-white border border-[#E8E4DC] text-[#687163] hover:text-[#1D241C] hover:bg-[#FAF8F5] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1D241C]">
              {mode === 'edit' ? `Edit Coupon "${existingPromo?.code}"` : 'Create New Coupon Code'}
            </h1>
            <p className="text-xs text-[#687163] mt-0.5">
              Set discount percentage or amount, minimum order value, and expiry date.
            </p>
          </div>
        </div>

        <button
          type="submit"
          className="px-5 py-2 bg-[#1D241C] hover:bg-[#C69E58] text-white hover:text-[#1D241C] text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Coupon</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs space-y-5">
        <div>
          <label className="block text-xs font-semibold text-[#1D241C] uppercase tracking-wider mb-1.5">
            Coupon Code *
          </label>
          <input
            type="text"
            required
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. SUMMER20 or FESTIVE10"
            className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-sm font-mono font-bold text-[#1D241C] tracking-wider focus:outline-none focus:border-[#C69E58]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1D241C] uppercase tracking-wider mb-1.5">
              Discount Type
            </label>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs text-[#1D241C] focus:outline-none focus:border-[#C69E58] cursor-pointer"
            >
              <option value="percentage">Percentage Discount (%)</option>
              <option value="fixed">Fixed Amount Discount (₹)</option>
              <option value="free_shipping">Free Delivery</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1D241C] uppercase tracking-wider mb-1.5">
              Discount Value {discountType === 'percentage' ? '(%)' : '(₹ INR)'}
            </label>
            <input
              type="number"
              min={1}
              max={discountType === 'percentage' ? 100 : 10000}
              value={discountValue}
              onChange={(e) => setDiscountValue(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs font-mono font-bold text-[#1D241C] focus:outline-none focus:border-[#C69E58]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1D241C] uppercase tracking-wider mb-1.5">
              Minimum Order Value (₹ INR)
            </label>
            <input
              type="number"
              value={minSpend || ''}
              onChange={(e) => setMinSpend(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="e.g. 1000"
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs font-mono text-[#1D241C] focus:outline-none focus:border-[#C69E58]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1D241C] uppercase tracking-wider mb-1.5">
              Usage Limit
            </label>
            <input
              type="number"
              value={usageLimit || ''}
              onChange={(e) => setUsageLimit(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Leave blank for unlimited"
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs font-mono text-[#1D241C] focus:outline-none focus:border-[#C69E58]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1D241C] uppercase tracking-wider mb-1.5">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs font-mono text-[#1D241C] focus:outline-none focus:border-[#C69E58]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1D241C] uppercase tracking-wider mb-1.5">
              Expiry Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs font-mono text-[#1D241C] focus:outline-none focus:border-[#C69E58]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="isActivePromo"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="rounded text-[#506040] focus:ring-[#506040]"
          />
          <label htmlFor="isActivePromo" className="text-xs font-semibold text-[#1D241C]">
            Enable coupon code for customer checkout
          </label>
        </div>
      </div>
    </form>
  );
};

export default PromotionForm;
