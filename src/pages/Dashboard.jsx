import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { useProduct } from '../context/ProductContext';
import { useCustomer } from '../context/CustomerContext';
import { StatCard } from '../components/StatCard';
import api from '../context/api';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Users,
  ArrowUpRight,
  PlusCircle,
  ChevronRight,
  RefreshCw,
  Clock,
  Package,
  CheckCircle2,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const Dashboard = () => {
  const { orders, currentUser, fetchOrders, showToast } = useAdmin();
  const { products, fetchProducts } = useProduct();
  const { customers, fetchCustomers } = useCustomer();
  const navigate = useNavigate();

  const [revenueRange, setRevenueRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Live analytics state from backend
  const [analytics, setAnalytics] = useState({
    kpis: {
      totalRevenue: 0,
      totalOrders: 0,
      avgOrderValue: 0,
      totalCustomers: 0,
      lowStockCount: 0,
      revenueGrowth: { value: '0%', isPositive: true },
      ordersGrowth: { value: '0%', isPositive: true },
      aovGrowth: { value: '0%', isPositive: true },
    },
    chartData: {
      '7d': [],
      '30d': [],
      '90d': [],
      YTD: [],
    },
    categoryData: [],
    topCategory: { name: 'Catalog', value: 0 },
    topSellingProducts: [],
    recentOrders: [],
    recentCustomers: [],
    orderStatusCounts: {
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      returned: 0,
    },
  });

  // Fetch live analytics metrics from backend
  const loadDashboardData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res = await api.get('/api/analytics/dashboard');
      if (res.data?.status && res.data.data) {
        setAnalytics(res.data.data);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.warn('Backend analytics endpoint fallback:', err.message);

      // Robust client-side fallback aggregation from live store context
      const paidOrders = (orders || []).filter(
        (o) =>
          o.status !== 'cancelled' &&
          (o.paymentStatus === 'paid' ||
            o.paymentStatus === 'cod_pending' ||
            o.status === 'delivered' ||
            o.status === 'confirmed' ||
            o.status === 'processing' ||
            o.status === 'shipped')
      );

      const totalRev = paidOrders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
      const totalOrd = (orders || []).length;
      const avgAov = paidOrders.length > 0 ? Math.round(totalRev / paidOrders.length) : 0;
      const lowStock = (products || []).filter((p) => (p.totalStock !== undefined ? p.totalStock <= 4 : false));

      setAnalytics((prev) => ({
        ...prev,
        kpis: {
          totalRevenue: Math.round(totalRev),
          totalOrders: totalOrd,
          avgOrderValue: avgAov,
          totalCustomers: (customers || []).length,
          lowStockCount: lowStock.length,
          revenueGrowth: { value: '+0%', isPositive: true },
          ordersGrowth: { value: '+0%', isPositive: true },
          aovGrowth: { value: '+0%', isPositive: true },
        },
      }));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [orders, products, customers]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.allSettled([
        loadDashboardData(true),
        fetchOrders?.(),
        fetchProducts?.(),
        fetchCustomers?.(),
      ]);
      showToast?.('info', 'Dashboard Refreshed', 'Latest store metrics synced with database.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-[#506040]/15 text-[#506040] border-[#506040]/30';
      case 'shipped':
        return 'bg-blue-900/15 text-blue-800 border-blue-200';
      case 'processing':
        return 'bg-[#C69E58]/15 text-[#A87C38] border-[#C69E58]/30';
      case 'confirmed':
        return 'bg-indigo-900/15 text-indigo-800 border-indigo-200';
      case 'cancelled':
      case 'returned':
        return 'bg-red-900/15 text-red-700 border-red-200';
      case 'pending':
      default:
        return 'bg-[#1D241C]/10 text-[#1D241C] border-[#1D241C]/20';
    }
  };

  // Active chart dataset for selected time range
  const activeChartData = analytics.chartData[revenueRange] || [];

  return (
    <div className="space-y-8 pb-12 animate-fade-in text-[#1D241C]">
      {/* Page Header with Greeting & Live Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E4DC]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-3xl font-bold text-[#1D241C]">
              Dashboard
            </h1>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono tracking-widest bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              <span>Store is Live</span>
            </div>
          </div>
          <p className="text-xs text-[#687163] mt-1 font-sans flex items-center gap-2">
            <span>
              Welcome back, <span className="font-semibold text-[#1D241C]">{currentUser?.name || 'Admin'}</span>. Real-time store performance & fulfillment.
            </span>
            <span className="text-[#A68758] font-mono text-[11px] hidden md:inline">
              • Synced {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="px-3.5 py-2 bg-white hover:bg-[#FAF8F5] border border-[#E8E4DC] text-[#1D241C] text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-2xs cursor-pointer disabled:opacity-50"
            title="Refresh dashboard metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#687163] ${isRefreshing ? 'animate-spin text-[#C69E58]' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Live'}</span>
          </button>

          <Link
            to="/admin/products/new"
            className="px-4 py-2 bg-[#1D241C] hover:bg-[#C69E58] text-white hover:text-[#1D241C] text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          label="Total Revenue"
          value={`₹${(analytics.kpis?.totalRevenue || 0).toLocaleString('en-IN')}`}
          subValue="Gross paid sales"
          change={analytics.kpis?.revenueGrowth}
          icon={DollarSign}
        />
        <StatCard
          label="Total Orders"
          value={`${analytics.kpis?.totalOrders || 0} Orders`}
          subValue="Live customer checkouts"
          change={analytics.kpis?.ordersGrowth}
          icon={ShoppingBag}
        />
        <StatCard
          label="Average Order Value"
          value={`₹${(analytics.kpis?.avgOrderValue || 0).toLocaleString('en-IN')}`}
          subValue="Avg per paid sale"
          change={analytics.kpis?.aovGrowth}
          icon={TrendingUp}
        />
        <StatCard
          label="Total Customers"
          value={`${analytics.kpis?.totalCustomers || 0} Patrons`}
          subValue="Registered user accounts"
          icon={Users}
        />
        <StatCard
          label="Low Stock Alerts"
          value={`${analytics.kpis?.lowStockCount || 0} Items`}
          subValue="Inventory <= 4 units"
          icon={AlertTriangle}
          badge={analytics.kpis?.lowStockCount > 0 ? 'Action Needed' : 'Optimal Stock'}
        />
      </div>

      {/* Quick Operations Pulse Strip */}
      <div className="bg-[#FAF8F5] border border-[#E8E4DC] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#1D241C]">
          <Clock className="w-4 h-4 text-[#C69E58]" />
          <span>Fulfillment Status:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <Link
            to="/admin/orders"
            className="px-3 py-1 bg-white border border-[#E8E4DC] rounded-lg text-[#1D241C] hover:border-[#C69E58] transition-colors flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Pending: <strong>{analytics.orderStatusCounts?.pending || 0}</strong></span>
          </Link>

          <Link
            to="/admin/orders"
            className="px-3 py-1 bg-white border border-[#E8E4DC] rounded-lg text-[#1D241C] hover:border-[#C69E58] transition-colors flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Processing: <strong>{analytics.orderStatusCounts?.processing || 0}</strong></span>
          </Link>

          <Link
            to="/admin/orders"
            className="px-3 py-1 bg-white border border-[#E8E4DC] rounded-lg text-[#1D241C] hover:border-[#C69E58] transition-colors flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>Shipped: <strong>{analytics.orderStatusCounts?.shipped || 0}</strong></span>
          </Link>

          <Link
            to="/admin/orders"
            className="px-3 py-1 bg-white border border-[#E8E4DC] rounded-lg text-[#1D241C] hover:border-[#C69E58] transition-colors flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Delivered: <strong>{analytics.orderStatusCounts?.delivered || 0}</strong></span>
          </Link>
        </div>

        <Link
          to="/admin/orders"
          className="text-xs text-[#506040] hover:text-[#1D241C] font-semibold flex items-center gap-1 transition-colors ml-auto"
        >
          <span>Manage Orders</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Performance Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#1D241C]">
                Sales & Revenue
              </h2>
              <p className="text-xs text-[#687163] mt-0.5">
                Real-time income and orders tracked from store checkouts
              </p>
            </div>

            {/* Time range selector */}
            <div className="flex items-center p-1 bg-[#FAF8F5] rounded-xl border border-[#E8E4DC]">
              {['7d', '30d', '90d', 'YTD'].map((range) => (
                <button
                  key={range}
                  onClick={() => setRevenueRange(range)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    revenueRange === range
                      ? 'bg-white text-[#1D241C] shadow-xs'
                      : 'text-[#687163] hover:text-[#1D241C]'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full">
            {activeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activeChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C69E58" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#C69E58" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={{ stroke: '#E8E4DC' }}
                    tick={{ fill: '#687163', fontSize: 11 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={{ stroke: '#E8E4DC' }}
                    tick={{ fill: '#687163', fontSize: 11 }}
                    tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                  />
                  <Tooltip
                    formatter={(val, name) => [
                      name === 'revenue' ? `₹${Number(val).toLocaleString('en-IN')}` : `${val} orders`,
                      name === 'revenue' ? 'Revenue' : 'Orders',
                    ]}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E8E4DC',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#C69E58"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#687163]">
                <Package className="w-10 h-10 text-[#C69E58] mb-2 opacity-50" />
                <p className="text-sm font-semibold text-[#1D241C]">No sales recorded for this period</p>
                <p className="text-xs text-[#687163] mt-1">Live customer orders will plot real revenue data automatically.</p>
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown Donut */}
        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#1D241C]">
              Sales by Category
            </h2>
            <p className="text-xs text-[#687163] mt-0.5">
              Live category distribution & sales share
            </p>
          </div>

          <div className="h-56 my-2 relative flex items-center justify-center">
            {analytics.categoryData && analytics.categoryData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={66}
                      outerRadius={88}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {analytics.categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val, name, item) => [
                        `${val}% (${item.payload.revenue > 0 ? `₹${item.payload.revenue.toLocaleString('en-IN')}` : `${item.payload.count} items`})`,
                        item.payload.name,
                      ]}
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E8E4DC',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                  <span className="text-[9px] uppercase tracking-widest text-[#506040] font-bold">Top Category</span>
                  <span className="font-serif text-xs font-bold text-[#1D241C] mt-0.5 leading-tight line-clamp-1">
                    {analytics.topCategory?.name || 'Accessories'}
                  </span>
                  <span className="text-[10px] font-mono text-[#687163]">{analytics.topCategory?.value || 0}% Share</span>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-[#687163]">
                <Layers className="w-8 h-8 text-[#C69E58] mb-1 opacity-50" />
                <span className="text-xs font-medium">No category data yet</span>
              </div>
            )}
          </div>

          <div className="space-y-2 pt-2 border-t border-[#E8E4DC] max-h-36 overflow-y-auto pr-1">
            {(analytics.categoryData || []).slice(0, 4).map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-[#1D241C] font-medium truncate">{item.name}</span>
                </div>
                <span className="font-mono text-[#687163] font-semibold shrink-0">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Row: Recent Orders Table & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#1D241C]">
                Recent Orders
              </h2>
              <p className="text-xs text-[#687163] mt-0.5">
                Real customer orders received from the store
              </p>
            </div>
            <Link to="/admin/orders" className="text-xs font-semibold text-[#506040] hover:text-[#1D241C] flex items-center gap-1 transition-colors">
              <span>View All Orders</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            {analytics.recentOrders && analytics.recentOrders.length > 0 ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#E8E4DC] text-[10px] uppercase tracking-wider text-[#687163]">
                    <th className="pb-3 font-semibold">Order ID</th>
                    <th className="pb-3 font-semibold">Customer</th>
                    <th className="pb-3 font-semibold">Product(s)</th>
                    <th className="pb-3 font-semibold">Total</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E4DC] text-xs">
                  {analytics.recentOrders.map((order) => (
                    <tr
                      key={order.id || order._id}
                      className="hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin/orders/${order.id || order._id}`)}
                    >
                      <td className="py-3.5 font-mono font-semibold text-[#1D241C]">
                        {order.orderNumber}
                      </td>
                      <td className="py-3.5">
                        <div className="font-medium text-[#1D241C]">{order.customerName || 'Customer'}</div>
                        <div className="text-[10px] text-[#687163]">{order.customerCity || order.customerEmail || 'India'}</div>
                      </td>
                      <td className="py-3.5 text-[#687163] max-w-xs truncate">
                        {order.itemsSummary || (order.items || []).map((i) => i.name).join(', ') || 'Couture Item'}
                      </td>
                      <td className="py-3.5 font-mono font-bold text-[#1D241C]">
                        ₹{(Number(order.total) || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider border ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/orders/${order.id || order._id}`);
                          }}
                          className="p-1.5 rounded-lg hover:bg-[#E8E4DC] text-[#1D241C] transition-colors cursor-pointer"
                          title="View order details"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center">
                <ShoppingBag className="w-10 h-10 text-[#C69E58] mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold text-[#1D241C]">No orders placed yet</p>
                <p className="text-xs text-[#687163] mt-1 max-w-md mx-auto">
                  When customers purchase pieces on your storefront, orders will appear here with live tracking.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Top Selling Products & Customers Column */}
        <div className="space-y-6">
          {/* Top-Selling Products */}
          <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-lg font-bold text-[#1D241C]">
                Top Selling Products
              </h2>
              <Link to="/admin/products" className="text-xs text-[#506040] hover:text-[#1D241C] font-medium">
                All Products →
              </Link>
            </div>

            <div className="space-y-3">
              {analytics.topSellingProducts && analytics.topSellingProducts.length > 0 ? (
                analytics.topSellingProducts.slice(0, 3).map((prod) => (
                  <div
                    key={prod.id || prod._id}
                    onClick={() => navigate(`/admin/products/${prod.id || prod._id}/edit`)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#FAF8F5] cursor-pointer transition-colors"
                  >
                    <img
                      src={prod.images?.[0] || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=200'}
                      alt={prod.name}
                      className="w-12 h-14 rounded-lg object-cover border border-[#E8E4DC] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-[#1D241C] truncate">
                        {prod.name}
                      </div>
                      <div className="text-[11px] text-[#687163] flex items-center gap-2 mt-0.5">
                        <span className="font-mono font-medium">₹{Number(prod.price || 0).toLocaleString('en-IN')}</span>
                        <span>•</span>
                        <span>{prod.salesCount || 0} sold</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        (prod.totalStock || 0) <= 4 || prod.isStockAvailable === false
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}>
                        {prod.isStockAvailable === false ? 'Out of stock' : `${prod.totalStock || 0} in stock`}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-[#687163]">
                  <span>No product sales recorded yet</span>
                </div>
              )}
            </div>
          </div>

          {/* Recent Customers Widget */}
          <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-serif text-lg font-bold text-[#1D241C]">
                Recent Customers
              </h2>
              <Link to="/admin/customers" className="text-xs text-[#506040] hover:text-[#1D241C] font-medium">
                All Customers →
              </Link>
            </div>

            <div className="space-y-2.5">
              {analytics.recentCustomers && analytics.recentCustomers.length > 0 ? (
                analytics.recentCustomers.slice(0, 3).map((cust) => (
                  <div
                    key={cust.id || cust._id}
                    onClick={() => navigate(`/admin/customers/${cust.id || cust._id}`)}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-[#FAF8F5] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] border border-[#E8E4DC] flex items-center justify-center shrink-0 text-[#506040] font-serif font-bold text-xs">
                        {cust.name?.charAt(0)?.toUpperCase() || 'C'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#1D241C] truncate">
                          {cust.name}
                        </div>
                        <div className="text-[10px] text-[#687163] truncate">
                          {cust.city || cust.email || 'India'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#FAF8F5] text-[#1D241C] border border-[#E8E4DC] shrink-0 capitalize">
                        {cust.ordersCount > 0 ? `${cust.ordersCount} orders` : (cust.status || 'Active')}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-[#687163]">
                  <span>No registered customers yet</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
