import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useProduct } from '../../context/ProductContext';
import { useCategory } from '../../context/CategoryContext';
import { useAdmin } from '../../context/AdminContext';
import {
  PlusCircle,
  Search,
  Download,
  Trash2,
  ArrowUpDown,
  Edit,
  Layers,
  CheckSquare,
  Square,
  Loader2,
  ChevronLeft,
  ChevronRight,
  PackageCheck,
  PackageX,
  Image as ImageIcon,
} from 'lucide-react';

export const ProductList = () => {
  const {
    products,
    isLoading,
    pagination,
    fetchProducts,
    deleteProduct,
    toggleStockAvailability,
    bulkUpdateStatus,
  } = useProduct();
  const { categories } = useCategory();
  const { showToast } = useAdmin();
  const navigate = useNavigate();

  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [limit, setLimit] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [density, setDensity] = useState('comfortable');

  // Selected for bulk actions
  const [selectedIds, setSelectedIds] = useState([]);

  // Debounced server-side fetching
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchProducts(currentPage, limit, searchQuery, selectedCategory, stockFilter, sortBy);
    }, 300);
    return () => clearTimeout(handler);
  }, [currentPage, limit, searchQuery, selectedCategory, stockFilter, sortBy, fetchProducts]);

  const toggleSelectAll = () => {
    if (selectedIds.length === products.length && products.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((p) => p.id));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExportCSV = () => {
    if (!products.length) {
      showToast('info', 'No Data', 'No garments available to export.');
      return;
    }

    const headers = ['ID', 'Name', 'SKU', 'Category', 'Price', 'Original Price', 'Stock Availability'];
    const rows = products.map((p) => [
      p.id,
      `"${(p.name || '').replace(/"/g, '""')}"`,
      p.sku,
      `"${p.categoryName || p.category?.name || 'Unassigned'}"`,
      p.price,
      p.originalPrice || '',
      p.isStockAvailable ? 'In Stock' : 'Out of Stock',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sumilux_catalog_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Catalog Exported', `${products.length} garments exported to CSV.`);
  };

  const handleSort = (field) => {
    if (sortBy === 'price_asc' && field === 'price') setSortBy('price_desc');
    else if (sortBy === 'price_desc' && field === 'price') setSortBy('price_asc');
    else if (field === 'price') setSortBy('price_asc');
    else if (sortBy === 'name_asc' && field === 'name') setSortBy('name_desc');
    else if (field === 'name') setSortBy('name_asc');
    else setSortBy('newest');
  };

  const handleToggleStock = async (product) => {
    await toggleStockAvailability(product.id, !product.isStockAvailable);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E4DC]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-3xl font-bold text-[#1A1A1A]">
              Garment & Atelier Catalog
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono tracking-widest bg-[#C8A87C]/15 text-[#A68758] font-bold">
              {pagination.total} Designs
            </span>
          </div>
          <p className="text-xs text-[#6B6864] mt-1">
            Manage luxury garments, departments, stock availability, and colorway variants.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white hover:bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl text-xs font-semibold text-[#1A1A1A] transition-colors flex items-center gap-2 shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#6B6864]" />
            <span>Export CSV</span>
          </button>
          <Link
            to="/admin/products/new"
            className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#C8A87C]" />
            <span>New Piece</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-[#E8E4DC] p-4 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#A68758] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by title, SKU..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs text-[#1A1A1A] placeholder-[#6B6864] focus:outline-none focus:border-[#C8A87C]"
            />
          </div>

          {/* Dynamic Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs text-[#1A1A1A] focus:outline-none focus:border-[#C8A87C] cursor-pointer"
          >
            <option value="all">All Departments</option>
            {categories.map((c) => (
              <option key={c.id || c._id} value={c.id || c._id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Stock Availability Filter */}
          <select
            value={stockFilter}
            onChange={(e) => {
              setStockFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs text-[#1A1A1A] focus:outline-none focus:border-[#C8A87C] cursor-pointer"
          >
            <option value="all">All Availability Statuses</option>
            <option value="in_stock">In Stock (Available)</option>
            <option value="out_of_stock">Out of Stock (Disabled)</option>
          </select>

          {/* Sorting Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-[#F8F6F3] border border-[#E8E4DC] rounded-xl text-xs text-[#1A1A1A] focus:outline-none focus:border-[#C8A87C] cursor-pointer"
          >
            <option value="newest">Recently Added</option>
            <option value="oldest">Oldest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
            <option value="name_desc">Name: Z to A</option>
          </select>
        </div>

        {/* Bulk Actions Bar & Density Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#F2EFE9] text-xs">
          <div className="flex items-center gap-3">
            {selectedIds.length > 0 ? (
              <div className="flex items-center gap-2 bg-[#FAF8F5] px-3 py-1.5 rounded-xl border border-[#E8E4DC]">
                <span className="font-semibold text-[#1A1A1A]">
                  {selectedIds.length} selected
                </span>
                <div className="h-3 w-px bg-[#E8E4DC]" />
                <button
                  onClick={() => {
                    bulkUpdateStatus(selectedIds, 'in_stock');
                    setSelectedIds([]);
                  }}
                  className="text-[#4A7A5E] hover:underline font-medium cursor-pointer"
                >
                  Enable Stock
                </button>
                <button
                  onClick={() => {
                    bulkUpdateStatus(selectedIds, 'archived');
                    setSelectedIds([]);
                  }}
                  className="text-[#A5432F] hover:underline font-medium cursor-pointer"
                >
                  Archive (Soft Delete)
                </button>
              </div>
            ) : (
              <span className="text-[#6B6864]">
                Showing <span className="font-semibold text-[#1A1A1A]">{products.length}</span> of{' '}
                {pagination.total} pieces
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#6B6864]">Density:</span>
            <button
              onClick={() => setDensity('comfortable')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                density === 'comfortable' ? 'bg-[#1A1A1A] text-white' : 'bg-[#F2EFE9] text-[#6B6864]'
              }`}
            >
              Spacious
            </button>
            <button
              onClick={() => setDensity('compact')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                density === 'compact' ? 'bg-[#1A1A1A] text-white' : 'bg-[#F2EFE9] text-[#6B6864]'
              }`}
            >
              Compact
            </button>
          </div>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#E8E4DC] bg-[#FAF8F5] text-[10px] uppercase tracking-wider text-[#6B6864]">
                <th className="py-3.5 px-4 w-10">
                  <button onClick={toggleSelectAll} className="flex items-center cursor-pointer">
                    {selectedIds.length === products.length && products.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-[#C8A87C]" />
                    ) : (
                      <Square className="w-4 h-4 text-[#6B6864]" />
                    )}
                  </button>
                </th>
                <th className="py-3.5 px-3 font-semibold">Garment / Piece</th>
                <th className="py-3.5 px-3 font-semibold">Department</th>
                <th
                  className="py-3.5 px-3 font-semibold cursor-pointer hover:text-[#1A1A1A]"
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center gap-1">
                    <span>Price</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-3 font-semibold text-center">Stock Availability</th>
                <th className="py-3.5 px-3 font-semibold">Variants</th>
                <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2EFE9] text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-[#A68758]">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span className="text-xs text-[#6B6864]">Loading atelier catalog...</span>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-[#6B6864]">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <PackageX className="w-10 h-10 text-[#C8A87C]/50" />
                      <div>
                        <p className="font-semibold text-sm text-[#1A1A1A]">No garments found</p>
                        <p className="text-xs text-[#6B6864] mt-0.5">
                          Try adjusting search filters or create a new atelier piece.
                        </p>
                      </div>
                      <Link
                        to="/admin/products/new"
                        className="px-3.5 py-1.5 bg-[#1A1A1A] text-white text-xs font-semibold rounded-xl hover:bg-[#333333] transition-colors"
                      >
                        Create Product
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const isSelected = selectedIds.includes(product.id);
                  const coverImage = product.images?.[0];

                  return (
                    <tr
                      key={product.id}
                      className={`hover:bg-[#FAF8F5] transition-colors ${
                        isSelected ? 'bg-[#FAF8F5]' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleSelectOne(product.id)}
                          className="flex items-center cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#C8A87C]" />
                          ) : (
                            <Square className="w-4 h-4 text-[#6B6864]" />
                          )}
                        </button>
                      </td>
                      <td className={`py-3 px-3 ${density === 'compact' ? 'py-2' : 'py-3.5'}`}>
                        <div className="flex items-center gap-3">
                          {coverImage ? (
                            <img
                              src={coverImage}
                              alt={product.name}
                              className="w-11 h-14 rounded-lg object-cover border border-[#E8E4DC] shrink-0 bg-[#FAF8F5]"
                            />
                          ) : (
                            <div className="w-11 h-14 rounded-lg border border-[#E8E4DC] bg-[#FAF8F5] flex items-center justify-center text-[#A68758] shrink-0">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div
                              className="font-semibold text-sm text-[#1A1A1A] truncate hover:text-[#C8A87C] cursor-pointer"
                              onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                            >
                              {product.name}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#6B6864]">
                              <span className="font-mono">{product.sku}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-[#6B6864]">
                        <span className="inline-block px-2.5 py-1 bg-[#FAF8F5] border border-[#E8E4DC] rounded-lg text-xs font-medium text-[#1A1A1A]">
                          {product.categoryName || product.category?.name || 'Unassigned'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-[#1A1A1A]">
                        ₹{product.price?.toLocaleString()}
                        {product.originalPrice && (
                          <span className="block text-[10px] text-[#6B6864] line-through font-normal">
                            ₹{product.originalPrice?.toLocaleString()}
                          </span>
                        )}
                      </td>

                      {/* Stock Availability Toggle Button */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStock(product)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors shadow-2xs ${
                            product.isStockAvailable
                              ? 'bg-[#4A7A5E]/15 text-[#4A7A5E] hover:bg-[#4A7A5E]/25 border border-[#4A7A5E]/30'
                              : 'bg-[#A5432F]/15 text-[#A5432F] hover:bg-[#A5432F]/25 border border-[#A5432F]/30'
                          }`}
                          title="Click to toggle stock availability"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              product.isStockAvailable ? 'bg-[#4A7A5E]' : 'bg-[#A5432F]'
                            }`}
                          />
                          <span>{product.isStockAvailable ? 'In Stock' : 'Out of Stock'}</span>
                        </button>
                      </td>

                      <td className="py-3 px-3 text-[#6B6864]">
                        <span className="text-xs font-mono text-[#A68758]">
                          {product.variants?.length || 0} Options
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                            className="p-1.5 rounded-lg hover:bg-[#F2EFE9] text-[#1A1A1A] transition-colors cursor-pointer"
                            title="Edit product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="p-1.5 rounded-lg hover:bg-[#A5432F]/10 text-[#A5432F] transition-colors cursor-pointer"
                            title="Archive piece (Soft Delete)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-[#E8E4DC] bg-[#FAF8F5] text-xs text-[#6B6864]">
          <div className="flex items-center gap-3">
            <span>Show:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2.5 py-1 bg-white border border-[#E8E4DC] rounded-lg text-xs font-semibold text-[#1A1A1A] focus:outline-none focus:border-[#C8A87C] cursor-pointer"
            >
              <option value={12}>12 per page</option>
              <option value={24}>24 per page</option>
              <option value={48}>48 per page</option>
            </select>
            <span>
              Showing {products.length > 0 ? (pagination.page - 1) * limit + 1 : 0} to{' '}
              {Math.min(pagination.page * limit, pagination.total)} of {pagination.total} entries
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={pagination.page <= 1 || isLoading}
              className="p-1.5 rounded-lg bg-white border border-[#E8E4DC] text-[#1A1A1A] hover:bg-[#F2EFE9] disabled:opacity-30 disabled:hover:bg-white transition-colors cursor-pointer"
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-mono text-xs font-semibold text-[#1A1A1A]">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={pagination.page >= pagination.totalPages || isLoading}
              className="p-1.5 rounded-lg bg-white border border-[#E8E4DC] text-[#1A1A1A] hover:bg-[#F2EFE9] disabled:opacity-30 disabled:hover:bg-white transition-colors cursor-pointer"
              title="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
