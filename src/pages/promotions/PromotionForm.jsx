import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import api from '../../context/api';
import { ArrowLeft, Save, Tag, Layers, CheckSquare, Square, Search } from 'lucide-react';
import ConfirmModal from '../../components/ConfirmModal';

export const PromotionForm = ({ mode }) => {
  const { id } = useParams();
  const { promotions, addPromotion, updatePromotion, showToast } = useAdmin();
  const navigate = useNavigate();
  const existingPromo = id ? promotions.find((p) => p.id === id || p._id === id) : null;

  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState(15);
  const [minSpend, setMinSpend] = useState(1000);
  const [maxDiscount, setMaxDiscount] = useState('');
  const [usageLimit, setUsageLimit] = useState(100);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('2026-12-31');
  const [isActive, setIsActive] = useState(true);

  // Category scoping state
  const [isAllCategories, setIsAllCategories] = useState(true);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [categorySearch, setCategorySearch] = useState('');
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch live categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const res = await api.get('/api/categories');
        if (res.data?.success && Array.isArray(res.data.data)) {
          setAvailableCategories(res.data.data);
        }
      } catch (err) {
        console.warn('Failed to load categories in PromotionForm:', err.message);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Populate form if editing
  useEffect(() => {
    if (mode === 'edit' && existingPromo) {
      setCode(existingPromo.code || '');
      setDescription(existingPromo.description || '');
      setDiscountType(existingPromo.discountType || 'percentage');
      setDiscountValue(existingPromo.discountValue || 15);
      setMinSpend(existingPromo.minSpend || 0);
      setMaxDiscount(existingPromo.maxDiscount || '');
      setUsageLimit(existingPromo.usageLimit || '');
      setStartDate(existingPromo.startDate || new Date().toISOString().split('T')[0]);
      setEndDate(existingPromo.endDate || '2026-12-31');
      setIsActive(existingPromo.isActive !== false);

      const isAll = existingPromo.isAllCategories ||
        !existingPromo.applicableCategories ||
        existingPromo.applicableCategories.includes('All Categories');

      setIsAllCategories(isAll);

      if (!isAll) {
        const catIds = (existingPromo.rawCategories || existingPromo.applicableCategories || [])
          .map((c) => (typeof c === 'object' && c._id ? c._id : c))
          .filter((cid) => typeof cid === 'string' && cid !== 'All Categories');
        setSelectedCategoryIds(catIds);
      }
    }
  }, [mode, existingPromo]);

  const toggleCategory = (catId) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const handleSelectAllCategories = () => {
    setSelectedCategoryIds(availableCategories.map((c) => c._id));
  };

  const handleClearAllCategories = () => {
    setSelectedCategoryIds([]);
  };

  const filteredCategories = availableCategories.filter((c) =>
    c.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
    c.slug.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!code.trim()) {
      showToast('danger', 'Code Required', 'Please enter a coupon code.');
      return;
    }
    if (!isAllCategories && selectedCategoryIds.length === 0) {
      showToast('danger', 'Category Required', 'Please select at least one applicable category or choose "All Categories".');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmedSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        code: code.toUpperCase().trim(),
        description: description.trim(),
        discountType,
        discountValue: Number(discountValue),
        minSpend: minSpend ? Number(minSpend) : 0,
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        startDate,
        endDate,
        isActive,
        isAllCategories,
        applicableCategories: isAllCategories ? [] : selectedCategoryIds,
      };

      if (mode === 'edit' && id) {
        await updatePromotion(id, payload);
        showToast('success', 'Promotion Updated', `Coupon code "${payload.code}" successfully updated.`);
      } else {
        await addPromotion(payload);
        showToast('success', 'Promotion Created', `Coupon code "${payload.code}" is now active.`);
      }
      setShowConfirmModal(false);
      navigate('/admin/promotions');
    } catch (err) {
      showToast('danger', 'Error', err.response?.data?.message || 'Failed to save coupon code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto pb-12 text-[#1D241C]">
      {/* Top Header */}
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
              {mode === 'edit' ? `Edit Coupon "${existingPromo?.code || ''}"` : 'Create New Coupon Code'}
            </h1>
            <p className="text-xs text-[#687163] mt-0.5">
              Set discount rates, target specific categories (e.g. Sarees), order thresholds, and expiry dates.
            </p>
          </div>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 bg-[#1D241C] hover:bg-[#C69E58] text-white hover:text-[#1D241C] text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Coupon</span>
        </button>
      </div>

      {/* Main Parameters Card */}
      <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs space-y-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#1D241C] flex items-center gap-2">
          <Tag className="w-4 h-4 text-[#506040]" />
          <span>Coupon Details</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1D241C] uppercase tracking-wider mb-1.5">
              Coupon Code *
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. SAREE20 or FESTIVE15"
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-sm font-mono font-bold text-[#1D241C] tracking-wider focus:outline-none focus:border-[#C69E58]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1D241C] uppercase tracking-wider mb-1.5">
              Description / Internal Note
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 20% off exclusively on Handcrafted Sarees"
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs text-[#1D241C] focus:outline-none focus:border-[#C69E58]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              Discount Value {discountType === 'percentage' ? '(%)' : '(₹ INR)'} *
            </label>
            <input
              type="number"
              min={1}
              max={discountType === 'percentage' ? 100 : 50000}
              required
              value={discountValue}
              onChange={(e) => setDiscountValue(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs font-mono font-bold text-[#1D241C] focus:outline-none focus:border-[#C69E58]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1D241C] uppercase tracking-wider mb-1.5">
              Max Discount Cap (₹ Optional)
            </label>
            <input
              type="number"
              min={0}
              value={maxDiscount}
              onChange={(e) => setMaxDiscount(e.target.value ? Number(e.target.value) : '')}
              placeholder="e.g. 1000 (No cap if empty)"
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs font-mono text-[#1D241C] focus:outline-none focus:border-[#C69E58]"
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
              min={0}
              value={minSpend || ''}
              onChange={(e) => setMinSpend(e.target.value ? Number(e.target.value) : 0)}
              placeholder="0 for no minimum"
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs font-mono text-[#1D241C] focus:outline-none focus:border-[#C69E58]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1D241C] uppercase tracking-wider mb-1.5">
              Global Usage Limit
            </label>
            <input
              type="number"
              min={1}
              value={usageLimit || ''}
              onChange={(e) => setUsageLimit(e.target.value ? Number(e.target.value) : '')}
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
            className="rounded text-[#506040] focus:ring-[#506040] cursor-pointer"
          />
          <label htmlFor="isActivePromo" className="text-xs font-semibold text-[#1D241C] cursor-pointer">
            Enable coupon code for customer checkout
          </label>
        </div>
      </div>

      {/* Category Scoping Card */}
      <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between pb-2 border-b border-[#E8E4DC]">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#1D241C] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#506040]" />
              <span>Category Eligibility Rules</span>
            </h2>
            <p className="text-xs text-[#687163] mt-0.5">
              Select whether this coupon applies storewide or strictly to specific product categories (e.g. Sarees).
            </p>
          </div>

          {!isAllCategories && (
            <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-[#506040]/15 text-[#506040]">
              {selectedCategoryIds.length} categories selected
            </span>
          )}
        </div>

        {/* Scope Selector Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label
            onClick={() => setIsAllCategories(true)}
            className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
              isAllCategories
                ? 'border-[#506040] bg-[#FAF8F5] ring-2 ring-[#506040]/20'
                : 'border-[#E8E4DC] hover:border-[#C69E58] bg-white'
            }`}
          >
            <input
              type="radio"
              name="categoryScope"
              checked={isAllCategories}
              onChange={() => setIsAllCategories(true)}
              className="mt-0.5 text-[#506040] focus:ring-[#506040]"
            />
            <div>
              <span className="block text-xs font-bold text-[#1D241C]">All Categories (Storewide)</span>
              <span className="block text-[11px] text-[#687163] mt-0.5">
                The discount will apply across all items in the customer's shopping bag.
              </span>
            </div>
          </label>

          <label
            onClick={() => setIsAllCategories(false)}
            className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
              !isAllCategories
                ? 'border-[#506040] bg-[#FAF8F5] ring-2 ring-[#506040]/20'
                : 'border-[#E8E4DC] hover:border-[#C69E58] bg-white'
            }`}
          >
            <input
              type="radio"
              name="categoryScope"
              checked={!isAllCategories}
              onChange={() => setIsAllCategories(false)}
              className="mt-0.5 text-[#506040] focus:ring-[#506040]"
            />
            <div>
              <span className="block text-xs font-bold text-[#1D241C]">Specific Categories Only</span>
              <span className="block text-[11px] text-[#687163] mt-0.5">
                Discount applies only to items from the selected categories (e.g. Sarees, Dresses).
              </span>
            </div>
          </label>
        </div>

        {/* Category Multi-Select Grid (Displayed when Specific Categories is selected) */}
        {!isAllCategories && (
          <div className="pt-3 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#687163]" />
                <input
                  type="text"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder="Filter categories (e.g. Saree)..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#E8E4DC] rounded-lg focus:outline-none focus:border-[#C69E58]"
                />
              </div>

              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleSelectAllCategories}
                  className="px-2.5 py-1 bg-[#FAF8F5] hover:bg-[#E8E4DC] border border-[#E8E4DC] rounded-lg text-[#1D241C] font-semibold cursor-pointer"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={handleClearAllCategories}
                  className="px-2.5 py-1 bg-[#FAF8F5] hover:bg-rose-50 border border-[#E8E4DC] rounded-lg text-rose-700 font-semibold cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            </div>

            {isLoadingCategories ? (
              <div className="p-8 text-center text-xs text-[#687163]">Loading categories...</div>
            ) : availableCategories.length === 0 ? (
              <div className="p-6 bg-[#FAF8F5] rounded-xl border border-dashed border-[#E8E4DC] text-center text-xs text-[#687163]">
                No categories found in database. Create categories under Products &gt; Categories first.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto p-1 border border-[#E8E4DC] rounded-xl bg-[#FAF8F5]/30">
                {filteredCategories.map((cat) => {
                  const isChecked = selectedCategoryIds.includes(cat._id);
                  return (
                    <div
                      key={cat._id}
                      onClick={() => toggleCategory(cat._id)}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                        isChecked
                          ? 'border-[#506040] bg-[#506040]/10 text-[#1D241C] shadow-2xs font-semibold'
                          : 'border-[#E8E4DC] hover:border-[#C69E58] bg-white text-[#687163]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-[#506040] shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-[#687163] shrink-0" />
                        )}
                        <span className="text-xs truncate">{cat.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#687163] shrink-0 bg-white/70 px-1.5 py-0.5 rounded border border-[#E8E4DC]">
                        {cat.slug}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => !isSubmitting && setShowConfirmModal(false)}
        onConfirm={handleConfirmedSubmit}
        isLoading={isSubmitting}
        variant="primary"
        title={mode === 'edit' ? 'Update Coupon Code?' : 'Create Promotion Code?'}
        message={`Save coupon "${code.trim().toUpperCase()}" with a ${discountValue}${
          discountType === 'percentage' ? '%' : ' INR'
        } discount on ${isAllCategories ? 'all categories' : `${selectedCategoryIds.length} selected categories`}?`}
        confirmText={mode === 'edit' ? 'Save Changes' : 'Create Coupon'}
        cancelText="Cancel"
      />
    </form>
  );
};

export default PromotionForm;
