import React from 'react';
import { useOMS } from '../lib/store';
import {
  LayoutDashboard,
  Store,
  Truck,
  BarChart3,
  Bell,
  FileSpreadsheet,
  Plus,
  X,
  Cake,
  Sparkles,
  Key,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  onOpenAddModal: () => void;
  onOpenThermalModal: () => void;
  onOpenSheetModal: () => void;
  onOpenPasswordModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile,
  setIsOpenMobile,
  onOpenAddModal,
  onOpenThermalModal,
  onOpenSheetModal,
  onOpenPasswordModal
}) => {
  const { session, orders = [], alerts = [], logout } = useOMS();

  const unreadAlertsCount = (alerts || []).filter((a) => !a.is_read).length;

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 left-0 h-full w-64 bg-[#0a0c16] border-r border-indigo-950/80 backdrop-blur-xl z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out shrink-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* Brand Header */}
            <div className="p-4 border-b border-indigo-950/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-lg shadow-purple-900/30">
                  <Cake className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="font-extrabold text-lg text-white tracking-tight leading-none">
                    BROOMIES
                  </h1>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400 mt-1 block">
                    Bakery Order System
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpenMobile(false)}
                className="lg:hidden text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation List matching exact image */}
            <div className="p-3 space-y-2.5">
              
              {/* 1. Dashboard */}
              <button
                onClick={() => handleTabClick('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition ${
                  activeTab === 'dashboard'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40 font-bold'
                    : 'text-slate-300 hover:bg-indigo-950/50 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </button>

              {/* 2. + Add Order Button */}
              <button
                onClick={() => {
                  onOpenAddModal();
                  setIsOpenMobile(false);
                }}
                className="w-full py-3 px-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-900/50 flex items-center justify-start gap-3 transition active:scale-[0.98]"
              >
                <Plus className="w-5 h-5" />
                <span>Add Order</span>
              </button>

              {/* 3. Outlet Reports */}
              <button
                onClick={() => handleTabClick('outlet')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition ${
                  activeTab === 'outlet'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40 font-bold'
                    : 'text-slate-300 hover:bg-indigo-950/50 hover:text-white'
                }`}
              >
                <Store className="w-5 h-5" />
                <span>Outlet Reports</span>
              </button>

              {/* 4. Delivery Partners */}
              <button
                onClick={() => handleTabClick('delivery')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition ${
                  activeTab === 'delivery'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40 font-bold'
                    : 'text-slate-300 hover:bg-indigo-950/50 hover:text-white'
                }`}
              >
                <Truck className="w-5 h-5" />
                <span>Delivery Partners</span>
              </button>

              {/* 5. Reports */}
              <button
                onClick={() => handleTabClick('analytics')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition ${
                  activeTab === 'analytics'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40 font-bold'
                    : 'text-slate-300 hover:bg-indigo-950/50 hover:text-white'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span>Reports</span>
              </button>

              {/* 6. Alerts */}
              <button
                onClick={() => handleTabClick('alerts')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-semibold text-sm transition ${
                  activeTab === 'alerts'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40 font-bold'
                    : 'text-slate-300 hover:bg-indigo-950/50 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5" />
                  <span>Alerts</span>
                </div>
                {unreadAlertsCount > 0 && (
                  <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {unreadAlertsCount}
                  </span>
                )}
              </button>

              {/* 7. Google Sheets */}
              <button
                onClick={() => handleTabClick('sheets')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition ${
                  activeTab === 'sheets'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40 font-bold'
                    : 'text-slate-300 hover:bg-indigo-950/50 hover:text-white'
                }`}
              >
                <FileSpreadsheet className="w-5 h-5" />
                <span>Google Sheets</span>
              </button>

              {/* Password Manager Button (For Admin) */}
              {session.role === 'admin' && onOpenPasswordModal && (
                <button
                  onClick={() => {
                    onOpenPasswordModal();
                    setIsOpenMobile(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm text-purple-300 hover:bg-purple-950/40 hover:text-white border border-purple-900/50 transition"
                >
                  <Key className="w-5 h-5 text-purple-400" />
                  <span>Passwords & Security</span>
                </button>
              )}

              {/* Logout Button */}
              <button
                onClick={() => {
                  logout();
                  setIsOpenMobile(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm text-rose-300 hover:bg-rose-950/40 hover:text-white border border-rose-900/50 transition"
              >
                <LogOut className="w-5 h-5 text-rose-400" />
                <span>Logout System</span>
              </button>

            </div>
          </div>

          {/* Footer info */}
          <div className="p-4 border-t border-indigo-950/80 bg-[#080911] text-xs text-slate-400">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-medium text-slate-400">System Live:</span>
              <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Connected
              </span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium">
              Outlet: {session.outlet || 'Sector 31'} | {orders.length} total orders
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
