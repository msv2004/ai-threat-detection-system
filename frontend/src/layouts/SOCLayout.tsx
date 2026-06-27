import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useSocketStore } from '../stores/socketStore';
import { useQuery } from '@tanstack/react-query';
import { detectionService } from '../services/api';
import Onboarding from '../components/Onboarding';
import Tooltip from '../components/ui/Tooltip';
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
  Monitor,
  ChevronDown
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
          fixed inset-y-0 left-0 z-50 flex flex-col
          bg-white/[0.03] backdrop-blur-xl border-r border-white/[0.06]
          transition-all duration-300 ease-in-out md:relative md:translate-x-0
          ${sidebarCollapsed ? 'w-[72px]' : 'w-[260px]'}
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Brand Header */}
        <div className="h-[72px] flex items-center border-b border-white/[0.06] px-5 justify-between shrink-0">
          <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-accent" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="rgba(99, 102, 241, 0.05)"/>
                <path d="M12 11V7" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="15" r="1" fill="currentColor"/>
              </svg>
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-[15px] tracking-tight text-white leading-none">Aegis</span>
                <span className="text-[10px] text-accent font-mono-data tracking-wider uppercase leading-none mt-1">SOC-MSV</span>
              </div>
            )}
          </Link>
          {!sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="hidden md:block p-1.5 rounded-lg hover:bg-white/[0.06] text-white/30 hover:text-white/60 transition-colors"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1.5 rounded-lg hover:bg-white/[0.06] text-white/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SOC Status Bar */}
        {!sidebarCollapsed && (
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-semantic-success pulse-emerald' : 'bg-semantic-critical pulse-red'}`} />
              <span className={`text-[10px] font-semibold uppercase tracking-[0.12em] ${isConnected ? 'text-semantic-success' : 'text-semantic-critical'}`}>
                {isConnected ? 'SOC Online' : 'SOC Offline'}
              </span>
            </div>
            {/* Mini metrics */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'CPU', value: isSniffing ? '41%' : '--' },
                { label: 'EPS', value: isSniffing ? `${activeStats?.flow_count || 0}` : '--' },
                { label: 'MTTD', value: isSniffing ? '4m' : '--' },
              ].map(m => (
                <div key={m.label} className="bg-white/[0.04] rounded-lg px-2.5 py-2 text-center">
                  <div className="text-[11px] font-semibold text-white font-mono-data">{m.value}</div>
                  <div className="text-[8px] text-white/30 uppercase tracking-wider font-medium mt-0.5">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-6">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="space-y-1">
              {!sidebarCollapsed && (
                <div className="px-4 mb-2.5 text-[10px] font-semibold text-white/25 uppercase tracking-[0.15em]">
                  {section.label}
                </div>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  sidebarCollapsed ? (
                    <Tooltip content={item.name} position="right">
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`
                          flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 relative
                          p-3
                          ${isActive
                            ? 'text-white bg-white/[0.08] border-l-[3px] border-accent'
                            : 'text-white/40 hover:text-white/80 hover:bg-white/[0.05]'}
                        `}
                      >
                        <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-accent' : ''}`} />
                      </Link>
                    </Tooltip>
                  ) : (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`
                        flex items-center gap-3.5 rounded-xl text-sm font-medium transition-all duration-200 relative
                        px-4 py-3
                        ${isActive
                          ? 'text-white bg-white/[0.08]'
                          : 'text-white/40 hover:text-white/80 hover:bg-white/[0.05]'}
                      `}
                    >
                      {/* Active left border (enhanced) */}
                      {isActive && (
                        <div className="absolute left-0 top-2 bottom-2 w-[3px] bg-accent rounded-r-full" />
                      )}
                      <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-accent' : ''}`} />
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
                  )
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="p-4 border-t border-white/[0.06] space-y-1.5">
          {/* Under attack alert */}
          {isUnderAttack && !sidebarCollapsed && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-semantic-critical/10 border border-semantic-critical/20 rounded-xl animate-pulse mb-2">
              <AlertTriangle className="w-4 h-4 text-semantic-critical shrink-0" />
              <span className="text-[10px] font-semibold text-semantic-critical uppercase tracking-wider">Active Threat</span>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`
              flex items-center gap-3.5 rounded-xl text-sm font-medium text-white/40 hover:text-white/80 hover:bg-white/[0.05] transition-all w-full
              ${sidebarCollapsed ? 'justify-center p-3' : 'px-4 py-3'}
            `}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>

          {/* Expand button when collapsed */}
          {sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="w-full flex justify-center py-2.5 text-white/25 hover:text-white/50 transition-colors"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-[72px] flex items-center justify-between px-8 bg-white/[0.02] backdrop-blur-xl border-b border-white/[0.06] z-20 shrink-0">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2.5 rounded-lg hover:bg-surface-2 text-text-secondary"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Redesigned Premium Logo inside Top Nav for Mobile/Tablet or collapsed layouts */}
            <div className="flex md:hidden items-center gap-2">
              <div className="w-8 h-8 rounded bg-accent/10 border border-accent/20 flex items-center justify-center">
                <svg className="w-4.5 h-4.5 text-accent" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="rgba(99, 102, 241, 0.05)"/>
                </svg>
              </div>
              <span className="font-display font-bold text-xs tracking-wider text-white">AEGIS</span>
            </div>

            {/* Redesigned Global Search Bar */}
            <div className="hidden md:flex search-container w-64 md:w-[320px] lg:w-[380px]">
              <Search className="w-4.5 h-4.5 text-text-tertiary shrink-0" />
              <input
                type="text"
                placeholder="Search operations, threats, or metrics..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="search-input"
              />
              <kbd className="search-badge">
                Ctrl + K
              </kbd>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Live ticker */}
            {isSniffing && activeStats && (
              <div className="hidden xl:flex items-center gap-2 bg-surface-0 border border-semantic-critical/20 rounded-lg px-3 py-2 max-w-sm overflow-hidden">
                <div className="w-2 h-2 rounded-full bg-semantic-critical pulse-red shrink-0" />
                <div className="overflow-hidden whitespace-nowrap">
                  <span className="text-[10px] font-mono-data text-text-secondary ticker-scroll inline-block">
                    LIVE: Pkts={activeStats.packet_count || 0} • Flows={activeStats.flow_count || 0} • Threats={activeStats.threat_count || 0}
                  </span>
                </div>
              </div>
            )}

            {/* Redesigned Operational System Health Badge */}
            <div className="hidden lg:flex status-badge-operational">
              <div className="status-badge-dot pulse-emerald" />
              <span>Operational 99.98%</span>
            </div>

            {/* Current Time display */}
            <div className="hidden lg:flex items-center gap-1.5 text-text-secondary bg-surface-2 px-3 py-2 rounded-lg border border-border-default h-10">
              <Clock className="w-3.5 h-3.5 text-text-tertiary" />
              <span className="text-xs font-mono-data leading-none">{timeStr}</span>
            </div>

            {/* Theme toggles */}
            <div className="hidden lg:flex items-center gap-1 bg-surface-2 p-0.5 rounded-lg border border-border-default h-10">
              <button className="p-1.5 rounded hover:bg-surface-3 text-text-tertiary transition-colors"><Sun className="w-3.5 h-3.5" /></button>
              <button className="p-1.5 rounded hover:bg-surface-3 text-accent transition-colors"><Moon className="w-3.5 h-3.5" /></button>
              <button className="p-1.5 rounded hover:bg-surface-3 text-text-tertiary transition-colors"><Monitor className="w-3.5 h-3.5" /></button>
            </div>

            {/* Notification Bell */}
            <button className="relative icon-btn-premium h-10 w-10">
              <Bell className="w-4.5 h-4.5" />
              {unreadAlerts > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-semantic-critical text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-red-500/20">
                  {unreadAlerts > 9 ? '9+' : unreadAlerts}
                </span>
              )}
            </button>

            {/* Settings Quick Access Link */}
            <Link to="/settings" className="hidden sm:flex icon-btn-premium h-10 w-10">
              <Settings className="w-4.5 h-4.5" />
            </Link>

            {/* Redesigned User Profile */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 p-1 pl-2.5 pr-2 rounded-xl bg-surface-2 border border-border-default hover:bg-surface-3 transition-all cursor-pointer h-10"
              >
                <div className="w-7 h-7 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-xs font-bold text-accent uppercase">
                  {user?.email?.[0] || 'U'}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-xs font-bold text-white leading-tight truncate max-w-[100px]">
                    {user?.email?.split('@')[0] || 'Operator'}
                  </div>
                  <div className="text-[9px] text-text-tertiary font-bold tracking-wider uppercase leading-none mt-0.5">SOC Manager</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-text-tertiary" />
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
          <footer className="mt-10 border-t border-white/[0.06] pt-6 text-xs text-white/25">
            <div className="max-w-[1600px] xl:max-w-[1800px] w-full mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>© 2026 Aegis SOC-MSV. All rights reserved.</div>
              <div className="flex gap-6">
                <a href="#" className="hover:text-white/50 transition-colors tracking-wider font-medium">Privacy</a>
                <a href="#" className="hover:text-white/50 transition-colors tracking-wider font-medium">Terms</a>
                <a href="#" className="hover:text-white/50 transition-colors tracking-wider font-medium">Docs</a>
              </div>
            </div>
          </footer>
        </div>
      </main>
      <Onboarding />
    </div>
  );
}
