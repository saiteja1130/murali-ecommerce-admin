import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { useCustomer } from '../../context/CustomerContext';
import { ArrowLeft, ShoppingBag, Heart, MapPin, MessageSquare, Mail, Phone, ShieldCheck, Loader2 } from 'lucide-react';
export const CustomerProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { orders, showToast } = useAdmin();
    const { fetchCustomerById, updateCustomerTier, updateCustomer, toggleCustomerStatus, addCustomerNote } = useCustomer();
    
    const [customer, setCustomer] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [vipTier, setVipTier] = useState('Client');
    const [newNote, setNewNote] = useState('');
    const [notesList, setNotesList] = useState([]);

    useEffect(() => {
        const fetchCustomer = async () => {
            setIsLoading(true);
            try {
                const mappedCustomer = await fetchCustomerById(id);
                setCustomer(mappedCustomer);
                setVipTier(mappedCustomer.vipTier || 'Client');
                setNotesList(mappedCustomer.notes ? [mappedCustomer.notes] : []);
            } catch (error) {
                showToast('danger', 'Error', 'Failed to fetch customer profile.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchCustomer();
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-[#A68758]">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p>Loading client dossier...</p>
            </div>
        );
    }

    if (!customer) {
        return (<div className="p-8 text-center text-[#6B6864]">
        Client profile not found.{' '}
        <Link to="/admin/customers" className="text-[#A68758] underline">
          Return to directory
        </Link>
      </div>);
    }
    // Find all orders placed by this customer
    const customerOrders = orders.filter((o) => o.customer.id === customer.id || o.customer.email === customer.email);
    const handleUpdateVIPTier = (newTier) => {
        setVipTier(newTier);
        updateCustomer(customer.id, { vipTier: newTier });
        showToast('success', 'Tier Updated', `Patron tier updated to ${newTier}.`);
    };
    const handleAddNote = (e) => {
        e.preventDefault();
        if (!newNote.trim())
            return;
        const updated = [newNote.trim(), ...notesList];
        setNotesList(updated);
        updateCustomer(customer.id, { notes: updated.join(' | ') });
        setNewNote('');
        showToast('info', 'Concierge Note Saved', 'Added to patron dossier.');
    };
    return (<div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E4DC]">
        <div className="flex items-center gap-3">
          <Link to="/admin/customers" className="p-2 rounded-xl bg-white border border-[#E8E4DC] text-[#6B6864] hover:text-[#1A1A1A] hover:bg-[#FAF8F5] transition-colors">
            <ArrowLeft className="w-4 h-4"/>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
                {customer.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono tracking-wider bg-[#1A1A1A] text-[#C8A87C] font-bold">
                {customer.vipTier || 'Client'}
              </span>
            </div>
            <p className="text-xs text-[#6B6864] mt-0.5">
              Client ID: <span className="font-mono">{customer.id}</span> • Member since {new Date(customer.createdAt).getFullYear()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#E8E4DC]">
            <span className="text-xs font-semibold text-[#1A1A1A]">Assign Tier:</span>
            <select value={customer.vipTier || 'Client'} onChange={(e) => handleUpdateVIPTier(e.target.value)} className="bg-[#F8F6F3] border border-[#E8E4DC] rounded-lg px-2 py-1 text-xs font-semibold text-[#1A1A1A] focus:outline-none focus:border-[#C8A87C]">
              <option value="VIC (Very Important Client)">VIC (Very Important Client)</option>
              <option value="Haute Member">Haute Member</option>
              <option value="Private Collector">Private Collector</option>
              <option value="Client">Standard Client</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Overview Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5 shadow-2xs">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-[#A68758]">
            Lifetime Spend (LTV)
          </div>
          <div className="font-mono-data text-2xl font-bold text-[#1A1A1A] mt-1">
            ${(customer.totalSpent || 0).toLocaleString()} USD
          </div>
          <div className="text-xs text-[#6B6864] mt-1">Direct couture purchases</div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5 shadow-2xs">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-[#A68758]">
            Completed Orders
          </div>
          <div className="font-mono-data text-2xl font-bold text-[#1A1A1A] mt-1">
            {customerOrders.length || (customer.orderCount || 0)} Orders
          </div>
          <div className="text-xs text-[#6B6864] mt-1">White-glove dispatched</div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5 shadow-2xs">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-[#A68758]">
            Average Basket Size
          </div>
          <div className="font-mono-data text-2xl font-bold text-[#1A1A1A] mt-1">
            ${Math.round((customer.totalSpent || 0) / (customer.orderCount || 1)).toLocaleString()}
          </div>
          <div className="text-xs text-[#6B6864] mt-1">Per transaction average</div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5 shadow-2xs">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-[#A68758]">
            Account Standing
          </div>
          <div className="text-sm font-bold text-[#4A7A5E] mt-2 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4"/>
            <span className="capitalize">{customer.status} • Verified Patron</span>
          </div>
          <div className="text-xs text-[#6B6864] mt-1">Compliant KYC verified</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Order History & Active Wishlist */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order History */}
          <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs space-y-4">
            <h2 className="font-serif text-lg font-bold text-[#1A1A1A] border-b border-[#F2EFE9] pb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#C8A87C]"/>
                <span>Acquisition & Order History</span>
              </span>
              <span className="text-xs text-[#6B6864] font-sans">
                {customerOrders.length} records
              </span>
            </h2>

            {customerOrders.length === 0 ? (<div className="py-8 text-center text-xs text-[#6B6864]">
                No recorded orders yet for this profile.
              </div>) : (<div className="divide-y divide-[#F2EFE9]">
                {customerOrders.map((order) => (<div key={order.id} onClick={() => navigate(`/admin/orders/${order.id}`)} className="py-3.5 flex items-center justify-between hover:bg-[#FAF8F5] px-2 rounded-xl cursor-pointer transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#1A1A1A]">
                          {order.orderNumber}
                        </span>
                        <span className="text-[10px] px-2 py-0.2 rounded font-mono uppercase bg-[#FAF8F5] border border-[#E8E4DC] text-[#6B6864]">
                          {order.status}
                        </span>
                      </div>
                      <div className="text-xs text-[#6B6864] mt-1">
                        {order.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono-data font-bold text-sm text-[#1A1A1A]">
                        ₹{order.total.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-[#6B6864]">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>))}
              </div>)}
          </div>

          {/* Active Wishlist Snapshot */}
          <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs space-y-4">
            <h2 className="font-serif text-lg font-bold text-[#1A1A1A] border-b border-[#F2EFE9] pb-3 flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#C8A87C]"/>
              <span>Private Salon Wishlist Snapshot</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(customer.wishlist || []).map((item, idx) => (<div key={idx} className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E4DC] flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-[#1A1A1A]">{item.name}</div>
                    <div className="text-[10px] text-[#6B6864] mt-0.5">
                      Added on {new Date(item.addedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="font-mono-data font-bold text-[#1A1A1A]">
                    ₹{item.price.toLocaleString()}
                  </div>
                </div>))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Contact Info, Sizing, Private Concierge Notes */}
        <div className="space-y-6">
          {/* Contact Details & Addresses Card */}
          <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs space-y-4">
            <h3 className="font-serif text-base font-bold text-[#1A1A1A] border-b border-[#F2EFE9] pb-2">
              Patron Information
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2.5 text-[#1A1A1A]">
                <Mail className="w-4 h-4 text-[#A68758]"/>
                <span>{customer.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-[#1A1A1A]">
                <Phone className="w-4 h-4 text-[#A68758]"/>
                <span className="font-mono">{customer.phone}</span>
              </div>
              <div className="flex items-start gap-2.5 text-[#1A1A1A]">
                <MapPin className="w-4 h-4 text-[#A68758] mt-0.5"/>
                <div>
                  <div className="font-medium">{customer.city || 'Unknown City'}, {customer.country || 'Unknown Country'}</div>
                  <div className="text-[11px] text-[#6B6864]">Primary White Glove Destination</div>
                </div>
              </div>
            </div>

            {/* Custom Sizing Notes */}
            <div className="pt-3 border-t border-[#F2EFE9]">
              <div className="text-[10px] uppercase font-mono tracking-wider font-semibold text-[#A68758] mb-1.5">
                Bespoke Atelier Sizing
              </div>
              <div className="p-2.5 bg-[#FAF8F5] rounded-xl border border-[#E8E4DC] text-xs text-[#1A1A1A]">
                Standard FR 36 / US 4. Prefers elongated hems on silk trenches.
              </div>
            </div>
          </div>

          {/* Concierge Notes Card */}
          <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs space-y-4">
            <h3 className="font-serif text-base font-bold text-[#1A1A1A] border-b border-[#F2EFE9] pb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#C8A87C]"/>
              <span>Concierge Notes & Stylist Log</span>
            </h3>

            <div className="space-y-2.5">
              {notesList.map((note, idx) => (<div key={idx} className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E4DC] text-xs text-[#1A1A1A] leading-relaxed">
                  {note}
                </div>))}
            </div>

            <form onSubmit={handleAddNote} className="space-y-2 pt-2">
              <textarea rows={2} value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Log private appointment preferences or gifting notes..." className="w-full px-3 py-2 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs text-[#1A1A1A] focus:outline-none focus:border-[#C8A87C]"/>
              <button type="submit" className="w-full py-2 bg-[#1A1A1A] text-white text-xs font-semibold rounded-xl hover:bg-[#333333] transition-colors">
                Add Stylist Note
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>);
};
export default CustomerProfile;
