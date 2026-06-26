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
  ChevronRight,
  Bell,
  Search,
  User,
  Wifi,
  WifiOff,
  PanelLeftClose,
  PanelLeft,
  Activity,
  AlertTriangle
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Threat Feed', path: '/threats', icon: ShieldAlert },
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
      { name: 'Settings & API', path: '/settings', icon: Settings },
    ],
  },
];

const PAGE_TITLES: Record<string, { title: string; description: string }> = {
  '/dashboard': { title: 'Security Dashboard', description: 'Autonomous threat classification, volumetric analytics, and intrusion diagnostics.' },
  '/threats': { title: 'Threat Registry & Feed', description: 'Real-time network log streams, anomaly detections, and VT reputations.' },
  '/datasets': { title: 'Data Ingestion & Splits', description: 'Upload network capture CSV sheets and configure preprocessing scalers.' },
  '/training': { title: 'AI Training Console', description: 'Train decision tree, random forest, and SVM classifiers on split nodes.' },
  '/models': { title: 'Model Registry & Importance', description: 'Manage deployed model configurations and inspect feature weight ratios.' },
  '/analytics': { title: 'Performance Analytics', description: 'Track threat growth vectors, classification speeds, and latency stability.' },
  '/settings': { title: 'Console Configuration', description: 'Configure security profiles, sound threshold preferences, and API credentials.' },
};

export default function SOCLayout() {
  const { user, clearAuth } = useAuthStore();
  const { isConnected, alerts, isUnderAttack, stats: wsStats, connect, disconnect } = useSocketStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
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

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const currentPage = PAGE_TITLES[location.pathname] || { title: 'SOC Console', description: 'Aegis Security Operations System' };
  const unreadAlerts = alerts?.length || 0;
  const activeStats = wsStats || sessionStatus;
  const isSniffing = activeStats?.status === 'running';

  return (
    <div className="min-h-screen flex bg-surface-0 text-text-primary overflow-hidden">
      {/* ── Mobile Layout Overlay ── */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 md:hidden transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ── Side Navigation bar ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col bg-surface-1 border-r border-border-default
          transition-all duration-300 ease-in-out md:relative md:translate-x-0
          ${sidebarCollapsed ? 'w-[72px]' : 'w-64'}
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Sidebar Header Brand */}
        <div className={`h-16 flex items-center border-b border-border-default px-4 justify-between`}>
          <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-accent" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col">
                <span className="font-extrabold text-sm tracking-widest text-white">AEGIS SOC</span>
                <span className="text-[9px] text-accent font-semibold tracking-wider uppercase leading-none mt-0.5">AI Cyber Defense</span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1.5 rounded-lg hover:bg-surface-2 text-text-secondary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Links */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-6">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="space-y-1">
              {!sidebarCollapsed && (
                <div className="px-3 mb-2 text-[10px] font-extrabold text-text-tertiary uppercase tracking-widest">
                  {section.label}
                </div>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      title={sidebarCollapsed ? item.name : undefined}
                      className={`
                        flex items-center gap-3 rounded-lg text-xs font-semibold transition-all duration-200
                        ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'px-3.5 py-2.5'}
                        ${isActive
                          ? 'bg-accent-subtle text-accent border border-accent-border/30'
                          : 'text-text-secondary border border-transparent hover:text-text-primary hover:bg-surface-2'
                        }
                      `}
                    >
                      <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-accent' : ''}`} />
                      {!sidebarCollapsed && <span>{item.name}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar bottom connection card */}
        <div className="p-3 border-t border-border-default space-y-2">
          {/* Active status pulse display */}
          <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg bg-surface-2/40 border border-border-subtle ${sidebarCollapsed ? 'justify-center' : ''}`}>
            {isConnected ? (
              <div className="w-2.5 h-2.5 rounded-full bg-semantic-success pulse-emerald" />
            ) : (
              <div className="w-2.5 h-2.5 rounded-full bg-semantic-critical pulse-red" />
            )}
            {!sidebarCollapsed && (
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isConnected ? 'text-semantic-success' : 'text-semantic-critical'}`}>
                {isConnected ? 'SOC Online' : 'SOC Offline'}
              </span>
            )}
          </div>

          {/* Under attack alarm banner */}
          {isUnderAttack && !sidebarCollapsed && (
            <div className="flex items-center gap-2 px-3 py-2 bg-semantic-critical/10 border border-semantic-critical/20 rounded-lg animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-semantic-critical shrink-0" />
              <span className="text-[9px] font-bold text-semantic-critical uppercase tracking-wider">Active Attack Hit</span>
            </div>
          )}

          {/* Collapse sidebar button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden md:flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-text-tertiary hover:text-text-secondary hover:bg-surface-2 transition-all w-full text-left font-semibold text-xs border border-transparent"
          >
            {sidebarCollapsed ? (
              <PanelLeft className="w-4 h-4 mx-auto text-text-secondary" />
            ) : (
              <>
                <PanelLeftClose className="w-4 h-4 text-text-secondary" />
                <span>Minimize Sidebar</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* ── Main Panel View Layout ── */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Header Controls bar */}
        <header className="h-16 flex items-center justify-between px-6 bg-surface-1 border-b border-border-default z-20 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-surface-2 text-text-secondary"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Title / Description */}
            <div className="hidden sm:block text-left">
              <h1 className="text-sm font-bold text-white tracking-wide uppercase leading-tight">{currentPage.title}</h1>
              <p className="text-[10px] text-text-secondary leading-tight mt-0.5">{currentPage.description}</p>
            </div>
            <span className="sm:hidden font-bold text-xs text-white uppercase">{currentPage.title.split(' ')[0]}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Live capture stats indicator */}
            {isSniffing && activeStats && (
              <div className="hidden lg:flex items-center gap-3 px-3 py-1 bg-semantic-success/5 border border-semantic-success/20 rounded-md text-[10px] font-mono-data">
                <Activity className="w-3.5 h-3.5 text-semantic-success animate-pulse" />
                <span className="text-text-secondary">Captured: <strong className="text-white">{activeStats.packet_count || 0}</strong></span>
                <span className="text-text-secondary">Flows: <strong className="text-white">{activeStats.flow_count || 0}</strong></span>
                <span className="text-text-secondary">Threats: <strong className="text-semantic-critical">{activeStats.threat_count || 0}</strong></span>
              </div>
            )}

            {/* Global Search box */}
            <div className={`
              hidden md:flex items-center gap-2.5 bg-surface-0 border rounded-lg px-3 py-1.5 w-52 transition-all duration-200
              ${searchFocused ? 'border-accent w-64 shadow-[0_0_12px_rgba(6,182,212,0.1)]' : 'border-border-strong'}
            `}>
              <Search className="w-4 h-4 text-text-tertiary" />
              <input
                type="text"
                placeholder="Search metrics, logs..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="bg-transparent text-xs text-white placeholder-text-tertiary outline-none flex-1 font-mono-data"
              />
            </div>

            {/* Notification Bell */}
            <button className="relative p-2 rounded-lg hover:bg-surface-2 text-text-secondary transition-colors cursor-pointer border border-transparent">
              <Bell className="w-4.5 h-4.5" />
              {unreadAlerts > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-semantic-critical text-[#02040a] text-[9px] font-extrabold rounded-full flex items-center justify-center shadow-lg shadow-red-500/20">
                  {unreadAlerts}
                </span>
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1 pl-2 rounded-lg hover:bg-surface-2 transition-all border border-transparent cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-accent-subtle border border-accent/20 flex items-center justify-center shadow-sm">
                  <User className="w-4 h-4 text-accent" />
                </div>
                <span className="hidden md:block text-xs font-bold text-text-secondary max-w-[120px] truncate">
                  {user?.email?.split('@')[0] || 'Operator'}
                </span>
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
                      Configure Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2.5 text-semantic-critical hover:bg-semantic-critical/5 transition-all w-full text-left border-t border-border-default mt-1"
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      Terminated Session
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Backend banners */}
        <BackendBanner />

        {/* Dynamic Outlet Page Loader */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-[1400px] mx-auto animate-fade-in">
            <Outlet />
          </div>
        </div>
      </main>
      <Onboarding />
    </div>
  );
}
