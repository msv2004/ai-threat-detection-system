import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { 
  User, 
  Key, 
  Settings, 
  Volume2, 
  Sliders, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Check, 
  Server,
  FileText,
  Wifi,
  WifiOff,
  CheckCircle,
  XCircle,
  Save,
} from 'lucide-react';

const SETTINGS_KEY = 'aegis_soc_settings';

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function SettingsPage() {
  const { user } = useAuthStore();
  
  // Load persisted settings from localStorage
  const saved = loadSettings();
  const [theme, setTheme] = useState<'dark' | 'light'>(saved?.theme || 'dark');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(saved?.soundEnabled ?? true);
  const [notificationVolume, setNotificationVolume] = useState<number>(saved?.notificationVolume ?? 80);
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const mockApiKey = 'aes_soc_live_cf83c162dae83f51a27e8293bd3a61f2';

  // Persist settings on change
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ theme, soundEnabled, notificationVolume }));
  }, [theme, soundEnabled, notificationVolume]);

  const handleSaveSettings = () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ theme, soundEnabled, notificationVolume }));
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(mockApiKey);
    setApiKeyCopied(true);
    setTimeout(() => setApiKeyCopied(false), 2000);
  };

  // Backend health check
  const BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';
  const { data: healthData, isLoading: isHealthLoading, isError: isHealthError, refetch: refetchHealth } = useQuery({
    queryKey: ['health_check'],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/health`);
      if (!res.ok) throw new Error('unhealthy');
      return res.json();
    },
    retry: 1,
    refetchInterval: 30000, // check every 30s
    staleTime: 10000,
  });

  const backendStatus = isHealthLoading ? 'checking' : isHealthError ? 'offline' : 'online';

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">System Settings</h1>
          <p className="text-text-secondary text-sm mt-1">Manage your operator profile, console preferences, and system configuration.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Profile & Keys (2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Operator Profile Card */}
          <div className="card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 border-b border-border-subtle pb-3">
              <User className="w-4 h-4 text-accent" />
              Operator Security Profile
            </h3>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-[9px] text-text-tertiary uppercase font-semibold block">Security Email</span>
                  <span className="text-text-primary font-semibold block mt-1">{user?.email}</span>
                </div>
                <div>
                  <span className="text-[9px] text-text-tertiary uppercase font-semibold block">Policy Role</span>
                  <span className="text-accent font-semibold block mt-1">
                    {user?.role?.name || 'Security Analyst'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[9px] text-text-tertiary uppercase font-semibold block">Role Scope</span>
                <p className="text-text-secondary mt-1 leading-relaxed text-[11px]">
                  {user?.role?.description || 'Access to model configurations, dataset registries, live packet capture triggers, and AI threat detection metrics analysis.'}
                </p>
              </div>
            </div>
          </div>

          {/* API Keys Card */}
          <div className="card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 border-b border-border-subtle pb-3">
              <Key className="w-4 h-4 text-accent" />
              Secure API Credentials
            </h3>

            <div className="space-y-4 text-xs">
              <p className="text-text-secondary text-[11px] leading-relaxed">
                Use your system access keys to query ML threat detection classification streams programmatically. Keep keys secure and do not share them publicly.
              </p>

              <div className="flex items-center gap-2 bg-surface-0 border border-border-subtle rounded-lg p-2.5">
                <input
                  type={apiKeyVisible ? 'text' : 'password'}
                  readOnly
                  value={mockApiKey}
                  className="bg-transparent flex-1 text-text-primary focus:outline-none font-mono tracking-wider text-[11px]"
                />
                <button
                  onClick={() => setApiKeyVisible(!apiKeyVisible)}
                  className="p-1 text-text-tertiary hover:text-text-primary transition-colors"
                >
                  {apiKeyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleCopyApiKey}
                  className="px-3 py-1 bg-accent/10 border border-accent/30 hover:border-accent/50 rounded text-[9px] font-bold text-accent uppercase transition-colors"
                >
                  {apiKeyCopied ? <Check className="w-3.5 h-3.5" /> : 'Copy'}
                </button>
              </div>
              <p className="text-[10px] text-text-tertiary">
                ⚠️ This is a demonstration key. Full API key management (create/rotate/revoke) is coming in a future release.
              </p>
            </div>
          </div>

        </div>

        {/* Right Side: Visual Toggles & Settings (1 column) */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Preferences Card */}
          <div className="card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 border-b border-border-subtle pb-3">
              <Sliders className="w-4 h-4 text-accent" />
              Console Preferences
            </h3>

            <div className="space-y-4 text-xs">
              
              {/* Theme Selector */}
              <div>
                <label className="block text-[10px] text-text-tertiary mb-1.5 uppercase tracking-wider font-semibold">Interface Theme</label>
                <div className="grid grid-cols-2 gap-2 bg-surface-0 p-1 rounded-lg border border-border-subtle">
                  <button
                    onClick={() => setTheme('dark')}
                    className={`text-center py-2 rounded-md text-[10px] font-semibold transition-colors ${theme === 'dark' ? 'bg-accent/10 text-accent border border-accent/30' : 'text-text-tertiary hover:text-text-primary'}`}
                  >
                    Dark Mode
                  </button>
                  <button
                    onClick={() => setTheme('light')}
                    className={`text-center py-2 rounded-md text-[10px] font-semibold transition-colors ${theme === 'light' ? 'bg-accent/10 text-accent border border-accent/30' : 'text-text-tertiary hover:text-text-primary'}`}
                  >
                    Light Mode
                  </button>
                </div>
                {theme === 'light' && (
                  <p className="text-[10px] text-amber-400 mt-1.5">Light mode is persisted but visual theming requires full CSS variable implementation.</p>
                )}
              </div>

              {/* Notification Toggles */}
              <div className="space-y-3 pt-1">
                <label className="block text-[10px] text-text-tertiary uppercase tracking-wider font-semibold">Alert Preferences</label>
                
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Critical threat sound alarm</span>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${soundEnabled ? 'bg-accent' : 'bg-surface-2 border border-border-default'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${soundEnabled ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-text-secondary">
                    <span>Alarm volume</span>
                    <span className="font-semibold text-text-primary">{notificationVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={notificationVolume}
                    onChange={(e) => setNotificationVolume(parseInt(e.target.value))}
                    className="w-full h-1.5 rounded-lg cursor-pointer accent-accent bg-surface-0"
                  />
                </div>
              </div>

              {/* Save button */}
              <button
                onClick={handleSaveSettings}
                className="w-full flex items-center justify-center gap-2 bg-accent/10 hover:bg-accent/20 border border-accent/30 hover:border-accent/50 text-accent py-2 rounded-lg text-xs font-semibold transition-all"
              >
                {settingsSaved ? (
                  <><CheckCircle className="w-3.5 h-3.5" /> Saved!</>
                ) : (
                  <><Save className="w-3.5 h-3.5" /> Save Preferences</>
                )}
              </button>
            </div>
          </div>

          {/* Backend Health Card */}
          <div className="card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 border-b border-border-subtle pb-3">
              <Server className="w-4 h-4 text-accent" />
              Backend Connection
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">API Server Status</span>
                <div className="flex items-center gap-1.5">
                  {backendStatus === 'checking' ? (
                    <span className="text-amber-400 font-semibold">Checking...</span>
                  ) : backendStatus === 'online' ? (
                    <>
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="text-emerald-400 font-semibold">Online</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-red-400 rounded-full" />
                      <span className="text-red-400 font-semibold">Offline</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-text-secondary">API Endpoint</span>
                <span className="text-text-tertiary font-mono text-[10px] truncate max-w-[130px]">{BASE_URL}</span>
              </div>

              {backendStatus === 'offline' && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                  <p className="text-amber-400 text-[10px] leading-relaxed">
                    The backend is unreachable. If deployed on Render.com free tier, cold start takes ~15 seconds. Retry in a moment.
                  </p>
                  <button
                    onClick={() => refetchHealth()}
                    className="mt-2 text-accent text-[10px] hover:underline font-semibold"
                  >
                    Check Again
                  </button>
                </div>
              )}

              {backendStatus === 'online' && healthData && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                  <p className="text-emerald-400 text-[10px]">
                    Backend is healthy and responsive. All API endpoints available.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
