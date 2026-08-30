import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { Search, Download, RotateCcw, ChevronRight, CreditCard } from 'lucide-react';
export const OrderList = () => {
    const { orders, showToast } = useAdmin();
    const navigate = useNavigate();
    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusTab, setStatusTab] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [vipFilter, setVipFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    const filteredOrders = useMemo(() => {
        return orders
            .filter((o) => {
            if (!o) return false;
            const orderNum = o.orderNumber || o.id || '';
            const custName = o.customer?.name || o.customerName || '';
            const custEmail = o.customer?.email || o.customerEmail || '';
            const matchesSearch = orderNum.toLowerCase().includes(searchQuery.toLowerCase()) ||
                custName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                custEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (o.trackingNumber && o.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesStatus = statusTab === 'all' || o.status === statusTab;
            const matchesPayment = paymentFilter === 'all' || o.paymentStatus === paymentFilter;
            const matchesVip = vipFilter === 'all' || (o.customer?.vipTier || 'Client') === vipFilter;
            return matchesSearch && matchesStatus && matchesPayment && matchesVip;
        })
            .sort((a, b) => {
            if (sortBy === 'date') {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            }
            else if (sortBy === 'total') {
                return sortOrder === 'asc' ? (a.total || 0) - (b.total || 0) : (b.total || 0) - (a.total || 0);
            }
            else {
                return sortOrder === 'asc' ? (a.status || '').localeCompare(b.status || '') : (b.status || '').localeCompare(a.status || '');
            }
        });
    }, [orders, searchQuery, statusTab, paymentFilter, vipFilter, sortBy, sortOrder]);
    const handleExportCSV = () => {
        const headers = ['Order Number', 'Date', 'Customer', 'Email', 'Status', 'Payment', 'Total (INR)'];
        const rows = filteredOrders.map((o) => [
            o.orderNumber || o.id,
            o.createdAt ? o.createdAt.split('T')[0] : '',
            `"${o.customer?.name || o.customerName || 'Customer'}"`,
            o.customer?.email || o.customerEmail || '',
            o.status,
            o.paymentStatus,
            Number(o.total || 0).toFixed(2),
        ]);
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `sumilux_orders_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('success', 'Orders Exported', `${filteredOrders.length} orders exported.`);
    };
    const getStatusBadge = (status) => {
        switch (status) {
            case 'delivered':
                return 'bg-[#4A7A5E]/15 text-[#4A7A5E] border-[#4A7A5E]/30';
            case 'shipped':
                return 'bg-[#5B7C99]/15 text-[#5B7C99] border-[#5B7C99]/30';
            case 'processing':
                return 'bg-[#B8863F]/15 text-[#B8863F] border-[#B8863F]/30';
            case 'returned':
                return 'bg-[#A5432F]/15 text-[#A5432F] border-[#A5432F]/30';
            case 'cancelled':
                return 'bg-[#6B6864]/15 text-[#6B6864] border-[#6B6864]/30';
            case 'pending':
            default:
                return 'bg-[#1A1A1A]/10 text-[#1A1A1A] border-[#1A1A1A]/20';
        }
    };
    const countsByStatus = useMemo(() => {
        const counts = { all: orders.length };
        orders.forEach((o) => {
            counts[o.status] = (counts[o.status] || 0) + 1;
        });
        return counts;
    }, [orders]);
    return (<div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E4DC]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-3xl font-bold text-[#1A1A1A]">
              Orders
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono tracking-widest bg-[#C8A87C]/15 text-[#A68758] font-bold">
              {orders.length} Active Orders
            </span>
          </div>
          <p className="text-xs text-[#6B6864] mt-1">
            Manage orders, tracking, packing slips, and returns.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#C8A87C]" />
            <span>Export Orders</span>
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E8E4DC] text-xs">
        {[
            { id: 'all', label: 'All Orders' },
            { id: 'confirmed', label: 'Confirmed' },
            { id: 'processing', label: 'Processing' },
            { id: 'shipped', label: 'Shipped / In Transit' },
            { id: 'delivered', label: 'Delivered' },
            { id: 'cancelled', label: 'Cancelled' },
        ].map((tab) => {
            const count = countsByStatus[tab.id] || 0;
            return (<button key={tab.id} onClick={() => setStatusTab(tab.id)} className={`px-3.5 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${statusTab === tab.id
                    ? 'bg-[#1D241C] text-white shadow-xs'
                    : 'bg-white text-[#687163] hover:text-[#1D241C] border border-[#E8E4DC]'}`}>
              <span>{tab.label}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${statusTab === tab.id
                    ? 'bg-[#C69E58] text-[#1D241C] font-bold'
                    : 'bg-[#FAF8F5] text-[#687163]'}`}>
                {count}
              </span>
            </button>);
        })}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#E8E4DC] p-4 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#506040] absolute left-3 top-2.5"/>
            <input type="text" placeholder="Search by order #, customer name, email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs text-[#1D241C] focus:outline-none focus:border-[#C69E58]"/>
          </div>

          <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="px-3 py-2 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs text-[#1D241C] focus:outline-none focus:border-[#C69E58] cursor-pointer">
            <option value="all">All Payment Statuses</option>
            <option value="paid">Paid</option>
            <option value="cod_pending">Cash on Delivery (Pending)</option>
            <option value="refunded">Refunded</option>
          </select>

          <select value={vipFilter} onChange={(e) => setVipFilter(e.target.value)} className="px-3 py-2 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs text-[#1D241C] focus:outline-none focus:border-[#C69E58] cursor-pointer">
            <option value="all">All Customer Types</option>
            <option value="VIP Customer">VIP Customer</option>
            <option value="Regular Customer">Regular Customer</option>
            <option value="New Customer">New Customer</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#E8E4DC] bg-[#FAF8F5] text-[10px] uppercase tracking-wider text-[#687163]">
                <th className="py-3.5 px-4 font-semibold">Order #</th>
                <th className="py-3.5 px-3 font-semibold">Date</th>
                <th className="py-3.5 px-3 font-semibold">Customer</th>
                <th className="py-3.5 px-3 font-semibold">Items</th>
                <th className="py-3.5 px-3 font-semibold">Payment</th>
                <th className="py-3.5 px-3 font-semibold">Order Status</th>
                <th className="py-3.5 px-3 font-semibold">Total (₹)</th>
                <th className="py-3.5 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2EFE9] text-xs">
              {filteredOrders.length === 0 ? (<tr>
                  <td colSpan={8} className="py-12 text-center text-[#6B6864]">
                    No orders match your filter criteria.
                  </td>
                </tr>) : (filteredOrders.map((order) => (<tr key={order.id} className="hover:bg-[#FAF8F5] transition-colors cursor-pointer" onClick={() => navigate(`/admin/orders/${order.id}`)}>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#1A1A1A]">
                      {order.orderNumber}
                      {order.isAtelierOrder && (<span className="block text-[9px] text-[#A68758] font-editorial italic">
                          * Special Edition
                        </span>)}
                    </td>
                    <td className="py-3.5 px-3 text-[#6B6864] whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            })}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-[#1D241C] flex items-center gap-1.5">
                        <span>{order.customer?.name || order.customerName || 'Customer'}</span>
                        {order.notes && (
                          <span
                            className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-[#506040]/15 text-[#506040] font-bold"
                            title={`Delivery Instructions: ${order.notes}`}
                          >
                            📝 Note
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#687163]">{order.customer?.city || order.customer?.email || order.customerEmail || ''}</div>
                    </td>
                    <td className="py-3.5 px-3 text-[#687163] max-w-xs truncate">
                      {(order.items || []).map((i) => `${i.quantity || 1}x ${i.productName || i.name || 'Product'}`).join(', ')}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${order.paymentStatus === 'paid'
                ? 'bg-[#4A7A5E]/15 text-[#4A7A5E] border border-[#4A7A5E]/30'
                : order.paymentStatus === 'cod_pending'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : order.paymentStatus === 'refunded'
                ? 'bg-[#A5432F]/15 text-[#A5432F] border border-[#A5432F]/30'
                : 'bg-neutral-100 text-neutral-700 border border-neutral-200'}`}>
                        {order.paymentStatus === 'cod_pending' ? 'COD PENDING' : order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider border ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono-data font-bold text-[#1A1A1A] text-sm">
                      ₹{order.total.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/orders/${order.id}`);
            }} className="p-1.5 rounded-lg hover:bg-[#E8E4DC] text-[#1A1A1A] transition-colors" title="View order details">
                        <ChevronRight className="w-4 h-4"/>
                      </button>
                    </td>
                  </tr>)))}
            </tbody>
          </table>
        </div>
      </div>
    </div>);
};
export default OrderList;
