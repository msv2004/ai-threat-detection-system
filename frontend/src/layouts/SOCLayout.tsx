import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useSocketStore } from '../stores/socketStore';
import { useQuery } from '@tanstack/react-query';
import { detectionService } from '../services/api';
import Onboarding from '../components/Onboarding';
import BackendBanner from '../components/ui/BackendBanner';
import {
  LayoutDashboard,
  ShieldAlert,
  Database,
  Cpu,
  Flame,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  Bell,
  Search,
  User,
  PanelLeftClose,
  PanelLeft,
  Activity,
  AlertTriangle,
  Clock,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { name: 'SOC Overview', path: '/dashboard', icon: LayoutDashboard, badge: 'live' as const },
      { name: 'Threat Monitoring', path: '/threats', icon: ShieldAlert, badge: 'count' as const, count: 8 },
    ],
  },
  {
    label: 'AI Pipeline',
    items: [
      { name: 'Datasets', path: '/datasets', icon: Database },
      { name: 'Training Console', path: '/training', icon: Flame },
      { name: 'Models Registry', path: '/models', icon: Cpu },
    ],
  },
  {
    label: 'Security & Intel',
    items: [
      { name: 'Analytics Monitor', path: '/analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Administration',
    items: [
      { name: 'Settings', path: '/settings', icon: Settings },
    ],
  },
];

const PAGE_TITLES: Record<string, { title: string; description: string }> = {
  '/dashboard': { title: 'SOC Overview', description: 'Security Operations Center Dashboard' },
  '/threats': { title: 'Threat Monitoring', description: 'Real-time network threat detection and classification' },
  '/datasets': { title: 'Data Ingestion', description: 'Upload and preprocess network capture datasets' },
  '/training': { title: 'AI Training Console', description: 'Train and deploy ML classifiers' },
  '/models': { title: 'Model Registry', description: 'Manage deployed model configurations' },
  '/analytics': { title: 'Analytics Monitor', description: 'Performance metrics and threat analytics' },
  '/settings': { title: 'SOC Control Center', description: 'Configure detections, retention, and integrations' },
};

export default function SOCLayout() {
  const { user, clearAuth } = useAuthStore();
  const { isConnected, alerts, isUnderAttack, stats: wsStats, connect, disconnect } = useSocketStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch engine status
  const { data: sessionStatus } = useQuery({
    queryKey: ['detection_status'],
    queryFn: detectionService.status,
    refetchInterval: 3000,
  });

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const currentPage = PAGE_TITLES[location.pathname] || { title: 'SOC Console', description: 'Aegis Security Operations System' };
  const unreadAlerts = alerts?.length || 0;
  const activeStats = wsStats || sessionStatus;
  const isSniffing = activeStats?.status === 'running';
  const timeStr = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <div className="min-h-screen flex bg-surface-0 text-text-primary overflow-hidden">
      {/* ── Mobile Overlay ── */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col bg-surface-1 border-r border-border-default
          transition-all duration-300 ease-in-out md:relative md:translate-x-0
          ${sidebarCollapsed ? 'w-[72px]' : 'w-[260px]'}
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center border-b border-border-default px-4 justify-between">
          <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-accent" />
            </div>
            {!sidebarCollapsed && (
              <span className="font-extrabold text-[15px] tracking-wide text-white">Aegis SOC</span>
            )}
          </Link>
          {!sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="hidden md:block p-1 rounded hover:bg-surface-2 text-text-tertiary transition-colors"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1.5 rounded-lg hover:bg-surface-2 text-text-secondary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SOC Status Bar */}
        {!sidebarCollapsed && (
          <div className="px-4 py-3 border-b border-border-default">
            <div className="flex items-center gap-2 mb-2.5">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-semantic-success pulse-emerald' : 'bg-semantic-critical pulse-red'}`} />
              <span className={`text-[10px] font-bold uppercase tracking-[0.15em] ${isConnected ? 'text-semantic-success' : 'text-semantic-critical'}`}>
                {isConnected ? 'SOC Online' : 'SOC Offline'}
              </span>
            </div>
            {/* Mini metrics */}
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: 'CPU', value: isSniffing ? '41%' : '--' },
                { label: 'EPS', value: isSniffing ? `${activeStats?.flow_count || 0}` : '--' },
                { label: 'MTTD', value: isSniffing ? '4m' : '--' },
              ].map(m => (
                <div key={m.label} className="bg-surface-2 rounded px-2 py-1.5 text-center">
                  <div className="text-[11px] font-bold text-white font-mono-data">{m.value}</div>
                  <div className="text-[8px] text-text-tertiary uppercase tracking-wider font-bold mt-0.5">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="space-y-0.5">
              {!sidebarCollapsed && (
                <div className="px-3 mb-2 text-[9px] font-extrabold text-text-tertiary uppercase tracking-[0.2em]">
                  {section.label}
                </div>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    title={sidebarCollapsed ? item.name : undefined}
                    className={`
                      flex items-center gap-3 rounded-lg text-[13px] font-medium transition-all duration-200 relative
                      ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'px-3.5 py-2.5'}
                      ${isActive
                        ? 'text-accent bg-accent/5'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
                      }
                    `}
                  >
                    {/* Active left border */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-accent rounded-r-full" />
                    )}
                    <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-accent' : ''}`} />
                    {!sidebarCollapsed && (
                      <>
                        <span className="flex-1">{item.name}</span>
                        {/* Badges */}
                        {'badge' in item && item.badge === 'live' && (
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-semantic-success/15 text-semantic-success px-1.5 py-0.5 rounded">
                            Live
                          </span>
                        )}
                        {'badge' in item && item.badge === 'count' && 'count' in item && (
                          <span className="text-[10px] font-bold bg-semantic-critical text-white w-5 h-5 rounded-full flex items-center justify-center">
                            {item.count}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="p-3 border-t border-border-default space-y-1">
          {/* Under attack alert */}
          {isUnderAttack && !sidebarCollapsed && (
            <div className="flex items-center gap-2 px-3 py-2 bg-semantic-critical/10 border border-semantic-critical/20 rounded-lg animate-pulse mb-2">
              <AlertTriangle className="w-3.5 h-3.5 text-semantic-critical shrink-0" />
              <span className="text-[9px] font-bold text-semantic-critical uppercase tracking-wider">Active Threat</span>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`
              flex items-center gap-3 rounded-lg text-[13px] font-medium text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-all w-full
              ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'px-3.5 py-2.5'}
            `}
          >
            <LogOut className="w-[18px] h-[18px] shrink-0" />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>

          {/* Expand button when collapsed */}
          {sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="w-full flex justify-center py-2 text-text-tertiary hover:text-text-secondary transition-colors"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-14 flex items-center justify-between px-6 bg-surface-1 border-b border-border-default z-20 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-surface-2 text-text-secondary"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search */}
            <div className={`
              hidden md:flex items-center gap-2.5 bg-surface-0 border rounded-lg px-3 py-1.5 transition-all duration-200
              ${searchFocused ? 'border-accent w-72 shadow-[0_0_12px_rgba(0,212,255,0.08)]' : 'border-border-strong w-56'}
            `}>
              <Search className="w-4 h-4 text-text-tertiary" />
              <input
                type="text"
                placeholder="Search..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="bg-transparent text-xs text-white placeholder-text-tertiary outline-none flex-1"
              />
              <kbd className="hidden lg:inline-flex items-center gap-0.5 text-[10px] text-text-tertiary bg-surface-2 px-1.5 py-0.5 rounded border border-border-default font-mono-data">
                ⌘K
              </kbd>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live ticker */}
            {isSniffing && activeStats && (
              <div className="hidden lg:flex items-center gap-2 bg-surface-0 border border-semantic-critical/20 rounded-lg px-3 py-1.5 max-w-md overflow-hidden">
                <div className="w-2 h-2 rounded-full bg-semantic-critical pulse-red shrink-0" />
                <div className="overflow-hidden whitespace-nowrap">
                  <span className="text-[11px] font-mono-data text-text-secondary ticker-scroll inline-block">
                    LIVE: Packets={activeStats.packet_count || 0} • Flows={activeStats.flow_count || 0} • Threats={activeStats.threat_count || 0} • Engine active on adapter
                  </span>
                </div>
              </div>
            )}

            {/* Uptime badge */}
            <div className="hidden lg:flex items-center gap-1.5 bg-semantic-success/8 border border-semantic-success/15 rounded-lg px-3 py-1.5">
              <Activity className="w-3.5 h-3.5 text-semantic-success" />
              <span className="text-[11px] font-bold font-mono-data text-semantic-success">99.982%</span>
            </div>

            {/* Clock */}
            <div className="hidden lg:flex items-center gap-1.5 text-text-tertiary">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[11px] font-mono-data">{timeStr}</span>
            </div>

            {/* Theme toggles */}
            <div className="hidden lg:flex items-center gap-1 border-l border-border-default pl-3 ml-1">
              <button className="p-1.5 rounded hover:bg-surface-2 text-text-tertiary transition-colors"><Sun className="w-3.5 h-3.5" /></button>
              <button className="p-1.5 rounded hover:bg-surface-2 text-accent transition-colors"><Moon className="w-3.5 h-3.5" /></button>
              <button className="p-1.5 rounded hover:bg-surface-2 text-text-tertiary transition-colors"><Monitor className="w-3.5 h-3.5" /></button>
            </div>

            {/* Notification Bell */}
            <button className="relative p-2 rounded-lg hover:bg-surface-2 text-text-secondary transition-colors border border-transparent">
              <Bell className="w-4.5 h-4.5" />
              {unreadAlerts > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-semantic-critical text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-red-500/20">
                  {unreadAlerts > 9 ? '9+' : unreadAlerts}
                </span>
              )}
            </button>

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 p-1 pl-2 rounded-lg hover:bg-surface-2 transition-all border border-transparent cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-xs font-bold text-accent uppercase">
                  {user?.email?.[0] || 'U'}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-xs font-bold text-white leading-tight truncate max-w-[100px]">
                    {user?.email?.split('@')[0] || 'Operator'}
                  </div>
                  <div className="text-[9px] text-text-tertiary leading-tight">SOC Manager</div>
                </div>
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-surface-1 border border-border-strong rounded-xl shadow-2xl py-1.5 z-50 animate-fade-in text-xs font-semibold">
                    <div className="px-4 py-3 border-b border-border-default">
                      <div className="font-bold text-white truncate">{user?.email}</div>
                      <div className="text-[10px] text-text-tertiary mt-0.5 uppercase tracking-wider">{user?.role?.name || 'Security Analyst'}</div>
                    </div>
                    <Link
                      to="/settings"
                      className="flex items-center gap-2 px-4 py-2.5 text-text-secondary hover:text-white hover:bg-surface-2 transition-all"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4 text-text-tertiary" />
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2.5 text-semantic-critical hover:bg-semantic-critical/5 transition-all w-full text-left border-t border-border-default mt-1"
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Backend Banner */}
        <BackendBanner />

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto flex flex-col p-6 md:p-8">
          <div className="max-w-[1600px] xl:max-w-[1800px] w-full mx-auto animate-fade-in flex-1">
            <Outlet />
          </div>
          {/* Footer */}
          <footer className="mt-8 border-t border-border-default pt-6 text-xs text-text-tertiary">
            <div className="max-w-[1600px] xl:max-w-[1800px] w-full mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>© 2026 Aegis SOC-MSV. All rights reserved.</div>
              <div className="flex gap-6">
                <a href="#" className="hover:text-text-secondary transition-colors uppercase tracking-wider font-medium">Privacy Policy</a>
                <a href="#" className="hover:text-text-secondary transition-colors uppercase tracking-wider font-medium">Terms of Service</a>
                <a href="#" className="hover:text-text-secondary transition-colors uppercase tracking-wider font-medium">Documentation</a>
              </div>
            </div>
          </footer>
        </div>
      </main>
      <Onboarding />
    </div>
  );
}
