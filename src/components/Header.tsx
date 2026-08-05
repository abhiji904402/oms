import React from 'react';
import { useOMS } from '../lib/store';
import { RoleSwitcher } from './RoleSwitcher';
import { exportToCSV, printPDFReport } from '../lib/exportUtils';
import {
  Search,
  Download,
  FileText,
  Menu,
  Bell,
  CheckCircle2,
  Filter,
  Sparkles,
  Calendar,
  LogOut,
  Key
} from 'lucide-react';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  onOpenAddModal: () => void;
  onOpenPasswordModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileMenu,
  onOpenAddModal,
  onOpenPasswordModal
}) => {
  const {
    orders,
    session,
    logout,
    searchQuery,
    setSearchQuery,
    selectedOutletFilter,
    setSelectedOutletFilter,
    selectedStatusFilter,
    setSelectedStatusFilter,
    dateRangeFilter,
    setDateRangeFilter,
    recentNotification,
    dismissNotification
  } = useOMS();

  // Outlets list
  const outlets = ['ALL', 'Sector 31', 'Sector 35', 'Sector 42', 'Sector 88'];
  const statuses = ['ALL', 'pending', 'processing', 'out_for_delivery', 'delivered', 'on_hold', 'cancelled'];

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 border-b border-slate-800/80 backdrop-blur-md px-4 py-3">
      {/* Toast Banner for Real-time Notifications */}
      {recentNotification && (
        <div className="mb-2 p-2 px-3 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between animate-fade-in shadow-lg">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
            <span className="font-semibold">{recentNotification}</span>
          </div>
          <button
            onClick={dismissNotification}
            className="text-emerald-400 hover:text-white font-bold text-sm px-1"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Left Section: Mobile Menu Toggle & Search Bar */}
        <div className="flex items-center gap-3 w-full lg:w-auto flex-1">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Order #, Customer, Mobile, or Item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950/80 border border-slate-700/70 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500/80 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Middle Filters: Outlet & Status dropdowns */}
        <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            <select
              value={selectedOutletFilter}
              onChange={(e) => setSelectedOutletFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none pr-1 py-1 cursor-pointer font-medium"
            >
              <option value="ALL" className="bg-slate-900 text-slate-200">All Outlets</option>
              {outlets.filter(o => o !== 'ALL').map((o) => (
                <option key={o} value={o} className="bg-slate-900 text-slate-200">{o}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none px-2 py-1 cursor-pointer capitalize font-medium"
            >
              <option value="ALL" className="bg-slate-900 text-slate-200">All Statuses</option>
              {statuses.filter(s => s !== 'ALL').map((s) => (
                <option key={s} value={s} className="bg-slate-900 text-slate-200 capitalize">{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Section: Export Actions, Password Settings & Logout */}
        <div className="flex items-center justify-end gap-2 w-full lg:w-auto">
          {/* Admin Passwords Button */}
          {session.role === 'admin' && onOpenPasswordModal && (
            <button
              onClick={onOpenPasswordModal}
              title="Manage Passwords"
              className="p-2 rounded-xl bg-purple-950/80 hover:bg-purple-900/80 border border-purple-700/60 text-purple-200 transition text-xs font-bold flex items-center gap-1.5 shadow-md"
            >
              <Key className="w-4 h-4 text-purple-400" />
              <span className="hidden xl:inline">Passwords</span>
            </button>
          )}

          {/* Export CSV */}
          <button
            onClick={() => exportToCSV(orders)}
            title="Export CSV"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 transition text-xs font-medium flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span className="hidden xl:inline">Export CSV</span>
          </button>

          {/* Export PDF Report */}
          <button
            onClick={() => printPDFReport(orders)}
            title="Generate PDF Summary"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 transition text-xs font-medium flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span className="hidden xl:inline">PDF Report</span>
          </button>

          {/* Persona Switcher */}
          <RoleSwitcher />

          {/* Logout Button */}
          <button
            onClick={logout}
            title="Logout"
            className="p-2 rounded-xl bg-rose-950/80 hover:bg-rose-900/80 border border-rose-800/60 text-rose-300 hover:text-white transition text-xs font-bold flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
