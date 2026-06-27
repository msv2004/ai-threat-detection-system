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
  RefreshCw,
  Monitor,
  Shield,
  Lock,
  Cpu,
  Database,
  Terminal
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
  
  const saved = loadSettings();
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>(saved?.theme || 'dark');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(saved?.soundEnabled ?? true);
  const [notificationVolume, setNotificationVolume] = useState<number>(saved?.notificationVolume ?? 80);
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('command');
  const [logRetention, setLogRetention] = useState('180');
  const [exportFormat, setExportFormat] = useState('json');
  const [timezone, setTimezone] = useState('UTC');

  const mockApiKey = 'aes_soc_live_cf83c162dae83f51a27e8293bd3a61f2';

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
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const { data: healthData, isLoading: isHealthLoading, isError: isHealthError, refetch: refetchHealth } = useQuery({
    queryKey: ['health_check'],
    queryFn: async () => {
      const res = await fetch(`${apiUrl}/api/v1/health`);
      if (!res.ok) throw new Error('Backend unreachable');
      return res.json();
    },
    retry: 1,
    refetchInterval: 30000,
  });

  const tabs = [
    { id: 'command', label: 'Command Center', icon: Monitor },
    { id: 'detection', label: 'Detection Policy', icon: Shield },
    { id: 'identity', label: 'Identity & Access', icon: Lock },
    { id: 'integrations', label: 'Integrations', icon: Cpu },
  ];

  const retentionHealth = [
    { label: 'Hot telemetry', value: 72, color: '#6366f1' },
    { label: 'Archived evidence', value: 44, color: '#00e676' },
    { label: 'Cold storage', value: 28, color: '#f97316' },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl text-white heading-display tracking-wider">SOC Control Center</h2>
          <p className="text-sm text-text-secondary mt-0.5">Configure detections, retention, identity controls, escalation paths, and SIEM integrations.</p>
        </div>
        <div className="flex items-center gap-3">
          {[
            { label: 'AUDIT EVENTS', value: '18.4K' },
            { label: 'TOKEN SCOPE', value: 'Least privilege' },
            { label: 'RETENTION', value: `${logRetention}d` },
          ].map(stat => (
            <div key={stat.label} className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-2 text-center">
              <div className="text-[9px] text-text-secondary uppercase tracking-wider font-bold">{stat.label}</div>
              <div className="text-sm font-bold text-white mt-0.5 font-mono-data">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-white/[0.06] pb-px">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'text-accent border-accent bg-accent/5'
                  : 'text-text-secondary border-transparent hover:text-text-primary hover:bg-white/[0.04]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Content - 2 cols */}
        <div className="xl:col-span-2 space-y-6">
          {activeTab === 'command' && (
            <>
              {/* Workspace & Theme */}
              <div className="card-static p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Monitor className="w-4 h-4 text-accent" />
                  <h3 className="text-base text-white heading-display tracking-wider">Workspace & Theme</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Theme Mode */}
                  <div>
                    <label className="block text-xs text-text-secondary mb-2 font-medium">Theme Mode</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['light', 'dark', 'system'] as const).map(t => (
                        <button
                          key={t}
                          onClick={() => setTheme(t)}
                          className={`py-2.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                            theme === t
                              ? 'bg-accent text-white font-bold'
                              : 'bg-white/[0.02] text-text-secondary border border-white/[0.08] hover:border-white/20'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Timezone */}
                  <div>
                    <label className="block text-xs text-text-secondary mb-2 font-medium">SOC Timezone</label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="input rounded-xl"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern (ET)</option>
                      <option value="America/Chicago">Central (CT)</option>
                      <option value="America/Los_Angeles">Pacific (PT)</option>
                      <option value="Europe/London">London (GMT)</option>
                      <option value="Asia/Kolkata">India (IST)</option>
                    </select>
                  </div>

                  {/* Log Retention */}
                  <div>
                    <label className="block text-xs text-text-secondary mb-2 font-medium">Log Retention</label>
                    <select
                      value={logRetention}
                      onChange={(e) => setLogRetention(e.target.value)}
                      className="input rounded-xl"
                    >
                      <option value="30">30 days</option>
                      <option value="90">90 days</option>
                      <option value="180">180 days</option>
                      <option value="365">365 days</option>
                    </select>
                  </div>

                  {/* Export Format */}
                  <div>
                    <label className="block text-xs text-text-secondary mb-2 font-medium">Evidence Export Format</label>
                    <select
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value)}
                      className="input rounded-xl"
                    >
                      <option value="json">JSON bundle</option>
                      <option value="csv">CSV export</option>
                      <option value="pcap">PCAP archive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* API Key & Connectivity */}
              <div className="card-static p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Key className="w-4 h-4 text-accent" />
                  <h3 className="text-base text-white heading-display tracking-wider">API Credentials</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-text-secondary mb-2 font-medium">API Key</label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-black/30 border border-white/[0.08] rounded-xl px-4 py-2.5 font-mono-data text-sm text-text-secondary">
                        {apiKeyVisible ? mockApiKey : '•'.repeat(40)}
                      </div>
                      <button
                        onClick={() => setApiKeyVisible(!apiKeyVisible)}
                        className="btn btn-ghost btn-sm rounded-xl"
                      >
                        {apiKeyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={handleCopyApiKey}
                        className="btn btn-secondary btn-sm"
                      >
                        {apiKeyCopied ? <Check className="w-4 h-4 text-semantic-success" /> : 'Copy'}
                      </button>
                    </div>
                  </div>

                  {/* Backend connectivity */}
                  <div>
                    <label className="block text-xs text-text-secondary mb-2 font-medium">Backend Endpoint</label>
                    <div className="flex items-center gap-3 p-3 bg-black/30 rounded-xl border border-white/[0.06]">
                      <div className={`w-2.5 h-2.5 rounded-full ${isHealthError ? 'bg-semantic-critical pulse-red' : 'bg-semantic-success pulse-emerald'}`} />
                      <span className="font-mono-data text-xs text-text-secondary flex-1">{apiUrl}</span>
                      {isHealthLoading ? (
                        <RefreshCw className="w-3.5 h-3.5 text-text-secondary animate-spin" />
                      ) : isHealthError ? (
                        <span className="text-[10px] text-semantic-critical font-bold">Unreachable</span>
                      ) : (
                        <span className="text-[10px] text-semantic-success font-bold">Connected</span>
                      )}
                      <button onClick={() => refetchHealth()} className="p-1.5 hover:bg-white/[0.05] rounded-xl transition-colors">
                        <RefreshCw className="w-3.5 h-3.5 text-text-secondary" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile */}
              <div className="card-static p-6">
                <div className="flex items-center gap-2 mb-5">
                  <User className="w-4 h-4 text-accent" />
                  <h3 className="text-base text-white heading-display tracking-wider">Profile</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-text-secondary mb-2 font-medium">Email</label>
                    <div className="bg-black/30 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-text-secondary font-mono-data">
                      {user?.email || 'Not set'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-text-secondary mb-2 font-medium">Role</label>
                    <div className="bg-black/30 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-text-secondary">
                      {user?.role?.name || 'Security Analyst'}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'detection' && (
            <div className="card-static p-6">
              <div className="flex items-center gap-2 mb-5">
                <Shield className="w-4 h-4 text-accent" />
                <h3 className="text-base text-white heading-display tracking-wider">Detection Policy</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-text-secondary mb-2 font-medium">Alert Threshold</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range" min="0" max="100"
                      value={notificationVolume}
                      onChange={(e) => setNotificationVolume(parseInt(e.target.value))}
                      className="flex-1 h-1.5 bg-white/[0.05] rounded-xl cursor-pointer accent-accent"
                    />
                    <span className="text-sm font-mono-data text-white w-12 text-right">{notificationVolume}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/[0.05]">
                  <div>
                    <div className="text-sm font-semibold text-white">Sound Alerts</div>
                    <div className="text-[11px] text-text-secondary mt-0.5 font-medium">Play audio notification on critical threat detection</div>
                  </div>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`w-11 h-6 rounded-full transition-all ${soundEnabled ? 'bg-accent' : 'bg-white/[0.05]'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${soundEnabled ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'identity' && (
            <div className="card-static p-6">
              <div className="flex items-center gap-2 mb-5">
                <Lock className="w-4 h-4 text-accent" />
                <h3 className="text-base text-white heading-display tracking-wider">Identity & Access Management</h3>
              </div>
              <p className="text-sm text-text-secondary">Role-based access control and MFA settings will be available in a future update.</p>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="card-static p-6">
              <div className="flex items-center gap-2 mb-5">
                <Cpu className="w-4 h-4 text-accent" />
                <h3 className="text-base text-white heading-display tracking-wider">SIEM Integrations</h3>
              </div>
              <p className="text-sm text-text-secondary">Connect to Splunk, Elastic, QRadar, and other SIEM platforms. Coming soon.</p>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Retention Health */}
          <div className="card-static p-6">
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-4 h-4 text-accent" />
              <h3 className="text-base text-white heading-display tracking-wider">Retention Health</h3>
            </div>
            <div className="space-y-4">
              {retentionHealth.map(item => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-text-secondary">{item.label}</span>
                    <span className="text-xs font-bold font-mono-data text-white">{item.value}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/[0.05] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.value}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Activity */}
          <div className="card-static p-6">
            <h3 className="text-base text-white mb-4 heading-display tracking-wider">Audit Activity</h3>
            <div className="space-y-3">
              {[
                { event: 'MFA enforced', by: 'SOC Manager', time: '2m ago' },
                { event: 'Token rotated', by: 'SOC Manager', time: '18m ago' },
                { event: 'Report export granted', by: 'Senior Analyst', time: '42m ago' },
                { event: 'Session revoked', by: 'Junior Analyst', time: '1h ago' },
              ].map((log, i) => (
                <div key={i} className="border-b border-white/[0.06] pb-3 last:border-0 last:pb-0">
                  <div className="text-xs font-bold text-white">{log.event}</div>
                  <div className="text-[10px] text-text-secondary/40 mt-0.5">{log.by} • {log.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Save Bar */}
      <div className="card-static p-4 flex items-center justify-between">
        <span className="text-xs text-text-secondary">Review and save the current SOC control settings.</span>
        <button
          onClick={handleSaveSettings}
          className="btn btn-primary flex items-center gap-2"
        >
          {settingsSaved ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Saved
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}
