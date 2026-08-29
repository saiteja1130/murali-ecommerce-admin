import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Truck, CreditCard, Bell, Save, Building } from 'lucide-react';

export const StoreSettings = () => {
  const { showToast } = useAdmin();
  const [activeTab, setActiveTab] = useState('general');

  // General state
  const [storeName, setStoreName] = useState('SUMILUX Accessories & Fashion');
  const [legalEntity, setLegalEntity] = useState('SUMILUX India Private Limited');
  const [contactEmail, setContactEmail] = useState('support@sumilux.com');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [flagshipAddress, setFlagshipAddress] = useState('Bandra West, Mumbai, Maharashtra 400050, India');
  const [baseCurrency, setBaseCurrency] = useState('INR');

  // Shipping state
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(5000);
  const [standardShippingRate, setStandardShippingRate] = useState(199);
  const [enableGiftWrapping, setEnableGiftWrapping] = useState(true);

  // Payment Gateways
  const [cardPaymentEnabled, setCardPaymentEnabled] = useState(true);
  const [upiPaymentEnabled, setUpiPaymentEnabled] = useState(true);
  const [codEnabled, setCodEnabled] = useState(true);

  // Notifications
  const [notifyLowStock, setNotifyLowStock] = useState(true);
  const [notifyNewOrder, setNotifyNewOrder] = useState(true);
  const [notifyDailyDigest, setNotifyDailyDigest] = useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    showToast('success', 'Settings Saved', 'Your store settings have been successfully updated.');
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 pb-12 text-[#1D241C]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E4DC]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-3xl font-bold text-[#1D241C]">
              Store & System Settings
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono tracking-widest bg-[#506040]/15 text-[#506040] font-bold">
              Global Settings
            </span>
          </div>
          <p className="text-xs text-[#687163] mt-1">
            Configure store contact information, shipping rules, payment options, and email notifications.
          </p>
        </div>

        <button
          type="submit"
          className="px-5 py-2 bg-[#1D241C] hover:bg-[#C69E58] text-white hover:text-[#1D241C] text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E8E4DC] text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2.5 font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'general'
              ? 'border-b-2 border-[#1D241C] text-[#1D241C]'
              : 'text-[#687163] hover:text-[#1D241C]'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Store Information</span>
        </button>
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
          <span>Shipping & Delivery</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('payment')}
          className={`px-4 py-2.5 font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'payment'
              ? 'border-b-2 border-[#1D241C] text-[#1D241C]'
              : 'text-[#687163] hover:text-[#1D241C]'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Payment Methods</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2.5 font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'notifications'
              ? 'border-b-2 border-[#1D241C] text-[#1D241C]'
              : 'text-[#687163] hover:text-[#1D241C]'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Alerts & Notifications</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs space-y-5">
          <h2 className="font-serif text-xl font-bold text-[#1D241C] border-b border-[#E8E4DC] pb-3">
            Store Profile & Contact
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1D241C] uppercase tracking-wider mb-1">
                Store Name *
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs text-[#1D241C] focus:outline-none focus:border-[#C69E58]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1D241C] uppercase tracking-wider mb-1">
                Business / Legal Name
              </label>
              <input
                type="text"
                value={legalEntity}
                onChange={(e) => setLegalEntity(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs text-[#1D241C] focus:outline-none focus:border-[#C69E58]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1D241C] uppercase tracking-wider mb-1">
                Customer Support Email
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs text-[#1D241C] focus:outline-none focus:border-[#C69E58]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1D241C] uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs text-[#1D241C] focus:outline-none focus:border-[#C69E58]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1D241C] uppercase tracking-wider mb-1">
              Store Address (Shown on receipts and invoices)
            </label>
            <input
              type="text"
              value={flagshipAddress}
              onChange={(e) => setFlagshipAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs text-[#1D241C] focus:outline-none focus:border-[#C69E58]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1D241C] uppercase tracking-wider mb-1">
                Store Currency
              </label>
              <select
                value={baseCurrency}
                onChange={(e) => setBaseCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs text-[#1D241C] focus:outline-none focus:border-[#C69E58]"
              >
                <option value="INR">INR (₹) — Indian Rupee</option>
                <option value="USD">USD ($) — US Dollar</option>
                <option value="EUR">EUR (€) — Euro</option>
                <option value="GBP">GBP (£) — British Pound</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'shipping' && (
        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs space-y-5">
          <h2 className="font-serif text-xl font-bold text-[#1D241C] border-b border-[#E8E4DC] pb-3">
            Shipping & Delivery Rates
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1D241C] uppercase tracking-wider mb-1">
                Free Delivery Order Minimum (₹ INR)
              </label>
              <input
                type="number"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs font-mono text-[#1D241C]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1D241C] uppercase tracking-wider mb-1">
                Standard Shipping Fee (₹ INR)
              </label>
              <input
                type="number"
                value={standardShippingRate}
                onChange={(e) => setStandardShippingRate(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs font-mono text-[#1D241C]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="enableGift"
              checked={enableGiftWrapping}
              onChange={(e) => setEnableGiftWrapping(e.target.checked)}
              className="rounded text-[#506040] focus:ring-[#506040]"
            />
            <label htmlFor="enableGift" className="text-xs font-semibold text-[#1D241C]">
              Offer Free Luxury Gift Packaging on All Orders
            </label>
          </div>
        </div>
      )}

      {activeTab === 'payment' && (
        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs space-y-5">
          <h2 className="font-serif text-xl font-bold text-[#1D241C] border-b border-[#E8E4DC] pb-3">
            Payment Gateways & Options
          </h2>

          <div className="space-y-3">
            <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8E4DC] flex items-center justify-between">
              <div>
                <div className="font-semibold text-xs text-[#1D241C]">Credit & Debit Cards</div>
                <div className="text-[11px] text-[#687163]">Accept Visa, Mastercard, RuPay, and American Express</div>
              </div>
              <input
                type="checkbox"
                checked={cardPaymentEnabled}
                onChange={(e) => setCardPaymentEnabled(e.target.checked)}
                className="rounded text-[#506040] focus:ring-[#506040]"
              />
            </div>

            <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8E4DC] flex items-center justify-between">
              <div>
                <div className="font-semibold text-xs text-[#1D241C]">UPI & Net Banking</div>
                <div className="text-[11px] text-[#687163]">Accept Google Pay, PhonePe, Paytm, and Direct Net Banking</div>
              </div>
              <input
                type="checkbox"
                checked={upiPaymentEnabled}
                onChange={(e) => setUpiPaymentEnabled(e.target.checked)}
                className="rounded text-[#506040] focus:ring-[#506040]"
              />
            </div>

            <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8E4DC] flex items-center justify-between">
              <div>
                <div className="font-semibold text-xs text-[#1D241C]">Cash on Delivery (COD)</div>
                <div className="text-[11px] text-[#687163]">Allow customers to pay cash when product is delivered</div>
              </div>
              <input
                type="checkbox"
                checked={codEnabled}
                onChange={(e) => setCodEnabled(e.target.checked)}
                className="rounded text-[#506040] focus:ring-[#506040]"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs space-y-5">
          <h2 className="font-serif text-xl font-bold text-[#1D241C] border-b border-[#E8E4DC] pb-3">
            Staff Alerts & Notifications
          </h2>

          <div className="space-y-3">
            <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8E4DC] flex items-center justify-between">
              <div>
                <div className="font-semibold text-xs text-[#1D241C]">Low Stock Alerts</div>
                <div className="text-[11px] text-[#687163]">Send email alert when product inventory drops to 4 or below</div>
              </div>
              <input
                type="checkbox"
                checked={notifyLowStock}
                onChange={(e) => setNotifyLowStock(e.target.checked)}
                className="rounded text-[#506040] focus:ring-[#506040]"
              />
            </div>

            <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8E4DC] flex items-center justify-between">
              <div>
                <div className="font-semibold text-xs text-[#1D241C]">New Order Notifications</div>
                <div className="text-[11px] text-[#687163]">Receive instant notification when a customer places an order</div>
              </div>
              <input
                type="checkbox"
                checked={notifyNewOrder}
                onChange={(e) => setNotifyNewOrder(e.target.checked)}
                className="rounded text-[#506040] focus:ring-[#506040]"
              />
            </div>

            <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8E4DC] flex items-center justify-between">
              <div>
                <div className="font-semibold text-xs text-[#1D241C]">Daily Summary Report</div>
                <div className="text-[11px] text-[#687163]">Receive a daily summary of total sales, revenue, and pending orders</div>
              </div>
              <input
                type="checkbox"
                checked={notifyDailyDigest}
                onChange={(e) => setNotifyDailyDigest(e.target.checked)}
                className="rounded text-[#506040] focus:ring-[#506040]"
              />
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default StoreSettings;
