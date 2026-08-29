import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_ADMIN_USERS, INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_RETURNS, INITIAL_INVENTORY_LOGS, INITIAL_PROMOTIONS, INITIAL_SHOP_THE_LOOK_SCENE, INITIAL_LOOKBOOK_ITEMS, INITIAL_REVIEWS, INITIAL_NOTIFICATIONS, INITIAL_ACTIVITY_LOGS } from '../data/mockData';
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
    lookbooks: [],
    reviews: [],
    activityLogs: [],
    notifications: [],
    toasts: [],
    isSidebarCollapsed: false,
    isCommandPaletteOpen: false,
    storeSettings: {},
    showToast: () => {},
    removeToast: () => {},
    toggleSidebar: () => {},
    setCommandPaletteOpen: () => {},
    updateStoreSettings: () => {},
    logActivity: () => {},
    addProduct: () => {},
    updateProduct: () => {},
    removeProduct: () => {},
    addOrder: () => {},
    updateOrderStatus: () => {},
    addReturn: () => {},
    updateReturnStatus: () => {},
    addPromotion: () => {},
    updatePromotion: () => {},
    removePromotion: () => {},
    updateShopTheLook: () => {},
    updateLookbook: () => {},
    addReview: () => {},
    updateReview: () => {},
    removeReview: () => {},
    fetchCustomers: async () => {},
};

const AdminContext = createContext(defaultAdminContext);
// Normalizers for mock data
const normalizedPromotions = INITIAL_PROMOTIONS.map((p) => ({
    ...p,
    discountType: p.type || 'percentage',
    discountValue: p.value || 15,
    isActive: p.status === 'active',
}));

const normalizedShopTheLook = {
    ...INITIAL_SHOP_THE_LOOK_SCENE,
    image: INITIAL_SHOP_THE_LOOK_SCENE.imageUrl || 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop',
    hotspots: (INITIAL_SHOP_THE_LOOK_SCENE.pins || []).map((p) => ({
        id: p.id,
        x: p.xPercent || 50,
        y: p.yPercent || 50,
        productId: p.productId,
        productName: p.productName,
        price: p.price,
        label: p.label,
    })),
};
const normalizedLookbooks = INITIAL_LOOKBOOK_ITEMS.map((lb) => ({
    ...lb,
    season: 'Autumn / Winter 2026',
    photographer: 'Hélène Desrosiers, Paris',
    image: lb.imageUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=800&auto=format&fit=crop',
    description: 'Photographed in historic Parisian salons exploring draped bias textures and shadow play.',
}));
const normalizedReviews = INITIAL_REVIEWS.map((r) => ({
    ...r,
    author: r.customerName || 'Victoria V.',
    createdAt: r.date || '2026-08-18',
    isVerifiedPurchase: r.isVerifiedBuyer !== false,
    officialReply: r.adminReply,
}));
const normalizedInventoryLogs = INITIAL_INVENTORY_LOGS.map((inv) => ({
    ...inv,
    createdAt: inv.timestamp || new Date().toISOString(),
    performedBy: inv.actor || 'Eleonora Vance',
}));
export const AdminProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(() => {
        const saved = localStorage.getItem('sumilux_admin_user');
        if (saved) {
            try {
                return JSON.parse(saved);
            }
            catch (e) {
                return INITIAL_ADMIN_USERS[0];
            }
        }
        return INITIAL_ADMIN_USERS[0];
    });
    const [users, setUsers] = useState(INITIAL_ADMIN_USERS);
    const [products, setProducts] = useState(() => {
        const saved = localStorage.getItem('sumilux_products');
        return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    });

    const [orders, setOrders] = useState(() => {
        const saved = localStorage.getItem('sumilux_orders');
        return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    });
    const [returns, setReturns] = useState(INITIAL_RETURNS);
    const [inventoryLogs, setInventoryLogs] = useState(normalizedInventoryLogs);
    const [promotions, setPromotions] = useState(normalizedPromotions);
    const [shopTheLookList, setShopTheLookList] = useState([
        normalizedShopTheLook,
        {
            id: 'scene-02',
            title: 'Place Vendôme Haute Evening',
            season: 'Winter 2026',
            image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1200&auto=format&fit=crop',
            active: true,
            hotspots: [
                {
                    id: 'hs-201',
                    x: 48,
                    y: 42,
                    productId: 'prd-004',
                    productName: 'Numbered Atelier Sculpted Bias-Cut Gown',
                    price: 4600,
                    label: 'Numbered Atelier Bias-Cut Gown ($4,600)',
                },
            ],
        },
    ]);
    const [shopTheLook, setShopTheLook] = useState(normalizedShopTheLook);
    const [lookbooks, setLookbooks] = useState(normalizedLookbooks);
    const [reviews, setReviews] = useState(normalizedReviews);
    const [activityLogs, setActivityLogs] = useState(INITIAL_ACTIVITY_LOGS);
    const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
    const [toasts, setToasts] = useState([]);
    // UI state
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
    // Settings
    const [storeSettings, setStoreSettings] = useState({
        storeName: "Murari's Glam & Glow Haute Couture",
        storeEmail: 'concierge@murarisglamandglow.com',
        currency: 'USD',
        currencySymbol: '$',
        freeShippingThreshold: 2000,
        standardVatPercent: 8.0,
        whiteGlovePackagingCost: 150,
        enableAtelierNumberedEditions: true,
        orderNumberPrefix: 'MGG-',
        lowStockThreshold: 4,
        supportPhone: '+1 (800) 786-4589 / VIP Concierge',
        conciergeHours: '24/7 VIP Client Service',
        returnWindowDays: 30,
        cookieConsentDefault: true,
        marketingCookiesDefault: true,
        analyticsCookiesDefault: true,
    });
    useEffect(() => {
        if (currentUser) {
            localStorage.setItem('sumilux_admin_user', JSON.stringify(currentUser));
        }
        else {
            localStorage.removeItem('sumilux_admin_user');
        }
    }, [currentUser]);
    useEffect(() => {
        localStorage.setItem('sumilux_products', JSON.stringify(products));
    }, [products]);
    useEffect(() => {
        localStorage.setItem('sumilux_orders', JSON.stringify(orders));
    }, [orders]);
    const showToast = (type, title, message) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        setToasts((prev) => [...prev, { id, type, title, message, duration: 4000 }]);
        setTimeout(() => {
            removeToast(id);
        }, 4500);
    };
    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };
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
    const updateOrderStatus = (id, status, note) => {
        const nowStr = new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
        setOrders((prev) => prev.map((o) => {
            if (o.id === id) {
                const newTimelineEvent = {
                    id: `tl-${Date.now()}`,
                    timestamp: nowStr,
                    title: `Status Changed to ${status.toUpperCase()}`,
                    description: note || `Order transitioned to ${status}.`,
                    actor: currentUser?.name || 'Staff Member',
                    type: status === 'shipped' ? 'shipped' : status === 'delivered' ? 'delivered' : 'processing',
                };
                const updatedNotes = note ? [...o.internalNotes, note] : o.internalNotes;
                return {
                    ...o,
                    status,
                    updatedAt: new Date().toISOString(),
                    timeline: [...o.timeline, newTimelineEvent],
                    internalNotes: updatedNotes,
                };
            }
            return o;
        }));
        showToast('success', 'Order Status Updated', `Order marked as ${status}`);
        logActivity('Orders', 'Updated Order Status', `Order ${id}`, `Status moved to ${status}`);
    };
    const addOrderNote = (id, note) => {
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, internalNotes: [...o.internalNotes, note] } : o)));
        showToast('info', 'Internal Note Added', 'Private client note attached to order.');
        logActivity('Orders', 'Added Note', `Order ${id}`, note);
    };
    const processRefund = (id, amount, reason) => {
        const nowStr = new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
        setOrders((prev) => prev.map((o) => {
            if (o.id === id) {
                const refundEvent = {
                    id: `tl-${Date.now()}`,
                    timestamp: nowStr,
                    title: `Refund Processed ($${amount.toFixed(2)})`,
                    description: `Reason: ${reason}`,
                    actor: currentUser?.name || 'Staff Member',
                    type: 'refund_issued',
                };
                return {
                    ...o,
                    status: amount >= o.total ? 'refunded' : o.status,
                    paymentStatus: 'refunded',
                    timeline: [...o.timeline, refundEvent],
                    internalNotes: [...o.internalNotes, `Refund of $${amount.toFixed(2)} issued: ${reason}`],
                };
            }
            return o;
        }));
        showToast('warning', 'Refund Completed', `$${amount.toFixed(2)} refunded successfully.`);
        logActivity('Orders', 'Processed Refund', `Order ${id}`, `Amount: $${amount}, Reason: ${reason}`);
    };
    const updateOrderTracking = (id, trackingNumber, carrier) => {
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, trackingNumber, carrier, status: 'shipped' } : o)));
        showToast('success', 'Tracking Added', `Dispatched via ${carrier} (${trackingNumber})`);
        logActivity('Orders', 'Dispatched Order', `Order ${id}`, `Carrier: ${carrier}, Tracking: ${trackingNumber}`);
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
    const addPromotion = (promoData) => {
        const newPromo = {
            ...promoData,
            id: `prm-${Date.now().toString().slice(-4)}`,
            usageCount: 0,
            discountType: promoData.discountType || promoData.type || 'percentage',
            discountValue: promoData.discountValue || promoData.value || 15,
            isActive: promoData.isActive !== false,
            startDate: promoData.startDate || new Date().toISOString().split('T')[0],
            endDate: promoData.endDate || '2026-12-31',
            applicableCategories: promoData.applicableCategories || [],
        };
        setPromotions((prev) => [newPromo, ...prev]);
        showToast('success', 'Promotion Created', `Promo code "${newPromo.code}" is active.`);
        logActivity('Promotions', 'Created Promo', newPromo.code, `Type: ${newPromo.discountType}, Value: ${newPromo.discountValue}`);
    };
    const updatePromotion = (id, updates) => {
        setPromotions((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
        showToast('success', 'Promotion Saved', 'Code parameters updated.');
    };
    const deletePromotion = (id) => {
        const promo = promotions.find((p) => p.id === id);
        setPromotions((prev) => prev.filter((p) => p.id !== id));
        showToast('warning', 'Promotion Deleted', `Code ${promo?.code || id} deleted.`);
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
    const addLookbook = (entry) => {
        const newItem = {
            ...entry,
            id: `lb-${Date.now().toString().slice(-4)}`,
            likes: entry.likes || 0,
            imageUrl: entry.image || entry.imageUrl,
        };
        setLookbooks((prev) => [...prev, newItem]);
        showToast('success', 'Lookbook Tile Added', 'Editorial look added to gallery.');
    };
    const addLookbookItem = (itemData) => {
        addLookbook(itemData);
    };
    const updateLookbook = (id, updates) => {
        setLookbooks((prev) => prev.map((lb) => (lb.id === id ? { ...lb, ...updates } : lb)));
        showToast('success', 'Lookbook Story Updated', 'Story saved.');
    };
    const deleteLookbook = (id) => {
        setLookbooks((prev) => prev.filter((lb) => lb.id !== id));
        showToast('warning', 'Lookbook Item Removed', 'Image removed from feed.');
    };
    const deleteLookbookItem = (id) => {
        deleteLookbook(id);
    };
    const approveReview = (id) => {
        setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'approved' } : r)));
        showToast('success', 'Review Approved', 'Published to customer-facing product page.');
        logActivity('Reviews', 'Approved Review', `Review ${id}`, 'Published to storefront');
    };
    const rejectReview = (id) => {
        setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r)));
        showToast('warning', 'Review Moderated', 'Review marked as rejected.');
    };
    const featureReview = (id) => {
        setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, isFeatured: !r.isFeatured } : r)));
        showToast('info', 'Featured Status Toggled', 'Review homepage visibility changed.');
    };
    const toggleFeaturedReview = (id) => {
        featureReview(id);
    };
    const replyToReview = (id, reply) => {
        setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, officialReply: reply, adminReply: reply, status: 'approved' } : r)));
        showToast('success', 'Reply Published', 'Official brand response posted.');
        logActivity('Reviews', 'Replied to Review', `Review ${id}`, reply);
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
        updateOrderStatus,
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
        lookbooks,
        lookbook: lookbooks,
        addLookbook,
        addLookbookItem,
        updateLookbook,
        deleteLookbook,
        deleteLookbookItem,
        reviews,
        approveReview,
        rejectReview,
        featureReview,
        toggleFeaturedReview,
        replyToReview,
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
