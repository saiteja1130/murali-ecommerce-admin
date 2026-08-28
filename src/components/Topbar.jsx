import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import {
  Search,
  Bell,
  CheckCheck,
  Crown,
  LogOut,
  PlusCircle,
  Sparkles,
  ShoppingBag,
  Package,
  RotateCcw,
  Star
} from 'lucide-react';

export const Topbar = () => {
  const {
    currentUser,
    logout,
    setCommandPaletteOpen,
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useAdmin();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotifIcon = (type) => {
    switch (type) {
      case 'order':
        return <ShoppingBag className="w-3.5 h-3.5 text-[#C8A87C]" />;
      case 'stock':
        return <Package className="w-3.5 h-3.5 text-[#B8863F]" />;
      case 'return':
        return <RotateCcw className="w-3.5 h-3.5 text-[#A5432F]" />;
      case 'review':
        return <Star className="w-3.5 h-3.5 text-[#4A7A5E]" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-[#5B7C99]" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 h-18 bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#E8E4DC] transition-all">
      <div className="max-w-7xl mx-auto w-full px-6 md:px-8 h-full flex items-center justify-between">
        {/* Search Input / Command Palette Trigger */}
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2 bg-[#F8F6F3] hover:bg-[#F2EFE9] border border-[#E8E4DC] rounded-xl text-xs text-[#6B6864] transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-[#C8A87C] group-hover:scale-110 transition-transform" />
              <span className="font-sans text-[#6B6864] group-hover:text-[#1A1A1A]">
                Quick Search (Orders, Products, Patrons, Categories)...
              </span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono tracking-widest text-[#6B6864] bg-white rounded border border-[#E8E4DC] shadow-2xs">
                ⌘K
              </kbd>
            </div>
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* Quick Add Product Action */}
          <button
            onClick={() => navigate('/admin/products/new')}
            className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1A1A1A] text-[#F8F6F3] text-xs font-medium hover:bg-[#333333] transition-colors shadow-2xs cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#C8A87C]" />
            <span>New Product</span>
          </button>

          {/* Notification Center */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 rounded-xl border border-[#E8E4DC] text-[#1A1A1A] hover:bg-[#F2EFE9] transition-colors cursor-pointer"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4 text-[#1A1A1A]" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#A5432F] text-white text-[9px] font-bold flex items-center justify-center border-2 border-white animate-pulse">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-[#E8E4DC] shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-3 border-b border-[#E8E4DC] flex items-center justify-between bg-[#FAF8F5]">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-sm font-bold text-[#1A1A1A]">Atelier Alerts</span>
                    {unreadNotificationsCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#A5432F] text-white">
                        {unreadNotificationsCount} unread
                      </span>
                    )}
                  </div>
                  {unreadNotificationsCount > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-[11px] text-[#A68758] hover:text-[#1A1A1A] font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-[#F2EFE9]">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          markNotificationAsRead(notif.id);
                          if (notif.link) {
                            navigate(notif.link);
                            setIsNotificationsOpen(false);
                          }
                        }}
                        className={`p-3.5 hover:bg-[#FAF8F5] transition-colors cursor-pointer flex gap-3 items-start ${!notif.isRead ? 'bg-[#FAF8F5]/60' : ''
                          }`}
                      >
                        <div className="p-2 rounded-xl bg-white border border-[#E8E4DC] shrink-0 mt-0.5">
                          {getNotifIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-semibold text-[#1A1A1A] truncate">
                              {notif.title}
                            </span>
                            <span className="text-[10px] text-[#6B6864] shrink-0">{notif.time}</span>
                          </div>
                          <p className="text-[11px] text-[#6B6864] mt-0.5 line-clamp-2 leading-relaxed">
                            {notif.message}
                          </p>
                        </div>
                        {!notif.isRead && (
                          <div className="w-2 h-2 rounded-full bg-[#C8A87C] shrink-0 mt-1.5" />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-[#6B6864]">
                      No notifications in dossier.
                    </div>
                  )}
                </div>

                <div className="p-2.5 bg-[#FAF8F5] border-t border-[#E8E4DC] text-center">
                  <span className="text-[11px] text-[#6B6864]">Real-time operational alerts</span>
                </div>
              </div>
            )}
          </div>

          {/* Admin Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-[#F2EFE9] transition-colors cursor-pointer"
            >
              <img
                src={currentUser?.avatar}
                alt={currentUser?.name}
                className="w-8 h-8 rounded-lg object-cover border border-[#C8A87C]/40"
              />
              <div className="hidden lg:block text-left">
                <div className="text-xs font-semibold text-[#1A1A1A] leading-tight">
                  {currentUser?.name}
                </div>
                <div className="text-[10px] text-[#A68758] font-medium leading-tight">
                  Administrator
                </div>
              </div>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-[#E8E4DC] shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-3 border-b border-[#E8E4DC]">
                  <div className="font-semibold text-xs text-[#1A1A1A] truncate">
                    {currentUser?.name}
                  </div>
                  <div className="text-[11px] text-[#6B6864] truncate">
                    {currentUser?.email}
                  </div>
                  <div className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-md bg-[#C8A87C]/15 text-[#A68758] text-[10px] font-semibold">
                    <Crown className="w-3 h-3" />
                    <span>Admin</span>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      navigate('/admin');
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-[#1A1A1A] hover:bg-[#F2EFE9] transition-colors cursor-pointer"
                  >
                    <Crown className="w-4 h-4 text-[#6B6864]" />
                    <span>Dashboard Overview</span>
                  </button>
                  <button
                    onClick={() => {
                      navigate('/admin/categories');
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-[#1A1A1A] hover:bg-[#F2EFE9] transition-colors cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4 text-[#6B6864]" />
                    <span>Categories Manager</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-[#E8E4DC]">
                  <button
                    onClick={() => {
                      logout();
                      navigate('/login');
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-[#A5432F] hover:bg-[#A5432F]/10 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out Session</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
