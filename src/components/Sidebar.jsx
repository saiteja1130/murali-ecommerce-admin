import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { 
  LayoutDashboard, 
  Package, 
  PlusCircle, 
  Grid, 
  ShoppingBag, 
  Users, 
  Sparkles, 
  CreditCard, 
  ChevronLeft, 
  ChevronRight, 
  Crown,
  Settings
} from 'lucide-react';

export const Sidebar = () => {
  const { currentUser, isSidebarCollapsed, toggleSidebar, orders, products } = useAdmin();
  const userRole = currentUser?.role || 'Super Admin';
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending' || o.status === 'processing').length;

  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard }
      ]
    },
    {
      title: 'PRODUCTS & INVENTORY',
      items: [
        {
          name: 'All Products',
          path: '/admin/products',
          icon: Package
        },
        {
          name: 'Add New Product',
          path: '/admin/products/new',
          icon: PlusCircle
        },
        {
          name: 'Categories',
          path: '/admin/categories',
          icon: Grid
        }
      ]
    },
    {
      title: 'ORDERS & USERS',
      items: [
        {
          name: 'Orders',
          path: '/admin/orders',
          icon: ShoppingBag,
          badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined
        },
        {
          name: 'Payment History',
          path: '/admin/payments',
          icon: CreditCard
        },
        {
          name: 'Customers',
          path: '/admin/customers',
          icon: Users
        }
      ]
    },
    {
      title: 'WEBSITE BANNERS',
      items: [
        {
          name: 'Hero Carousel',
          path: '/admin/hero-carousel',
          icon: Sparkles
        }
      ]
    },
    {
      title: 'STORE CONFIGURATION',
      items: [
        {
          name: 'Store Settings',
          path: '/admin/settings',
          icon: Settings
        }
      ]
    }
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 bg-[#FFFFFF] border-r border-[#E8E4DC] flex flex-col transition-all duration-300 ease-in-out ${
        isSidebarCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Brand Header */}
      <div className="h-20 px-4 border-b border-[#E8E4DC] flex items-center justify-between shrink-0">
        {!isSidebarCollapsed ? (
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src="/assets/images/Logo.png"
              alt="Murari's Glam & Glow"
              className="h-11 w-auto object-contain shrink-0"
            />
            <div className="min-w-0">
              <div className="font-serif text-lg tracking-[0.12em] font-bold text-[#1D241C] leading-tight truncate">
                MURARI'S
              </div>
              <div className="text-[8.5px] uppercase tracking-[0.2em] text-[#C69E58] font-semibold truncate">
                GLAM & GLOW • ADMIN
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto flex items-center justify-center">
            <img
              src="/assets/images/Logo.png"
              alt="Murari's Glam & Glow"
              className="h-9 w-auto object-contain"
              title="Murari's Glam & Glow"
            />
          </div>
        )}

        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-[#687163] hover:text-[#1D241C] hover:bg-[#F3F0E9] transition-colors cursor-pointer shrink-0"
          title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label="Toggle sidebar width"
        >
          {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((section, idx) => {
          return (
            <div key={idx} className="space-y-1">
              {!isSidebarCollapsed && (
                <div className="px-3 text-[10px] font-semibold tracking-[0.18em] text-[#506040] uppercase mb-1.5 font-sans">
                  {section.title}
                </div>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/admin'}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-[#1D241C] text-[#FAF8F5] shadow-sm'
                          : 'text-[#687163] hover:text-[#1D241C] hover:bg-[#F3F0E9]'
                      } ${isSidebarCollapsed ? 'justify-center px-2' : ''}`
                    }
                    title={isSidebarCollapsed ? item.name : undefined}
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${
                            isActive ? 'text-[#C69E58]' : 'text-[#687163] group-hover:text-[#1D241C]'
                          }`}
                        />
                        {!isSidebarCollapsed && <span className="truncate flex-1 tracking-wide">{item.name}</span>}
                        {!isSidebarCollapsed && item.badge && (
                          <span
                            className={`px-1.5 py-0.5 text-[10px] font-mono rounded-md font-semibold tracking-tight ${
                              isActive ? 'bg-[#C69E58] text-[#1D241C]' : 'bg-[#C69E58]/20 text-[#A87C38]'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        {isSidebarCollapsed && item.badge && (
                          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C69E58]" />
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* User Tier */}
      <div className="p-3 border-t border-[#E8E4DC] bg-[#FAF8F5]">
        {!isSidebarCollapsed ? (
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white border border-[#E8E4DC] shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={currentUser?.avatar}
                alt={currentUser?.name}
                className="w-8 h-8 rounded-lg object-cover border border-[#C8A87C]/30 shrink-0"
              />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-[#1A1A1A] truncate">{currentUser?.name}</div>
                <div className="flex items-center gap-1 text-[10px] text-[#A68758] font-medium">
                  <Crown className="w-3 h-3 text-[#C8A87C]" />
                  <span className="truncate">Administrator</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <img
              src={currentUser?.avatar}
              alt={currentUser?.name}
              className="w-8 h-8 rounded-lg object-cover border border-[#C8A87C]/40"
              title={`${currentUser?.name} (Administrator)`}
            />
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
