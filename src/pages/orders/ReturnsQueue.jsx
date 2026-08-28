import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { ArrowLeft, Search } from 'lucide-react';
export const ReturnsQueue = () => {
    const { returns, approveReturn, rejectReturn, refundOrder, showToast } = useAdmin();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedReturn, setSelectedReturn] = useState(null);
    const filteredReturns = returns.filter((r) => {
        const matchesSearch = r.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.productName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
        return matchesSearch && matchesStatus;
    });
    const getReturnStatusBadge = (status) => {
        switch (status) {
            case 'refunded':
                return 'bg-[#4A7A5E]/15 text-[#4A7A5E] border-[#4A7A5E]/30';
            case 'approved':
                return 'bg-[#5B7C99]/15 text-[#5B7C99] border-[#5B7C99]/30';
            case 'rejected':
                return 'bg-[#A5432F]/15 text-[#A5432F] border-[#A5432F]/30';
            case 'pending':
            default:
                return 'bg-[#B8863F]/15 text-[#B8863F] border-[#B8863F]/30';
        }
    };
    return (<div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E4DC]">
        <div className="flex items-center gap-3">
          <Link to="/admin/orders" className="p-2 rounded-xl bg-white border border-[#E8E4DC] text-[#6B6864] hover:text-[#1A1A1A] hover:bg-[#FAF8F5] transition-colors">
            <ArrowLeft className="w-4 h-4"/>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-3xl font-bold text-[#1A1A1A]">
                Returns & Atelier Inspection Queue
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono tracking-widest bg-[#A5432F]/15 text-[#A5432F] font-bold">
                {returns.filter((r) => r.status === 'pending').length} Pending Review
              </span>
            </div>
            <p className="text-xs text-[#6B6864] mt-1">
              Verify atelier garments, authorize returns labels, and issue direct credit or bank reversals.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#E8E4DC] p-4 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#A68758] absolute left-3 top-2.5"/>
            <input type="text" placeholder="Search by order #, client name, garment..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs text-[#1A1A1A] focus:outline-none focus:border-[#C8A87C]"/>
          </div>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs text-[#1A1A1A] focus:outline-none focus:border-[#C8A87C]">
            <option value="all">All Request Statuses</option>
            <option value="pending">Pending Inspection</option>
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
              <tr className="border-b border-[#E8E4DC] bg-[#FAF8F5] text-[10px] uppercase tracking-wider text-[#6B6864]">
                <th className="py-3.5 px-4 font-semibold">Request ID</th>
                <th className="py-3.5 px-3 font-semibold">Order #</th>
                <th className="py-3.5 px-3 font-semibold">Patron</th>
                <th className="py-3.5 px-3 font-semibold">Garment / Piece</th>
                <th className="py-3.5 px-3 font-semibold">Reason</th>
                <th className="py-3.5 px-3 font-semibold">Refund Amount</th>
                <th className="py-3.5 px-3 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Inspection Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2EFE9] text-xs">
              {filteredReturns.length === 0 ? (<tr>
                  <td colSpan={8} className="py-12 text-center text-[#6B6864]">
                    No return requests found in queue.
                  </td>
                </tr>) : (filteredReturns.map((ret) => (<tr key={ret.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#1A1A1A]">
                      {ret.id}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[#A68758]">
                      {ret.orderNumber}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-[#1A1A1A]">
                      {ret.customerName}
                    </td>
                    <td className="py-3.5 px-3 text-[#1A1A1A] max-w-xs truncate font-medium">
                      {ret.productName}
                    </td>
                    <td className="py-3.5 px-3 text-[#6B6864] max-w-xs truncate">
                      {ret.reason}
                    </td>
                    <td className="py-3.5 px-3 font-mono-data font-bold text-[#1A1A1A]">
                      ${ret.amount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider border ${getReturnStatusBadge(ret.status)}`}>
                        {ret.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {ret.status === 'pending' ? (<div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => approveReturn(ret.id)} className="px-2.5 py-1 bg-[#4A7A5E] hover:bg-emerald-800 text-white rounded-lg text-[11px] font-medium transition-colors">
                            Approve
                          </button>
                          <button onClick={() => rejectReturn(ret.id)} className="px-2.5 py-1 bg-[#FAF8F5] border border-[#E8E4DC] text-[#A5432F] hover:bg-[#A5432F]/10 rounded-lg text-[11px] font-medium transition-colors">
                            Reject
                          </button>
                        </div>) : ret.status === 'approved' ? (<button onClick={() => {
                    refundOrder(ret.orderId, ret.amount, ret.reason);
                    showToast('success', 'Refund Processed', `$${ret.amount.toFixed(2)} returned to client account.`);
                }} className="px-3 py-1 bg-[#1A1A1A] text-[#C8A87C] rounded-lg text-[11px] font-semibold hover:bg-[#333333] transition-colors">
                          Execute Refund
                        </button>) : (<span className="text-[11px] text-[#6B6864]">Completed</span>)}
                    </td>
                  </tr>)))}
            </tbody>
          </table>
        </div>
      </div>
    </div>);
};
export default ReturnsQueue;
