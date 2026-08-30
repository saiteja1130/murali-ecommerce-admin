import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from './api';
import { useAdmin } from './AdminContext';

const defaultCategoryContext = {
  mainCategories: [],
  categories: [],
  isLoading: false,
  isLoadingMain: false,
  fetchMainCategories: async () => {},
  addMainCategory: async () => false,
  updateMainCategory: async () => false,
  deleteMainCategory: async () => {},
  fetchCategories: async () => {},
  addCategory: async () => false,
  updateCategory: async () => false,
  deleteCategory: async () => {},
};

const CategoryContext = createContext(defaultCategoryContext);

export const CategoryProvider = ({ children }) => {
  const { showToast, logActivity } = useAdmin();
  const [mainCategories, setMainCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMain, setIsLoadingMain] = useState(true);

  // 1. Fetch Main Categories (Women, Kids, etc.)
  const fetchMainCategories = useCallback(async () => {
    setIsLoadingMain(true);
    try {
      const response = await api.get('/api/main-categories');
      setMainCategories(
        (response.data?.data || []).map((mCat) => ({
          ...mCat,
          id: mCat._id || mCat.id,
        }))
      );
    } catch (error) {
      console.error('Failed to fetch main categories:', error);
    } finally {
      setIsLoadingMain(false);
    }
  }, []);

  // 2. Fetch Subcategories
  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/categories');
      setCategories(
        (response.data?.data || []).map((cat) => ({
          ...cat,
          id: cat._id || cat.id,
        }))
      );
    } catch (error) {
      console.error('Failed to fetch subcategories:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch both on mount
  useEffect(() => {
    fetchMainCategories();
    fetchCategories();
  }, [fetchMainCategories, fetchCategories]);

  // Main Category CRUD
  const addMainCategory = async (formData) => {
    try {
      const isFormData = formData instanceof FormData;
      const res = await api.post('/api/main-categories', formData, {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
      });
      const newMCat = { ...res.data.data, id: res.data.data._id || res.data.data.id, subcategoryCount: 0 };
      setMainCategories((prev) => [...prev, newMCat]);
      showToast('success', 'Main Category Created', `"${newMCat.name}" added successfully.`);
      logActivity('Products', 'Created Main Category', newMCat.name, 'New department created.');
      return true;
    } catch (error) {
      showToast('danger', 'Error', error.response?.data?.message || 'Failed to create main category');
      return false;
    }
  };

  const updateMainCategory = async (id, formData) => {
    try {
      const isFormData = formData instanceof FormData;
      let payload = formData;
      if (!isFormData) {
        payload = new FormData();
        Object.keys(formData).forEach((key) => payload.append(key, formData[key]));
      }
      const res = await api.put(`/api/main-categories/${id}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const updatedMCat = { ...res.data.data, id: res.data.data._id || res.data.data.id };
      setMainCategories((prev) => prev.map((m) => (m.id === id ? { ...m, ...updatedMCat } : m)));
      showToast('success', 'Main Category Updated', `"${updatedMCat.name}" updated successfully.`);
      return true;
    } catch (error) {
      showToast('danger', 'Error', error.response?.data?.message || 'Failed to update main category');
      return false;
    }
  };

  const deleteMainCategory = async (id) => {
    try {
      await api.delete(`/api/main-categories/${id}`);
      setMainCategories((prev) => prev.filter((m) => m.id !== id));
      showToast('warning', 'Main Category Deleted', 'Main category removed.');
      return true;
    } catch (error) {
      showToast('danger', 'Error', error.response?.data?.message || 'Failed to delete main category');
      return false;
    }
  };

  // Subcategory CRUD
  const addCategory = async (formData) => {
    try {
      const isFormData = formData instanceof FormData;
      const res = await api.post('/api/categories', formData, {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
      });
      const newCat = { ...res.data.data, id: res.data.data._id || res.data.data.id, itemCount: 0 };
      setCategories((prev) => [...prev, newCat]);
      fetchMainCategories(); // Refresh subcategory count on main categories
      showToast('success', 'Subcategory Created', `"${newCat.name}" added successfully.`);
      logActivity('Products', 'Created Subcategory', newCat.name, 'New category created.');
      return true;
    } catch (error) {
      showToast('danger', 'Error', error.response?.data?.message || 'Failed to create subcategory');
      return false;
    }
  };

  const updateCategory = async (id, formData) => {
    try {
      const isFormData = formData instanceof FormData;
      let payload = formData;
      if (!isFormData) {
        payload = new FormData();
        Object.keys(formData).forEach((key) => payload.append(key, formData[key]));
      }
      const res = await api.put(`/api/categories/${id}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const updatedCat = { ...res.data.data, id: res.data.data._id || res.data.data.id };
      setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updatedCat } : c)));
      fetchMainCategories();
      showToast('success', 'Subcategory Updated', 'Details saved.');
      return true;
    } catch (error) {
      showToast('danger', 'Error', error.response?.data?.message || 'Failed to update subcategory');
      return false;
    }
  };

  const deleteCategory = async (id) => {
    try {
      await api.delete(`/api/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      fetchMainCategories();
      showToast('warning', 'Subcategory Deleted', 'Subcategory removed.');
      return true;
    } catch (error) {
      showToast('danger', 'Error', error.response?.data?.message || 'Failed to delete subcategory');
      return false;
    }
  };

  return (
    <CategoryContext.Provider
      value={{
        mainCategories,
        categories,
        isLoading,
        isLoadingMain,
        fetchMainCategories,
        addMainCategory,
        updateMainCategory,
        deleteMainCategory,
        fetchCategories,
        addCategory,
        updateCategory,
        deleteCategory,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategory = () => {
  const context = useContext(CategoryContext);
  return context || defaultCategoryContext;
};

export default CategoryContext;
