import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { useCustomer } from '../../context/CustomerContext';
import { Search, Download, ChevronRight, Loader2, ChevronLeft } from 'lucide-react';

export const CustomerList = () => {
  const { showToast } = useAdmin();
  const { customers, isLoading, pagination, fetchCustomers } = useCustomer();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Debounced API fetch
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchCustomers(page, limit, searchQuery, sortBy);
    }, 300);

    return () => clearTimeout(handler);
  }, [page, limit, searchQuery, sortBy]);

  // Reset page to 1 when search or sort changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery, sortBy]);
  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'City', 'Country', 'LTV Spent', 'Orders Count', 'Status'];
    const rows = customers.map((c) => [
      c.id,
      `"${c.name}"`,
      c.email || '',
      c.phone || '',
      `"${c.city || ''}"`,
      `"${c.country || ''}"`,
      c.vipTier || '',
      c.totalSpent || 0,
      c.orderCount || 0,
      c.status || '',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sumilux_customers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Customers Exported', `${filteredCustomers.length} customer profiles exported.`);
  };
  return (<div className="space-y-6">
    {/* Header */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E4DC]">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="font-serif text-3xl font-bold text-[#1D241C]">
            Customer Directory
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono tracking-widest bg-[#506040]/15 text-[#506040] font-bold">
            {pagination.total} Customers
          </span>
        </div>
        <p className="text-xs text-[#687163] mt-1">
          View customer records, contact information, order history, and total spending.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleExportCSV}
          className="px-3.5 py-2 bg-white hover:bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs font-semibold text-[#1D241C] transition-colors flex items-center gap-2 shadow-2xs cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-[#687163]" />
          <span>Export CSV</span>
        </button>
      </div>
    </div>

    {/* Filter Bar */}
    <div className="bg-white rounded-2xl border border-[#E8E4DC] p-4 shadow-2xs">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[#506040] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by customer name, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs text-[#1D241C] focus:outline-none focus:border-[#C69E58]"
          />
        </div>

        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="px-3 py-2 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs text-[#1D241C] focus:outline-none focus:border-[#C69E58] cursor-pointer"
        >
          <option value="all">All Customer Types</option>
          <option value="VIP Customer">VIP Customer</option>
          <option value="Regular Customer">Regular Customer</option>
          <option value="New Customer">New Customer</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs text-[#1D241C] focus:outline-none focus:border-[#C69E58] cursor-pointer"
        >
          <option value="date_desc">Newest First</option>
          <option value="date_asc">Oldest First</option>
          <option value="name_asc">Name (A-Z)</option>
          <option value="name_desc">Name (Z-A)</option>
        </select>
      </div>
    </div>

    {/* Customers Table */}
    <div className="bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#E8E4DC] bg-[#FAF8F5] text-[10px] uppercase tracking-wider text-[#687163]">
              <th className="py-3.5 px-4 font-semibold">Customer</th>
              <th className="py-3.5 px-3 font-semibold">Location</th>
              <th className="py-3.5 px-3 font-semibold">Total Spent (₹)</th>
              <th className="py-3.5 px-3 font-semibold">Total Orders</th>
              <th className="py-3.5 px-3 font-semibold">Joined Date</th>
              <th className="py-3.5 px-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F2EFE9] text-xs">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-[#A68758]">
                    <Loader2 className="w-6 h-6 animate-spin mb-2" />
                    <p>Loading customer directory...</p>
                  </div>
                </td>
              </tr>
            ) : customers.length === 0 ? (<tr>
              <td colSpan={7} className="py-12 text-center text-[#6B6864]">
                No customer profiles found matching criteria.
              </td>
            </tr>) : (customers.map((cust) => (<tr key={cust.id} className="hover:bg-[#FAF8F5] transition-colors cursor-pointer" onClick={() => navigate(`/admin/customers/${cust.id}`)}>
              <td className="py-3.5 px-4">
                <div className="flex items-center gap-3">
                  {cust.avatar ? (
                    <img src={cust.avatar} alt={cust.name} className="w-10 h-10 rounded-full object-cover border border-[#C8A87C]/30 shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#E8E4DC] flex items-center justify-center shrink-0 text-[#A68758] font-serif font-bold">
                      {cust.name?.charAt(0) || '-'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-[#1A1A1A] hover:text-[#C8A87C]">
                      {cust.name}
                    </div>
                    <div className="text-[11px] text-[#6B6864] truncate">{cust.email}</div>
                  </div>
                </div>
              </td>
              <td className="py-3.5 px-3 text-[#1A1A1A]">
                <div>{cust.city || '-'}</div>
                <div className="text-[10px] text-[#6B6864]">{cust.country || ''}</div>
              </td>
              <td className="py-3.5 px-3 font-mono font-bold text-[#1D241C] text-sm">
                ₹{(cust.totalSpent || 0).toLocaleString('en-IN')}
              </td>
              <td className="py-3.5 px-3 font-mono-data font-semibold text-[#1A1A1A]">
                {cust.orderCount || 0} Orders
              </td>
              <td className="py-3.5 px-3 text-[#6B6864]">
                {new Date(cust.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                })}
              </td>
              <td className="py-3.5 px-4 text-right">
                <button onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/admin/customers/${cust.id}`);
                }} className="p-1.5 rounded-lg hover:bg-[#E8E4DC] text-[#1A1A1A] transition-colors" title="View profile">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </td>
            </tr>)))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-[#E8E4DC] flex items-center justify-between text-xs text-[#6B6864]">
        <div className="flex items-center gap-2">
          <span>Show</span>
          <select 
            value={limit} 
            onChange={(e) => setLimit(Number(e.target.value))}
            className="bg-[#F8F6F3] border border-[#E8E4DC] rounded-lg px-2 py-1 focus:outline-none focus:border-[#C8A87C]"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>per page</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden sm:inline">
            Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
          </span>
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={pagination.page === 1}
              className="p-1.5 rounded-lg border border-[#E8E4DC] hover:bg-[#FAF8F5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono px-2 text-[#1A1A1A] font-semibold">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button 
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={pagination.page === pagination.totalPages}
              className="p-1.5 rounded-lg border border-[#E8E4DC] hover:bg-[#FAF8F5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>);
};
export default CustomerList;
