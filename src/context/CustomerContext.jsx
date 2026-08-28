import React, { createContext, useContext, useState, useEffect } from 'react';
import api from './api';

const defaultCustomerContext = {
    customers: [],
    isLoading: false,
    pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
    fetchCustomers: async () => {},
    fetchCustomerById: async () => null,
    updateCustomerTier: () => {},
    updateCustomer: () => {},
    toggleCustomerStatus: () => {},
    addCustomerNote: () => {},
};

const CustomerContext = createContext(defaultCustomerContext);

export const CustomerProvider = ({ children }) => {
    const [customers, setCustomers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

    const fetchCustomers = async (page = 1, limit = 10, search = '', sort = '') => {
        setIsLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            });
            if (search) queryParams.append('search', search);
            if (sort) queryParams.append('sort', sort);

            const response = await api.get(`/api/users?${queryParams.toString()}`);
            const data = response.data;

            const mappedCustomers = data.data.map(user => ({
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone || '',
                role: user.role,
                createdAt: user.createdAt,
                status: user.isEmailVerified ? 'active' : 'pending',
            }));

            setCustomers(mappedCustomers);
            setPagination({
                page: data.page,
                limit,
                total: data.total,
                totalPages: data.totalPages
            });
        } catch (error) {
            console.error("Failed to fetch customers:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCustomerById = async (id) => {
        try {
            const response = await api.get(`/api/users/${id}`);
            const user = response.data.data;
            return {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone || '',
                role: user.role,
                createdAt: user.createdAt,
                status: user.isEmailVerified ? 'active' : 'pending',
            };
        } catch (error) {
            console.error("Failed to fetch customer by ID:", error);
            throw error;
        }
    };

    // Placeholder functions to keep UI from crashing if they are called
    const updateCustomerTier = (id, tier) => {
        setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, vipTier: tier } : c)));
    };

    const updateCustomer = (id, updates) => {
        setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    };

    const toggleCustomerStatus = (id) => {
        setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, status: c.status === 'active' ? 'blocked' : 'active' } : c)));
    };

    const addCustomerNote = (id, note) => {
        setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, notes: `${c.notes ? c.notes + ' | ' : ''}${note}` } : c)));
    };

    return (
        <CustomerContext.Provider value={{
            customers,
            isLoading,
            pagination,
            fetchCustomers,
            fetchCustomerById,
            updateCustomerTier,
            updateCustomer,
            toggleCustomerStatus,
            addCustomerNote
        }}>
            {children}
        </CustomerContext.Provider>
    );
};

export const useCustomer = () => {
    const context = useContext(CustomerContext);
    return context || defaultCustomerContext;
};

export default CustomerContext;
