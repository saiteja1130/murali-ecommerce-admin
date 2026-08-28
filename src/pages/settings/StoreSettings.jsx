import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Truck, CreditCard, Bell, Save, Building } from 'lucide-react';
export const StoreSettings = () => {
    const { showToast } = useAdmin();
    const [activeTab, setActiveTab] = useState('general');
    // General state
    const [storeName, setStoreName] = useState('SUMILUX Haute Couture');
    const [legalEntity, setLegalEntity] = useState('SUMILUX Maison de Mode S.A.S.');
    const [contactEmail, setContactEmail] = useState('concierge@sumilux.com');
    const [phone, setPhone] = useState('+33 1 42 68 00 00');
    const [flagshipAddress, setFlagshipAddress] = useState('18 Place Vendôme, 75001 Paris, France');
    const [baseCurrency, setBaseCurrency] = useState('USD');
    // Shipping & White Glove state
    const [freeShippingThreshold, setFreeShippingThreshold] = useState(2000);
    const [whiteGloveRate, setWhiteGloveRate] = useState(150);
    const [internationalFlatRate, setInternationalFlatRate] = useState(75);
    const [enableMonogramming, setEnableMonogramming] = useState(true);
    // Payment Gateways
    const [stripeEnabled, setStripeEnabled] = useState(true);
    const [applePayEnabled, setApplePayEnabled] = useState(true);
    const [bankWireForHighOrders, setBankWireForHighOrders] = useState(true);
    // Notifications
    const [notifyLowStock, setNotifyLowStock] = useState(true);
    const [notifyVICOrder, setNotifyVICOrder] = useState(true);
    const [notifyDailyDigest, setNotifyDailyDigest] = useState(true);
    const handleSave = (e) => {
        e.preventDefault();
        showToast('success', 'Settings Synchronized', 'Store parameters committed across global endpoints.');
    };
    return (<form onSubmit={handleSave} className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E4DC]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-3xl font-bold text-[#1A1A1A]">
              Maison & System Configuration
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono tracking-widest bg-[#C8A87C]/15 text-[#A68758] font-bold">
              Global Settings
            </span>
          </div>
          <p className="text-xs text-[#6B6864] mt-1">
            Manage flagship salon credentials, currencies, white-glove logistics, payment gateways, and staff alerts.
          </p>
        </div>

        <button type="submit" className="px-5 py-2 bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-sm">
          <Save className="w-4 h-4 text-[#C8A87C]"/>
          <span>Save Global Changes</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E8E4DC] text-xs">
        <button type="button" onClick={() => setActiveTab('general')} className={`px-4 py-2.5 font-semibold transition-colors flex items-center gap-2 cursor-pointer ${activeTab === 'general'
            ? 'border-b-2 border-[#1A1A1A] text-[#1A1A1A]'
            : 'text-[#6B6864] hover:text-[#1A1A1A]'}`}>
          <Building className="w-4 h-4"/>
          <span>Maison Identity</span>
        </button>
        <button type="button" onClick={() => setActiveTab('shipping')} className={`px-4 py-2.5 font-semibold transition-colors flex items-center gap-2 cursor-pointer ${activeTab === 'shipping'
            ? 'border-b-2 border-[#1A1A1A] text-[#1A1A1A]'
            : 'text-[#6B6864] hover:text-[#1A1A1A]'}`}>
          <Truck className="w-4 h-4"/>
          <span>White Glove Logistics</span>
        </button>
        <button type="button" onClick={() => setActiveTab('payment')} className={`px-4 py-2.5 font-semibold transition-colors flex items-center gap-2 cursor-pointer ${activeTab === 'payment'
            ? 'border-b-2 border-[#1A1A1A] text-[#1A1A1A]'
            : 'text-[#6B6864] hover:text-[#1A1A1A]'}`}>
          <CreditCard className="w-4 h-4"/>
          <span>Payment Gateways</span>
        </button>
        <button type="button" onClick={() => setActiveTab('notifications')} className={`px-4 py-2.5 font-semibold transition-colors flex items-center gap-2 cursor-pointer ${activeTab === 'notifications'
            ? 'border-b-2 border-[#1A1A1A] text-[#1A1A1A]'
            : 'text-[#6B6864] hover:text-[#1A1A1A]'}`}>
          <Bell className="w-4 h-4"/>
          <span>Staff Alerts & Webhooks</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'general' && (<div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs space-y-5">
          <h2 className="font-serif text-xl font-bold text-[#1A1A1A] border-b border-[#F2EFE9] pb-3">
            Maison General Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider mb-1">
                Storefront Brand Name *
              </label>
              <input type="text" required value={storeName} onChange={(e) => setStoreName(e.target.value)} className="w-full px-3.5 py-2.5 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs text-[#1A1A1A]"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider mb-1">
                Legal Entity
              </label>
              <input type="text" value={legalEntity} onChange={(e) => setLegalEntity(e.target.value)} className="w-full px-3.5 py-2.5 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs text-[#1A1A1A]"/>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider mb-1">
                Private Concierge Email
              </label>
              <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full px-3.5 py-2.5 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs text-[#1A1A1A]"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider mb-1">
                Salon Telephone
              </label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3.5 py-2.5 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs text-[#1A1A1A]"/>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider mb-1">
              Flagship Showroom Address (Displayed on Invoices)
            </label>
            <input type="text" value={flagshipAddress} onChange={(e) => setFlagshipAddress(e.target.value)} className="w-full px-3.5 py-2.5 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs text-[#1A1A1A]"/>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider mb-1">
                Primary Currency
              </label>
              <select value={baseCurrency} onChange={(e) => setBaseCurrency(e.target.value)} className="w-full px-3.5 py-2.5 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs text-[#1A1A1A]">
                <option value="USD">INR (₹) — Indian Rupee</option>
                <option value="EUR">EUR (€) — Euro</option>
                <option value="GBP">GBP (£) — British Pound</option>
                <option value="CHF">CHF — Swiss Franc</option>
                <option value="JPY">JPY (¥) — Japanese Yen</option>
              </select>
            </div>
          </div>
        </div>)}

      {activeTab === 'shipping' && (<div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs space-y-5">
          <h2 className="font-serif text-xl font-bold text-[#1A1A1A] border-b border-[#F2EFE9] pb-3">
            White Glove Delivery & Packaging Rules
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider mb-1">
                Complimentary Courier Minimum Threshold (₹ INR)
              </label>
              <input type="number" value={freeShippingThreshold} onChange={(e) => setFreeShippingThreshold(Number(e.target.value))} className="w-full px-3.5 py-2.5 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs font-mono text-[#1A1A1A]"/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider mb-1">
                Dedicated White Glove Hand-Delivery Fee (₹ INR)
              </label>
              <input type="number" value={whiteGloveRate} onChange={(e) => setWhiteGloveRate(Number(e.target.value))} className="w-full px-3.5 py-2.5 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs font-mono text-[#1A1A1A]"/>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input type="checkbox" id="enableMono" checked={enableMonogramming} onChange={(e) => setEnableMonogramming(e.target.checked)} className="rounded text-[#C8A87C] focus:ring-[#C8A87C]"/>
            <label htmlFor="enableMono" className="text-xs font-semibold text-[#1A1A1A]">
              Offer Complimentary Gold Foil Monogramming & Embossing on Leather Goods
            </label>
          </div>
        </div>)}

      {activeTab === 'payment' && (<div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs space-y-5">
          <h2 className="font-serif text-xl font-bold text-[#1A1A1A] border-b border-[#F2EFE9] pb-3">
            Secure Payment Channels
          </h2>

          <div className="space-y-3">
            <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8E4DC] flex items-center justify-between">
              <div>
                <div className="font-semibold text-xs text-[#1A1A1A]">Stripe Haute Luxury Processing</div>
                <div className="text-[11px] text-[#6B6864]">Accepts Visa, Mastercard, American Express Centurion, Diners Club</div>
              </div>
              <input type="checkbox" checked={stripeEnabled} onChange={(e) => setStripeEnabled(e.target.checked)} className="rounded text-[#C8A87C] focus:ring-[#C8A87C]"/>
            </div>

            <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8E4DC] flex items-center justify-between">
              <div>
                <div className="font-semibold text-xs text-[#1A1A1A]">Apple Pay & Digital Wallets</div>
                <div className="text-[11px] text-[#6B6864]">Biometric one-tap checkout for iOS & Safari clients</div>
              </div>
              <input type="checkbox" checked={applePayEnabled} onChange={(e) => setApplePayEnabled(e.target.checked)} className="rounded text-[#C8A87C] focus:ring-[#C8A87C]"/>
            </div>

            <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8E4DC] flex items-center justify-between">
              <div>
                <div className="font-semibold text-xs text-[#1A1A1A]">Private Swiss / Parisian Bank Wire Transfer</div>
                <div className="text-[11px] text-[#6B6864]">Reserved for High Jewelry & custom Haute Couture orders exceeding ₹50,000</div>
              </div>
              <input type="checkbox" checked={bankWireForHighOrders} onChange={(e) => setBankWireForHighOrders(e.target.checked)} className="rounded text-[#C8A87C] focus:ring-[#C8A87C]"/>
            </div>
          </div>
        </div>)}

      {activeTab === 'notifications' && (<div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs space-y-5">
          <h2 className="font-serif text-xl font-bold text-[#1A1A1A] border-b border-[#F2EFE9] pb-3">
            Internal Staff Alerts & Notifications
          </h2>

          <div className="space-y-3">
            <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8E4DC] flex items-center justify-between">
              <div>
                <div className="font-semibold text-xs text-[#1A1A1A]">Low Vault Stock Shortage Alerts</div>
                <div className="text-[11px] text-[#6B6864]">Send email to inventory team when a piece drops below 4 units</div>
              </div>
              <input type="checkbox" checked={notifyLowStock} onChange={(e) => setNotifyLowStock(e.target.checked)} className="rounded text-[#C8A87C] focus:ring-[#C8A87C]"/>
            </div>

            <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8E4DC] flex items-center justify-between">
              <div>
                <div className="font-semibold text-xs text-[#1A1A1A]">High-Value Order Alerts</div>
                <div className="text-[11px] text-[#6B6864]">Send mobile alert to customer relations when a client places an order</div>
              </div>
              <input type="checkbox" checked={notifyVICOrder} onChange={(e) => setNotifyVICOrder(e.target.checked)} className="rounded text-[#C8A87C] focus:ring-[#C8A87C]"/>
            </div>

            <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8E4DC] flex items-center justify-between">
              <div>
                <div className="font-semibold text-xs text-[#1A1A1A]">Executive Daily Performance Digest</div>
                <div className="text-[11px] text-[#6B6864]">Email midnight PDF summary of gross revenue and fulfillment KPIs</div>
              </div>
              <input type="checkbox" checked={notifyDailyDigest} onChange={(e) => setNotifyDailyDigest(e.target.checked)} className="rounded text-[#C8A87C] focus:ring-[#C8A87C]"/>
            </div>
          </div>
        </div>)}
    </form>);
};
export default StoreSettings;
