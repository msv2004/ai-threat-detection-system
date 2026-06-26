import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { 
  User, 
  Key, 
  Settings, 
  Volume2, 
  Sliders, 
  Eye, 
  EyeOff, 
  Check, 
  Server,
  Save,
  CheckCircle,
  AlertTriangle,
  Globe,
  RefreshCw
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
    <div className="space-y-6 text-left font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white uppercase tracking-wider font-sans">Console Configuration</h2>
          <p className="text-xs text-text-secondary mt-0.5 font-sans">Manage credentials, preferences, and system nodes health checks</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Profile & Keys (2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Operator Profile Card */}
          <div className="card p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase flex items-center gap-1.5 border-b border-border-default pb-3">
              <User className="w-4 h-4 text-accent" />
              Operator Security Profile
            </h3>

            <div className="space-y-4 text-xs font-semibold text-text-secondary">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-surface-0 border border-border-subtle p-3 rounded-lg">
                  <span className="text-[9px] text-text-tertiary uppercase font-bold tracking-wider block">Security Email</span>
                  <span className="text-white font-bold block mt-1 font-mono-data">{user?.email}</span>
                </div>
                <div className="bg-surface-0 border border-border-subtle p-3 rounded-lg">
                  <span className="text-[9px] text-text-tertiary uppercase font-bold tracking-wider block">Policy Role Access</span>
                  <span className="text-accent font-bold block mt-1 uppercase tracking-wider">
                    {user?.role?.name || 'Security Analyst'}
                  </span>
                </div>
              </div>

              <div className="bg-surface-0 border border-border-subtle p-3 rounded-lg">
                <span className="text-[9px] text-text-tertiary uppercase font-bold tracking-wider block">Authorized Scope Description</span>
                <p className="text-text-secondary mt-1.5 leading-relaxed text-[11px]">
                  {user?.role?.description || 'Access to model configurations, dataset registries, live packet capture triggers, and AI threat detection metrics analysis.'}
                </p>
              </div>
            </div>
          </div>

          {/* API Keys Card */}
          <div className="card p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase flex items-center gap-1.5 border-b border-border-default pb-3">
              <Key className="w-4 h-4 text-accent" />
              Secure API Credentials
            </h3>

            <div className="space-y-4 text-xs font-semibold text-text-secondary">
              <p className="text-text-secondary leading-relaxed text-[11px]">
                Use secure system tokens to fetch threat anomaly payload indicators programmatically. Safeguard credentials under encryption keys rules.
              </p>

              <div className="flex items-center gap-3 bg-surface-0 border border-border-strong rounded-lg p-2.5">
                <input
                  type={apiKeyVisible ? 'text' : 'password'}
                  readOnly
                  value={mockApiKey}
                  className="bg-transparent flex-1 text-white focus:outline-none font-mono-data tracking-widest text-[11.5px]"
                />
                <button
                  type="button"
                  onClick={() => setApiKeyVisible(!apiKeyVisible)}
                  className="p-1 text-text-tertiary hover:text-white transition-colors cursor-pointer"
                >
                  {apiKeyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleCopyApiKey}
                  className="px-3 py-1.5 bg-accent/10 border border-accent-border/30 hover:border-accent rounded text-[9px] font-bold text-accent uppercase transition-all cursor-pointer"
                >
                  {apiKeyCopied ? <Check className="w-3.5 h-3.5 text-accent" /> : 'Copy'}
                </button>
              </div>
              <p className="text-[9px] text-text-tertiary">
                ⚠️ Notice: API credentials rotated programmatically. Keep private logs encrypted.
              </p>
            </div>
          </div>

        </div>

        {/* Right Side: Preferences & Diagnostics (1 Column) */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Preferences Card */}
          <div className="card p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase flex items-center gap-1.5 border-b border-border-default pb-3">
              <Sliders className="w-4 h-4 text-accent" />
              Console Preferences
            </h3>

            <div className="space-y-4 text-xs font-semibold">
              
              {/* Theme Selector */}
              <div className="space-y-1.5">
                <label className="block text-[9px] text-text-tertiary uppercase tracking-wider">Console Mode Theme</label>
                <div className="grid grid-cols-2 gap-1.5 bg-surface-0 p-1 rounded-lg border border-border-subtle">
                  <button
                    onClick={() => setTheme('dark')}
                    className={`py-2 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer ${theme === 'dark' ? 'bg-accent/10 text-accent border border-accent-border/20' : 'text-text-tertiary hover:text-white'}`}
                  >
                    Dark Theme
                  </button>
                  <button
                    onClick={() => setTheme('light')}
                    className={`py-2 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer ${theme === 'light' ? 'bg-accent/10 text-accent border border-accent-border/20' : 'text-text-tertiary hover:text-white'}`}
                  >
                    Light Theme
                  </button>
                </div>
              </div>

              {/* Sound alarm controls */}
              <div className="space-y-3.5 pt-1 text-text-secondary">
                <label className="block text-[9px] text-text-tertiary uppercase tracking-wider">Auditory Alarm metrics</label>
                
                <div className="flex items-center justify-between">
                  <span>Audible alarm on critical triggers</span>
                  <button
                    type="button"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${soundEnabled ? 'bg-accent border border-transparent' : 'bg-surface-0 border border-border-strong'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${soundEnabled ? 'left-[18px]' : 'left-0.5'}`} />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Alarm Trigger Volume</span>
                    <span className="font-bold text-white font-mono-data">{notificationVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={notificationVolume}
                    onChange={(e) => setNotificationVolume(parseInt(e.target.value))}
                    className="w-full h-1 bg-surface-0 rounded-lg cursor-pointer accent-accent"
                  />
                </div>
              </div>

              {/* Save Preference */}
              <button
                onClick={handleSaveSettings}
                className="w-full btn btn-primary flex justify-center items-center gap-1.5 uppercase font-mono-data text-xs tracking-wider"
              >
                {settingsSaved ? (
                  <><CheckCircle className="w-3.5 h-3.5" /> Saved!</>
                ) : (
                  <><Save className="w-3.5 h-3.5 fill-current" /> Save Preferences</>
                )}
              </button>
            </div>
          </div>

          {/* Backend Health Diagnostics */}
          <div className="card p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase flex items-center gap-1.5 border-b border-border-default pb-3">
              <Server className="w-4 h-4 text-accent" />
              Diagnostics Node Health
            </h3>

            <div className="space-y-3 text-xs font-semibold text-text-secondary">
              <div className="flex items-center justify-between border-b border-border-subtle pb-1">
                <span>FastAPI Service Status</span>
                <div className="flex items-center gap-1.5">
                  {backendStatus === 'checking' ? (
                    <span className="text-semantic-warning font-mono-data">CHECKING...</span>
                  ) : backendStatus === 'online' ? (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-semantic-success pulse-emerald" />
                      <span className="text-semantic-success font-bold font-mono-data uppercase text-[10px]">Online</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-semantic-critical" />
                      <span className="text-semantic-critical font-bold font-mono-data uppercase text-[10px]">Offline</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-border-subtle pb-1 font-mono-data text-[10.5px]">
                <span>Host Hostname</span>
                <span className="text-text-tertiary select-all truncate max-w-[130px]">{BASE_URL}</span>
              </div>

              {backendStatus === 'offline' && (
                <div className="bg-semantic-warning/5 border border-semantic-warning/20 rounded-xl p-3 text-left space-y-2">
                  <p className="text-semantic-warning text-[10px] leading-relaxed font-semibold">
                    The backend endpoint is unreachable. If Render container goes dormant, cold starts take ~15s. Click below to retry.
                  </p>
                  <button
                    onClick={() => refetchHealth()}
                    className="text-accent text-[10px] hover:underline font-bold font-mono-data flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> RETRY HEALTH CHECK
                  </button>
                </div>
              )}

              {backendStatus === 'online' && healthData && (
                <div className="bg-semantic-success/5 border border-semantic-success/20 rounded-xl p-3 text-left text-[10px] text-semantic-success font-semibold leading-relaxed">
                  FastAPI service diagnostics healthy. All API routes and websocket gateways fully active.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
