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
  ExternalLink,
  FileCode,
  Globe
} from 'lucide-react';
import { generateAndroidAppBundle, generateDirectApkFile } from '../utils/apkGenerator';

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
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

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

  const handleDownloadDirectApk = async () => {
    setIsDownloading(true);
    setDownloadProgress(20);

    try {
      const apkBlob = await generateDirectApkFile('https://broms.vercel.app');
      setDownloadProgress(80);

      // Trigger Direct .APK Download
      const url = URL.createObjectURL(apkBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'BroomiesRider_v2.4_broms_vercel_app.apk';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadProgress(100);
      setTimeout(() => {
        setIsDownloading(false);
        setIsInstalled(true);
      }, 400);
    } catch (err) {
      console.error('APK generation error:', err);
      setIsDownloading(false);
    }

    // Trigger PWA install prompt if supported
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

  const handleDownloadSourceZip = async () => {
    setIsDownloading(true);
    setDownloadProgress(30);

    try {
      const zipBlob = await generateAndroidAppBundle('https://broms.vercel.app');
      setDownloadProgress(90);

      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'BroomiesRider_AndroidStudio_Project_broms_vercel_app.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadProgress(100);
      setTimeout(() => {
        setIsDownloading(false);
      }, 400);
    } catch (err) {
      console.error('ZIP generation error:', err);
      setIsDownloading(false);
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

          {/* Vercel Target Badge */}
          <div className="p-3.5 rounded-2xl bg-indigo-950/60 border border-indigo-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Globe className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">Live Vercel Web App Applet</div>
                <div className="text-xs font-mono font-extrabold text-emerald-400">https://broms.vercel.app</div>
              </div>
            </div>
            <a
              href="https://broms.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-indigo-900/80 hover:bg-indigo-800 text-indigo-200 text-xs font-bold flex items-center gap-1 transition"
            >
              <span>Visit</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* App Features List */}
          <div className="space-y-2.5 bg-[#080a18] p-4 rounded-2xl border border-indigo-950">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              ✨ Key Android App Package Features:
            </span>

            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="flex items-center gap-2.5 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>Full Android Studio Source Code</strong> (MainActivity.java + AndroidManifest.xml)</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>Target Endpoint:</strong> Pre-configured for <code>broms.vercel.app</code></span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>Full Permissions:</strong> GPS Live Tracking, Camera, File Upload, Offline Sync</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>PWA 1-Tap Home Screen Install</strong> directly on Android Chrome</span>
              </div>
            </div>
          </div>

          {/* Installation Steps */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              📲 2 Easy Installation Options:
            </span>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-[#111530] border border-indigo-900/60 space-y-1">
                <div className="font-extrabold text-emerald-400 flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  Option 1: Direct Mobile Install (Recommended for Rider Phone)
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Open <strong>https://broms.vercel.app</strong> on Android Chrome, tap menu (3 dots top-right) and select <strong>"Add to Home Screen" / "Install App"</strong>. It installs as a full native app instantly!
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#111530] border border-indigo-900/60 space-y-1">
                <div className="font-extrabold text-purple-400 flex items-center gap-1.5">
                  <FileCode className="w-4 h-4" />
                  Option 2: Download Full Android Studio APK WebApp Project (.ZIP)
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Click the button below to download the complete Android Studio WebView code package (containing <code>MainActivity.java</code>, <code>AndroidManifest.xml</code>, <code>build.gradle</code>) targeted at <strong>broms.vercel.app</strong>!
                </p>
              </div>
            </div>
          </div>

          {/* Download Progress Bar */}
          {isDownloading && (
            <div className="p-4 rounded-2xl bg-[#090d21] border border-emerald-500/50 space-y-2 animate-pulse">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <Download className="w-4 h-4 animate-bounce" />
                  Building & Downloading BroomiesRider_v2.4_broms_vercel_app.apk...
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
          <div className="space-y-2.5 pt-2">
            <button
              onClick={handleDownloadDirectApk}
              disabled={isDownloading}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-xl shadow-emerald-950/60 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
            >
              <Download className="w-5 h-5 text-emerald-200 animate-pulse" />
              <span>
                {isDownloading
                  ? 'Generating Direct APK File...'
                  : isInstalled
                  ? '📲 Re-Download Direct APK File (broms.vercel.app)'
                  : '📲 Download Direct APK File (BroomiesRider_v2.4.apk)'}
              </span>
            </button>

            <button
              onClick={handleDownloadSourceZip}
              disabled={isDownloading}
              className="w-full py-2.5 px-4 rounded-xl bg-purple-950/70 hover:bg-purple-900/80 text-purple-200 border border-purple-800/60 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
            >
              <FileCode className="w-4 h-4 text-purple-400" />
              <span>📦 Download Android Studio Source Code Project (.ZIP)</span>
            </button>

            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-xs transition"
            >
              Close & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
