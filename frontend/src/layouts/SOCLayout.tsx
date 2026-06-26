import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useSocketStore } from '../stores/socketStore';
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
    label: 'Data Pipeline',
    items: [
      { name: 'Datasets', path: '/datasets', icon: Database },
      { name: 'Training', path: '/training', icon: Flame },
      { name: 'Models', path: '/models', icon: Cpu },
    ],
  },
  {
    label: 'Insights',
    items: [
      { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'System',
    items: [
      { name: 'Settings', path: '/settings', icon: Settings },
    ],
  },
];

const PAGE_TITLES: Record<string, { title: string; description: string }> = {
  '/dashboard': { title: 'Dashboard', description: 'Security overview and quick actions' },
  '/threats': { title: 'Threat Feed', description: 'Detected security incidents' },
  '/datasets': { title: 'Datasets', description: 'Upload and manage training data' },
  '/training': { title: 'Training', description: 'Train AI detection models' },
  '/models': { title: 'Models', description: 'Manage deployed models' },
  '/analytics': { title: 'Analytics', description: 'Performance and threat trends' },
  '/settings': { title: 'Settings', description: 'System configuration' },
};

export default function SOCLayout() {
  const { user, clearAuth } = useAuthStore();
  const { isConnected, alerts, connect, disconnect } = useSocketStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const currentPage = PAGE_TITLES[location.pathname] || { title: 'Dashboard', description: '' };

  // Build breadcrumbs
  const breadcrumbs = [
    { label: 'Aegis', path: '/dashboard' },
    { label: currentPage.title, path: location.pathname },
  ];

  const unreadAlerts = alerts?.length || 0;

  const sidebarWidth = sidebarCollapsed ? 'w-[68px]' : 'w-60';

  return (
    <div className="min-h-screen flex bg-surface-0 text-text-primary">
      {/* ── Mobile overlay ── */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden animate-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 ${sidebarWidth} bg-surface-1 border-r border-border-subtle
          flex flex-col transition-all duration-200 ease-out
          md:relative md:translate-x-0
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Brand */}
        <div className={`h-16 flex items-center border-b border-border-subtle ${sidebarCollapsed ? 'justify-center px-2' : 'px-5 justify-between'}`}>
          <Link to="/dashboard" className="flex items-center gap-2.5 text-text-primary hover:text-accent transition-colors">
            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Shield className="w-4.5 h-4.5 text-accent" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <span className="font-bold text-[15px] tracking-tight">Aegis</span>
                <span className="text-[10px] text-text-tertiary block leading-none">Security Operations</span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1.5 rounded-md hover:bg-surface-3 text-text-secondary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              {!sidebarCollapsed && (
                <div className="px-3 mb-2 text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">
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
                        flex items-center gap-3 rounded-lg text-[13px] font-medium transition-all duration-150
                        ${sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'}
                        ${isActive
                          ? 'bg-accent/10 text-accent'
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
                        }
                      `}
                    >
                      <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-accent' : ''}`} />
                      {!sidebarCollapsed && <span>{item.name}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className={`border-t border-border-subtle p-3 ${sidebarCollapsed ? 'flex flex-col items-center gap-2' : ''}`}>
          {/* Connection status */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-2 mb-2 ${sidebarCollapsed ? 'justify-center px-2' : ''}`}>
            {isConnected ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-red-400" />
            )}
            {!sidebarCollapsed && (
              <span className={`text-xs font-medium ${isConnected ? 'text-emerald-400' : 'text-red-400'}`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            )}
          </div>

          {/* Collapse toggle (desktop only) */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-text-tertiary hover:text-text-secondary hover:bg-surface-2 transition-colors w-full"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <PanelLeft className="w-4 h-4 mx-auto" />
            ) : (
              <>
                <PanelLeftClose className="w-4 h-4" />
                <span className="text-xs">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 flex items-center justify-between px-4 md:px-6 bg-surface-1/80 backdrop-blur-md border-b border-border-subtle z-20 shrink-0">
          {/* Left side: hamburger + breadcrumbs */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-surface-3 text-text-secondary"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumbs */}
            <nav className="hidden sm:flex items-center gap-1.5 text-sm">
              {breadcrumbs.map((crumb, i) => (
                <React.Fragment key={crumb.path}>
                  {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-text-tertiary" />}
                  {i === breadcrumbs.length - 1 ? (
                    <span className="font-semibold text-text-primary">{crumb.label}</span>
                  ) : (
                    <Link to={crumb.path} className="text-text-tertiary hover:text-text-secondary transition-colors">
                      {crumb.label}
                    </Link>
                  )}
                </React.Fragment>
              ))}
            </nav>

            {/* Mobile title */}
            <span className="sm:hidden font-semibold text-sm text-text-primary">{currentPage.title}</span>
          </div>

          {/* Right side: search, notifications, user */}
          <div className="flex items-center gap-2">
            {/* Search (desktop) */}
            <div className="hidden lg:flex items-center gap-2 bg-surface-0 border border-border-subtle rounded-lg px-3 py-1.5 w-56 focus-within:border-accent focus-within:shadow-[0_0_0_3px_rgba(14,165,233,0.15)] transition-all">
              <Search className="w-4 h-4 text-text-tertiary" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent text-sm text-text-primary placeholder-text-tertiary outline-none flex-1"
              />
            </div>

            {/* Notification bell */}
            <button className="relative p-2 rounded-lg hover:bg-surface-3 text-text-secondary transition-colors">
              <Bell className="w-[18px] h-[18px]" />
              {unreadAlerts > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadAlerts > 9 ? '9+' : unreadAlerts}
                </span>
              )}
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 pl-2 rounded-lg hover:bg-surface-3 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-accent" />
                </div>
                <span className="hidden md:block text-sm text-text-secondary max-w-[140px] truncate">
                  {user?.email?.split('@')[0]}
                </span>
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-surface-2 border border-border-default rounded-xl shadow-2xl py-1.5 z-50 animate-fade-in">
                    <div className="px-4 py-3 border-b border-border-subtle">
                      <div className="text-sm font-medium text-text-primary truncate">{user?.email}</div>
                      <div className="text-xs text-text-tertiary mt-0.5">{user?.role?.name || 'Security Analyst'}</div>
                    </div>
                    <Link
                      to="/settings"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-3 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/5 transition-colors w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Backend connection warning banner */}
        <BackendBanner />

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-[1400px] mx-auto animate-fade-in">
            <Outlet />
          </div>
        </div>
      </main>
      <Onboarding />
    </div>
  );
}
