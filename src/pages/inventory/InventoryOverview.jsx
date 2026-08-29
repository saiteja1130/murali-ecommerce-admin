import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { useCategory } from '../../context/CategoryContext';
import { Package, AlertTriangle, Search, Download, RefreshCw, Layers } from 'lucide-react';

export const InventoryOverview = () => {
  const { products, inventoryLogs, adjustStock, showToast } = useAdmin();
  const { categories } = useCategory();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [stockLevelFilter, setStockLevelFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('inventory');

  // Adjustment Modal
  const [adjustModalProduct, setAdjustModalProduct] = useState(null);
  const [adjustDelta, setAdjustDelta] = useState(5);
  const [adjustReason, setAdjustReason] = useState('Restock from supplier');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesStock =
        stockLevelFilter === 'all' ||
        (stockLevelFilter === 'low' && (p.totalStock || 0) <= 4 && (p.totalStock || 0) > 0) ||
        (stockLevelFilter === 'out' && (p.totalStock || 0) === 0) ||
        (stockLevelFilter === 'in_stock' && (p.totalStock || 0) > 4);
      return matchesSearch && matchesCat && matchesStock;
    });
  }, [products, searchQuery, selectedCategory, stockLevelFilter]);

  const handleExecuteAdjustment = (e) => {
    e.preventDefault();
    if (!adjustModalProduct) return;
    adjustStock(adjustModalProduct.productId, adjustDelta, adjustReason);
    setAdjustModalProduct(null);
  };

  const handleExportCSV = () => {
    const headers = ['Product ID', 'Name', 'SKU', 'Category', 'Total Stock', 'Status'];
    const rows = filteredProducts.map((p) => [
      p.id,
      `"${p.name}"`,
      p.sku,
      `"${p.category}"`,
      p.totalStock || 0,
      p.status || 'Active',
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Inventory CSV Exported', 'Stock balance sheet generated.');
  };

  const totalCatalogUnits = products.reduce((acc, p) => acc + (p.totalStock || 0), 0);
  const lowStockCount = products.filter((p) => (p.totalStock || 0) <= 4).length;

  return (
    <div className="space-y-6 pb-12 text-[#1D241C]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E4DC]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-3xl font-bold text-[#1D241C]">
              Inventory & Stock Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono tracking-widest bg-[#506040]/15 text-[#506040] font-bold">
              {totalCatalogUnits} Units in Stock
            </span>
          </div>
          <p className="text-xs text-[#687163] mt-1">
            Real-time stock auditing, available inventory quantities, and low stock notifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white hover:bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs font-semibold text-[#1D241C] transition-colors flex items-center gap-2 shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#687163]" />
            <span>Export Stock CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5 shadow-2xs">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-[#506040]">
            Total Products
          </div>
          <div className="font-mono text-2xl font-bold text-[#1D241C] mt-1">
            {products.length} Products
          </div>
          <div className="text-xs text-[#687163] mt-1">Catalog items</div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5 shadow-2xs">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-[#506040]">
            Total Stock Units
          </div>
          <div className="font-mono text-2xl font-bold text-[#1D241C] mt-1">
            {totalCatalogUnits} Units
          </div>
          <div className="text-xs text-[#687163] mt-1">Available in warehouse</div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5 shadow-2xs">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-[#506040]">
            Low Stock Alerts
          </div>
          <div className="font-mono text-2xl font-bold text-red-700 mt-1 flex items-center gap-2">
            <span>{lowStockCount} Products</span>
            {lowStockCount > 0 && <AlertTriangle className="w-5 h-5" />}
          </div>
          <div className="text-xs text-[#687163] mt-1">Stock is 4 or below</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E8E4DC] text-xs">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2.5 font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'inventory'
              ? 'border-b-2 border-[#1D241C] text-[#1D241C]'
              : 'text-[#687163] hover:text-[#1D241C]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Product Inventory</span>
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2.5 font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'logs'
              ? 'border-b-2 border-[#1D241C] text-[#1D241C]'
              : 'text-[#687163] hover:text-[#1D241C]'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          <span>Stock Adjustment History</span>
        </button>
      </div>

      {activeTab === 'inventory' ? (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white rounded-2xl border border-[#E8E4DC] p-4 shadow-2xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-[#506040] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by product name or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs text-[#1D241C] focus:outline-none focus:border-[#C69E58]"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs text-[#1D241C] focus:outline-none focus:border-[#C69E58] cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id || c._id} value={c.id || c._id || c.name}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={stockLevelFilter}
                onChange={(e) => setStockLevelFilter(e.target.value)}
                className="px-3 py-2 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs text-[#1D241C] focus:outline-none focus:border-[#C69E58] cursor-pointer"
              >
                <option value="all">All Stock Levels</option>
                <option value="low">Low Stock (≤ 4)</option>
                <option value="out">Out of Stock (0)</option>
                <option value="in_stock">In Stock (&gt; 4)</option>
              </select>
            </div>
          </div>

          {/* Product Stock Table */}
          <div className="bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#E8E4DC] bg-[#FAF8F5] text-[10px] uppercase tracking-wider text-[#687163]">
                    <th className="py-3.5 px-4 font-semibold">Product</th>
                    <th className="py-3.5 px-3 font-semibold">SKU</th>
                    <th className="py-3.5 px-3 font-semibold">Category</th>
                    <th className="py-3.5 px-3 font-semibold">Stock Quantity</th>
                    <th className="py-3.5 px-3 font-semibold">Variants</th>
                    <th className="py-3.5 px-3 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E4DC] text-xs">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images?.[0] || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=200'}
                            alt={p.name}
                            className="w-10 h-12 rounded-lg object-cover border border-[#E8E4DC] shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-semibold text-sm text-[#1D241C]">{p.name}</div>
                            <div className="text-[11px] font-mono text-[#687163]">
                              ₹{Number(p.price || 0).toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-mono font-medium text-[#1D241C]">
                        {p.sku}
                      </td>
                      <td className="py-3.5 px-3 text-[#687163]">
                        {p.category}
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg font-mono font-bold text-xs ${
                            (p.totalStock || 0) <= 4
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {p.totalStock || 0} Units
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="text-[#687163] font-medium">
                          {(p.variants || []).length} Variants
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        {(p.totalStock || 0) === 0 ? (
                          <span className="text-[10px] uppercase font-mono font-bold text-red-700">
                            Out of Stock
                          </span>
                        ) : (p.totalStock || 0) <= 4 ? (
                          <span className="text-[10px] uppercase font-mono font-bold text-amber-700">
                            Low Stock
                          </span>
                        ) : (
                          <span className="text-[10px] uppercase font-mono font-bold text-emerald-800">
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() =>
                            setAdjustModalProduct({
                              productId: p.id,
                              productName: p.name,
                              sku: p.sku,
                              currentStock: p.totalStock || 0,
                            })
                          }
                          className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#E8E4DC] border border-[#E8E4DC] text-[#1D241C] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Adjust Stock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Inventory Logs Table */
        <div className="bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden shadow-2xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#E8E4DC] bg-[#FAF8F5] text-[10px] uppercase tracking-wider text-[#687163]">
                <th className="py-3.5 px-4 font-semibold">Date & Time</th>
                <th className="py-3.5 px-3 font-semibold">Product</th>
                <th className="py-3.5 px-3 font-semibold">SKU</th>
                <th className="py-3.5 px-3 font-semibold">Change</th>
                <th className="py-3.5 px-3 font-semibold">Reason</th>
                <th className="py-3.5 px-4 font-semibold text-right">Updated By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E4DC] text-xs">
              {inventoryLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#FAF8F5] transition-colors">
                  <td className="py-3.5 px-4 text-[#687163] font-mono">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-[#1D241C]">
                    {log.productName}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-[#506040]">
                    {log.sku}
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold">
                    {log.change > 0 ? (
                      <span className="text-[#506040]">+{log.change}</span>
                    ) : (
                      <span className="text-red-700">{log.change}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-[#1D241C]">
                    {log.reason}
                  </td>
                  <td className="py-3.5 px-4 text-right text-[#687163] font-medium">
                    {log.performedBy}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Adjust Modal */}
      {adjustModalProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleExecuteAdjustment}
            className="bg-white max-w-md w-full p-6 rounded-2xl border border-[#E8E4DC] shadow-2xl space-y-4"
          >
            <h3 className="font-serif text-xl font-bold text-[#1D241C]">
              Adjust Product Stock
            </h3>
            <p className="text-xs text-[#687163]">
              Adjusting <strong className="text-[#1D241C]">{adjustModalProduct.productName}</strong> (
              <span className="font-mono">{adjustModalProduct.sku}</span>). Current stock is{' '}
              <strong className="font-mono text-[#1D241C]">{adjustModalProduct.currentStock} units</strong>.
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-[#1D241C] uppercase tracking-wider mb-1">
                  Stock Units Adjustment (+ to add, - to remove)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustDelta((prev) => prev - 1)}
                    className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] font-bold text-sm hover:bg-[#E8E4DC] cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    required
                    value={adjustDelta}
                    onChange={(e) => setAdjustDelta(Number(e.target.value))}
                    className="flex-1 px-3.5 py-2 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-center text-sm font-mono font-bold text-[#1D241C]"
                  />
                  <button
                    type="button"
                    onClick={() => setAdjustDelta((prev) => prev + 1)}
                    className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] font-bold text-sm hover:bg-[#E8E4DC] cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1D241C] uppercase tracking-wider mb-1">
                  Reason for Adjustment *
                </label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs text-[#1D241C] cursor-pointer"
                >
                  <option value="Restock from supplier">Restock from supplier</option>
                  <option value="Customer return adjustment">Customer return adjustment</option>
                  <option value="Damaged or defective item removal">Damaged or defective item removal</option>
                  <option value="Manual inventory count correction">Manual inventory count correction</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[#E8E4DC]">
              <button
                type="button"
                onClick={() => setAdjustModalProduct(null)}
                className="px-4 py-2 rounded-xl text-xs text-[#687163] hover:bg-[#FAF8F5] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#1D241C] hover:bg-[#C69E58] text-white hover:text-[#1D241C] text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Save Stock Change
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default InventoryOverview;
