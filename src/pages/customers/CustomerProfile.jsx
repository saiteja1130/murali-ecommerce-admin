import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { useCustomer } from '../../context/CustomerContext';
import { ArrowLeft, ShoppingBag, Heart, MapPin, MessageSquare, Mail, Phone, ShieldCheck, Loader2 } from 'lucide-react';

export const CustomerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders = [], showToast } = useAdmin();
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
        setVipTier(mappedCustomer?.vipTier || 'Client');
        setNotesList(mappedCustomer?.notes ? [mappedCustomer.notes] : []);
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
      <div className="flex flex-col items-center justify-center p-12 text-[#506040]">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p className="text-xs text-[#687163]">Loading customer profile...</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-8 text-center text-[#687163] text-xs">
        Customer profile not found.{' '}
        <Link to="/admin/customers" className="text-[#506040] underline font-semibold">
          Return to directory
        </Link>
      </div>
    );
  }

  // Find all orders placed by this customer safely
  const customerOrders = (orders || []).filter((o) => {
    if (!o) return false;
    const orderCustomerId = o.customer?.id || o.customer?._id || o.customerId || o.user?._id || o.user;
    const orderCustomerEmail = o.customer?.email || o.email;
    return (
      (orderCustomerId && String(orderCustomerId) === String(customer.id)) ||
      (orderCustomerEmail && customer.email && orderCustomerEmail.toLowerCase() === customer.email.toLowerCase())
    );
  });

  const totalSpent = customerOrders.reduce((sum, ord) => sum + Number(ord?.total || 0), 0) || Number(customer.totalSpent || 0);

  const handleUpdateVIPTier = (newTier) => {
    setVipTier(newTier);
    updateCustomer(customer.id, { vipTier: newTier });
    showToast('success', 'Tier Updated', `Customer tier updated to ${newTier}.`);
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    const updated = [newNote.trim(), ...notesList];
    setNotesList(updated);
    updateCustomer(customer.id, { notes: updated.join(' | ') });
    setNewNote('');
    showToast('info', 'Note Saved', 'Customer note added successfully.');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E4DC]">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/customers"
            className="p-2 rounded-xl bg-white border border-[#E8E4DC] text-[#687163] hover:text-[#1D241C] hover:bg-[#FAF8F5] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1D241C]">
                {customer.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono tracking-wider bg-[#506040]/15 text-[#506040] font-bold border border-[#506040]/30">
                {customer.vipTier || 'Client'}
              </span>
            </div>
            <p className="text-xs text-[#687163] mt-0.5">
              Customer ID: <span className="font-mono">{customer.id}</span>
              {customer.createdAt ? ` • Joined ${new Date(customer.createdAt).toLocaleDateString()}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#E8E4DC]">
            <span className="text-xs font-semibold text-[#1D241C]">Member Tier:</span>
            <select
              value={customer.vipTier || 'Client'}
              onChange={(e) => handleUpdateVIPTier(e.target.value)}
              className="bg-[#FAF8F5] border border-[#E8E4DC] rounded-lg px-2 py-1 text-xs font-semibold text-[#1D241C] focus:outline-none focus:border-[#C69E58]"
            >
              <option value="Client">Standard Client</option>
              <option value="Gold Member">Gold Member</option>
              <option value="Platinum Member">Platinum Member</option>
              <option value="VIP Patron">VIP Patron</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Overview Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5 shadow-2xs">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-[#506040]">
            Total Spent
          </div>
          <div className="font-mono-data text-2xl font-bold text-[#1D241C] mt-1">
            ₹{totalSpent.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-[#687163] mt-1">Lifetime order total</div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5 shadow-2xs">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-[#506040]">
            Total Orders
          </div>
          <div className="font-mono-data text-2xl font-bold text-[#1D241C] mt-1">
            {customerOrders.length} Order{customerOrders.length === 1 ? '' : 's'}
          </div>
          <div className="text-xs text-[#687163] mt-1">Completed purchases</div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5 shadow-2xs">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-[#506040]">
            Average Order Value
          </div>
          <div className="font-mono-data text-2xl font-bold text-[#1D241C] mt-1">
            ₹{customerOrders.length > 0 ? Math.round(totalSpent / customerOrders.length).toLocaleString('en-IN') : '0'}
          </div>
          <div className="text-xs text-[#687163] mt-1">Per transaction average</div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5 shadow-2xs">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-[#506040]">
            Account Status
          </div>
          <div className="text-sm font-bold text-emerald-700 mt-2 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span className="capitalize">{customer.status || 'Active'} Account</span>
          </div>
          <div className="text-xs text-[#687163] mt-1">Verified customer profile</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Order History & Active Wishlist */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order History */}
          <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs space-y-4">
            <h2 className="font-serif text-lg font-bold text-[#1D241C] border-b border-[#E8E4DC] pb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#506040]" />
                <span>Order History</span>
              </span>
              <span className="text-xs text-[#687163] font-sans">
                {customerOrders.length} order{customerOrders.length === 1 ? '' : 's'}
              </span>
            </h2>

            {customerOrders.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#687163]">
                No recorded orders yet for this customer.
              </div>
            ) : (
              <div className="divide-y divide-[#E8E4DC]">
                {customerOrders.map((order) => (
                  <div
                    key={order.id || order._id}
                    onClick={() => navigate(`/admin/orders/${order.id || order._id}`)}
                    className="py-3.5 flex items-center justify-between hover:bg-[#FAF8F5] px-2 rounded-xl cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#1D241C]">
                          {order.orderNumber || order.id || order._id}
                        </span>
                        <span className="text-[10px] px-2 py-0.2 rounded font-mono uppercase bg-[#FAF8F5] border border-[#E8E4DC] text-[#687163]">
                          {order.status || 'Pending'}
                        </span>
                      </div>
                      <div className="text-xs text-[#687163] mt-1">
                        {(order.items || []).map((i) => `${i.quantity || 1}x ${i.productName || i.name || 'Product'}`).join(', ')}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono-data font-bold text-sm text-[#1D241C]">
                        ₹{Number(order.total || 0).toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-[#687163]">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Wishlist Snapshot */}
          <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs space-y-4">
            <h2 className="font-serif text-lg font-bold text-[#1D241C] border-b border-[#E8E4DC] pb-3 flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#506040]" />
              <span>Customer Wishlist</span>
            </h2>

            {(!customer.wishlist || customer.wishlist.length === 0) ? (
              <div className="py-6 text-center text-xs text-[#687163]">
                No items in wishlist.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {customer.wishlist.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E4DC] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-[#1D241C]">{item.name}</div>
                      {item.addedAt && (
                        <div className="text-[10px] text-[#687163] mt-0.5">
                          Added on {new Date(item.addedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <div className="font-mono-data font-bold text-[#1D241C]">
                      ₹{Number(item.price || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Contact Info & Saved Addresses */}
        <div className="space-y-6">
          {/* Contact Details Card */}
          <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs space-y-4">
            <h3 className="font-serif text-base font-bold text-[#1D241C] border-b border-[#E8E4DC] pb-2">
              Customer Contact Information
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2.5 text-[#1D241C]">
                <Mail className="w-4 h-4 text-[#506040]" />
                <span>{customer.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-[#1D241C]">
                <Phone className="w-4 h-4 text-[#506040]" />
                <span className="font-mono">{customer.phone || 'No phone registered'}</span>
              </div>
              {customer.addresses && customer.addresses.length > 0 && (
                <div className="flex items-start gap-2.5 text-[#1D241C]">
                  <MapPin className="w-4 h-4 text-[#506040] mt-0.5" />
                  <div>
                    <div className="font-medium">
                      {customer.addresses[0].city}, {customer.addresses[0].state || customer.addresses[0].country}
                    </div>
                    <div className="text-[11px] text-[#687163]">
                      {customer.addresses.length} saved address{customer.addresses.length === 1 ? '' : 'es'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Saved Delivery Addresses Card */}
          <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs space-y-4">
            <h3 className="font-serif text-base font-bold text-[#1D241C] border-b border-[#E8E4DC] pb-2 flex items-center justify-between">
              <span>Saved Delivery Addresses</span>
              <span className="text-xs font-mono font-bold text-[#506040]">
                {customer.addresses?.length || 0}
              </span>
            </h3>

            {(!customer.addresses || customer.addresses.length === 0) ? (
              <div className="text-xs text-[#687163] py-2 text-center">
                No delivery addresses added yet by this customer.
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                {customer.addresses.map((addr, idx) => (
                  <div
                    key={addr._id || addr.id || idx}
                    className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                      addr.isDefault ? 'border-[#506040] bg-[#FAF8F5]' : 'border-[#E8E4DC] bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-[#1D241C]">
                      <span>{addr.fullName || customer.name}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] font-mono uppercase bg-[#FAF8F5] border border-[#E8E4DC] text-[#687163] px-1.5 py-0.2 rounded">
                          {addr.addressType || 'Home'}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[9px] font-mono uppercase bg-[#506040] text-white px-1.5 py-0.2 rounded">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-[#687163]">
                      {addr.street} {addr.apartment ? `, ${addr.apartment}` : ''}
                    </div>
                    <div className="text-[#687163]">
                      {addr.city}, {addr.state} {addr.postalCode}
                    </div>
                    <div className="text-[#1D241C] font-mono text-[11px] pt-1">
                      Phone: {addr.phone || customer.phone || 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Concierge Notes Card */}
          <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs space-y-4">
            <h3 className="font-serif text-base font-bold text-[#1D241C] border-b border-[#E8E4DC] pb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#506040]" />
              <span>Customer Notes & Preferences</span>
            </h3>

            <div className="space-y-2.5">
              {notesList.map((note, idx) => (
                <div key={idx} className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E4DC] text-xs text-[#1D241C] leading-relaxed">
                  {note}
                </div>
              ))}
            </div>

            <form onSubmit={handleAddNote} className="space-y-2 pt-2">
              <textarea
                rows={2}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add private note about this customer..."
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs text-[#1D241C] focus:outline-none focus:border-[#C69E58]"
              />
              <button
                type="submit"
                className="w-full py-2 bg-[#1D241C] hover:bg-[#C69E58] text-white hover:text-[#1D241C] text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Add Customer Note
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
