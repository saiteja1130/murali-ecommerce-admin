import React, { createContext, useContext, useState, useEffect } from 'react';
import api from './api';
import { useAdmin } from './AdminContext';

const defaultCategoryContext = {
    categories: [],
    isLoading: false,
    fetchCategories: async () => {},
    addCategory: async () => false,
    updateCategory: async () => false,
    deleteCategory: async () => {},
};

const CategoryContext = createContext(defaultCategoryContext);

export const CategoryProvider = ({ children }) => {
    const { showToast, logActivity } = useAdmin();
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/categories');
            setCategories(
                (response.data?.data || []).map((cat) => ({
                    ...cat,
                    id: cat._id,
                }))
            );
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch categories on mount
    useEffect(() => {
        fetchCategories();
    }, []);

    const addCategory = async (formData) => {
        try {
            const res = await api.post('/api/categories', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const newCat = { ...res.data.data, id: res.data.data._id, itemCount: 0 };
            setCategories((prev) => [...prev, newCat]);
            showToast('success', 'Category Created', `"${newCat.name}" added.`);
            logActivity('Products', 'Created Category', newCat.name, 'New category created.');
            return true;
        } catch (error) {
            showToast('danger', 'Error', error.response?.data?.message || 'Failed to create category');
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

            const updatedCat = { ...res.data.data, id: res.data.data._id };
            setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updatedCat } : c)));
            showToast('success', 'Category Updated', 'Order and details saved.');
            return true;
        } catch (error) {
            showToast('danger', 'Error', error.response?.data?.message || 'Failed to update category');
            return false;
        }
    };

    const deleteCategory = async (id) => {
        try {
            await api.delete(`/api/categories/${id}`);
            setCategories((prev) => prev.filter((c) => c.id !== id));
            showToast('warning', 'Category Deleted', 'Category removed.');
        } catch (error) {
            showToast('danger', 'Error', error.response?.data?.message || 'Failed to delete category');
        }
    };

    return (
        <CategoryContext.Provider
            value={{
                categories,
                isLoading,
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
