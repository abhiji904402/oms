import React, { useState } from 'react';
import { useOMS } from '../lib/store';
import { Order, OrderStatus } from '../types';
import { EditOrderModal } from '../components/EditOrderModal';
import {
  FileSpreadsheet,
  RefreshCw,
  Copy,
  Check,
  Save,
  Pencil,
  Trash2,
  Zap,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

const APPS_SCRIPT_CODE = `// ===================================================
// BROOMIES BAKERY – Google Apps Script
// Outlet-wise sheets + Smart missing data sync
// ===================================================

var OUTLET_SHEET_MAP = {
  "sector_31": "Sector 31",
  "sector_42": "Sector 42",
  "sector_35": "Sector 35",
  "sector_88": "Sector 88"
};

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var contents = e.postData.contents;
    var data = JSON.parse(contents);

    // Auto-create Header row if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Order #", "Customer Name", "Phone", "Outlet", "Item Type", "Quantity/Weight",
        "Informed By", "Delivery Type", "Delivery Date", "Time", "Total (₹)", "Advance (₹)",
        "Remaining (₹)", "Payment Type", "Adv Bill No.", "Final Bill No.", "Status", "Cake Photo URL", "Remarks", "Last Updated"
      ]);
      sheet.getRange(1, 1, 1, 20).setFontWeight("bold").setBackground("#d9ead3");
    }

    // Check action: delete, create, update
    if (data && data.action === "delete") {
      deleteOrder(sheet, data.order || data);
    } else if (Array.isArray(data)) {
      data.forEach(function(order) { appendOrUpdateOrder(sheet, order); });
    } else if (data && data.order) {
      appendOrUpdateOrder(sheet, data.order);
    } else if (data) {
      appendOrUpdateOrder(sheet, data);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Order synced" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function appendOrUpdateOrder(sheet, order) {
  var rows = sheet.getDataRange().getValues();
  var orderNum = order.order_number;
  var rowIndex = -1;

  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] == orderNum) {
      rowIndex = i + 1;
      break;
    }
  }

  var rowData = [
    order.order_number || "",
    order.customer_name || "",
    order.mobile_number || "",
    order.outlet || "",
    order.item_type || "",
    order.quantity || "",
    order.informed_by || "",
    order.delivery_type || "",
    order.delivery_date || "",
    order.delivery_time_expected || "",
    order.total_amount || 0,
    order.advance_amount || 0,
    order.remaining_balance || 0,
    order.payment_type || "",
    order.advance_bill_number || "",
    order.final_bill_number || "",
    order.status || "",
    order.cake_photo_url || "",
    order.remarks || "",
    new Date().toLocaleString("en-IN")
  ];

  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
}

function deleteOrder(sheet, order) {
  var rows = sheet.getDataRange().getValues();
  var orderNum = typeof order === 'object' ? order.order_number : order;
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] == orderNum) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Bakery OMS Live Google Sheets Sync Webhook Active!");
}`;

export const GoogleSheetsPage: React.FC = () => {
  const { sheetConfig, orders = [], updateSheetConfig, triggerSheetSync, deleteOrder } = useOMS();
  const [isSyncing, setIsSyncing] = useState(false);
  const [urlInput, setUrlInput] = useState(sheetConfig.sheet_url);
  const [copied, setCopied] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await triggerSheetSync();
    setTimeout(() => {
      setIsSyncing(false);
    }, 1200);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    updateSheetConfig({ sheet_url: urlInput });
    alert('Web App URL updated & saved successfully!');
  };

  const handleEditClick = (order: Order) => {
    setEditingOrder(order);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (order: Order) => {
    if (window.confirm(`Are you sure you want to delete Order #${order.order_number}? This will also delete it live from Google Sheets.`)) {
      deleteOrder(order.id);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-200/90 text-amber-950">pending</span>;
      case 'processing':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-200/90 text-sky-950">processing</span>;
      case 'out_for_delivery':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-200/90 text-blue-950">out for delivery</span>;
      case 'delivered':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-200/90 text-emerald-950">delivered</span>;
      case 'cancelled':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-400 text-slate-950">cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-200 text-purple-950">{status}</span>;
    }
  };

  const getPaymentText = (order: Order) => {
    if (order.remaining_balance && order.remaining_balance > 0) {
      return <span className="text-slate-200 font-medium text-xs">Due</span>;
    }
    return <span className="text-slate-200 font-medium text-xs">Full Paid</span>;
  };

  // Sort orders newest first
  const sortedOrders = [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto text-slate-100">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Google Sheet Sync
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure live data sync with Google Sheets
          </p>
        </div>

        <button
          onClick={handleManualSync}
          disabled={isSyncing}
          className="px-4 py-2.5 rounded-xl bg-[#0e1120] hover:bg-indigo-950 border border-slate-700/80 text-white font-bold text-xs shadow-md flex items-center gap-2 transition"
        >
          <RefreshCw className={`w-4 h-4 text-slate-300 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing...' : 'Manual Sync'}</span>
        </button>
      </div>

      {/* 2. Sync Active Banner */}
      <div className="bg-[#121d22]/90 border border-emerald-900/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center gap-3">
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold px-3 py-1 rounded-full">
            Active
          </span>
          <span className="text-emerald-300 text-xs sm:text-sm font-medium">
            Sync is configured and active
          </span>
        </div>
        <div className="text-xs text-emerald-400/90 font-mono">
          Last synced: {new Date(sheetConfig.last_synced_at || Date.now()).toLocaleString('en-IN')}
        </div>
      </div>

      {/* 3. Section 1: Apps Script Code Box */}
      <div className="bg-[#0b0e1b] border border-indigo-950 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
              1
            </div>
            <h2 className="text-base font-bold text-white">Apps Script Code</h2>
          </div>

          <button
            onClick={handleCopyCode}
            className="px-3.5 py-1.5 rounded-xl bg-purple-950/60 border border-purple-800/60 hover:bg-purple-900/80 text-purple-300 hover:text-white font-bold text-xs flex items-center gap-1.5 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>

        {/* Highlighted Step instruction */}
        <div className="bg-purple-950/40 border border-purple-900/50 rounded-xl px-4 py-2 text-xs font-semibold text-purple-200">
          Copy this code → Open Google Sheet → Extensions → Apps Script → Paste → Deploy as Web App
        </div>

        {/* Scrollable Code Box */}
        <div className="bg-[#070913] border border-indigo-950 rounded-xl p-4 overflow-x-auto max-h-64 scrollbar-thin">
          <pre className="font-mono text-xs text-slate-300 whitespace-pre leading-relaxed select-all">
            {APPS_SCRIPT_CODE}
          </pre>
        </div>
      </div>

      {/* 4. Section 2: Web App URL */}
      <div className="bg-[#0b0e1b] border border-indigo-950 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
            2
          </div>
          <h2 className="text-base font-bold text-white">Web App URL</h2>
        </div>

        <form onSubmit={handleSaveUrl} className="flex flex-col sm:flex-row gap-3">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://script.google.com/macros/s/.../exec"
            className="flex-1 bg-[#070913] border border-indigo-950 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-100 font-mono focus:outline-none focus:border-purple-500 shadow-inner"
            required
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2 transition"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
        </form>
      </div>

      {/* 5. Section 3: All Orders Table */}
      <div className="bg-[#0b0e1b] border border-indigo-950 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-white">
            All Orders ({sortedOrders.length})
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            Newest first • Click to edit
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-indigo-950/80">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-indigo-950 bg-[#070913] text-slate-400 text-xs font-semibold">
                <th className="py-3 px-4">Order#</th>
                <th className="py-3 px-4">Outlet</th>
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-4 text-center">Qty</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Del. Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-950/60 text-xs">
              {sortedOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No orders synced yet.
                  </td>
                </tr>
              ) : (
                sortedOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-indigo-950/30 transition">
                    <td className="py-3 px-4 font-bold text-indigo-400 font-mono">
                      #{ord.order_number}
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-medium">
                      {ord.outlet}
                    </td>
                    <td className="py-3 px-4 text-slate-200">
                      {ord.item_type}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-200">
                      {ord.quantity}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      ₹{ord.total_amount}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(ord.status)}
                    </td>
                    <td className="py-3 px-4">
                      {getPaymentText(ord)}
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-mono">
                      {ord.delivery_date}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(ord)}
                          className="p-1.5 rounded-lg hover:bg-purple-950/80 text-purple-400 hover:text-purple-300 transition"
                          title="Edit Order"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(ord)}
                          className="p-1.5 rounded-lg hover:bg-rose-950/80 text-rose-400 hover:text-rose-300 transition"
                          title="Delete Order"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Order Modal */}
      {editingOrder && (
        <EditOrderModal
          order={editingOrder}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingOrder(null);
          }}
        />
      )}
    </div>
  );
};

