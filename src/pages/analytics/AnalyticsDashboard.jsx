import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { StatCard } from '../../components/StatCard';
import { DollarSign, TrendingUp, ShoppingBag, Percent, Download } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
export const AnalyticsDashboard = () => {
    const { orders, products, customers, showToast } = useAdmin();
    const [timeRange, setTimeRange] = useState('30d');
    const monthlySalesData = [
        { month: 'Jan', revenue: 110000, orders: 42, aov: 2619 },
        { month: 'Feb', revenue: 125000, orders: 46, aov: 2717 },
        { month: 'Mar', revenue: 148000, orders: 54, aov: 2740 },
        { month: 'Apr', revenue: 162000, orders: 59, aov: 2745 },
        { month: 'May', revenue: 185000, orders: 68, aov: 2720 },
        { month: 'Jun', revenue: 210000, orders: 74, aov: 2837 },
        { month: 'Jul', revenue: 195000, orders: 71, aov: 2746 },
        { month: 'Aug', revenue: 238000, orders: 82, aov: 2902 },
    ];
    const funnelData = [
        { stage: 'Storefront Visits', count: '104,200', pct: '100%' },
        { stage: 'Garment Detail Views', count: '38,400', pct: '36.8%' },
        { stage: 'Added to Salon Bag', count: '8,920', pct: '8.5%' },
        { stage: 'Initiated Checkout', count: '5,140', pct: '4.9%' },
        { stage: 'VIP Purchases Completed', count: '4,020', pct: '3.8%' },
    ];
    const clientTierShare = [
        { name: 'VIC Clients', value: 52, color: '#C8A87C' },
        { name: 'Haute Members', value: 26, color: '#1A1A1A' },
        { name: 'Private Collectors', value: 14, color: '#A68758' },
        { name: 'Standard Patrons', value: 8, color: '#D4CEBF' },
    ];
    const handleExportPDF = () => {
        window.print();
    };
    const handleExportAnalyticsCSV = () => {
        const headers = ['Month', 'Revenue (USD)', 'Orders Count', 'Average Basket (AOV)'];
        const rows = monthlySalesData.map((d) => [d.month, d.revenue, d.orders, d.aov]);
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `sumilux_executive_analytics_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('success', 'Executive Report Exported', 'CSV analytics balance spreadsheet downloaded.');
    };
    return (<div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E4DC]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-3xl font-bold text-[#1A1A1A]">
              Haute Performance & Intelligence
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono tracking-widest bg-[#C8A87C]/15 text-[#A68758] font-bold">
              Fiscal Year 2026
            </span>
          </div>
          <p className="text-xs text-[#6B6864] mt-1">
            Revenue breakdowns, VIP acquisition cohorts, conversion funnel mechanics, and piece profitability.
          </p>
        </div>

        <div className="flex items-center gap-3 no-print">
          <button onClick={handleExportPDF} className="px-3.5 py-2 bg-white hover:bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs font-semibold text-[#1A1A1A] transition-colors flex items-center gap-2 shadow-2xs">
            <Download className="w-3.5 h-3.5 text-[#6B6864]"/>
            <span>Print Report (PDF)</span>
          </button>
          <button onClick={handleExportAnalyticsCSV} className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-sm">
            <Download className="w-3.5 h-3.5 text-[#C8A87C]"/>
            <span>Export Financial CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Fiscal Revenue" value="₹1,373,000" subValue="YTD Couture Gross" change={{ value: '+24.6%', isPositive: true }} icon={DollarSign}/>
        <StatCard label="Blended AOV" value="₹2,746 INR" subValue="Average item basket" change={{ value: '+9.4%', isPositive: true }} icon={TrendingUp}/>
        <StatCard label="VIC LTV Repeat Rate" value="76.8%" subValue="Multi-season repeat buyers" change={{ value: '+5.1%', isPositive: true }} icon={Percent}/>
        <StatCard label="Inventory Turn Rate" value="4.2x / yr" subValue="Atelier production velocity" icon={ShoppingBag}/>
      </div>

      {/* Main Monthly Revenue Bar Chart & VIP Cohort Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Bar Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#1A1A1A]">
                Monthly Revenue Performance
              </h2>
              <p className="text-xs text-[#6B6864] mt-0.5">
                Gross couture volume comparison across 2026 fiscal cycles
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySalesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: '#E8E4DC' }} tick={{ fill: '#6B6864', fontSize: 11 }}/>
                <YAxis tickLine={false} axisLine={{ stroke: '#E8E4DC' }} tick={{ fill: '#6B6864', fontSize: 11 }} tickFormatter={(val) => `$${val / 1000}k`}/>
                <Tooltip formatter={(val) => [`$${val.toLocaleString()}`, 'Gross Volume']} contentStyle={{
            backgroundColor: '#FFFFFF',
            borderColor: '#E8E4DC',
            borderRadius: '12px',
            fontSize: '12px',
        }}/>
                <Bar dataKey="revenue" fill="#C8A87C" radius={[6, 6, 0, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Client Tier Contribution Donut (1 col) */}
        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#1A1A1A]">
              Revenue by Patron Tier
            </h2>
            <p className="text-xs text-[#6B6864] mt-0.5">
              VIP membership share of total transactions
            </p>
          </div>

          <div className="h-48 relative flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={clientTierShare} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                  {clientTierShare.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2}/>))}
                </Pie>
                <Tooltip formatter={(val) => [`${val}%`, 'Share']} contentStyle={{
            backgroundColor: '#FFFFFF',
            borderColor: '#E8E4DC',
            borderRadius: '8px',
            fontSize: '12px',
        }}/>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center pointer-events-none">
              <div className="text-[10px] uppercase tracking-wider text-[#6B6864]">Core Patron</div>
              <div className="font-serif text-base font-bold text-[#1A1A1A]">VIC Salon</div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#F2EFE9]">
            {clientTierShare.map((item) => (<div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}/>
                  <span className="text-[#1A1A1A] font-medium">{item.name}</span>
                </div>
                <span className="font-mono-data text-[#6B6864] font-semibold">{item.value}%</span>
              </div>))}
          </div>
        </div>
      </div>

      {/* Conversion Funnel & Top Selling Pieces Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs space-y-4">
          <h2 className="font-serif text-xl font-bold text-[#1A1A1A] border-b border-[#F2EFE9] pb-3">
            Storefront Conversion Funnel
          </h2>

          <div className="space-y-3">
            {funnelData.map((step, idx) => (<div key={step.stage} className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E4DC] text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-[#1A1A1A]">{step.stage}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[#6B6864]">{step.count}</span>
                    <span className="font-mono font-bold text-[#A68758]">{step.pct}</span>
                  </div>
                </div>
                <div className="w-full bg-[#E8E4DC] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#C8A87C] h-full rounded-full" style={{ width: `${100 - idx * 22}%` }}/>
                </div>
              </div>))}
          </div>
        </div>

        {/* Top Grossing Creations */}
        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-2xs space-y-4">
          <h2 className="font-serif text-xl font-bold text-[#1A1A1A] border-b border-[#F2EFE9] pb-3">
            Top Grossing Atelier Designs
          </h2>

          <div className="space-y-3">
            {products.slice(0, 4).map((p, idx) => (<div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FAF8F5] transition-colors">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-xs text-[#A68758] w-4">
                    0{idx + 1}
                  </span>
                  <img src={p.images[0]} alt={p.name} className="w-10 h-12 rounded-lg object-cover border border-[#E8E4DC] shrink-0"/>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[#1A1A1A] truncate">{p.name}</div>
                    <div className="text-[10px] text-[#6B6864] font-mono">{p.sku}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono-data font-bold text-xs text-[#1A1A1A]">
                    ${(p.price * p.salesCount).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-[#4A7A5E] font-medium">
                    {p.salesCount} sold
                  </div>
                </div>
              </div>))}
          </div>
        </div>
      </div>
    </div>);
};
export default AnalyticsDashboard;
