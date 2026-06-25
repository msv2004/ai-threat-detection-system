import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
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
  FileText
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [theme, setTheme] = useState('dark');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationVolume, setNotificationVolume] = useState(80);
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);

  const mockApiKey = 'aes_soc_live_cf83c162dae83f51a27e8293bd3a61f2';

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(mockApiKey);
    setApiKeyCopied(true);
    setTimeout(() => setApiKeyCopied(false), 2000);
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wider uppercase m-0 leading-none">System Settings</h1>
          <span className="text-[10px] text-white/40 tracking-widest mt-1 block">MANAGE OPERATOR PROFILES & AUDIT SHELL SETTINGS</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Profile & Keys (2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Operator Profile Card */}
          <div className="glass-panel p-5 rounded-xl border border-white/5 space-y-4">
            <h3 className="text-xs font-bold text-white tracking-widest uppercase border-b border-white/5 pb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-[#06b6d4]" />
              Operator Security Profile
            </h3>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-[9px] text-white/40 uppercase block">SECURITY EMAIL ADDRESS</span>
                  <span className="text-white font-bold block mt-1">{user?.email}</span>
                </div>
                <div>
                  <span className="text-[9px] text-white/40 uppercase block">ASSIGNED POLICY ROLE</span>
                  <span className="text-cyan-400 font-bold block mt-1">
                    {user?.role?.name || 'Security Analyst'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[9px] text-white/40 uppercase block">ROLE DELEGATED SCOPE</span>
                <p className="text-white/60 mt-1 leading-relaxed text-[11px]">
                  {user?.role?.description || 'Access to model configurations, dataset registries, live packet capture triggers, and AI threat detection metrics analysis.'}
                </p>
              </div>
            </div>
          </div>

          {/* API Keys Card (Future) */}
          <div className="glass-panel p-5 rounded-xl border border-white/5 space-y-4">
            <h3 className="text-xs font-bold text-white tracking-widest uppercase border-b border-white/5 pb-3 flex items-center gap-2">
              <Key className="w-4 h-4 text-[#06b6d4]" />
              Secure API Credentials
            </h3>

            <div className="space-y-4 text-xs">
              <p className="text-white/50 text-[11px] leading-relaxed">
                Use your system access keys to query ML threat detection classification streams programmatically. Keep keys secure.
              </p>

              <div className="flex items-center gap-2 bg-[#070b13] border border-white/10 rounded-lg p-2.5">
                <input
                  type={apiKeyVisible ? 'text' : 'password'}
                  readOnly
                  value={mockApiKey}
                  className="bg-transparent flex-1 text-white focus:outline-none font-mono tracking-wider text-[11px]"
                />
                <button
                  onClick={() => setApiKeyVisible(!apiKeyVisible)}
                  className="p-1 text-white/40 hover:text-white"
                >
                  {apiKeyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleCopyApiKey}
                  className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 hover:border-cyan-500/50 rounded text-[9px] font-bold text-[#06b6d4] uppercase"
                >
                  {apiKeyCopied ? <Check className="w-3.5 h-3.5" /> : 'Copy'}
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Visual Toggles & Settings (1 column) */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Preferences Card */}
          <div className="glass-panel p-5 rounded-xl border border-white/5 space-y-4">
            <h3 className="text-xs font-bold text-white tracking-widest uppercase border-b border-white/5 pb-3 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#06b6d4]" />
              SOC Console Preferences
            </h3>

            <div className="space-y-4 text-xs">
              
              {/* Theme Selector */}
              <div>
                <label className="block text-[10px] text-white/40 mb-1.5 uppercase tracking-wider">DASHBOARD GRAPHICAL STATE</label>
                <div className="grid grid-cols-2 gap-2 bg-[#070b13] p-1 rounded-lg border border-white/5">
                  <button
                    onClick={() => setTheme('dark')}
                    className={`text-center py-1.5 rounded text-[10px] uppercase font-bold transition-colors ${theme === 'dark' ? 'bg-cyan-500/10 text-[#06b6d4]' : 'text-white/40 hover:text-white'}`}
                  >
                    Operator Dark
                  </button>
                  <button
                    onClick={() => setTheme('light')}
                    className={`text-center py-1.5 rounded text-[10px] uppercase font-bold transition-colors ${theme === 'light' ? 'bg-cyan-500/10 text-[#06b6d4]' : 'text-white/40 hover:text-white'}`}
                  >
                    Console Light
                  </button>
                </div>
              </div>

              {/* Notification Toggles */}
              <div className="space-y-3 pt-2">
                <label className="block text-[10px] text-white/40 uppercase tracking-wider">ANOMALY WARNING TRIGGERS</label>
                
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Critical threat sound alarm</span>
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={(e) => setSoundEnabled(e.target.checked)}
                    className="w-4 h-4 accent-cyan-500 rounded focus:ring-0 bg-[#070b13] border-white/10"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-white/60">
                    <span>Alarm broadcast volume</span>
                    <span>{notificationVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={notificationVolume}
                    onChange={(e) => setNotificationVolume(parseInt(e.target.value))}
                    className="w-full accent-cyan-500 h-1 bg-[#070b13] rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Server metrics */}
              <div className="pt-4 border-t border-white/5 space-y-2">
                <label className="block text-[10px] text-white/40 uppercase tracking-wider">API SERVER CONTEXT</label>
                <div className="flex items-center gap-2 text-emerald-400">
                  <Server className="w-4 h-4" />
                  <span>ONLINE • Local host: 8000</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
