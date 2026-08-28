import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { Package, AlertTriangle, Search, Download, RefreshCw, Layers } from 'lucide-react';
export const InventoryOverview = () => {
    const { products, inventoryLogs, adjustStock, showToast } = useAdmin();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [stockLevelFilter, setStockLevelFilter] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [activeTab, setActiveTab] = useState('inventory');
    // Adjustment Modal
    const [adjustModalProduct, setAdjustModalProduct] = useState(null);
    const [adjustDelta, setAdjustDelta] = useState(5);
    const [adjustReason, setAdjustReason] = useState('Atelier Restock from Lyon Mill');
    const filteredProducts = useMemo(() => {
        return products.filter((p) => {
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.sku.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
            const matchesStock = stockLevelFilter === 'all' ||
                (stockLevelFilter === 'low' && p.totalStock <= 4 && p.totalStock > 0) ||
                (stockLevelFilter === 'out' && p.totalStock === 0) ||
                (stockLevelFilter === 'in_stock' && p.totalStock > 4);
            return matchesSearch && matchesCat && matchesStock;
        });
    }, [products, searchQuery, selectedCategory, stockLevelFilter]);
    const handleExecuteAdjustment = (e) => {
        e.preventDefault();
        if (!adjustModalProduct)
            return;
        adjustStock(adjustModalProduct.productId, adjustDelta, adjustReason);
        setAdjustModalProduct(null);
    };
    const handleExportCSV = () => {
        const headers = ['Product ID', 'Name', 'Master SKU', 'Category', 'Total Stock', 'Variants Count', 'Status'];
        const rows = filteredProducts.map((p) => [
            p.id,
            `"${p.name}"`,
            p.sku,
            `"${p.category}"`,
            p.totalStock,
            p.variants.length,
            p.status,
        ]);
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `sumilux_inventory_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('success', 'Inventory CSV Exported', 'Stock balance sheet generated.');
    };
    const totalCatalogUnits = products.reduce((acc, p) => acc + p.totalStock, 0);
    const lowStockCount = products.filter((p) => p.totalStock <= 4).length;
    return (<div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E4DC]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-3xl font-bold text-[#1A1A1A]">
              Atelier Inventory & Warehousing
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono tracking-widest bg-[#C8A87C]/15 text-[#A68758] font-bold">
              {totalCatalogUnits} Units in Vault
            </span>
          </div>
          <p className="text-xs text-[#6B6864] mt-1">
            Real-time stock auditing, warehouse allocation, restock reconciliation, and shortage alerts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleExportCSV} className="px-3.5 py-2 bg-white hover:bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs font-semibold text-[#1A1A1A] transition-colors flex items-center gap-2 shadow-2xs">
            <Download className="w-3.5 h-3.5 text-[#6B6864]"/>
            <span>Export Stock CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5 shadow-2xs">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-[#A68758]">
            Total Master Pieces
          </div>
          <div className="font-mono-data text-2xl font-bold text-[#1A1A1A] mt-1">
            {products.length} Garment Styles
          </div>
          <div className="text-xs text-[#6B6864] mt-1">Active collection models</div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5 shadow-2xs">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-[#A68758]">
            Total Allocated Units
          </div>
          <div className="font-mono-data text-2xl font-bold text-[#1A1A1A] mt-1">
            {totalCatalogUnits} Garment Units
          </div>
          <div className="text-xs text-[#6B6864] mt-1">Stored across Paris & Milan ateliers</div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5 shadow-2xs">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-[#A68758]">
            Critical Low Stock Alert
          </div>
          <div className="font-mono-data text-2xl font-bold text-[#A5432F] mt-1 flex items-center gap-2">
            <span>{lowStockCount} Styles</span>
            {lowStockCount > 0 && <AlertTriangle className="w-5 h-5"/>}
          </div>
          <div className="text-xs text-[#6B6864] mt-1">Threshold: &le; 4 pieces remaining</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E8E4DC] text-xs">
        <button onClick={() => setActiveTab('inventory')} className={`px-4 py-2.5 font-semibold transition-colors flex items-center gap-2 cursor-pointer ${activeTab === 'inventory'
            ? 'border-b-2 border-[#1A1A1A] text-[#1A1A1A]'
            : 'text-[#6B6864] hover:text-[#1A1A1A]'}`}>
          <Package className="w-4 h-4"/>
          <span>Active Stock Balance</span>
        </button>
        <button onClick={() => setActiveTab('logs')} className={`px-4 py-2.5 font-semibold transition-colors flex items-center gap-2 cursor-pointer ${activeTab === 'logs'
            ? 'border-b-2 border-[#1A1A1A] text-[#1A1A1A]'
            : 'text-[#6B6864] hover:text-[#1A1A1A]'}`}>
          <RefreshCw className="w-4 h-4"/>
          <span>Stock Adjustment Audit Log</span>
        </button>
      </div>

      {activeTab === 'inventory' ? (<div className="space-y-4">
          {/* Filters */}
          <div className="bg-white rounded-2xl border border-[#E8E4DC] p-4 shadow-2xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-[#A68758] absolute left-3 top-2.5"/>
                <input type="text" placeholder="Search by garment title or SKU..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs text-[#1A1A1A] focus:outline-none focus:border-[#C8A87C]"/>
              </div>

              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="px-3 py-2 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs text-[#1A1A1A] focus:outline-none focus:border-[#C8A87C]">
                <option value="all">All Departments</option>
                <option value="Women's Ready-to-Wear">Women's Ready-to-Wear</option>
                <option value="Men's Sartorial">Men's Sartorial</option>
                <option value="Limited Atelier Edition">Limited Atelier Edition</option>
                <option value="Leather Goods & Footwear">Leather Goods & Footwear</option>
              </select>

              <select value={stockLevelFilter} onChange={(e) => setStockLevelFilter(e.target.value)} className="px-3 py-2 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs text-[#1A1A1A] focus:outline-none focus:border-[#C8A87C]">
                <option value="all">All Inventory Levels</option>
                <option value="low">Low Stock (&le; 4)</option>
                <option value="out">Out of Stock (0)</option>
                <option value="in_stock">Healthy Stock (&gt; 4)</option>
              </select>
            </div>
          </div>

          {/* Product Stock Table */}
          <div className="bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#E8E4DC] bg-[#FAF8F5] text-[10px] uppercase tracking-wider text-[#6B6864]">
                    <th className="py-3.5 px-4 font-semibold">Garment / Piece</th>
                    <th className="py-3.5 px-3 font-semibold">Master SKU</th>
                    <th className="py-3.5 px-3 font-semibold">Department</th>
                    <th className="py-3.5 px-3 font-semibold">Available Units</th>
                    <th className="py-3.5 px-3 font-semibold">Variant SKUs</th>
                    <th className="py-3.5 px-3 font-semibold">Status Health</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Quick Stock Adjust</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2EFE9] text-xs">
                  {filteredProducts.map((p) => (<tr key={p.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img src={p.images[0]} alt={p.name} className="w-10 h-12 rounded-lg object-cover border border-[#E8E4DC] shrink-0"/>
                          <div className="min-w-0">
                            <div className="font-semibold text-sm text-[#1A1A1A]">{p.name}</div>
                            <div className="text-[11px] font-mono text-[#6B6864]">
                              ₹{p.price.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-mono font-medium text-[#1A1A1A]">
                        {p.sku}
                      </td>
                      <td className="py-3.5 px-3 text-[#6B6864]">
                        {p.category}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg font-mono font-bold text-xs ${p.totalStock <= 4
                    ? 'bg-[#A5432F]/15 text-[#A5432F]'
                    : 'bg-[#4A7A5E]/15 text-[#4A7A5E]'}`}>
                          {p.totalStock} Units
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <Link to={`/admin/products/${p.id}/variants`} className="inline-flex items-center gap-1 text-[#A68758] hover:text-[#1A1A1A] font-medium">
                          <Layers className="w-3.5 h-3.5"/>
                          <span>{p.variants.length} Matrix SKUs</span>
                        </Link>
                      </td>
                      <td className="py-3.5 px-3">
                        {p.totalStock === 0 ? (<span className="text-[10px] uppercase font-mono font-bold text-[#A5432F]">
                            Out of Stock
                          </span>) : p.totalStock <= 4 ? (<span className="text-[10px] uppercase font-mono font-bold text-[#B8863F]">
                            Restock Required
                          </span>) : (<span className="text-[10px] uppercase font-mono font-bold text-[#4A7A5E]">
                            Optimal Balance
                          </span>)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button onClick={() => setAdjustModalProduct({
                    productId: p.id,
                    productName: p.name,
                    sku: p.sku,
                    currentStock: p.totalStock,
                })} className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#F2EFE9] border border-[#E8E4DC] text-[#1A1A1A] rounded-xl text-xs font-semibold transition-colors">
                          Adjust Balance
                        </button>
                      </td>
                    </tr>))}
                </tbody>
              </table>
            </div>
          </div>
        </div>) : (
        /* Inventory Logs Table */
        <div className="bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden shadow-2xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#E8E4DC] bg-[#FAF8F5] text-[10px] uppercase tracking-wider text-[#6B6864]">
                <th className="py-3.5 px-4 font-semibold">Timestamp</th>
                <th className="py-3.5 px-3 font-semibold">Garment Piece</th>
                <th className="py-3.5 px-3 font-semibold">SKU Identifier</th>
                <th className="py-3.5 px-3 font-semibold">Stock Delta</th>
                <th className="py-3.5 px-3 font-semibold">Reconciliation Reason</th>
                <th className="py-3.5 px-4 font-semibold text-right">Authorized Staff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2EFE9] text-xs">
              {inventoryLogs.map((log) => (<tr key={log.id} className="hover:bg-[#FAF8F5] transition-colors">
                  <td className="py-3.5 px-4 text-[#6B6864] font-mono">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-[#1A1A1A]">
                    {log.productName}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-[#A68758]">
                    {log.sku}
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold">
                    {log.change > 0 ? (<span className="text-[#4A7A5E]">+{log.change}</span>) : (<span className="text-[#A5432F]">{log.change}</span>)}
                  </td>
                  <td className="py-3.5 px-3 text-[#1A1A1A]">
                    {log.reason}
                  </td>
                  <td className="py-3.5 px-4 text-right text-[#6B6864] font-medium">
                    {log.performedBy}
                  </td>
                </tr>))}
            </tbody>
          </table>
        </div>)}

      {/* Adjust Modal */}
      {adjustModalProduct && (<div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleExecuteAdjustment} className="bg-white max-w-md w-full p-6 rounded-2xl border border-[#E8E4DC] shadow-2xl space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">
              Reconcile Atelier Inventory
            </h3>
            <p className="text-xs text-[#6B6864]">
              Adjusting <strong className="text-[#1A1A1A]">{adjustModalProduct.productName}</strong> (
              <span className="font-mono">{adjustModalProduct.sku}</span>). Current vault stock is{' '}
              <strong className="font-mono text-[#1A1A1A]">{adjustModalProduct.currentStock} units</strong>.
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider mb-1">
                  Stock Units Delta (Use negative for removal)
                </label>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setAdjustDelta((prev) => prev - 1)} className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] font-bold text-sm hover:bg-[#F2EFE9]">
                    -
                  </button>
                  <input type="number" required value={adjustDelta} onChange={(e) => setAdjustDelta(Number(e.target.value))} className="flex-1 px-3.5 py-2 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-center text-sm font-mono font-bold text-[#1A1A1A]"/>
                  <button type="button" onClick={() => setAdjustDelta((prev) => prev + 1)} className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] font-bold text-sm hover:bg-[#F2EFE9]">
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider mb-1">
                  Reason for Adjustment *
                </label>
                <select value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} className="w-full px-3.5 py-2 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs text-[#1A1A1A]">
                  <option value="Atelier Restock from Lyon Mill">Atelier Restock from Lyon Mill</option>
                  <option value="Showroom Sample Relocation">Showroom Sample Relocation</option>
                  <option value="Client Order Reservation">Client Order Reservation</option>
                  <option value="Quality Inspection Scrap">Quality Inspection Scrap</option>
                  <option value="Annual Inventory Count Reconciliation">Annual Inventory Count Reconciliation</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[#F2EFE9]">
              <button type="button" onClick={() => setAdjustModalProduct(null)} className="px-4 py-2 rounded-xl text-xs text-[#6B6864] hover:bg-[#F2EFE9]">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-[#1A1A1A] text-white text-xs font-semibold rounded-xl hover:bg-[#333333] transition-colors">
                Commit Stock Change
              </button>
            </div>
          </form>
        </div>)}
    </div>);
};
export default InventoryOverview;
