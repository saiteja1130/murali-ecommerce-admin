import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { 
  CreditCard, 
  Search, 
  Download, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  DollarSign, 
  Building2, 
  RotateCcw,
  ExternalLink,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

export const PaymentHistories = () => {
  const { orders, showToast } = useAdmin();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [gatewayFilter, setGatewayFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Derive transaction records from orders
  const transactions = useMemo(() => {
    return orders.map((order, idx) => {
      let gateway = 'Credit Card';
      const pm = (order.paymentMethod || '').toLowerCase();
      if (pm.includes('amex')) gateway = 'American Express Centurion';
      else if (pm.includes('apple') || pm.includes('stripe')) gateway = 'Stripe / Apple Pay';
      else if (pm.includes('klarna')) gateway = 'Klarna Luxury Pay';
      else if (pm.includes('wire') || pm.includes('bank')) gateway = 'Direct Wire Transfer';

      return {
        id: `TXN-884${idx + 10}9`,
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        amount: order.total,
        gateway,
        method: order.paymentMethod || 'Credit Card Secure',
        status: order.paymentStatus || 'paid',
        date: order.createdAt,
        referenceCode: `AUTH_${Math.random().toString(36).substring(2, 9).toUpperCase()}`
      };
    });
  }, [orders]);

  // Metrics
  const totalSettled = useMemo(() => {
    return transactions
      .filter((t) => t.status === 'paid')
      .reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  const pendingSettlement = useMemo(() => {
    return transactions
      .filter((t) => t.status === 'pending')
      .reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  const totalRefunded = useMemo(() => {
    return transactions
      .filter((t) => t.status === 'refunded')
      .reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  // Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        const matchesSearch =
          t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.referenceCode.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesGateway = gatewayFilter === 'all' || t.gateway === gatewayFilter;
        const matchesStatus = statusFilter === 'all' || t.status === statusFilter;

        return matchesSearch && matchesGateway && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'amount') {
          return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
        } else {
          return sortOrder === 'asc'
            ? new Date(a.date).getTime() - new Date(b.date).getTime()
            : new Date(b.date).getTime() - new Date(a.date).getTime();
        }
      });
  }, [transactions, searchQuery, gatewayFilter, statusFilter, sortBy, sortOrder]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Transaction ID', 'Order Number', 'Customer', 'Email', 'Gateway', 'Payment Method', 'Amount (USD)', 'Status', 'Date', 'Auth Ref'];
    const rows = filteredTransactions.map((t) => [
      t.id,
      t.orderNumber,
      `"${t.customerName}"`,
      t.customerEmail,
      `"${t.gateway}"`,
      `"${t.method}"`,
      t.amount.toFixed(2),
      t.status,
      `"${t.date}"`,
      t.referenceCode
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sumilux_payment_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Payment history CSV ledger successfully downloaded', 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#1A1A1A] tracking-tight">
            Payment Histories & Settlements
          </h1>
          <p className="text-xs text-[#6B6864] mt-1 font-sans">
            Audit captured transactions, credit gateway authorizations, and refund records.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#F8F6F3] text-[#1A1A1A] border border-[#E8E4DC] rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4 text-[#C8A87C]" />
          <span>Export Ledger (CSV)</span>
        </button>
      </div>

      {/* Financial KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E8E4DC] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B6864]">Total Settled</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-2xl font-bold text-[#1A1A1A]">
            ₹{totalSettled.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-emerald-700 font-medium">Captured via verified gateways</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8E4DC] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B6864]">Pending Authorization</span>
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-2xl font-bold text-[#1A1A1A]">
            ${pendingSettlement.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-amber-700 font-medium">Awaiting bank wire confirmation</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8E4DC] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B6864]">Refunds Processed</span>
            <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-2xl font-bold text-[#1A1A1A]">
            ₹{totalRefunded.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-neutral-500 font-medium">Reversed to original payment source</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8E4DC] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B6864]">Total Volume</span>
            <div className="w-8 h-8 rounded-full bg-[#FAF6F0] text-[#C8A87C] flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif text-2xl font-bold text-[#1A1A1A]">
            {transactions.length} Transactions
          </p>
          <p className="text-[11px] text-[#6B6864] font-medium">100% encrypted & PCI compliant</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8E4DC] shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative min-w-[240px] flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Transaction ID, Customer, Order # or Auth code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs text-[#1A1A1A] focus:outline-none focus:border-[#C8A87C]"
          />
        </div>

        {/* Gateway Filter */}
        <div className="flex items-center gap-2">
          <select
            value={gatewayFilter}
            onChange={(e) => setGatewayFilter(e.target.value)}
            className="px-3 py-2 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs text-[#1A1A1A] focus:outline-none focus:border-[#C8A87C] cursor-pointer"
          >
            <option value="all">All Payment Gateways</option>
            <option value="American Express Centurion">Amex Centurion Direct</option>
            <option value="Stripe / Apple Pay">Stripe / Apple Pay</option>
            <option value="Klarna Luxury Pay">Klarna Luxury Financing</option>
            <option value="Direct Wire Transfer">Bank Wire Atelier</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs text-[#1A1A1A] focus:outline-none focus:border-[#C8A87C] cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="paid">Settled / Paid</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Transactions Ledger Table */}
      <div className="bg-white rounded-2xl border border-[#E8E4DC] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF8F5] text-[#6B6864] border-b border-[#E8E4DC]">
                <th className="py-3.5 px-4 font-semibold">Transaction ID</th>
                <th className="py-3.5 px-4 font-semibold">Order</th>
                <th className="py-3.5 px-4 font-semibold">Patron Customer</th>
                <th className="py-3.5 px-4 font-semibold">Channel / Gateway</th>
                <th className="py-3.5 px-4 font-semibold">Date & Time</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Settled Amount</th>
                <th className="py-3.5 px-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E4DC]">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-[#FAF8F5] transition-colors group">
                    {/* Transaction ID & Code */}
                    <td className="py-4 px-4 font-mono font-bold text-[#1A1A1A]">
                      <div>{t.id}</div>
                      <div className="text-[10px] text-neutral-400 font-normal">{t.referenceCode}</div>
                    </td>

                    {/* Order Reference */}
                    <td className="py-4 px-4 font-mono font-medium">
                      <Link
                        to={`/admin/orders/${t.orderId}`}
                        className="text-[#1A1A1A] hover:text-[#C8A87C] inline-flex items-center gap-1 group-hover:underline"
                      >
                        <span>{t.orderNumber}</span>
                        <ArrowUpRight className="w-3 h-3 text-[#C8A87C]" />
                      </Link>
                    </td>

                    {/* Patron Name */}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-[#1A1A1A]">{t.customerName}</div>
                      <div className="text-[11px] text-[#6B6864]">{t.customerEmail}</div>
                    </td>

                    {/* Gateway */}
                    <td className="py-4 px-4">
                      <div className="font-medium text-[#1A1A1A]">{t.gateway}</div>
                      <div className="text-[10px] text-neutral-400">{t.method}</div>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 text-[#6B6864] whitespace-nowrap">
                      {new Date(t.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}{' '}
                      <span className="text-[10px] text-neutral-400">
                        {new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase ${
                          t.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : t.status === 'pending'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            t.status === 'paid'
                              ? 'bg-emerald-500'
                              : t.status === 'pending'
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                        />
                        {t.status === 'paid' ? 'Settled' : t.status === 'pending' ? 'Pending' : 'Refunded'}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-4 px-4 font-mono font-bold text-right text-[#1A1A1A]">
                      ${t.amount.toFixed(2)}
                    </td>

                    {/* View Order Link */}
                    <td className="py-4 px-4 text-center">
                      <Link
                        to={`/admin/orders/${t.orderId}`}
                        className="p-1.5 text-neutral-400 hover:text-[#C8A87C] transition-colors inline-block"
                        title="View Order Details"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-400 text-xs">
                    No payment transaction records matched your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistories;
