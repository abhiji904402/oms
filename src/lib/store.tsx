import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Order, DeliveryPartner, SheetConfig, SyncLog, UserSession, Role, OutletName, OrderStatus, Alert } from '../types';
import { INITIAL_ORDERS, INITIAL_DELIVERY_PARTNERS, INITIAL_SHEET_CONFIG, INITIAL_ALERTS } from '../data/mockData';

export interface AuthPasswords {
  admin: string;
  outlets: Record<string, string>;
  defaultOutletPassword: string;
  partners: Record<string, string>;
  defaultPartnerPassword: string;
}

interface OMSContextType {
  // Session & Auth
  session: UserSession;
  setSession: (session: UserSession) => void;
  switchRole: (role: Role, outlet?: OutletName, partnerId?: string) => void;
  isAuthenticated: boolean;
  login: (userSession: UserSession) => void;
  logout: () => void;

  // Passwords Management
  authPasswords: AuthPasswords;
  updateAdminPassword: (newPass: string) => void;
  updateOutletPassword: (outletName: string, newPass: string) => void;
  updatePartnerPassword: (partnerId: string, newPass: string) => void;
  verifyPassword: (
    role: Role,
    identifier: string | undefined,
    passwordAttempt: string
  ) => { success: boolean; message?: string; userSession?: UserSession };

  // Orders
  orders: Order[];
  addOrder: (orderData: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>) => Order;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  updateOrderStatus: (id: string, status: OrderStatus, deliveryPartner?: string) => void;
  markDelivered: (id: string, photoUrl: string, otpInput?: string) => { success: boolean; message: string };

  // Delivery Partners
  partners: DeliveryPartner[];
  addPartner: (partner: Omit<DeliveryPartner, 'id' | 'total_deliveries'>) => void;
  deletePartner: (id: string) => void;
  updatePartnerStatus: (id: string, status: DeliveryPartner['status']) => void;

  // Alerts
  alerts: Alert[];
  triggerSheetSync: () => Promise<void>;

  // Google Sheet Config & Sync
  sheetConfig: SheetConfig;
  updateSheetConfig: (updates: Partial<SheetConfig>) => void;
  syncLogs: SyncLog[];
  triggerGoogleSheetSync: () => Promise<void>;

  // Selection for batch actions (e.g., Thermal Printing)
  selectedOrderIds: string[];
  toggleOrderSelection: (id: string) => void;
  selectAllOrders: (ids: string[]) => void;
  clearOrderSelection: () => void;

  // Filter State
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedOutletFilter: string;
  setSelectedOutletFilter: (o: string) => void;
  selectedStatusFilter: string;
  setSelectedStatusFilter: (s: string) => void;
  dateRangeFilter: { start: string; end: string };
  setDateRangeFilter: (range: { start: string; end: string }) => void;

  // Notifications / Live Event Banner
  recentNotification: string | null;
  dismissNotification: () => void;
}

const OMSContext = createContext<OMSContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_ORDERS = 'broomies_oms_orders_v3';
const LOCAL_STORAGE_KEY_PARTNERS = 'broomies_oms_partners_v3';
const LOCAL_STORAGE_KEY_SHEET = 'broomies_oms_sheet_v3';
const LOCAL_STORAGE_KEY_SESSION = 'broomies_oms_session_v3';
const LOCAL_STORAGE_KEY_AUTH = 'broomies_oms_auth_v1';
const LOCAL_STORAGE_KEY_PASSWORDS = 'broomies_oms_passwords_v1';

const DEFAULT_PASSWORDS: AuthPasswords = {
  admin: 'admin123',
  outlets: {
    'Sector 31': 'outlet123',
    'Sector 35': 'outlet123',
    'Sector 42': 'outlet123',
    'Sector 88': 'outlet123'
  },
  defaultOutletPassword: 'outlet123',
  partners: {
    'pt-1': 'rider123',
    'pt-2': 'rider123',
    'pt-3': 'rider123'
  },
  defaultPartnerPassword: 'rider123'
};

export const OMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth & Session state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_AUTH);
    return saved === 'true';
  });

  const [authPasswords, setAuthPasswords] = useState<AuthPasswords>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PASSWORDS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved passwords', e);
      }
    }
    return DEFAULT_PASSWORDS;
  });

  const [session, setSessionState] = useState<UserSession>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_SESSION);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved session', e);
      }
    }
    return {
      id: 'usr-admin',
      name: 'Broomies Central Admin',
      role: 'admin'
    };
  });

  // Orders State
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_ORDERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved orders', e);
      }
    }
    return INITIAL_ORDERS;
  });

  // Delivery Partners State
  const [partners, setPartners] = useState<DeliveryPartner[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PARTNERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved partners', e);
      }
    }
    return INITIAL_DELIVERY_PARTNERS;
  });

  // Google Sheet Config State
  const [sheetConfig, setSheetConfig] = useState<SheetConfig>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_SHEET);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved sheet config', e);
      }
    }
    return INITIAL_SHEET_CONFIG;
  });

  // Alerts State
  const [alerts, setAlerts] = useState<Alert[]>(() => {
    return INITIAL_ALERTS || [];
  });

  // Sync Logs
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);

  // Batch selection
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOutletFilter, setSelectedOutletFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState({ start: '', end: '' });

  // Notifications
  const [recentNotification, setRecentNotification] = useState<string | null>(null);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PARTNERS, JSON.stringify(partners));
  }, [partners]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_SHEET, JSON.stringify(sheetConfig));
  }, [sheetConfig]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_SESSION, JSON.stringify(session));
  }, [session]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_AUTH, String(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PASSWORDS, JSON.stringify(authPasswords));
  }, [authPasswords]);

  const login = useCallback((userSession: UserSession) => {
    setSessionState(userSession);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  const updateAdminPassword = useCallback((newPass: string) => {
    setAuthPasswords((prev) => ({ ...prev, admin: newPass }));
  }, []);

  const updateOutletPassword = useCallback((outletName: string, newPass: string) => {
    setAuthPasswords((prev) => ({
      ...prev,
      outlets: { ...prev.outlets, [outletName]: newPass }
    }));
  }, []);

  const updatePartnerPassword = useCallback((partnerId: string, newPass: string) => {
    setAuthPasswords((prev) => ({
      ...prev,
      partners: { ...prev.partners, [partnerId]: newPass }
    }));
  }, []);

  const verifyPassword = useCallback(
    (role: Role, identifier: string | undefined, passwordAttempt: string) => {
      if (role === 'admin') {
        if (passwordAttempt === authPasswords.admin) {
          const userSession: UserSession = {
            id: 'usr-admin',
            name: 'Broomies Central Admin',
            role: 'admin'
          };
          return { success: true, userSession };
        }
        return { success: false, message: 'Incorrect Admin Password!' };
      }

      if (role === 'outlet') {
        const outletName = (identifier as OutletName) || 'Sector 31';
        const expected = authPasswords.outlets[outletName] || authPasswords.defaultOutletPassword;
        if (passwordAttempt === expected) {
          const userSession: UserSession = {
            id: `usr-outlet-${outletName}`,
            name: `${outletName} Manager`,
            role: 'outlet',
            outlet: outletName
          };
          return { success: true, userSession };
        }
        return { success: false, message: `Incorrect password for ${outletName} branch!` };
      }

      if (role === 'delivery') {
        const partner = partners.find((p) => p.id === identifier) || partners[0];
        const partnerId = partner ? partner.id : (identifier || 'pt-1');
        const expected =
          authPasswords.partners[partnerId] ||
          partner?.password ||
          authPasswords.defaultPartnerPassword;

        if (passwordAttempt === expected) {
          const userSession: UserSession = {
            id: `usr-rider-${partnerId}`,
            name: `Rider: ${partner ? partner.name : 'Delivery Partner'}`,
            role: 'delivery',
            deliveryPartnerId: partnerId
          };
          return { success: true, userSession };
        }
        return {
          success: false,
          message: `Incorrect password for ${partner ? partner.name : 'Delivery Partner'}!`
        };
      }

      return { success: false, message: 'Unknown role or authentication error.' };
    },
    [authPasswords, partners]
  );

  const showNotification = useCallback((msg: string) => {
    setRecentNotification(msg);
    setTimeout(() => {
      setRecentNotification(null);
    }, 5000);
  }, []);

  const setSession = (newSession: UserSession) => {
    setSessionState(newSession);
  };

  const switchRole = (role: Role, outlet?: OutletName, partnerId?: string) => {
    let name = 'Broomies Central Admin';
    if (role === 'outlet') {
      name = outlet ? `${outlet} Manager` : 'Outlet Manager';
    } else if (role === 'delivery') {
      const partner = partners.find((p) => p.id === partnerId);
      name = partner ? partner.name : 'Delivery Partner';
    }

    const updatedSession: UserSession = {
      id: `usr-${role}-${Date.now()}`,
      name,
      role,
      outlet: outlet || 'Downtown Flagship',
      deliveryPartnerId: partnerId || partners[0]?.id
    };
    setSessionState(updatedSession);
    showNotification(`Switched role to ${role.toUpperCase()} (${name})`);
  };

  // Helper function to log sheet sync
  const logSync = useCallback((orderNumber: number, event: 'create' | 'update' | 'delete' | 'manual_sync', success = true) => {
    const newLog: SyncLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      event,
      order_number: orderNumber,
      status: success ? 'success' : 'failed',
      details: success ? `[pushToSheet] Synced Order #${orderNumber} (${event}) to Google Sheet` : `Sync failed for #${orderNumber}`
    };
    setSyncLogs((prev) => [newLog, ...prev.slice(0, 49)]);

    setSheetConfig((prev) => ({
      ...prev,
      last_sync: new Date().toISOString(),
      last_synced_at: new Date().toISOString(),
      sync_count: prev.sync_count + 1,
      webhook_status: 'connected'
    }));
  }, []);

  // pushToSheet function for Google Sheet webhook
  const pushToSheet = useCallback(async (order: Order, action: 'create' | 'update' | 'delete') => {
    if (!sheetConfig.auto_sync) return;
    try {
      if (sheetConfig.sheet_url && sheetConfig.sheet_url.startsWith('http')) {
        await fetch(sheetConfig.sheet_url, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ action, order })
        }).catch(() => {});
      }
      logSync(order.order_number, action, true);
    } catch (err) {
      console.error('pushToSheet error:', err);
    }
  }, [sheetConfig.auto_sync, sheetConfig.sheet_url, logSync]);

  // Real-time subscription simulation timer
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time background pulse
      setOrders((prev) => {
        // Find an out_for_delivery order and simulate location or status check
        return prev.map((o) => {
          if (o.status === 'out_for_delivery' && Math.random() > 0.85) {
            return {
              ...o,
              updated_at: new Date().toISOString()
            };
          }
          return o;
        });
      });
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Webhook / API sync function
  const triggerGoogleSheetSync = useCallback(async () => {
    if (sheetConfig.sheet_url && sheetConfig.sheet_url.startsWith('http')) {
      try {
        await fetch(sheetConfig.sheet_url, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify(orders)
        }).catch(() => {});
      } catch (err) {
        console.error('Sheet sync webhook error:', err);
      }
    }
    logSync(0, 'manual_sync', true);
    showNotification('Successfully synchronized all orders with Google Sheets!');
  }, [orders, sheetConfig.sheet_url, logSync, showNotification]);

  const addOrder = useCallback((orderData: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>): Order => {
    const maxOrderNum = orders.reduce((max, o) => Math.max(max, o.order_number), 1000);
    const newOrderNumber = maxOrderNum + 1;
    const now = new Date().toISOString();
    const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();

    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      order_number: newOrderNumber,
      otp: randomOtp,
      payment_changed_by: session.name || 'Admin',
      payment_changed_at: now,
      created_at: now,
      updated_at: now
    };

    setOrders((prev) => [newOrder, ...prev]);
    showNotification(`✨ New Order #${newOrderNumber} created at ${newOrder.outlet}!`);

    // Auto-sync via pushToSheet
    pushToSheet(newOrder, 'create');

    return newOrder;
  }, [orders, session.name, pushToSheet, showNotification]);

  const updateOrder = useCallback((id: string, updates: Partial<Order>) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === id) {
          const now = new Date().toISOString();
          const hasPaymentUpdate =
            updates.payment_type !== undefined ||
            updates.advance_amount !== undefined ||
            updates.remaining_balance !== undefined ||
            updates.due_amount !== undefined;

          const updated: Order = {
            ...ord,
            ...updates,
            updated_at: now,
            ...(hasPaymentUpdate
              ? {
                  payment_changed_by: session.name || session.role,
                  payment_changed_at: now
                }
              : {})
          };

          pushToSheet(updated, 'update');
          return updated;
        }
        return ord;
      })
    );
  }, [session.name, session.role, pushToSheet]);

  const deleteOrder = useCallback((id: string) => {
    setOrders((prev) => {
      const target = prev.find((o) => o.id === id);
      if (target) {
        showNotification(`Order #${target.order_number} removed.`);
        pushToSheet(target, 'delete');
      }
      return prev.filter((o) => o.id !== id);
    });
    setSelectedOrderIds((prev) => prev.filter((item) => item !== id));
  }, [showNotification, pushToSheet]);

  const updateOrderStatus = useCallback((id: string, status: OrderStatus, deliveryPartner?: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === id) {
          const now = new Date().toISOString();
          const updates: Partial<Order> = {
            status,
            updated_at: now
          };
          if (deliveryPartner) {
            updates.delivery_partner = deliveryPartner;
          }
          if (status === 'delivered' && !ord.actual_delivery_time) {
            updates.actual_delivery_time = now;
            updates.delivered_by = session.name || deliveryPartner || 'Rider';
            updates.rider_delivered = true;
          }

          const updated = { ...ord, ...updates };
          showNotification(`Order #${ord.order_number} status changed to ${status.toUpperCase()}`);
          pushToSheet(updated, 'update');
          return updated;
        }
        return ord;
      })
    );
  }, [session.name, showNotification, pushToSheet]);

  const markDelivered = useCallback((id: string, photoUrl: string, otpInput?: string) => {
    const targetOrder = orders.find((o) => o.id === id);
    if (!targetOrder) {
      return { success: false, message: 'Order not found.' };
    }

    if (targetOrder.otp && otpInput && targetOrder.otp.trim() !== otpInput.trim()) {
      return { success: false, message: 'Invalid OTP code! Please verify with customer.' };
    }

    const now = new Date().toISOString();
    const updatedOrder: Order = {
      ...targetOrder,
      status: 'delivered',
      delivery_photo_url: photoUrl,
      advance_amount: targetOrder.total_amount,
      remaining_balance: 0,
      due_amount: 0,
      payment_type: 'full',
      actual_delivery_time: now,
      delivered_by: session.name || targetOrder.delivery_partner || 'Rider',
      payment_changed_by: session.name || 'Rider',
      payment_changed_at: now,
      rider_delivered: true,
      updated_at: now
    };

    setOrders((prev) =>
      prev.map((o) => (o.id === id ? updatedOrder : o))
    );

    pushToSheet(updatedOrder, 'update');

    // Update delivery partner total deliveries count
    if (targetOrder.delivery_partner) {
      setPartners((prev) =>
        prev.map((p) => {
          if (p.name === targetOrder.delivery_partner || p.id === session.deliveryPartnerId) {
            return { ...p, total_deliveries: p.total_deliveries + 1, status: 'available' };
          }
          return p;
        })
      );
    }

    showNotification(`🚀 Order #${targetOrder.order_number} successfully delivered & verified!`);
    return { success: true, message: 'Delivered successfully!' };
  }, [orders, session.name, session.deliveryPartnerId, showNotification, pushToSheet]);

  const addPartner = useCallback((partnerData: Omit<DeliveryPartner, 'id' | 'total_deliveries'>) => {
    const newPartner: DeliveryPartner = {
      ...partnerData,
      id: `dp-${Date.now()}`,
      total_deliveries: 0
    };
    setPartners((prev) => [...prev, newPartner]);
    showNotification(`Added new delivery partner: ${newPartner.name}`);
  }, [showNotification]);

  const deletePartner = useCallback((id: string) => {
    setPartners((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) {
        showNotification(`Removed delivery partner: ${target.name}`);
      }
      return prev.filter((p) => p.id !== id);
    });
  }, [showNotification]);

  const updatePartnerStatus = useCallback((id: string, status: DeliveryPartner['status']) => {
    setPartners((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    );
  }, []);

  const updateSheetConfig = useCallback((updates: Partial<SheetConfig>) => {
    setSheetConfig((prev) => ({ ...prev, ...updates }));
    showNotification('Updated Google Sheets Integration configuration.');
  }, [showNotification]);

  // Batch selections
  const toggleOrderSelection = useCallback((id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const selectAllOrders = useCallback((ids: string[]) => {
    setSelectedOrderIds(ids);
  }, []);

  const clearOrderSelection = useCallback(() => {
    setSelectedOrderIds([]);
  }, []);

  const value = useMemo(
    () => ({
      session,
      setSession,
      switchRole,
      isAuthenticated,
      login,
      logout,
      authPasswords,
      updateAdminPassword,
      updateOutletPassword,
      updatePartnerPassword,
      verifyPassword,
      orders: orders || [],
      addOrder,
      updateOrder,
      deleteOrder,
      updateOrderStatus,
      markDelivered,
      partners: partners || [],
      addPartner,
      deletePartner,
      updatePartnerStatus,
      alerts: alerts || [],
      triggerSheetSync: triggerGoogleSheetSync,
      sheetConfig,
      updateSheetConfig,
      syncLogs: syncLogs || [],
      triggerGoogleSheetSync,
      selectedOrderIds: selectedOrderIds || [],
      toggleOrderSelection,
      selectAllOrders,
      clearOrderSelection,
      searchQuery,
      setSearchQuery,
      selectedOutletFilter,
      setSelectedOutletFilter,
      selectedStatusFilter,
      setSelectedStatusFilter,
      dateRangeFilter,
      setDateRangeFilter,
      recentNotification,
      dismissNotification: () => setRecentNotification(null)
    }),
    [
      session,
      isAuthenticated,
      login,
      logout,
      authPasswords,
      updateAdminPassword,
      updateOutletPassword,
      updatePartnerPassword,
      verifyPassword,
      orders,
      addOrder,
      updateOrder,
      deleteOrder,
      updateOrderStatus,
      markDelivered,
      partners,
      addPartner,
      deletePartner,
      updatePartnerStatus,
      alerts,
      sheetConfig,
      updateSheetConfig,
      syncLogs,
      triggerGoogleSheetSync,
      selectedOrderIds,
      toggleOrderSelection,
      selectAllOrders,
      clearOrderSelection,
      searchQuery,
      selectedOutletFilter,
      selectedStatusFilter,
      dateRangeFilter,
      recentNotification
    ]
  );

  return <OMSContext.Provider value={value}>{children}</OMSContext.Provider>;
};

export const useOMS = () => {
  const context = useContext(OMSContext);
  if (!context) {
    throw new Error('useOMS must be used within an OMSProvider');
  }
  return context;
};
