import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import {
  Search,
  Package,
  ShoppingBag,
  Users,
  CreditCard,
  Grid,
  Sparkles,
  LayoutDashboard,
  PlusCircle,
  ArrowRight,
  X
} from 'lucide-react';

export const CommandPalette = () => {
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    products,
    orders,
    customers,
  } = useAdmin();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      } else if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isCommandPaletteOpen]);

  // Search results calculation
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    const quickActions = [
      {
        id: 'act-new-prod',
        category: 'Quick Actions',
        title: 'Create New Luxury Product',
        subtitle: 'Open product creation form',
        icon: PlusCircle,
        action: () => navigate('/admin/products/new'),
      },
      {
        id: 'act-view-categories',
        category: 'Quick Actions',
        title: 'Manage Categories',
        subtitle: 'Add, edit, or reorder store categories',
        icon: Grid,
        action: () => navigate('/admin/categories'),
      },
      {
        id: 'act-view-payments',
        category: 'Quick Actions',
        title: 'View Payment Histories & Settlements',
        subtitle: 'Audit transactions, payment methods & gateway authorizations',
        icon: CreditCard,
        action: () => navigate('/admin/payments'),
      },
      {
        id: 'act-view-hero',
        category: 'Quick Actions',
        title: 'Edit Hero Carousel Banners',
        subtitle: 'Configure storefront landing slides and CTAs',
        icon: Sparkles,
        action: () => navigate('/admin/hero-carousel'),
      },
    ];

    if (!q) {
      return quickActions;
    }

    const matchedProducts = products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      )
      .slice(0, 4)
      .map((p) => ({
        id: `prod-${p.id}`,
        category: 'Products',
        title: p.name,
        subtitle: `${p.sku} • $₹{p.price.toLocaleString()} • ${p.category}`,
        icon: Package,
        action: () => navigate(`/admin/products/${p.id}/edit`),
      }));

    const matchedOrders = orders
      .filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          (o.customerName && o.customerName.toLowerCase().includes(q)) ||
          (o.customerEmail && o.customerEmail.toLowerCase().includes(q))
      )
      .slice(0, 3)
      .map((o) => ({
        id: `ord-${o.id}`,
        category: 'Orders',
        title: `Order ${o.orderNumber} — ${o.customerName}`,
        subtitle: `$${o.total.toFixed(2)} • ${(o.status || '').toUpperCase()} • ${o.paymentStatus || 'PAID'}`,
        icon: ShoppingBag,
        action: () => navigate(`/admin/orders/${o.id}`),
      }));

    const matchedCustomers = customers
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.city && c.city.toLowerCase().includes(q))
      )
      .slice(0, 3)
      .map((c) => ({
        id: `cst-${c.id}`,
        category: 'Users / Patrons',
        title: c.name,
        subtitle: `${c.email} • ${c.vipTier} • Spent: $${c.totalSpent.toLocaleString()}`,
        icon: Users,
        action: () => navigate(`/admin/customers/${c.id}`),
      }));

    const navPages = [
      { name: 'Dashboard Overview', path: '/admin', icon: LayoutDashboard },
      { name: 'Product Catalog', path: '/admin/products', icon: Package },
      { name: 'Category Manager', path: '/admin/categories', icon: Grid },
      { name: 'Orders List', path: '/admin/orders', icon: ShoppingBag },
      { name: 'Payment Histories', path: '/admin/payments', icon: CreditCard },
      { name: 'User / Customer Directory', path: '/admin/customers', icon: Users },
      { name: 'Hero Carousel Editor', path: '/admin/hero-carousel', icon: Sparkles },
    ]
      .filter((nav) => nav.name.toLowerCase().includes(q))
      .map((nav) => ({
        id: `nav-${nav.path}`,
        category: 'Navigation',
        title: nav.name,
        subtitle: `Jump directly to ${nav.path}`,
        icon: nav.icon,
        action: () => navigate(nav.path),
      }));

    return [
      ...matchedProducts,
      ...matchedOrders,
      ...matchedCustomers,
      ...navPages,
      ...quickActions.filter((a) => a.title.toLowerCase().includes(q)),
    ];
  }, [query, products, orders, customers, navigate]);

  const handleSelect = (item) => {
    item.action();
    setCommandPaletteOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (results.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % (results.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    }
  };

  if (!isCommandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-[#FFFFFF] rounded-2xl border border-[#E8E4DC] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#E8E4DC]">
          <Search className="w-5 h-5 text-[#C8A87C] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search products, orders, patrons, categories, or jump to page..."
            className="w-full bg-transparent text-sm text-[#1A1A1A] placeholder-[#6B6864] focus:outline-none font-sans"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-[#6B6864] hover:text-[#1A1A1A] hover:bg-[#F2EFE9]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="px-2 py-0.5 text-[10px] font-mono tracking-widest text-[#6B6864] bg-[#FAF8F5] rounded border border-[#E8E4DC]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-[#F2EFE9]">
          {results.length > 0 ? (
            results.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${isSelected ? 'bg-[#1A1A1A] text-[#F8F6F3]' : 'hover:bg-[#FAF8F5] text-[#1A1A1A]'
                    }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg ${isSelected ? 'bg-white/10 text-[#C8A87C]' : 'bg-[#FAF8F5] text-[#6B6864]'
                        }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold truncate">{item.title}</span>
                        <span
                          className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-mono ${isSelected ? 'bg-white/20 text-[#C8A87C]' : 'bg-[#E8E4DC]/60 text-[#6B6864]'
                            }`}
                        >
                          {item.category}
                        </span>
                      </div>
                      <div
                        className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-[#C8A87C]' : 'text-[#6B6864]'
                          }`}
                      >
                        {item.subtitle}
                      </div>
                    </div>
                  </div>
                  <ArrowRight
                    className={`w-4 h-4 shrink-0 ml-2 transition-transform ${isSelected ? 'translate-x-1 text-[#C8A87C]' : 'text-transparent'
                      }`}
                  />
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-xs text-[#6B6864]">
              No results found for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-[#FAF8F5] border-t border-[#E8E4DC] flex items-center justify-between text-[11px] text-[#6B6864]">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-white rounded border border-[#E8E4DC] mr-1">
                ↑↓
              </kbd>
              Navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-white rounded border border-[#E8E4DC] mr-1">
                ↵
              </kbd>
              Select
            </span>
          </div>
          <span>Atelier Quick Navigation</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
