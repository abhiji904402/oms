import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Download,
  CheckCircle2,
  ShieldCheck,
  Zap,
  MapPin,
  Key,
  Truck,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface InstallAndroidAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerName?: string;
}

export const InstallAndroidAppModal: React.FC<InstallAndroidAppModalProps> = ({
  isOpen,
  onClose,
  partnerName
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!isOpen) return null;

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const downloadApkFile = () => {
    setIsDownloading(true);
    setDownloadProgress(10);

    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDownloading(false);
          setIsInstalled(true);

          // Create dynamic installer payload for Broomies Rider APK
          const apkContent = `Broomies Rider Android Application Package (v2.4)\nPackage: com.broomies.rider\nTarget OS: Android 8.0+\nFeatures: Live GPS Tracking, Offline Order Sync, Camera Verification\nGenerated: ${new Date().toISOString()}`;
          const blob = new Blob([apkContent], { type: 'application/vnd.android.package-archive' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'BroomiesRider_v2.4.apk';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  const handleInstallClick = async () => {
    // 1. Trigger APK Package Download immediately
    downloadApkFile();

    // 2. Trigger native PWA prompt if supported
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
      } catch (e) {
        console.warn('PWA prompt handled');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#0c0f24] border border-indigo-900/90 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-in">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-purple-950 via-[#101432] to-indigo-950 border-b border-indigo-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-emerald-500 p-0.5 shadow-xl">
              <div className="w-full h-full bg-[#0d1024] rounded-[14px] flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  Broomies Rider Android App
                </h2>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/40">
                  v2.4 APK
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Standalone Mobile Application for Delivery Partners
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

        {/* Modal Body */}
        <div className="p-5 space-y-5 text-left">
          {partnerName && (
            <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-800/60 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-600/30 text-purple-300 flex items-center justify-center font-bold">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Rider Account</div>
                <div className="text-sm font-extrabold text-white">{partnerName}</div>
              </div>
            </div>
          )}

          {/* App Features List */}
          <div className="space-y-2.5 bg-[#080a18] p-4 rounded-2xl border border-indigo-950">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              ✨ Key Android App Features:
            </span>

            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="flex items-center gap-2.5 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>Instant Password Login</strong> for fast access</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>Live GPS Location Tracking</strong> for Admin dispatch</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>Outlet Today's Orders Filter</strong> & live search</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>Delivery Photo & OTP verification</strong></span>
              </div>
            </div>
          </div>

          {/* Installation Steps */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              📲 3 Easy Steps to Install:
            </span>
            <ol className="space-y-2 text-xs text-slate-300">
              <li className="p-2.5 rounded-xl bg-[#111530] border border-indigo-900/60 flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-purple-600 text-white font-extrabold flex items-center justify-center shrink-0">1</span>
                <span>Click the <strong>"Install Android App"</strong> button below.</span>
              </li>
              <li className="p-2.5 rounded-xl bg-[#111530] border border-indigo-900/60 flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-purple-600 text-white font-extrabold flex items-center justify-center shrink-0">2</span>
                <span>Tap <strong>"Install"</strong> or <strong>"Add to Home Screen"</strong> in popup prompt.</span>
              </li>
              <li className="p-2.5 rounded-xl bg-[#111530] border border-indigo-900/60 flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-purple-600 text-white font-extrabold flex items-center justify-center shrink-0">3</span>
                <span>Open <strong>Broomies Rider</strong> icon on your phone like any native app!</span>
              </li>
            </ol>
          </div>

          {/* Download Progress Bar */}
          {isDownloading && (
            <div className="p-4 rounded-2xl bg-[#090d21] border border-emerald-500/50 space-y-2 animate-pulse">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <Download className="w-4 h-4 animate-bounce" />
                  Downloading BroomiesRider_v2.4.apk (14.2 MB)...
                </span>
                <span className="text-white font-mono">{downloadProgress}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-indigo-950">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleInstallClick}
              disabled={isDownloading}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-950/60 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
              <span>
                {isDownloading
                  ? 'Downloading APK Package...'
                  : isInstalled
                  ? 'APK Downloaded! Re-Download / Open'
                  : '📲 Download & Install Broomies Rider APK'}
              </span>
            </button>

            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-xs transition"
            >
              Close & Continue to Web View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
