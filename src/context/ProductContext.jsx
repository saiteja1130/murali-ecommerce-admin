import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from './api';
import { useAdmin } from './AdminContext';

const defaultProductContext = {
  products: [],
  isLoading: false,
  pagination: { page: 1, limit: 12, total: 0, totalPages: 1 },
  fetchProducts: async () => {},
  fetchProductById: async () => null,
  addProduct: async () => {},
  updateProduct: async () => {},
  toggleStockAvailability: async () => false,
  deleteProduct: async () => {},
  bulkUpdateStatus: async () => {},
};

const ProductContext = createContext(defaultProductContext);

export const ProductProvider = ({ children }) => {
  const { showToast, logActivity } = useAdmin();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });

  const fetchProducts = useCallback(async (page = 1, limit = 12, search = '', category = 'all', stockStatus = 'all', sort = 'newest') => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) queryParams.append('search', search);
      if (category && category !== 'all') queryParams.append('category', category);
      if (stockStatus && stockStatus !== 'all') queryParams.append('stockStatus', stockStatus);
      if (sort) queryParams.append('sort', sort);

      const response = await api.get(`/api/products?${queryParams.toString()}`);
      const data = response.data;

      const mappedProducts = (data.data || []).map((p) => ({
        ...p,
        id: p._id,
        categoryName: p.category?.name || 'Unassigned',
        categorySlug: p.category?.slug || '',
        categoryId: p.category?._id || p.category,
      }));

      setProducts(mappedProducts);
      setPagination({
        page: data.page || 1,
        limit,
        total: data.total || 0,
        totalPages: data.totalPages || 1,
      });
    } catch (error) {
      console.error('Failed to fetch products:', error);
      showToast('danger', 'Error', error.response?.data?.message || 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const fetchProductById = async (id) => {
    try {
      const response = await api.get(`/api/products/${id}`);
      const p = response.data.data;
      return {
        ...p,
        id: p._id,
        categoryId: p.category?._id || p.category,
        categoryName: p.category?.name || '',
      };
    } catch (error) {
      console.error('Failed to fetch product by ID:', error);
      throw error;
    }
  };

  const addProduct = async (formData) => {
    try {
      const response = await api.post('/api/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const newProduct = {
        ...response.data.data,
        id: response.data.data._id,
        categoryName: response.data.data.category?.name || 'Unassigned',
      };
      setProducts((prev) => [newProduct, ...prev]);
      showToast('success', 'Product Created', `"${newProduct.name}" added to catalog.`);
      logActivity('Products', 'Created Product', newProduct.name, `SKU: ${newProduct.sku}, Price: ₹${newProduct.price}`);
      return newProduct;
    } catch (error) {
      console.error('Failed to create product:', error);
      showToast('danger', 'Error', error.response?.data?.message || 'Failed to create product');
      throw error;
    }
  };

  const updateProduct = async (id, formData) => {
    try {
      const response = await api.put(`/api/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const updated = {
        ...response.data.data,
        id: response.data.data._id,
        categoryName: response.data.data.category?.name || 'Unassigned',
      };
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      showToast('success', 'Product Updated', `"${updated.name}" saved.`);
      logActivity('Products', 'Updated Product', updated.name, `Updated properties & stock.`);
      return updated;
    } catch (error) {
      console.error('Failed to update product:', error);
      showToast('danger', 'Error', error.response?.data?.message || 'Failed to update product');
      throw error;
    }
  };

  const toggleStockAvailability = async (id, nextState) => {
    try {
      const response = await api.patch(`/api/products/${id}/toggle-stock`, {
        isStockAvailable: nextState,
      });
      const updated = response.data.data;
      setProducts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, isStockAvailable: updated.isStockAvailable } : p
        )
      );
      showToast(
        'info',
        'Stock Updated',
        `Stock availability ${updated.isStockAvailable ? 'enabled' : 'disabled'}.`
      );
      return true;
    } catch (error) {
      console.error('Failed to toggle stock availability:', error);
      showToast('danger', 'Error', 'Failed to update stock availability.');
      return false;
    }
  };

  const deleteProduct = async (id) => {
    try {
      await api.delete(`/api/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast('warning', 'Product Archived', 'Piece moved to archive. Order history preserved.');
      logActivity('Products', 'Archived Product', `Product ${id}`, 'Soft deleted from active catalog.');
    } catch (error) {
      console.error('Failed to archive product:', error);
      showToast('danger', 'Error', error.response?.data?.message || 'Failed to archive product');
    }
  };

  const bulkUpdateStatus = async (ids, status) => {
    // For bulk stock availability updates or archive
    try {
      if (status === 'archived') {
        await Promise.all(ids.map((id) => api.delete(`/api/products/${id}`)));
        setProducts((prev) => prev.filter((p) => !ids.includes(p.id)));
        showToast('warning', 'Bulk Action Completed', `${ids.length} pieces archived.`);
      } else {
        const isStock = status === 'live' || status === 'in_stock';
        await Promise.all(
          ids.map((id) => api.patch(`/api/products/${id}/toggle-stock`, { isStockAvailable: isStock }))
        );
        setProducts((prev) =>
          prev.map((p) => (ids.includes(p.id) ? { ...p, isStockAvailable: isStock } : p))
        );
        showToast('success', 'Bulk Action Applied', `${ids.length} products updated.`);
      }
    } catch (error) {
      console.error('Failed bulk action:', error);
      showToast('danger', 'Error', 'Failed to complete bulk action.');
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        isLoading,
        pagination,
        fetchProducts,
        fetchProductById,
        addProduct,
        updateProduct,
        toggleStockAvailability,
        deleteProduct,
        bulkUpdateStatus,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => {
  const context = useContext(ProductContext);
  return context || defaultProductContext;
};

export default ProductContext;
