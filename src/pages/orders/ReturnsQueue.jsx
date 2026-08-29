import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { ArrowLeft, Search } from 'lucide-react';

export const ReturnsQueue = () => {
  const { returns, approveReturn, rejectReturn, refundOrder, showToast } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredReturns = returns.filter((r) => {
    const matchesSearch =
      r.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.productName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getReturnStatusBadge = (status) => {
    switch (status) {
      case 'refunded':
        return 'bg-[#506040]/15 text-[#506040] border-[#506040]/30';
      case 'approved':
        return 'bg-blue-900/15 text-blue-800 border-blue-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'pending':
      default:
        return 'bg-[#C69E58]/15 text-[#A87C38] border-[#C69E58]/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E4DC]">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/orders"
            className="p-2 rounded-xl bg-white border border-[#E8E4DC] text-[#687163] hover:text-[#1D241C] hover:bg-[#FAF8F5] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-3xl font-bold text-[#1D241C]">
                Returns & Refunds
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono tracking-widest bg-red-50 text-red-700 border border-red-200 font-bold">
                {returns.filter((r) => r.status === 'pending').length} Pending Review
              </span>
            </div>
            <p className="text-xs text-[#687163] mt-1">
              Review customer return requests, approve items, and issue refunds.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#E8E4DC] p-4 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#506040] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by order #, customer name, product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs text-[#1D241C] focus:outline-none focus:border-[#C69E58]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs text-[#1D241C] focus:outline-none focus:border-[#C69E58] cursor-pointer"
          >
            <option value="all">All Request Statuses</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved for Return</option>
            <option value="refunded">Refund Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Returns Table */}
      <div className="bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#E8E4DC] bg-[#FAF8F5] text-[10px] uppercase tracking-wider text-[#687163]">
                <th className="py-3.5 px-4 font-semibold">Request ID</th>
                <th className="py-3.5 px-3 font-semibold">Order #</th>
                <th className="py-3.5 px-3 font-semibold">Customer</th>
                <th className="py-3.5 px-3 font-semibold">Product</th>
                <th className="py-3.5 px-3 font-semibold">Reason</th>
                <th className="py-3.5 px-3 font-semibold">Refund Amount (₹)</th>
                <th className="py-3.5 px-3 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E4DC] text-xs">
              {filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#687163]">
                    No return requests found.
                  </td>
                </tr>
              ) : (
                filteredReturns.map((ret) => (
                  <tr key={ret.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#1D241C]">
                      {ret.id}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[#506040]">
                      {ret.orderNumber}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-[#1D241C]">
                      {ret.customerName}
                    </td>
                    <td className="py-3.5 px-3 text-[#1D241C] max-w-xs truncate font-medium">
                      {ret.productName}
                    </td>
                    <td className="py-3.5 px-3 text-[#687163] max-w-xs truncate">
                      {ret.reason}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-[#1D241C]">
                      ₹{ret.amount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider border ${getReturnStatusBadge(ret.status)}`}>
                        {ret.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {ret.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => approveReturn(ret.id)}
                            className="px-2.5 py-1 bg-[#506040] hover:bg-[#1D241C] text-white rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectReturn(ret.id)}
                            className="px-2.5 py-1 bg-[#FAF8F5] border border-[#E8E4DC] text-red-700 hover:bg-red-50 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      ) : ret.status === 'approved' ? (
                        <button
                          onClick={() => {
                            refundOrder(ret.orderId, ret.amount, ret.reason);
                            showToast('success', 'Refund Processed', `₹${ret.amount.toFixed(2)} refunded to customer account.`);
                          }}
                          className="px-3 py-1 bg-[#1D241C] hover:bg-[#C69E58] hover:text-[#1D241C] text-white rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          Process Refund
                        </button>
                      ) : (
                        <span className="text-[11px] text-[#687163]">Completed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReturnsQueue;
