import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Truck,
  Radio,
  Navigation,
  Compass,
  RefreshCw,
  Phone,
  ShieldCheck,
  Zap,
  UserCheck
} from 'lucide-react';
import { DeliveryPartner } from '../types';

interface RiderLocationMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  partners: DeliveryPartner[];
  onSimulateMovement?: () => void;
}

// Outlet Base Locations (Faridabad / NCR Grid)
const OUTLET_LOCATIONS = [
  { name: 'Sector 31 Outlet', lat: 28.4682, lng: 77.3060, color: '#10b981' },
  { name: 'Sector 35 Outlet', lat: 28.4520, lng: 77.3180, color: '#f59e0b' },
  { name: 'Sector 42 Outlet', lat: 28.4350, lng: 77.3320, color: '#3b82f6' },
  { name: 'Sector 88 Outlet', lat: 28.4120, lng: 77.3450, color: '#8b5cf6' }
];

export const RiderLocationMapModal: React.FC<RiderLocationMapModalProps> = ({
  isOpen,
  onClose,
  partners,
  onSimulateMovement
}) => {
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(partners[0]?.id || null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    if (!selectedPartnerId && partners.length > 0) {
      setSelectedPartnerId(partners[0].id);
    }
  }, [partners, selectedPartnerId]);

  if (!isOpen) return null;

  const activePartner = partners.find((p) => p.id === selectedPartnerId) || partners[0];

  // Helper to map lat/lng to percentage coordinates on visual map canvas
  // Bounds around Faridabad NCR: Lat [28.38, 28.49], Lng [77.28, 77.37]
  const getCanvasCoords = (lat?: number, lng?: number) => {
    const minLat = 28.38;
    const maxLat = 28.49;
    const minLng = 77.28;
    const maxLng = 77.37;

    const currentLat = lat || 28.45;
    const currentLng = lng || 77.32;

    const x = Math.max(5, Math.min(92, ((currentLng - minLng) / (maxLng - minLng)) * 100));
    // Invert Y so higher latitude is at top
    const y = Math.max(8, Math.min(90, 100 - ((currentLat - minLat) / (maxLat - minLat)) * 100));

    return { x, y };
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#0b0e1e] border border-indigo-900/80 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-scale-in">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-950/90 via-[#0d1127] to-indigo-950/90 border-b border-indigo-900/60 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-lg">
              <Radio className="w-5 h-5 text-purple-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Delivery Partner Live GPS Tracking
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-extrabold text-[10px] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  GPS ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Track live locations, speed, and active delivery routes in real-time
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center border border-indigo-950 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-hidden">
          {/* Left Side: Partner List */}
          <div className="p-3 sm:p-4 bg-[#080a17] border-r border-indigo-950 space-y-3 overflow-y-auto max-h-[300px] lg:max-h-none">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active Riders ({partners.length})
              </span>
              <button
                onClick={() => {
                  setIsSimulating(true);
                  if (onSimulateMovement) onSimulateMovement();
                  setTimeout(() => setIsSimulating(false), 800);
                }}
                className="text-[11px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 bg-purple-950/50 border border-purple-800/60 px-2.5 py-1 rounded-lg transition"
              >
                <RefreshCw className={`w-3 h-3 ${isSimulating ? 'animate-spin' : ''}`} />
                <span>Sync GPS</span>
              </button>
            </div>

            <div className="space-y-2">
              {partners.map((p) => {
                const isSel = p.id === selectedPartnerId;
                const loc = p.location || { lat: 28.45, lng: 77.32, address: 'Faridabad Sector 31', speed: 0, updated_at: '' };

                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPartnerId(p.id)}
                    className={`w-full p-3 rounded-2xl text-left transition border flex items-center justify-between gap-3 ${
                      isSel
                        ? 'bg-gradient-to-r from-purple-950/90 to-indigo-950/90 border-purple-500/80 shadow-lg shadow-purple-950/40'
                        : 'bg-[#0f1328] hover:bg-[#151a36] border-indigo-950 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border ${
                          p.status === 'on_delivery'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}>
                          <Truck className="w-5 h-5" />
                        </div>
                        <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#0b0e1e] ${
                          p.status === 'on_delivery' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
                        }`} />
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs font-extrabold text-white truncate flex items-center gap-1.5">
                          {p.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {p.vehicle || 'Delivery Bike'}
                        </div>
                        <div className="text-[10px] text-emerald-400 font-bold truncate mt-0.5">
                          📍 {loc.address}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-black text-purple-300 font-mono">
                        {loc.speed ? `${loc.speed} km/h` : 'Stopped'}
                      </div>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase ${
                        p.status === 'on_delivery' ? 'bg-amber-950 text-amber-300' : 'bg-emerald-950 text-emerald-300'
                      }`}>
                        {p.status === 'on_delivery' ? 'On Trip' : 'Available'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Side: Map Canvas */}
          <div className="lg:col-span-2 relative bg-[#060813] min-h-[360px] sm:min-h-[480px] p-4 flex flex-col justify-between overflow-hidden">
            {/* Visual Grid / Map Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e1b4b_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060813] via-transparent to-purple-950/20 pointer-events-none" />

            {/* Top Bar on Map */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 bg-[#0c0f24]/90 backdrop-blur border border-indigo-900/60 p-3 rounded-2xl shadow-xl">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-purple-400 animate-spin-slow" />
                <span className="text-xs font-extrabold text-white">Live Tracking Grid</span>
                <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded-md font-mono">
                  NCR / Faridabad Sector Map
                </span>
              </div>

              {activePartner && (
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-400 text-[11px]">Selected: <strong className="text-white">{activePartner.name}</strong></span>
                  <a
                    href={`tel:${activePartner.phone}`}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1 transition"
                  >
                    <Phone className="w-3 h-3" />
                    Call
                  </a>
                </div>
              )}
            </div>

            {/* Map Plot Area */}
            <div className="relative z-10 my-4 flex-1 bg-[#090c1d] border border-indigo-950 rounded-2xl overflow-hidden shadow-2xl relative min-h-[260px]">
              {/* Outlet Landmarks */}
              {OUTLET_LOCATIONS.map((outlet) => {
                const { x, y } = getCanvasCoords(outlet.lat, outlet.lng);
                return (
                  <div
                    key={outlet.name}
                    style={{ left: `${x}%`, top: `${y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
                  >
                    <div
                      style={{ backgroundColor: `${outlet.color}22`, borderColor: outlet.color }}
                      className="p-1.5 rounded-xl border shadow-lg backdrop-blur flex items-center gap-1 text-[10px] font-bold text-white"
                    >
                      <MapPin className="w-3.5 h-3.5" style={{ color: outlet.color }} />
                      <span className="hidden sm:inline">{outlet.name}</span>
                    </div>
                  </div>
                );
              })}

              {/* Rider Live GPS Pins */}
              {partners.map((p) => {
                const loc = p.location || { lat: 28.45, lng: 77.32 };
                const { x, y } = getCanvasCoords(loc.lat, loc.lng);
                const isSel = p.id === selectedPartnerId;

                return (
                  <div
                    key={p.id}
                    style={{ left: `${x}%`, top: `${y}%` }}
                    onClick={() => setSelectedPartnerId(p.id)}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-700 cursor-pointer z-20 ${
                      isSel ? 'scale-110 z-30' : 'opacity-85 hover:opacity-100'
                    }`}
                  >
                    {/* Radar Pulse Effect */}
                    <div className={`absolute -inset-3 rounded-full animate-ping opacity-30 ${
                      p.status === 'on_delivery' ? 'bg-amber-400' : 'bg-emerald-400'
                    }`} />

                    <div className={`p-2 rounded-2xl border shadow-2xl backdrop-blur flex items-center gap-2 ${
                      isSel
                        ? 'bg-purple-900/90 border-purple-400 text-white ring-4 ring-purple-500/30'
                        : 'bg-[#0e122b]/90 border-indigo-800 text-slate-200'
                    }`}>
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                        p.status === 'on_delivery' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-slate-950'
                      }`}>
                        <Truck className="w-4 h-4" />
                      </div>

                      <div className="pr-1 text-left">
                        <div className="text-[11px] font-extrabold leading-tight text-white">{p.name}</div>
                        <div className="text-[9px] font-mono text-purple-300">
                          {loc.speed ? `${loc.speed} km/h` : 'Stopped'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Status Card */}
            {activePartner && (
              <div className="relative z-10 bg-[#0c0f24]/95 border border-indigo-900/80 p-3.5 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-extrabold text-white flex items-center gap-2">
                      <span>{activePartner.name} ({activePartner.login_id})</span>
                      <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                        LAT: {activePartner.location?.lat.toFixed(4) || '28.4520'} • LNG: {activePartner.location?.lng.toFixed(4) || '77.3180'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Vehicle: {activePartner.vehicle || 'Standard Bike'} • Total Deliveries Completed: <strong>{activePartner.total_deliveries}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-purple-300 bg-purple-950/80 border border-purple-800 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    Live Android Geolocation Tracker Active
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
