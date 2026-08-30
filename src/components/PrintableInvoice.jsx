import React from 'react';
import { useAdmin } from '../context/AdminContext';
import { Printer, X } from 'lucide-react';
export const PrintableInvoice = ({ order, onClose }) => {
    const { storeSettings } = useAdmin();
    const handlePrint = () => {
        window.print();
    };
    return (<div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-white max-w-3xl w-full rounded-2xl shadow-2xl border border-[#E8E4DC] overflow-hidden my-8">
        {/* Modal Controls */}
        <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#E8E4DC] flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-[#C8A87C]"/>
            <span className="text-xs font-semibold text-[#1A1A1A] tracking-wider uppercase">
              Packing Slip & Atelier Invoice Preview
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handlePrint} className="px-4 py-1.5 bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5 shadow-sm">
              <Printer className="w-3.5 h-3.5 text-[#C8A87C]"/>
              <span>Print Document</span>
            </button>
            <button onClick={onClose} className="p-1.5 text-[#6B6864] hover:text-[#1A1A1A] rounded-lg hover:bg-[#F2EFE9] transition-colors">
              <X className="w-4 h-4"/>
            </button>
          </div>
        </div>

        {/* The Document Area */}
        <div id="printable-document" className="p-8 sm:p-12 text-[#1A1A1A] bg-white font-sans">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-[#1D241C] pb-6 mb-8">
            <div className="flex items-center gap-4">
              <img
                src="/assets/images/Logo.png"
                alt="Murari's Glam & Glow"
                className="h-16 w-auto object-contain"
              />
              <div>
                <div className="font-serif text-2xl font-bold tracking-[0.14em] text-[#1D241C]">
                  MURARI'S
                </div>
                <div className="text-[9.5px] uppercase tracking-[0.25em] text-[#C69E58] font-bold">
                  Glam & Glow • Atelier Operations
                </div>
                <div className="text-xs text-[#687163] mt-1 space-y-0.5">
                  <div>concierge@murarisglamandglow.com</div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-widest text-[#6B6864]">
                Invoice & Dispatch Order
              </div>
              <div className="font-mono-data text-2xl font-bold text-[#1A1A1A] mt-1">
                {order.orderNumber}
              </div>
              <div className="text-xs text-[#6B6864] mt-2">
                Date: {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <div className="inline-block mt-2 px-2.5 py-0.5 rounded border border-[#C8A87C] text-[#A68758] text-[10px] uppercase tracking-widest font-semibold">
                {order.customer?.vipTier || 'Client Patron'}
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-[#E8E4DC]">
            <div>
              <div className="text-[10px] font-semibold tracking-widest uppercase text-[#A68758] mb-2">
                Bespoke Delivery To:
              </div>
              <div className="font-semibold text-sm text-[#1A1A1A]">
                {order.shippingAddress?.fullName || order.shippingAddress?.name || order.customer?.name || 'Valued Client'}
              </div>
              <div className="text-xs text-[#6B6864] mt-1 leading-relaxed">
                <div>{order.shippingAddress?.street}</div>
                {order.shippingAddress?.suite && <div>{order.shippingAddress.suite}</div>}
                <div>{order.shippingAddress?.city}{order.shippingAddress?.state ? `, ${order.shippingAddress.state}` : ''} {order.shippingAddress?.postalCode}</div>
                <div>{order.shippingAddress?.country || 'India'}</div>
                {(order.shippingAddress?.phone || order.customer?.phone) && (
                  <div className="mt-2 text-[#1A1A1A] font-mono">{order.shippingAddress?.phone || order.customer?.phone}</div>
                )}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-semibold tracking-widest uppercase text-[#A68758] mb-2">
                Logistics & Dispatch:
              </div>
              <div className="text-xs text-[#6B6864] space-y-1.5 leading-relaxed">
                <div><span className="font-medium text-[#1A1A1A]">Courier:</span> {order.carrier || 'Standard Express'}</div>
                <div><span className="font-medium text-[#1A1A1A]">Tracking:</span> <span className="font-mono">{order.trackingNumber || 'SMLX-TRK-ASSIGNED'}</span></div>
                <div><span className="font-medium text-[#1A1A1A]">Payment:</span> {order.paymentMethod === 'upi' ? 'UPI' : (order.paymentMethod || 'UPI')} ({(order.paymentStatus || 'PAID').toUpperCase()})</div>
                <div><span className="font-medium text-[#1A1A1A]">Packaging:</span> Premium Garment Bag & Box</div>
              </div>
            </div>
          </div>

          {/* Line items table */}
          <div className="mb-8">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#1A1A1A] text-[10px] uppercase tracking-wider text-[#6B6864]">
                  <th className="pb-3 font-semibold">Garment / Piece Description</th>
                  <th className="pb-3 font-semibold">SKU / Variant</th>
                  <th className="pb-3 font-semibold text-center">Qty</th>
                  <th className="pb-3 font-semibold text-right">Unit Price</th>
                  <th className="pb-3 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E4DC] text-xs">
                {(order.items || []).map((item, idx) => {
                  const unitPrice = Number(item.price !== undefined ? item.price : (item.unitPrice !== undefined ? item.unitPrice : 0));
                  const qty = Number(item.quantity || 1);
                  const totalPrice = Number(item.totalPrice !== undefined ? item.totalPrice : (unitPrice * qty));
                  const itemName = item.name || item.productName || item.product?.name || 'Garment Piece';
                  const itemColor = item.color || (typeof item.selectedColor === 'object' ? item.selectedColor?.name : item.selectedColor) || 'Standard';
                  const itemSize = item.size || item.selectedSize || 'Standard';

                  return (
                    <tr key={item.id || item._id || idx}>
                      <td className="py-4">
                        <div className="font-medium text-[#1A1A1A]">{itemName}</div>
                      </td>
                      <td className="py-4 font-mono text-[#6B6864]">
                        {item.sku || 'SMLX'} ({itemColor} / {itemSize})
                      </td>
                      <td className="py-4 text-center font-mono-data">{qty}</td>
                      <td className="py-4 text-right font-mono-data">₹{unitPrice.toFixed(2)}</td>
                      <td className="py-4 text-right font-mono-data font-semibold">
                        ₹{totalPrice.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Financial Summary */}
          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-[#6B6864]">
                <span>Subtotal</span>
                <span className="font-mono-data">₹{Number(order.subtotal !== undefined ? order.subtotal : (order.total || 0)).toFixed(2)}</span>
              </div>
              {Number(order.discount || 0) > 0 && (
                <div className="flex justify-between text-[#4A7A5E]">
                  <span>VIP Courtesy Savings</span>
                  <span className="font-mono-data">-₹{Number(order.discount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#6B6864]">
                <span>Shipping & White Glove</span>
                <span className="font-mono-data">
                  {Number(order.shippingCost !== undefined ? order.shippingCost : (order.shipping || 0)) === 0 ? 'Free' : `₹${Number(order.shippingCost !== undefined ? order.shippingCost : (order.shipping || 0)).toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-[#6B6864]">
                <span>Estimated Taxes / GST</span>
                <span className="font-mono-data">₹0.00 (Inclusive)</span>
              </div>
              <div className="border-t-2 border-[#1A1A1A] pt-2 flex justify-between font-bold text-sm text-[#1A1A1A]">
                <span>Total Amount Paid</span>
                <span className="font-mono-data">₹{Number(order.total || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer certification */}
          <div className="pt-6 border-t border-[#E8E4DC] text-center text-[10px] text-[#6B6864] space-y-1">
            <div className="font-serif italic text-xs text-[#A68758]">
              "Crafted with timeless reverence for luxury, beauty, and elegance."
            </div>
            <div>MURARI'S GLAM & GLOW • Registered Indian Enterprise</div>
            <div>Questions regarding this shipment? Contact concierge@murarisglamandglow.com</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintableInvoice;
