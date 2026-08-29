import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { useCustomer } from '../context/CustomerContext';
import { StatCard } from '../components/StatCard';
import { DollarSign, ShoppingBag, TrendingUp, AlertTriangle, Users, ArrowUpRight, PlusCircle, ChevronRight } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

export const Dashboard = () => {
  const { orders, products, currentUser } = useAdmin();
  const { customers } = useCustomer();
  const [revenueRange, setRevenueRange] = useState('30d');
  const navigate = useNavigate();

  // Metrics calculation
  const totalRevenue = Math.round(orders.reduce((acc, o) => acc + (o.paymentStatus === 'paid' ? o.total : 0), 128450));
  const totalOrdersCount = orders.length + 42;
  const avgOrderValue = Math.round(totalRevenue / totalOrdersCount);
  const lowStockProducts = products.filter((p) => (p.totalStock !== undefined ? p.totalStock <= 4 : false));

  // Revenue chart dataset per range
  const chartData = {
    '7d': [
      { name: 'Mon', revenue: 14200, orders: 4 },
      { name: 'Tue', revenue: 18900, orders: 5 },
      { name: 'Wed', revenue: 12400, orders: 3 },
      { name: 'Thu', revenue: 26800, orders: 7 },
      { name: 'Fri', revenue: 31200, orders: 9 },
      { name: 'Sat', revenue: 22400, orders: 6 },
      { name: 'Sun', revenue: 19800, orders: 5 },
    ],
    '30d': [
      { name: 'Day 01', revenue: 28400, orders: 8 },
      { name: 'Day 05', revenue: 34100, orders: 10 },
      { name: 'Day 10', revenue: 22900, orders: 6 },
      { name: 'Day 15', revenue: 46200, orders: 12 },
      { name: 'Day 20', revenue: 38700, orders: 9 },
      { name: 'Day 25', revenue: 52100, orders: 14 },
    ],
    '90d': [
      { name: 'Month 1', revenue: 98000, orders: 28 },
      { name: 'Month 2', revenue: 134000, orders: 39 },
      { name: 'Month 3', revenue: 182000, orders: 51 },
    ],
    'YTD': [
      { name: 'Q1', revenue: 420000, orders: 120 },
      { name: 'Q2', revenue: 580000, orders: 165 },
      { name: 'Q3', revenue: 640000, orders: 182 },
    ],
  }[revenueRange];

  // Category shares for donut chart
  const categoryData = [
    { name: "Hair Accessories & Clips", value: 44, color: '#C69E58' },
    { name: "Jewelry & Earrings", value: 24, color: '#506040' },
    { name: 'Special Collection', value: 18, color: '#1D241C' },
    { name: 'Other Accessories', value: 14, color: '#A68758' },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-[#506040]/15 text-[#506040] border-[#506040]/30';
      case 'shipped':
        return 'bg-blue-900/15 text-blue-800 border-blue-200';
      case 'processing':
        return 'bg-[#C69E58]/15 text-[#A87C38] border-[#C69E58]/30';
      case 'pending':
      default:
        return 'bg-[#1D241C]/10 text-[#1D241C] border-[#1D241C]/20';
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in text-[#1D241C]">
      {/* Page Header with Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E4DC]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-3xl font-bold text-[#1D241C]">
              Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono tracking-widest bg-[#506040]/15 text-[#506040] font-bold">
              Live Store Active
            </span>
          </div>
          <p className="text-xs text-[#687163] mt-1 font-sans">
            Welcome back, <span className="font-medium text-[#1D241C]">{currentUser?.name || 'Admin'}</span>. Here is the latest overview of your store's performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
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
          value={`₹${totalRevenue.toLocaleString('en-IN')}`}
          subValue="Total sales to date"
          change={{ value: '+18.4%', isPositive: true }}
          icon={DollarSign}
        />
        <StatCard
          label="Total Orders"
          value={`${totalOrdersCount} Orders`}
          subValue="Updated live"
          change={{ value: '+8.2%', isPositive: true }}
          icon={ShoppingBag}
        />
        <StatCard
          label="Average Order Value"
          value={`₹${avgOrderValue.toLocaleString('en-IN')}`}
          subValue="Avg spent per order"
          change={{ value: '+12.1%', isPositive: true }}
          icon={TrendingUp}
        />
        <StatCard
          label="Total Customers"
          value={`${(customers || []).length} Customers`}
          subValue="Registered users"
          icon={Users}
        />
        <StatCard
          label="Low Stock Alerts"
          value={`${lowStockProducts.length} Items`}
          subValue="Stock 4 or below"
          icon={AlertTriangle}
          badge={lowStockProducts.length > 0 ? 'Action Needed' : 'Good Stock'}
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Performance Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#1D241C]">
                Sales & Revenue
              </h2>
              <p className="text-xs text-[#687163] mt-0.5">
                Overview of store income and order volume over time
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
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C69E58" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#C69E58" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tickLine={false} axisLine={{ stroke: '#E8E4DC' }} tick={{ fill: '#687163', fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={{ stroke: '#E8E4DC' }} tick={{ fill: '#687163', fontSize: 11 }} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip
                  formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Revenue']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E8E4DC',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#C69E58" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Donut */}
        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#1D241C]">
              Sales by Category
            </h2>
            <p className="text-xs text-[#687163] mt-0.5">
              Category share of overall sales
            </p>
          </div>

          <div className="h-56 my-2 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={66} outerRadius={88} paddingAngle={4} dataKey="value">
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => [`${val}%`, 'Share']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E8E4DC',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-[9px] uppercase tracking-widest text-[#506040] font-bold">Top Category</span>
              <span className="font-serif text-sm font-bold text-[#1D241C] mt-0.5 leading-tight">Clips & Hair</span>
              <span className="text-[10px] font-mono text-[#687163]">44% Share</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#E8E4DC]">
            {categoryData.map((item) => (
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
                Latest orders received from customers
              </p>
            </div>
            <Link to="/admin/orders" className="text-xs font-semibold text-[#506040] hover:text-[#1D241C] flex items-center gap-1 transition-colors">
              <span>View All Orders</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
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
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                    onClick={() => navigate(`/admin/orders/${order.id}`)}
                  >
                    <td className="py-3.5 font-mono font-semibold text-[#1D241C]">
                      {order.orderNumber}
                    </td>
                    <td className="py-3.5">
                      <div className="font-medium text-[#1D241C]">{order.customer?.name || order.customerName || 'Customer'}</div>
                      <div className="text-[10px] text-[#687163]">{order.customer?.city || order.customer?.email || order.customerEmail || '—'}</div>
                    </td>
                    <td className="py-3.5 text-[#687163] max-w-xs truncate">
                      {(order.items || []).map((i) => i.productName).join(', ')}
                    </td>
                    <td className="py-3.5 font-mono font-bold text-[#1D241C]">
                      ₹{(order.total || 0).toFixed(2)}
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
                          navigate(`/admin/orders/${order.id}`);
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
          </div>
        </div>

        {/* Top Selling Products & Customers */}
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
              {products.slice(0, 3).map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => navigate(`/admin/products/${prod.id}/edit`)}
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
                      (prod.totalStock || 0) <= 4
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}>
                      {prod.totalStock || 0} in stock
                    </span>
                  </div>
                </div>
              ))}
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
              {(customers || []).slice(0, 3).map((cust) => (
                <div
                  key={cust.id}
                  onClick={() => navigate(`/admin/customers/${cust.id}`)}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-[#FAF8F5] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {cust.avatar ? (
                      <img src={cust.avatar} alt={cust.name} className="w-8 h-8 rounded-lg object-cover border border-[#E8E4DC] shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] border border-[#E8E4DC] flex items-center justify-center shrink-0 text-[#506040] font-serif font-bold text-[10px]">
                        {cust.name?.charAt(0) || 'C'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#1D241C] truncate">
                        {cust.name}
                      </div>
                      <div className="text-[10px] text-[#687163] truncate">
                        {cust.city || 'India'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#FAF8F5] text-[#1D241C] border border-[#E8E4DC] shrink-0 capitalize">
                    {cust.status || 'Active'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
