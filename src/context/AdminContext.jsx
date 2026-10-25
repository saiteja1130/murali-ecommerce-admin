import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from './api';

const defaultAdminContext = {
    currentUser: null,
    users: [],
    products: [],
    orders: [],
    customers: [],
    returns: [],
    inventoryLogs: [],
    promotions: [],
    shopTheLookList: [],
    shopTheLook: null,
    activityLogs: [],
    notifications: [],
    toasts: [],
    isSidebarCollapsed: false,
    isCommandPaletteOpen: false,
    storeSettings: {},
    showToast: () => { },
    removeToast: () => { },
    toggleSidebar: () => { },
    setCommandPaletteOpen: () => { },
    updateStoreSettings: () => { },
    logActivity: () => { },
    addProduct: () => { },
    updateProduct: () => { },
    removeProduct: () => { },
    addOrder: () => { },
    updateOrderStatus: () => { },
    addReturn: () => { },
    updateReturnStatus: () => { },
    addPromotion: () => { },
    updatePromotion: () => { },
    removePromotion: () => { },
    updateShopTheLook: () => { },
    fetchCustomers: async () => { },
};

const AdminContext = createContext(defaultAdminContext);

export const AdminProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(() => {
        const saved = localStorage.getItem('sumilux_admin_user');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return null;
            }
        }
        return null;
    });
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [payments, setPayments] = useState([]);
    const [paymentMetrics, setPaymentMetrics] = useState({
        totalSettled: 0,
        totalPendingCod: 0,
        totalRefunded: 0,
        totalFailed: 0,
    });
    const [returns, setReturns] = useState([]);
    const [inventoryLogs, setInventoryLogs] = useState([]);
    const [promotions, setPromotions] = useState([]);
    const [shopTheLookList, setShopTheLookList] = useState([]);
    const [shopTheLook, setShopTheLook] = useState(null);
    const [activityLogs, setActivityLogs] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [toasts, setToasts] = useState([]);
    // UI state
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
    // Settings
    const [storeSettings, setStoreSettings] = useState({
        storeName: "Murari's Glam & Glow Haute Couture",
        storeEmail: 'concierge@murarisglamandglow.com',
        currency: 'INR',
        currencySymbol: '₹',
        freeShippingThreshold: 5000,
        standardVatPercent: 0,
        whiteGlovePackagingCost: 0,
        enableAtelierNumberedEditions: true,
        orderNumberPrefix: 'SMLX-',
        lowStockThreshold: 4,
        supportPhone: '+91 98765 43210 / VIP Concierge',
        conciergeHours: '24/7 VIP Client Service',
        returnWindowDays: 14,
        cookieConsentDefault: true,
        marketingCookiesDefault: true,
        analyticsCookiesDefault: true,
    });

    const fetchOrders = async () => {
        try {
            const res = await api.get('/api/orders');
            if (res.data?.status && Array.isArray(res.data.data)) {
                const liveOrders = res.data.data.map((o) => ({
                    ...o,
                    id: o._id || o.id,
                    orderNumber: o.orderNumber,
                    status: o.orderStatus || o.status || 'confirmed',
                    paymentStatus: o.paymentStatus || 'paid',
                    paymentMethod: o.paymentMethod || 'upi',
                    total: Number(o.total || 0),
                    subtotal: Number(o.subtotal !== undefined ? o.subtotal : (o.total || 0)),
                    discount: Number(o.discount || 0),
                    promoCode: o.promoCode || '',
                    shippingCost: Number(o.shippingCost || 0),
                    createdAt: o.createdAt || new Date().toISOString(),
                    customer: o.user ? {
                        id: o.user._id,
                        name: o.shippingAddress?.fullName || o.user.name,
                        email: o.user.email,
                        phone: o.shippingAddress?.phone || o.user.phone,
                        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300',
                        vipTier: 'Gold Patron'
                    } : {
                        name: o.shippingAddress?.fullName || 'Customer',
                        email: '',
                        phone: o.shippingAddress?.phone || '',
                        vipTier: 'Client'
                    },
                    customerName: o.shippingAddress?.fullName || o.user?.name || 'Customer',
                    customerEmail: o.user?.email || '',
                    shippingAddress: o.shippingAddress,
                    items: (o.items || []).map((i, idx) => {
                        const rawProd = i.product || {};
                        const selectedColor = i.selectedColor || { name: i.color || 'Standard', hex: '#1D241C' };
                        const colorName = (selectedColor.name || (typeof selectedColor === 'string' ? selectedColor : '')).trim().toLowerCase();
                        
                        // Check for color-specific image match in product.colorImages
                        let matchedColorImage = '';
                        if (colorName && Array.isArray(rawProd.colorImages) && rawProd.colorImages.length > 0) {
                            const match = rawProd.colorImages.find(
                                (ci) => ci.color && ci.color.trim().toLowerCase() === colorName
                            );
                            if (match && Array.isArray(match.images) && match.images.length > 0) {
                                matchedColorImage = match.images[0];
                            }
                        }
                        const itemImg = matchedColorImage || i.image || rawProd.image || (Array.isArray(rawProd.images) && rawProd.images[0]) || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=900';

                        return {
                            ...i,
                            id: i._id || `${o._id || o.id}-${i.variantId || i.sku || idx}`,
                            _id: i._id,
                            variantId: i.variantId || '',
                            sku: i.sku || rawProd.sku || '',
                            name: i.name || rawProd.name || 'Garment Piece',
                            image: itemImg,
                            product: rawProd,
                            category: rawProd.category?.name || rawProd.category || 'Luxury Haute',
                            price: Number(i.price !== undefined ? i.price : (rawProd.price || 0)),
                            quantity: Number(i.quantity || 1),
                            size: i.selectedSize || i.size || 'Standard',
                            selectedSize: i.selectedSize || i.size || 'Standard',
                            color: selectedColor.name || selectedColor || 'Standard',
                            selectedColor: typeof selectedColor === 'object' ? selectedColor : { name: selectedColor, hex: '#1D241C' }
                        };
                    }),
                    timeline: [
                        {
                            id: `tl-1`,
                            timestamp: o.createdAt ? new Date(o.createdAt).toLocaleString('en-IN') : 'Just now',
                            title: `Order Created via ${o.paymentMethod === 'upi' ? 'UPI Instant Payment' : 'Cash on Delivery'}`,
                            description: `Payment status: ${o.paymentStatus}. Order record active in MongoDB.`,
                            actor: 'System',
                            type: 'placed'
                        }
                    ],
                    internalNotes: o.notes ? [o.notes] : []
                }));
                setOrders(liveOrders);
                return liveOrders;
            }
            return [];
        } catch (err) {
            console.warn('Could not fetch live admin orders:', err.message);
            return [];
        }
    };

    const fetchPayments = async () => {
        try {
            const res = await api.get('/api/payments');
            if (res.data?.status && Array.isArray(res.data.data)) {
                setPayments(res.data.data || []);
                if (res.data.metrics) setPaymentMetrics(res.data.metrics);
                return res.data.data;
            }
            return [];
        } catch (err) {
            console.warn('Could not fetch live admin payments:', err.message);
            return [];
        }
    };

    const fetchPromotions = async () => {
        try {
            const res = await api.get('/api/coupons');
            if (res.data?.status && Array.isArray(res.data.data)) {
                const formatted = res.data.data.map((p) => ({
                    ...p,
                    id: p._id || p.id,
                    code: p.code,
                    discountType: p.discountType,
                    discountValue: p.discountValue,
                    minSpend: p.minSpend,
                    usageLimit: p.usageLimit,
                    usageCount: p.usageCount || 0,
                    startDate: p.startDate ? new Date(p.startDate).toISOString().split('T')[0] : '',
                    endDate: p.endDate ? new Date(p.endDate).toISOString().split('T')[0] : '',
                    isActive: p.isActive,
                    isAllCategories: p.isAllCategories,
                    applicableCategories: p.isAllCategories
                        ? ['All Categories']
                        : (p.applicableCategories?.map((c) => (typeof c === 'object' ? c.name : c)) || ['All Categories']),
                    rawCategories: p.applicableCategories || [],
                }));
                setPromotions(formatted);
                return formatted;
            }
        } catch (err) {
            console.warn('Could not fetch live coupons:', err.message);
        }
    };

    useEffect(() => {
        localStorage.removeItem('sumilux_products');
        localStorage.removeItem('sumilux_orders');
        fetchOrders();
        fetchPayments();
        fetchPromotions();
    }, []);

    useEffect(() => {
        if (currentUser) {
            localStorage.setItem('sumilux_admin_user', JSON.stringify(currentUser));
        }
        else {
            localStorage.removeItem('sumilux_admin_user');
        }
    }, [currentUser]);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);
    const showToast = useCallback((type, title, message) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        setToasts((prev) => [...prev, { id, type, title, message, duration: 4000 }]);
        setTimeout(() => {
            removeToast(id);
        }, 4500);
    }, [removeToast]);
    const logActivity = (module, action, target, details) => {
        const newLog = {
            id: `act-${Date.now()}`,
            timestamp: 'Just now',
            actor: currentUser
                ? { name: currentUser.name, role: currentUser.role, avatar: currentUser.avatar }
                : { name: 'System', role: 'Super Admin', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300' },
            module,
            action,
            target,
            details,
        };
        setActivityLogs((prev) => [newLog, ...prev]);
    };
    const login = async (email, password) => {
        try {
            const res = await api.post('/api/auth/admin-login', { email, password });
            const token = res.data.token;
            const user = res.data.user;

            localStorage.setItem('sumilux_admin_token', token);
            setCurrentUser(user);
            showToast('success', `Welcome back, ${user.name}`, `Signed in as ${user.role}`);
            logActivity('Auth', 'Admin Login', user.name, `Successful login from secure workstation.`);
            // Immediately sync live database orders and payments
            fetchOrders();
            fetchPayments();
            return true;
        } catch (error) {
            console.error('Login error:', error);
            showToast('danger', 'Login Failed', error.response?.data?.message || 'Invalid credentials');
            throw error; // Rethrow to let the UI catch it
        }
    };
    const logout = () => {
        if (currentUser) {
            logActivity('Auth', 'Admin Logout', currentUser.name, 'Session closed safely.');
        }
        localStorage.removeItem('sumilux_admin_token');
        localStorage.removeItem('sumilux_admin_user');
        setCurrentUser(null);
        showToast('info', 'Logged out', 'You have been safely disconnected.');
    };
    const switchRole = (role) => {
        const matchedUser = users.find((u) => u.role === role);
        if (matchedUser) {
            setCurrentUser(matchedUser);
            showToast('info', 'Role Switched', `Now acting as ${matchedUser.name} (${role})`);
        }
        else if (currentUser) {
            const updated = { ...currentUser, role };
            setCurrentUser(updated);
            showToast('info', 'Role Switched', `Role updated to ${role}`);
        }
    };
    const addUser = (userData) => {
        const newUser = {
            ...userData,
            id: `usr-${Date.now()}`,
            lastLogin: 'Never',
        };
        setUsers((prev) => [...prev, newUser]);
        showToast('success', 'Team Member Added', `${newUser.name} has been invited as ${newUser.role}`);
        logActivity('Settings', 'Invited Admin', newUser.name, `Assigned role: ${newUser.role}`);
    };
    const updateUserRole = (id, role, status = 'active') => {
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role, status } : u)));
        if (currentUser && currentUser.id === id) {
            setCurrentUser((prev) => (prev ? { ...prev, role, status } : null));
        }
        showToast('success', 'Permissions Updated', 'User access tier has been modified.');
        logActivity('Settings', 'Updated Permissions', `User ${id}`, `Role set to ${role}`);
    };
    const addProduct = (productData) => {
        const now = new Date().toISOString().split('T')[0];
        const totalStock = productData.variants.reduce((acc, v) => acc + (v.stock || 0), 0);
        const newProduct = {
            ...productData,
            id: `prd-${Date.now().toString().slice(-4)}`,
            totalStock,
            salesCount: 0,
            rating: 5.0,
            reviewCount: 0,
            createdAt: now,
            updatedAt: now,
        };
        setProducts((prev) => [newProduct, ...prev]);
        showToast('success', 'Product Created', `"${newProduct.name}" added to catalog.`);
        logActivity('Products', 'Created Product', newProduct.name, `SKU: ${newProduct.sku}, Price: ₹${newProduct.price}`);
        return newProduct;
    };
    const updateProduct = (id, updates) => {
        setProducts((prev) => prev.map((p) => {
            if (p.id === id) {
                const updated = {
                    ...p,
                    ...updates,
                    updatedAt: new Date().toISOString().split('T')[0],
                };
                if (updates.variants) {
                    updated.totalStock = updates.variants.reduce((acc, v) => acc + (v.stock || 0), 0);
                }
                return updated;
            }
            return p;
        }));
        showToast('success', 'Product Updated', 'Changes saved successfully.');
        logActivity('Products', 'Updated Product', `Product ${id}`, 'Modified product attributes and inventory.');
    };
    const deleteProduct = (id) => {
        const prod = products.find((p) => p.id === id);
        setProducts((prev) => prev.filter((p) => p.id !== id));
        showToast('warning', 'Product Archived/Deleted', `"${prod?.name || id}" removed from active catalog.`);
        logActivity('Products', 'Deleted Product', prod?.name || id, 'Product record removed from live store.');
    };
    const bulkUpdateStatus = (ids, status) => {
        setProducts((prev) => prev.map((p) => (ids.includes(p.id) ? { ...p, status, updatedAt: new Date().toISOString().split('T')[0] } : p)));
        showToast('success', 'Bulk Action Applied', `${ids.length} products updated to status "${status}".`);
        logActivity('Products', 'Bulk Status Update', `${ids.length} products`, `Set status to ${status}`);
    };
    const updateOrderStatus = async (id, status, note) => {
        try {
            await api.patch(`/api/orders/${id}/status`, { orderStatus: status });
            await fetchOrders();
            await fetchPayments();
            showToast('success', 'Order Status Updated', `Order marked as ${status}`);
            logActivity('Orders', 'Updated Order Status', `Order ${id}`, `Status moved to ${status}`);
        } catch (err) {
            console.error('Failed to update status on server:', err);
            // Local fallback
            setOrders((prev) => prev.map((o) => (o.id === id || o._id === id ? { ...o, status } : o)));
            showToast('success', 'Order Status Updated', `Order marked as ${status}`);
        }
    };
    const updatePaymentStatus = async (id, paymentStatus) => {
        try {
            await api.patch(`/api/orders/${id}/status`, { paymentStatus });
            await fetchOrders();
            await fetchPayments();
            showToast('success', 'Payment Status Updated', `Payment marked as ${paymentStatus.toUpperCase()}`);
            logActivity('Orders', 'Updated Payment Status', `Order ${id}`, `Payment status moved to ${paymentStatus}`);
        } catch (err) {
            console.error('Failed to update payment status on server:', err);
            setOrders((prev) => prev.map((o) => (o.id === id || o._id === id ? { ...o, paymentStatus } : o)));
            showToast('success', 'Payment Status Updated', `Payment marked as ${paymentStatus.toUpperCase()}`);
        }
    };
    const addOrderNote = (id, note) => {
        setOrders((prev) => prev.map((o) => (o.id === id || o._id === id ? { ...o, internalNotes: [...(o.internalNotes || []), note] } : o)));
        showToast('info', 'Internal Note Added', 'Private client note attached to order.');
        logActivity('Orders', 'Added Note', `Order ${id}`, note);
    };
    const processRefund = async (id, amount, reason) => {
        try {
            await api.patch(`/api/orders/${id}/status`, { orderStatus: 'cancelled', paymentStatus: 'refunded' });
            await fetchOrders();
            await fetchPayments();
            showToast('warning', 'Refund Completed', `₹${amount.toFixed(2)} refunded successfully.`);
            logActivity('Orders', 'Processed Refund', `Order ${id}`, `Amount: ₹${amount}, Reason: ${reason}`);
        } catch (err) {
            console.error('Failed to process refund:', err);
            setOrders((prev) => prev.map((o) => (o.id === id || o._id === id ? { ...o, status: 'cancelled', paymentStatus: 'refunded' } : o)));
            showToast('warning', 'Refund Completed', `₹${amount.toFixed(2)} marked as refunded.`);
        }
    };
    const updateOrderTracking = async (id, trackingNumber, carrier) => {
        try {
            await api.patch(`/api/orders/${id}/tracking`, { trackingNumber, shippingMethod: carrier });
            await api.patch(`/api/orders/${id}/status`, { orderStatus: 'shipped' });
            await fetchOrders();
            showToast('success', 'Tracking Added', `Dispatched via ${carrier} (${trackingNumber})`);
            logActivity('Orders', 'Dispatched Order', `Order ${id}`, `Carrier: ${carrier}, Tracking: ${trackingNumber}`);
        } catch (err) {
            console.error('Failed to update tracking on server:', err);
            setOrders((prev) => prev.map((o) => (o.id === id || o._id === id ? { ...o, trackingNumber, carrier, status: 'shipped' } : o)));
            showToast('success', 'Tracking Added', `Dispatched via ${carrier} (${trackingNumber})`);
        }
    };
    const updateReturnStatus = (id, status, inspectionNotes) => {
        setReturns((prev) => prev.map((r) => (r.id === id ? { ...r, status, inspectionNotes: inspectionNotes || r.inspectionNotes } : r)));
        showToast('info', 'Return Status Updated', `Return request marked as ${status}.`);
        logActivity('Orders', 'Return Workflow', `Return ${id}`, `Status: ${status}`);
    };
    const adjustStock = (identifierOrSku, changeOrDelta, variantOrReason, changeParam, reasonParam) => {
        let sku = identifierOrSku;
        let productName = 'Garment Piece';
        let delta = typeof changeOrDelta === 'number' ? changeOrDelta : Number(changeOrDelta);
        let reason = (typeof variantOrReason === 'string' ? variantOrReason : reasonParam) || 'Atelier Inventory Correction';
        // If identifier is product ID (e.g. prd-001)
        const targetProd = products.find((p) => p.id === identifierOrSku || p.sku === identifierOrSku);
        if (targetProd) {
            sku = targetProd.sku;
            productName = targetProd.name;
            setProducts((prev) => prev.map((p) => {
                if (p.id === targetProd.id) {
                    const newStock = Math.max(0, p.totalStock + delta);
                    const newVariants = p.variants.map((v, i) => i === 0 ? { ...v, stock: Math.max(0, v.stock + delta) } : v);
                    return {
                        ...p,
                        totalStock: newStock,
                        variants: newVariants,
                    };
                }
                return p;
            }));
        }
        const newLog = {
            id: `inv-${Date.now()}`,
            timestamp: 'Just now',
            createdAt: new Date().toISOString(),
            sku,
            productName,
            change: delta,
            reason,
            actor: currentUser?.name || 'Staff Member',
            performedBy: currentUser?.name || 'Staff Member',
        };
        setInventoryLogs((prev) => [newLog, ...prev]);
        showToast('success', 'Stock Adjusted', `${sku} balance updated by ${delta > 0 ? '+' : ''}${delta}`);
        logActivity('Inventory', 'Stock Adjustment', sku, `${delta > 0 ? '+' : ''}${delta} units (${reason})`);
    };
    const addPromotion = async (promoData) => {
        try {
            const res = await api.post('/api/coupons', promoData);
            if (res.data?.status && res.data.data) {
                const created = res.data.data;
                const newPromo = {
                    ...created,
                    id: created._id || created.id,
                    applicableCategories: created.isAllCategories
                        ? ['All Categories']
                        : (created.applicableCategories?.map((c) => (typeof c === 'object' ? c.name : c)) || []),
                    rawCategories: created.applicableCategories || [],
                };
                setPromotions((prev) => [newPromo, ...prev]);
                showToast('success', 'Promotion Created', `Promo code "${newPromo.code}" is active.`);
                logActivity('Promotions', 'Created Promo', newPromo.code, `Type: ${newPromo.discountType}, Value: ${newPromo.discountValue}`);
                return newPromo;
            }
        } catch (err) {
            console.error('Failed to create promotion:', err);
            showToast('danger', 'Error', err.response?.data?.message || 'Failed to create coupon.');
            throw err;
        }
    };

    const updatePromotion = async (id, updates) => {
        try {
            const res = await api.put(`/api/coupons/${id}`, updates);
            if (res.data?.status && res.data.data) {
                const updated = res.data.data;
                const formatted = {
                    ...updated,
                    id: updated._id || updated.id,
                    applicableCategories: updated.isAllCategories
                        ? ['All Categories']
                        : (updated.applicableCategories?.map((c) => (typeof c === 'object' ? c.name : c)) || []),
                    rawCategories: updated.applicableCategories || [],
                };
                setPromotions((prev) => prev.map((p) => (p.id === id || p._id === id ? formatted : p)));
                showToast('success', 'Promotion Saved', 'Code parameters updated.');
                return formatted;
            }
        } catch (err) {
            console.error('Failed to update promotion:', err);
            showToast('danger', 'Error', err.response?.data?.message || 'Failed to update coupon.');
            throw err;
        }
    };

    const deletePromotion = async (id) => {
        try {
            await api.delete(`/api/coupons/${id}`);
            const promo = promotions.find((p) => p.id === id || p._id === id);
            setPromotions((prev) => prev.filter((p) => p.id !== id && p._id !== id));
            showToast('warning', 'Promotion Deleted', `Code ${promo?.code || id} deleted.`);
        } catch (err) {
            console.error('Failed to delete promotion:', err);
            showToast('danger', 'Error', err.response?.data?.message || 'Failed to delete coupon.');
            throw err;
        }
    };

    const updateLook = (id, updates) => {
        setShopTheLookList((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
        setShopTheLook((prev) => ({ ...prev, ...updates }));
        showToast('success', 'Shop The Look Saved', 'Hotspot pins saved to scene.');
    };
    const updateShopTheLook = (sceneUpdates) => {
        setShopTheLook((prev) => ({ ...prev, ...sceneUpdates }));
        showToast('success', 'Hotspot Scene Saved', 'Interactive pins updated on editorial photograph.');
    };
    const markNotificationAsRead = (id) => {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    };
    const markAllNotificationsAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        showToast('info', 'Notifications Cleared', 'All alerts marked as read.');
    };
    const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;
    const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);
    const updateStoreSettings = (updates) => {
        setStoreSettings((prev) => ({ ...prev, ...updates }));
        showToast('success', 'Settings Saved', 'Global store preferences updated.');
        logActivity('Settings', 'Updated Store Config', 'Global Config', 'Modified parameters');
    };
    return (<AdminContext.Provider value={{
        currentUser,
        users,
        login,
        logout,
        switchRole,
        addUser,
        updateUserRole,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        bulkUpdateStatus,
        orders,
        fetchOrders,
        payments,
        fetchPayments,
        paymentMetrics,
        updateOrderStatus,
        updatePaymentStatus,
        addOrderNote,
        processRefund,
        updateOrderTracking,
        returns,
        updateReturnStatus,
        inventoryLogs,
        adjustStock,
        promotions,
        addPromotion,
        updatePromotion,
        deletePromotion,
        looks: shopTheLookList,
        shopTheLook,
        updateLook,
        updateShopTheLook,
        activityLogs,
        logActivity,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        unreadNotificationsCount,
        toasts,
        showToast,
        removeToast,
        isSidebarCollapsed,
        toggleSidebar,
        isCommandPaletteOpen,
        setCommandPaletteOpen,
        storeSettings,
        updateStoreSettings,
    }}>
        {children}
    </AdminContext.Provider>);
};
export const useAdmin = () => {
    const context = useContext(AdminContext);
    return context || defaultAdminContext;
};
