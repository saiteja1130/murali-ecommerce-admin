/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RootProvider } from './context/RootContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { AdminLayout } from './layouts/AdminLayout';

// Auth Page
import AdminLogin from './pages/AdminLogin';
import GlobalLoader from './components/GlobalLoader';

// Dashboard
import Dashboard from './pages/Dashboard';

// Products & Categories Module
import ProductList from './pages/products/ProductList';
import ProductForm from './pages/products/ProductForm';
import ProductVariants from './pages/products/ProductVariants';
import CategoryManager from './pages/products/CategoryManager';

// Orders & Payment Module
import OrderList from './pages/orders/OrderList';
import OrderDetail from './pages/orders/OrderDetail';
import PaymentHistories from './pages/orders/PaymentHistories';

// Users / Customers Module
import CustomerList from './pages/customers/CustomerList';
import CustomerProfile from './pages/customers/CustomerProfile';

// Hero Carousel Studio Module
import HeroCarouselEditor from './pages/content/HeroCarouselEditor';

export function App() {
  return (
    <RootProvider>
      <GlobalLoader />
      <BrowserRouter>
        <Routes>
          {/* Public Auth Route */}
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Root Redirect to Admin */}
          <Route path="/" element={<Navigate to="/admin" replace />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            {/* 1. Dashboard Index */}
            <Route index element={<Dashboard />} />

            {/* 2. Products & Categories Management */}
            <Route path="products" element={<ProductList />} />
            <Route path="products/new" element={<ProductForm mode="create" />} />
            <Route path="products/:id/edit" element={<ProductForm mode="edit" />} />
            <Route path="products/:id/variants" element={<ProductVariants />} />
            <Route path="categories" element={<CategoryManager />} />
            <Route path="products/categories" element={<CategoryManager />} />

            {/* 3. Orders & Payment Histories */}
            <Route path="orders" element={<OrderList />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="payments" element={<PaymentHistories />} />
            <Route path="orders/payments" element={<PaymentHistories />} />

            {/* 4. Users / Customers & Profile Details */}
            <Route path="customers" element={<CustomerList />} />
            <Route path="customers/:id" element={<CustomerProfile />} />
            <Route path="users" element={<CustomerList />} />
            <Route path="users/:id" element={<CustomerProfile />} />

            {/* 5. Hero Carousel Studio */}
            <Route path="hero-carousel" element={<HeroCarouselEditor />} />
            <Route path="content/hero" element={<HeroCarouselEditor />} />
          </Route>

          {/* Catch-all Wildcard Route */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </BrowserRouter>
    </RootProvider>
  );
}

export default App;
