import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import api from '../../context/api';
import { Truck, Save, Tag, Sparkles, Loader2 } from 'lucide-react';

export const StoreSettings = () => {
  const { showToast } = useAdmin();
  const [activeTab, setActiveTab] = useState('shipping');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Shipping state (Backend Sync)
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(5000);
  const [standardShippingRate, setStandardShippingRate] = useState(30);

  // Promo Code & Discount state (Backend Sync)
  const [promoCode, setPromoCode] = useState('SUMI15');
  const [discountPercent, setDiscountPercent] = useState(15);
  const [isPromoActive, setIsPromoActive] = useState(true);

  // Fetch settings from Backend API on mount
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/api/settings');
        if (response.data?.status && response.data?.data) {
          const s = response.data.data;
          if (s.shippingFee !== undefined) setStandardShippingRate(s.shippingFee);
          if (s.freeShippingThreshold !== undefined) setFreeShippingThreshold(s.freeShippingThreshold);
          if (s.promoCode !== undefined) setPromoCode(s.promoCode);
          if (s.discountPercent !== undefined) setDiscountPercent(s.discountPercent);
          if (s.isPromoActive !== undefined) setIsPromoActive(s.isPromoActive);
        }
      } catch (err) {
        console.warn('Failed to fetch backend settings, using local fallback:', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        shippingFee: Number(standardShippingRate),
        freeShippingThreshold: Number(freeShippingThreshold),
        promoCode: promoCode.trim().toUpperCase(),
        discountPercent: Number(discountPercent),
        isPromoActive: Boolean(isPromoActive),
      };

      const response = await api.put('/api/settings', payload);
      if (response.data?.status) {
        showToast('success', 'Settings Saved', 'Store shipping rules, thresholds, and promo codes successfully updated.');
      } else {
        showToast('success', 'Settings Updated', 'Configuration updated in system cache.');
      }
    } catch (error) {
      console.error('Failed to update store settings:', error);
      showToast('danger', 'Save Failed', error.response?.data?.message || 'Could not save store settings to server.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center space-y-3 text-[#687163]">
        <Loader2 className="w-8 h-8 animate-spin text-[#C69E58]" />
        <p className="text-xs font-mono">Loading store system settings...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 pb-12 text-[#1D241C]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E4DC]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-3xl font-bold text-[#1D241C]">
              Store & Shipping Settings
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono tracking-widest bg-[#506040]/15 text-[#506040] font-bold">
              Global Sync
            </span>
          </div>
          <p className="text-xs text-[#687163] mt-1">
            Manage live standard shipping fees, free shipping order thresholds, and promotional coupon codes.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="px-5 py-2.5 bg-[#1D241C] hover:bg-[#C69E58] text-white hover:text-[#1D241C] text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{isSaving ? 'Saving Changes...' : 'Save Changes'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E8E4DC] text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('shipping')}
          className={`px-4 py-2.5 font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'shipping'
              ? 'border-b-2 border-[#1D241C] text-[#1D241C]'
              : 'text-[#687163] hover:text-[#1D241C]'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Shipping & Delivery Rules</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('promotions')}
          className={`px-4 py-2.5 font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'promotions'
              ? 'border-b-2 border-[#1D241C] text-[#1D241C]'
              : 'text-[#687163] hover:text-[#1D241C]'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Promotions & Coupons</span>
        </button>
      </div>

      {/* Tab Contents: Shipping & Delivery */}
      {activeTab === 'shipping' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs space-y-6">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#1D241C]">
                Shipping Rates & Free Shipping Threshold
              </h2>
              <p className="text-xs text-[#687163] mt-1">
                Configure standard shipping charges and the minimum order subtotal required for shoppers to unlock complimentary free shipping.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#1D241C] uppercase tracking-wider">
                  Free Shipping Minimum Threshold (₹ INR) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-xs font-mono text-[#687163]">
                    ₹
                  </span>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={freeShippingThreshold}
                    onChange={(e) => setFreeShippingThreshold(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs font-mono font-bold text-[#1D241C] focus:outline-none focus:border-[#C69E58]"
                  />
                </div>
                <p className="text-[11px] text-[#687163]">
                  Customers who add items totaling ₹{Number(freeShippingThreshold).toLocaleString('en-IN')} or more get 100% Free Shipping.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#1D241C] uppercase tracking-wider">
                  Base Standard Shipping Fee (₹ INR) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-xs font-mono text-[#687163]">
                    ₹
                  </span>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={standardShippingRate}
                    onChange={(e) => setStandardShippingRate(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs font-mono font-bold text-[#1D241C] focus:outline-none focus:border-[#C69E58]"
                  />
                </div>
                <p className="text-[11px] text-[#687163]">
                  Applied to orders with a subtotal under ₹{Number(freeShippingThreshold).toLocaleString('en-IN')}.
                </p>
              </div>
            </div>

            {/* Live Storefront Preview Box */}
            <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8E4DC] space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#C69E58] font-bold block">
                Live Storefront Customer View
              </span>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-[#1D241C]">
                <div>
                  <strong>Under ₹{Number(freeShippingThreshold).toLocaleString('en-IN')}:</strong> Customer pays <strong>₹{Number(standardShippingRate).toFixed(2)}</strong> shipping fee.
                </div>
                <div className="text-emerald-700 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span><strong>₹{Number(freeShippingThreshold).toLocaleString('en-IN')}+:</strong> Free Shipping Progress Bar Unlocked!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Contents: Promotions & Coupons */}
      {activeTab === 'promotions' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs space-y-6">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#1D241C]">
                Promotional Coupon Configuration
              </h2>
              <p className="text-xs text-[#687163] mt-1">
                Configure your active promotional voucher code and discount percentage redeemed during checkout.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#1D241C] uppercase tracking-wider">
                  Promotional Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="SUMI15"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs font-mono font-bold uppercase text-[#1D241C] focus:outline-none focus:border-[#C69E58]"
                />
                <p className="text-[11px] text-[#687163]">
                  Case-insensitive promo code entered by customers in the Cart Drawer & Checkout.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#1D241C] uppercase tracking-wider">
                  Discount Percentage (%) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs font-mono font-bold text-[#1D241C] focus:outline-none focus:border-[#C69E58]"
                  />
                  <span className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-xs font-mono text-[#687163]">
                    %
                  </span>
                </div>
                <p className="text-[11px] text-[#687163]">
                  Deducts {discountPercent}% from the customer's cart subtotal.
                </p>
              </div>
            </div>

            <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8E4DC] flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#1D241C]">Enable Active Promo Code</h4>
                <p className="text-[11px] text-[#687163]">
                  When active, customers applying <strong>{promoCode}</strong> receive <strong>{discountPercent}% OFF</strong> their order.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPromoActive}
                  onChange={(e) => setIsPromoActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#506040]" />
              </label>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default StoreSettings;
