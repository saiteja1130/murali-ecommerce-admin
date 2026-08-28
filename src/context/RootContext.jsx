import React from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { AdminProvider, useAdmin } from './AdminContext';
import { CategoryProvider, useCategory } from './CategoryContext';
import { CustomerProvider, useCustomer } from './CustomerContext';
import { HeroProvider, useHero } from './HeroContext';
import { ProductProvider, useProduct } from './ProductContext';

export const RootProvider = ({ children }) => {
  return (
    <AuthProvider>
      <AdminProvider>
        <CategoryProvider>
          <CustomerProvider>
            <HeroProvider>
              <ProductProvider>
                {children}
              </ProductProvider>
            </HeroProvider>
          </CustomerProvider>
        </CategoryProvider>
      </AdminProvider>
    </AuthProvider>
  );
};

export { useAuth, useAdmin, useCategory, useCustomer, useHero, useProduct };
export default RootProvider;
