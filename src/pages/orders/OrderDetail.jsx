import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { PrintableInvoice } from '../../components/PrintableInvoice';
import {
  ArrowLeft,
  Printer,
  RotateCcw,
  CheckCircle2,
  CreditCard,
  User,
  MapPin,
  MessageSquare,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export const OrderDetail = () => {
  const { id } = useParams();
  const { orders, updateOrderStatus, addOrderNote, refundOrder, showToast, currentUser } = useAdmin();
  const navigate = useNavigate();

  const order = orders.find((o) => o.id === id);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('Customer requested return/refund');
  const [refundAmount, setRefundAmount] = useState(order ? order.total : 0);
  const [newNote, setNewNote] = useState('');

  if (!order) {
    return (
      <div className="p-8 text-center text-[#687163]">
        Order not found.{' '}
        <Link to="/admin/orders" className="text-[#506040] underline font-semibold">
          Return to Orders
        </Link>
      </div>
    );
  }

  const handleStatusChange = (newStatus) => {
    updateOrderStatus(order.id, newStatus);
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    addOrderNote(order.id, newNote.trim(), currentUser?.name || 'Staff');
    setNewNote('');
  };

  const handleExecuteRefund = () => {
    refundOrder(order.id, refundAmount, refundReason);
    setShowRefundModal(false);
  };

  const timelineSteps = [
    { status: 'pending', label: 'Order Placed', date: order.createdAt },
    { status: 'processing', label: 'Order Packing & Processing' },
    { status: 'shipped', label: 'Shipped / In Transit' },
    { status: 'delivered', label: 'Order Delivered' },
  ];

  const currentStepIdx = timelineSteps.findIndex((s) => s.status === order.status);

  return (
    <div className="space-y-6 pb-12 text-[#1D241C]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E4DC]">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/orders"
            className="p-2 rounded-xl bg-white border border-[#E8E4DC] text-[#687163] hover:text-[#1D241C] hover:bg-[#FAF8F5] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1D241C]">
                Order {order.orderNumber}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono tracking-wider bg-[#FAF8F5] text-[#1D241C] border border-[#E8E4DC] font-bold">
                Customer Order
              </span>
            </div>
            <p className="text-xs text-[#687163] mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowPrintModal(true)}
            className="px-3.5 py-2 bg-white hover:bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs font-semibold text-[#1D241C] transition-colors flex items-center gap-2 shadow-2xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-[#506040]" />
            <span>Print Invoice</span>
          </button>

          {order.paymentStatus === 'paid' && (
            <button
              onClick={() => {
                setRefundAmount(order.total);
                setShowRefundModal(true);
              }}
              className="px-3.5 py-2 bg-white hover:bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Issue Refund</span>
            </button>
          )}
        </div>
      </div>

      {/* Order Progress Stepper */}
      <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E4DC] pb-4">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#506040]">
              Order Status Progress
            </span>
            <div className="text-sm font-semibold text-[#1D241C] mt-0.5">
              Current Status: <span className="capitalize text-[#C69E58] font-bold">{order.status}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#1D241C]">Change Status:</span>
            <select
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-3 py-1.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs font-medium text-[#1D241C] focus:outline-none focus:border-[#C69E58] cursor-pointer"
            >
              <option value="pending">Pending Payment</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped / In Transit</option>
              <option value="delivered">Delivered</option>
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
            return (
              <div
                key={step.status}
                className={`p-4 rounded-xl border transition-colors ${
                  isCurrent
                    ? 'bg-[#FAF8F5] border-[#C69E58]'
                    : isCompleted
                    ? 'bg-white border-[#506040]/30'
                    : 'bg-[#FAF8F5]/50 border-[#E8E4DC] opacity-60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCompleted ? 'bg-[#506040] text-white' : 'bg-[#E8E4DC] text-[#687163]'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span className="text-xs font-bold text-[#1D241C]">
                    {step.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-[11px] text-[#687163] mt-2 leading-tight">
                  {step.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Left Items + Tracking & Right Customer Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Line items + Logistics tracking */}
        <div className="lg:col-span-2 space-y-6">
          {/* Line Items Card */}
          <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs space-y-4">
            <h2 className="font-serif text-lg font-bold text-[#1D241C] border-b border-[#E8E4DC] pb-3 flex items-center justify-between">
              <span>Products in Order</span>
              <span className="text-xs font-normal text-[#687163] font-sans">
                {(order.items || []).length} Item(s)
              </span>
            </h2>

            <div className="divide-y divide-[#E8E4DC]">
              {(order.items || []).map((item, idx) => {
                const unitPrice = Number(item.price !== undefined ? item.price : (item.unitPrice !== undefined ? item.unitPrice : (item.product?.price || 0)));
                const qty = Number(item.quantity || 1);
                const itemTotal = Number(item.totalPrice !== undefined ? item.totalPrice : (unitPrice * qty));
                const itemName = item.name || item.productName || item.product?.name || 'Garment Piece';
                const itemColor = item.color || (typeof item.selectedColor === 'object' ? item.selectedColor?.name : item.selectedColor) || 'Standard';
                const itemSize = item.size || item.selectedSize || 'Standard';
                const itemImg = item.image || item.product?.image || (Array.isArray(item.product?.images) && item.product.images[0]) || '';

                return (
                  <div key={item.id || item._id || idx} className="py-4 flex items-center gap-4 first:pt-0 last:pb-0">
                    <img
                      src={itemImg}
                      alt={itemName}
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=900';
                      }}
                      className="w-16 h-20 rounded-xl object-cover border border-[#E8E4DC] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-[#1D241C]">
                        {itemName}
                      </div>
                      <div className="text-xs text-[#687163] mt-0.5 flex flex-wrap items-center gap-2">
                        {item.sku && <span className="font-mono">{item.sku}</span>}
                        <span>•</span>
                        <span>Color: <strong>{itemColor}</strong></span>
                        <span>•</span>
                        <span>Size: <strong>{itemSize}</strong></span>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-xs text-[#687163]">
                        {qty} x ₹{unitPrice.toFixed(2)}
                      </div>
                      <div className="font-bold text-sm text-[#1D241C] mt-0.5">
                        ₹{itemTotal.toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Financial Totals Calculation */}
            <div className="pt-4 border-t border-[#E8E4DC] space-y-2 text-xs">
              <div className="flex justify-between text-[#687163]">
                <span>Subtotal</span>
                <span className="font-mono">₹{Number(order.subtotal !== undefined ? order.subtotal : (order.total || 0)).toFixed(2)}</span>
              </div>
              {Number(order.discount || 0) > 0 && (
                <div className="flex justify-between text-[#506040]">
                  <span>Discount</span>
                  <span className="font-mono">-₹{Number(order.discount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#687163]">
                <span>Delivery / Shipping</span>
                <span className="font-mono">
                  {Number(order.shippingCost !== undefined ? order.shippingCost : (order.shipping || 0)) === 0 ? 'Free Delivery' : `₹${Number(order.shippingCost !== undefined ? order.shippingCost : (order.shipping || 0)).toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-[#687163]">
                <span>Estimated Taxes / GST</span>
                <span className="font-mono">₹0.00 (Inclusive)</span>
              </div>
              <div className="pt-2 border-t-2 border-[#1D241C] flex justify-between font-bold text-base text-[#1D241C]">
                <span>Total Amount</span>
                <span className="font-mono">₹{Number(order.total || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Internal Staff Notes */}
          <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs space-y-4">
            <h2 className="font-serif text-lg font-bold text-[#1D241C] border-b border-[#E8E4DC] pb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#506040]" />
              <span>Internal Notes (Staff Only)</span>
            </h2>

            <div className="space-y-3">
              {order.notes && order.notes.length > 0 ? (
                order.notes.map((note) => (
                  <div key={note.id} className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E4DC] text-xs">
                    <div className="flex items-center justify-between text-[#687163] text-[11px] mb-1">
                      <span className="font-semibold text-[#1D241C]">{note.author}</span>
                      <span>{new Date(note.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-[#1D241C] leading-relaxed">{note.text}</p>
                  </div>
                ))
              ) : (
                <div className="text-xs text-[#687163] italic">No notes added yet.</div>
              )}
            </div>

            <form onSubmit={handleAddNote} className="pt-2 flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add private note about this order..."
                className="flex-1 px-3.5 py-2 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs text-[#1D241C] focus:outline-none focus:border-[#C69E58]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#1D241C] hover:bg-[#C69E58] text-white hover:text-[#1D241C] text-xs font-semibold rounded-xl transition-colors shrink-0 cursor-pointer"
              >
                Add Note
              </button>
            </form>
          </div>
        </div>

        {/* Right 1 Col: Customer Details & Address */}
        <div className="space-y-6">
          {/* Customer Profile Card */}
          <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E4DC] pb-3">
              <h3 className="font-serif text-base font-bold text-[#1D241C] flex items-center gap-2">
                <User className="w-4 h-4 text-[#506040]" />
                <span>Customer Information</span>
              </h3>
              {order.customer?.id && (
                <Link
                  to={`/admin/customers/${order.customer.id}`}
                  className="text-xs text-[#506040] hover:text-[#1D241C] flex items-center gap-1 font-medium"
                >
                  <span>Profile</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] flex items-center justify-center font-serif text-lg font-bold text-[#506040]">
                {(order.customer?.name || order.customerName || 'Customer').charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm text-[#1D241C] truncate">
                  {order.customer?.name || order.customerName || 'Customer'}
                </div>
                <div className="text-xs text-[#687163] truncate">
                  {order.customer?.email || order.customerEmail || ''}
                </div>
                {(order.customer?.phone || order.phone) && (
                  <div className="text-xs font-mono text-[#1D241C] mt-0.5">
                    {order.customer?.phone || order.phone}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-[#E8E4DC] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#687163]">Account Status</span>
                <span className="font-semibold text-[#1D241C]">Active Customer</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#687163]">Total Lifetime Spend</span>
                <span className="font-mono font-bold text-[#1D241C]">
                  ₹{Number(order.customer?.totalSpent || order.total || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#687163]">Total Orders Placed</span>
                <span className="font-mono font-semibold text-[#1D241C]">
                  {order.customer?.orderCount || 1} Order{(order.customer?.orderCount || 1) === 1 ? '' : 's'}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Destination Card */}
          <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs space-y-3">
            <h3 className="font-serif text-base font-bold text-[#1D241C] border-b border-[#E8E4DC] pb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#506040]" />
              <span>Shipping Address</span>
            </h3>

            <div className="text-xs text-[#1D241C] space-y-1 leading-relaxed">
              <div className="font-semibold">
                {order.shippingAddress?.name || order.shippingAddress?.fullName || order.customer?.name || order.customerName || 'Customer'}
              </div>
              <div>{order.shippingAddress?.street || 'No street provided'}</div>
              {(order.shippingAddress?.apartment || order.shippingAddress?.suite) && (
                <div>{order.shippingAddress?.apartment || order.shippingAddress?.suite}</div>
              )}
              <div>
                {order.shippingAddress?.city}
                {order.shippingAddress?.state ? `, ${order.shippingAddress?.state}` : ''}{' '}
                {order.shippingAddress?.postalCode}
              </div>
              <div>{order.shippingAddress?.country || 'India'}</div>
              {order.shippingAddress?.phone && (
                <div className="font-mono pt-1 text-[#1D241C]">
                  Phone: {order.shippingAddress.phone}
                </div>
              )}
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs space-y-4">
            <h3 className="font-serif text-base font-bold text-[#1D241C] border-b border-[#E8E4DC] pb-2 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#506040]" />
              <span>Payment Details</span>
            </h3>

            <div className="text-xs space-y-2.5">
              <div className="flex justify-between">
                <span className="text-[#687163]">Payment Method</span>
                <span className="font-medium text-[#1D241C]">
                  {order.paymentMethod === 'upi' ? 'UPI Instant Payment' : order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : order.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#687163]">Payment Status</span>
                <span
                  className={`font-mono font-bold uppercase px-2 py-0.5 rounded text-[11px] ${
                    order.paymentStatus === 'paid'
                      ? 'text-[#4A7A5E] bg-[#4A7A5E]/15 border border-[#4A7A5E]/30'
                      : order.paymentStatus === 'cod_pending'
                      ? 'text-blue-700 bg-blue-50 border border-blue-200'
                      : order.paymentStatus === 'refunded'
                      ? 'text-[#A5432F] bg-[#A5432F]/15 border border-[#A5432F]/30'
                      : 'text-[#B8863F] bg-[#B8863F]/15 border border-[#B8863F]/30'
                  }`}
                >
                  {order.paymentStatus === 'cod_pending' ? 'COD PENDING' : order.paymentStatus}
                </span>
              </div>
              {order.razorpay?.paymentId && (
                <div className="flex justify-between pt-1 border-t border-[#E8E4DC]">
                  <span className="text-[#687163]">Transaction ID</span>
                  <span className="font-mono font-bold text-[#1D241C]">{order.razorpay.paymentId}</span>
                </div>
              )}
              {order.createdAt && (
                <div className="flex justify-between pt-1 border-t border-[#E8E4DC]">
                  <span className="text-[#687163]">Date & Time</span>
                  <span className="text-[#1D241C]">
                    {new Date(order.createdAt).toLocaleString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Printable Invoice Modal */}
      {showPrintModal && <PrintableInvoice order={order} onClose={() => setShowPrintModal(false)} />}

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-2xl border border-[#E8E4DC] shadow-2xl space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#1D241C] flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-red-700" />
              <span>Process Customer Refund</span>
            </h3>
            <p className="text-xs text-[#687163] leading-relaxed">
              Issuing a refund will mark this order as refunded and return funds to the customer.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#1D241C] uppercase tracking-wider mb-1">
                  Refund Amount (₹ INR)
                </label>
                <input
                  type="number"
                  max={order.total}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs font-mono font-bold text-[#1D241C]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1D241C] uppercase tracking-wider mb-1">
                  Reason for Refund
                </label>
                <textarea
                  rows={3}
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs text-[#1D241C]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E8E4DC]">
              <button
                type="button"
                onClick={() => setShowRefundModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#687163] hover:bg-[#FAF8F5] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteRefund}
                className="px-5 py-2 bg-red-700 text-white text-xs font-semibold rounded-xl hover:bg-red-800 transition-colors cursor-pointer"
              >
                Refund ₹{refundAmount.toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
