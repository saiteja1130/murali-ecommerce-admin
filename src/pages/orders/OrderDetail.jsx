import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { PrintableInvoice } from '../../components/PrintableInvoice';
import { ArrowLeft, Printer, RotateCcw, CheckCircle2, Truck, CreditCard, User, MapPin, MessageSquare, Sparkles, ChevronRight } from 'lucide-react';
export const OrderDetail = () => {
    const { id } = useParams();
    const { orders, updateOrderStatus, addOrderNote, refundOrder, showToast, currentUser } = useAdmin();
    const navigate = useNavigate();
    const order = orders.find((o) => o.id === id);
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [refundReason, setRefundReason] = useState('Bespoke fit modification requested by client');
    const [refundAmount, setRefundAmount] = useState(order ? order.total : 0);
    const [newNote, setNewNote] = useState('');
    const [carrierInput, setCarrierInput] = useState(order?.carrier || 'White Glove Private Courier');
    const [trackingInput, setTrackingInput] = useState(order?.trackingNumber || 'SMI-WG-8921104');
    if (!order) {
        return (<div className="p-8 text-center text-[#6B6864]">
        Order not found.{' '}
        <Link to="/admin/orders" className="text-[#A68758] underline">
          Return to Orders
        </Link>
      </div>);
    }
    const handleStatusChange = (newStatus) => {
        updateOrderStatus(order.id, newStatus, trackingInput, carrierInput);
    };
    const handleAddNote = (e) => {
        e.preventDefault();
        if (!newNote.trim())
            return;
        addOrderNote(order.id, newNote.trim(), currentUser?.name || 'Concierge Staff');
        setNewNote('');
    };
    const handleExecuteRefund = () => {
        refundOrder(order.id, refundAmount, refundReason);
        setShowRefundModal(false);
    };
    const timelineSteps = [
        { status: 'pending', label: 'Order Placed & Secured', date: order.createdAt },
        { status: 'processing', label: 'Atelier Inspection & Monogramming' },
        { status: 'shipped', label: 'White Glove Courier In Transit' },
        { status: 'delivered', label: 'Order Delivered' },
    ];
    const currentStepIdx = timelineSteps.findIndex((s) => s.status === order.status);
    return (<div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E4DC]">
        <div className="flex items-center gap-3">
          <Link to="/admin/orders" className="p-2 rounded-xl bg-white border border-[#E8E4DC] text-[#6B6864] hover:text-[#1A1A1A] hover:bg-[#FAF8F5] transition-colors">
            <ArrowLeft className="w-4 h-4"/>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
                Order {order.orderNumber}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono tracking-wider bg-[#FAF8F5] text-[#1A1A1A] border border-[#E8E4DC] font-bold">
                Patron Order
              </span>
            </div>
            <p className="text-xs text-[#6B6864] mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button onClick={() => setShowPrintModal(true)} className="px-3.5 py-2 bg-white hover:bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs font-semibold text-[#1A1A1A] transition-colors flex items-center gap-2 shadow-2xs">
            <Printer className="w-3.5 h-3.5 text-[#C8A87C]"/>
            <span>Print Invoice & Packing Slip</span>
          </button>

          {order.paymentStatus === 'paid' && (<button onClick={() => {
                setRefundAmount(order.total);
                setShowRefundModal(true);
            }} className="px-3.5 py-2 bg-white hover:bg-[#A5432F]/5 border border-[#A5432F]/30 rounded-xl text-xs font-semibold text-[#A5432F] transition-colors flex items-center gap-2">
              <RotateCcw className="w-3.5 h-3.5"/>
              <span>Issue Refund</span>
            </button>)}
        </div>
      </div>

      {/* Fulfillment Stepper & Quick Status Selector Card */}
      <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F2EFE9] pb-4">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#A68758]">
              Fulfillment Journey
            </span>
            <div className="text-sm font-semibold text-[#1A1A1A] mt-0.5">
              Status: <span className="capitalize text-[#C8A87C]">{order.status}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#1A1A1A]">Update Stage:</span>
            <select value={order.status} onChange={(e) => handleStatusChange(e.target.value)} className="px-3 py-1.5 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs font-medium text-[#1A1A1A] focus:outline-none focus:border-[#C8A87C]">
              <option value="pending">Pending Payment</option>
              <option value="processing">Processing (Atelier)</option>
              <option value="shipped">Shipped (In Transit)</option>
              <option value="delivered">Delivered (Completed)</option>
              <option value="cancelled">Cancelled</option>
              <option value="returned">Returned</option>
            </select>
          </div>
        </div>

        {/* Stepper Display */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
          {timelineSteps.map((step, idx) => {
            const isCompleted = currentStepIdx >= idx;
            const isCurrent = currentStepIdx === idx;
            return (<div key={step.status} className={`p-4 rounded-xl border transition-colors ${isCurrent
                    ? 'bg-[#FAF8F5] border-[#C8A87C]'
                    : isCompleted
                        ? 'bg-white border-[#4A7A5E]/30'
                        : 'bg-[#FAF8F5]/50 border-[#E8E4DC] opacity-60'}`}>
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isCompleted ? 'bg-[#4A7A5E] text-white' : 'bg-[#E8E4DC] text-[#6B6864]'}`}>
                    {isCompleted ? <CheckCircle2 className="w-4 h-4"/> : idx + 1}
                  </div>
                  <span className="text-xs font-bold text-[#1A1A1A]">
                    {step.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-[11px] text-[#6B6864] mt-2 leading-tight">
                  {step.label}
                </div>
              </div>);
        })}
        </div>
      </div>

      {/* Main Grid: Left Items + Timeline & Right Customer Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Line items + Logistics tracking */}
        <div className="lg:col-span-2 space-y-6">
          {/* Line Items Card */}
          <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs space-y-4">
            <h2 className="font-serif text-lg font-bold text-[#1A1A1A] border-b border-[#F2EFE9] pb-3 flex items-center justify-between">
              <span>Garments & Atelier Pieces</span>
              <span className="text-xs font-normal text-[#6B6864] font-sans">
                {order.items.length} Item(s)
              </span>
            </h2>

            <div className="divide-y divide-[#F2EFE9]">
              {order.items.map((item) => (<div key={item.id} className="py-4 flex items-center gap-4 first:pt-0 last:pb-0">
                  <img src={item.image} alt={item.productName} className="w-16 h-20 rounded-xl object-cover border border-[#E8E4DC] shrink-0"/>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-[#1A1A1A]">
                      {item.productName}
                    </div>
                    <div className="text-xs text-[#6B6864] mt-0.5 flex flex-wrap items-center gap-2">
                      <span className="font-mono">{item.sku}</span>
                      <span>•</span>
                      <span>Color: <strong>{item.color}</strong></span>
                      <span>•</span>
                      <span>Size: <strong>{item.size}</strong></span>
                    </div>
                    {item.isAtelier && (<div className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded bg-[#C8A87C]/15 text-[#A68758] text-[10px] font-semibold">
                        <Sparkles className="w-3 h-3"/>
                        <span>Hand-Numbered Atelier Edition</span>
                      </div>)}
                  </div>
                  <div className="text-right font-mono-data">
                    <div className="text-xs text-[#6B6864]">
                      {item.quantity} x ${item.unitPrice.toLocaleString()}
                    </div>
                    <div className="font-bold text-sm text-[#1A1A1A] mt-0.5">
                      ${item.totalPrice.toLocaleString()}
                    </div>
                  </div>
                </div>))}
            </div>

            {/* Financial Totals Calculation */}
            <div className="pt-4 border-t border-[#F2EFE9] space-y-2 text-xs">
              <div className="flex justify-between text-[#6B6864]">
                <span>Subtotal</span>
                <span className="font-mono-data">₹{order.subtotal.toLocaleString()}</span>
              </div>
              {order.discount > 0 && (<div className="flex justify-between text-[#4A7A5E]">
                  <span>Promotional Discount</span>
                  <span className="font-mono-data">-${order.discount.toLocaleString()}</span>
                </div>)}
              <div className="flex justify-between text-[#6B6864]">
                <span>Insured White Glove Courier</span>
                <span className="font-mono-data">
                  {order.shipping === 0 ? 'Complimentary' : `$${order.shipping.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between text-[#6B6864]">
                <span>Sales Tax / VAT</span>
                <span className="font-mono-data">₹{order.tax.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t-2 border-[#1A1A1A] flex justify-between font-bold text-base text-[#1A1A1A]">
                <span>Total Amount</span>
                <span className="font-mono-data">₹{order.total.toFixed(2)} USD</span>
              </div>
            </div>
          </div>

          {/* White Glove Courier Logistics Dispatch */}
          <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs space-y-4">
            <h2 className="font-serif text-lg font-bold text-[#1A1A1A] border-b border-[#F2EFE9] pb-3 flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#C8A87C]"/>
              <span>Courier & Tracking Assignment</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider mb-1">
                  Designated Courier
                </label>
                <input type="text" value={carrierInput} onChange={(e) => setCarrierInput(e.target.value)} placeholder="White Glove Courier / DHL Express" className="w-full px-3.5 py-2 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs text-[#1A1A1A]"/>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider mb-1">
                  Airway Bill / Tracking Code
                </label>
                <input type="text" value={trackingInput} onChange={(e) => setTrackingInput(e.target.value)} placeholder="SMI-WG-8921104" className="w-full px-3.5 py-2 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs font-mono text-[#1A1A1A]"/>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="button" onClick={() => {
            updateOrderStatus(order.id, order.status, trackingInput, carrierInput);
            showToast('success', 'Tracking Updated', 'Client notified via SMS concierge.');
        }} className="px-4 py-1.5 bg-[#1A1A1A] text-white text-xs font-semibold rounded-xl hover:bg-[#333333] transition-colors">
                Update Logistics Info
              </button>
            </div>
          </div>

          {/* Internal Staff Notes & Concierge Audit */}
          <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs space-y-4">
            <h2 className="font-serif text-lg font-bold text-[#1A1A1A] border-b border-[#F2EFE9] pb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#C8A87C]"/>
              <span>Internal Concierge Notes (Staff Only)</span>
            </h2>

            <div className="space-y-3">
              {order.notes && order.notes.length > 0 ? (order.notes.map((note) => (<div key={note.id} className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E4DC] text-xs">
                    <div className="flex items-center justify-between text-[#6B6864] text-[11px] mb-1">
                      <span className="font-semibold text-[#1A1A1A]">{note.author}</span>
                      <span>{new Date(note.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-[#1A1A1A] leading-relaxed">{note.text}</p>
                  </div>))) : (<div className="text-xs text-[#6B6864] italic">No internal staff notes recorded yet.</div>)}
            </div>

            <form onSubmit={handleAddNote} className="pt-2 flex gap-2">
              <input type="text" value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Add confidential packing note or client sizing nuance..." className="flex-1 px-3.5 py-2 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs text-[#1A1A1A] focus:outline-none focus:border-[#C8A87C]"/>
              <button type="submit" className="px-4 py-2 bg-[#1A1A1A] text-white text-xs font-semibold rounded-xl hover:bg-[#333333] transition-colors shrink-0">
                Post Note
              </button>
            </form>
          </div>
        </div>

        {/* Right 1 Col: Customer Dossier & Address Cards */}
        <div className="space-y-6">
          {/* Customer Profile Card */}
          <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#F2EFE9] pb-3">
              <h3 className="font-serif text-base font-bold text-[#1A1A1A] flex items-center gap-2">
                <User className="w-4 h-4 text-[#C8A87C]"/>
                <span>Patron Dossier</span>
              </h3>
              <Link to={`/admin/customers/${order.customer.id}`} className="text-xs text-[#A68758] hover:text-[#1A1A1A] flex items-center gap-1 font-medium">
                <span>Full Profile</span>
                <ChevronRight className="w-3 h-3"/>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#FAF8F5] border border-[#C8A87C]/30 flex items-center justify-center font-serif text-lg font-bold text-[#1A1A1A]">
                {order.customer.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm text-[#1A1A1A] truncate">{order.customer.name}</div>
                <div className="text-xs text-[#6B6864] truncate">{order.customer.email}</div>
                <div className="text-xs font-mono text-[#1A1A1A] mt-0.5">{order.customer.phone}</div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#F2EFE9] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#6B6864]">Account Status</span>
                <span className="font-semibold text-[#1A1A1A]">Registered Patron</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6864]">Lifetime Spend</span>
                <span className="font-mono-data font-bold text-[#1A1A1A]">
                  ${order.customer.totalSpent.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6864]">Past Completed Orders</span>
                <span className="font-mono-data font-semibold text-[#1A1A1A]">
                  {order.customer.orderCount} Orders
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Destination Card */}
          <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs space-y-3">
            <h3 className="font-serif text-base font-bold text-[#1A1A1A] border-b border-[#F2EFE9] pb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#C8A87C]"/>
              <span>Bespoke Delivery Address</span>
            </h3>

            <div className="text-xs text-[#1A1A1A] space-y-1 leading-relaxed">
              <div className="font-semibold">{order.customer.name}</div>
              <div>{order.shippingAddress.street}</div>
              {order.shippingAddress.suite && <div>{order.shippingAddress.suite}</div>}
              <div>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</div>
              <div>{order.shippingAddress.country}</div>
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs space-y-3">
            <h3 className="font-serif text-base font-bold text-[#1A1A1A] border-b border-[#F2EFE9] pb-2 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#C8A87C]"/>
              <span>Settlement & Payment</span>
            </h3>

            <div className="text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#6B6864]">Gateway / Method</span>
                <span className="font-medium text-[#1A1A1A]">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6864]">Status</span>
                <span className="font-mono font-bold uppercase text-[#4A7A5E] bg-[#4A7A5E]/10 px-2 py-0.5 rounded">
                  {order.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6864]">Packaging Preference</span>
                <span className="font-medium text-[#A68758]">Monogrammed Muslin & Cedar</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Invoice Modal */}
      {showPrintModal && (<PrintableInvoice order={order} onClose={() => setShowPrintModal(false)}/>)}

      {/* Refund Modal */}
      {showRefundModal && (<div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-2xl border border-[#E8E4DC] shadow-2xl space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-[#A5432F]"/>
              <span>Issue Client Refund</span>
            </h3>
            <p className="text-xs text-[#6B6864] leading-relaxed">
              Issuing a refund will reverse funds back to the original payment source and update inventory availability if returned.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider mb-1">
                  Refund Amount (₹ INR)
                </label>
                <input type="number" max={order.total} value={refundAmount} onChange={(e) => setRefundAmount(Number(e.target.value))} className="w-full px-3 py-2 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs font-mono font-bold text-[#1A1A1A]"/>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider mb-1">
                  Reason for Adjustment
                </label>
                <textarea rows={3} value={refundReason} onChange={(e) => setRefundReason(e.target.value)} className="w-full px-3 py-2 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs text-[#1A1A1A]"/>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#F2EFE9]">
              <button type="button" onClick={() => setShowRefundModal(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6B6864] hover:bg-[#F2EFE9]">
                Cancel
              </button>
              <button type="button" onClick={handleExecuteRefund} className="px-5 py-2 bg-[#A5432F] text-white text-xs font-semibold rounded-xl hover:bg-red-700 transition-colors">
                Execute ${refundAmount.toFixed(2)} Refund
              </button>
            </div>
          </div>
        </div>)}
    </div>);
};
export default OrderDetail;
