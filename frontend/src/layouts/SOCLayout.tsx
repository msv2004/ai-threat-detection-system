import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useSocketStore } from '../stores/socketStore';
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
  Activity 
} from 'lucide-react';

export default function SOCLayout() {
  const { user, clearAuth } = useAuthStore();
  const { isConnected, isUnderAttack, stats, connect, disconnect } = useSocketStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Auto-connect to websocket on layout mount
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Threat Feed', path: '/threats', icon: ShieldAlert },
    { name: 'Datasets', path: '/datasets', icon: Database },
    { name: 'Model Registry', path: '/models', icon: Cpu },
    { name: 'Training Console', path: '/training', icon: Flame },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="min-height-100vh flex flex-col md:flex-row bg-[#080b11] text-[#f1f5f9] cyber-grid">
      {/* Top Banner & Header for Attack State */}
      <div className="w-full h-1 bg-[#1e293b] border-b border-[#0f172a] relative z-50">
        <div className={`h-full transition-all duration-500 ${isUnderAttack ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-[#06b6d4] shadow-[0_0_10px_#06b6d4]'}`} style={{ width: '100%' }}></div>
      </div>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-[#0d1527] border-b border-white/5 z-40">
        <div className="flex items-center gap-2">
          <Shield className={`w-6 h-6 ${isUnderAttack ? 'text-red-500 animate-pulse' : 'text-[#06b6d4]'}`} />
          <span className="font-bold tracking-wider text-sm text-[#f1f5f9]">AEGIS SOC</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-cyan-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-xs text-white/40">{isConnected ? 'ONLINE' : 'OFFLINE'}</span>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-white/5 rounded">
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-[#090d16] border-r border-white/5 flex flex-col transform transition-transform duration-300 md:relative md:transform-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Sidebar Brand header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded bg-slate-900 border ${isUnderAttack ? 'border-red-500/30' : 'border-cyan-500/30'}`}>
              <Shield className={`w-6 h-6 ${isUnderAttack ? 'text-red-500 animate-pulse' : 'text-[#06b6d4]'}`} />
            </div>
            <div>
              <h1 className="font-bold tracking-wider text-base m-0 text-white leading-none">AEGIS SOC</h1>
              <span className="text-[10px] text-white/40 tracking-widest font-mono">CORE SEC ENG</span>
            </div>
          </div>
          <button className="md:hidden p-1 hover:bg-white/5 rounded text-white/50" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Attack Warning Banner */}
        {isUnderAttack ? (
          <div className="mx-4 mt-4 p-3 bg-red-950/40 border border-red-500/30 rounded flex items-center gap-3 animate-pulse-glow">
            <Activity className="w-4 h-4 text-red-500 animate-bounce" />
            <div>
              <div className="text-xs font-bold text-red-400 font-mono tracking-wide leading-none">NETWORK ATTACK</div>
              <span className="text-[9px] text-red-500/80 font-mono">HIGH-RISK ANOMALY DETECTED</span>
            </div>
          </div>
        ) : (
          <div className="mx-4 mt-4 p-3 bg-cyan-950/20 border border-cyan-500/20 rounded flex items-center gap-3">
            <Activity className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="text-xs font-bold text-cyan-400 font-mono tracking-wide leading-none">SYS_STATUS: NOMINAL</div>
              <span className="text-[9px] text-cyan-500/50 font-mono">MONITORING FLOWS LIVE</span>
            </div>
          </div>
        )}

        {/* Sidebar Nav Items */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-150 font-medium
                  ${isActive 
                    ? 'bg-cyan-500/10 text-[#06b6d4] border-l-2 border-[#06b6d4] pl-3' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'}
                `}
                onClick={() => setIsSidebarOpen(false)}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#06b6d4]' : 'text-white/40 group-hover:text-white'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer (User details / Logout) */}
        <div className="p-4 border-t border-white/5 bg-[#070b13]">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="overflow-hidden">
              <div className="text-xs text-white/80 font-medium truncate font-mono">{user?.email}</div>
              <span className="text-[9px] text-cyan-500/70 font-mono tracking-widest leading-none">
                {user?.role?.name ? user.role.name.toUpperCase() : 'SOC_ANALYST'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-white/5 rounded text-white/40 hover:text-red-400 transition-colors"
              title="Logout session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden min-h-screen">
        {/* Top Navbar */}
        <header className="hidden md:flex h-16 items-center justify-between px-8 bg-[#0a0f1d]/80 backdrop-blur border-b border-white/5 z-20">
          {/* Active Session Status Widget */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/40 font-mono uppercase tracking-widest">NIDS CAPTURE:</span>
              {stats?.status === 'running' ? (
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded text-[11px] font-mono text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-bold">ACTIVE</span>
                  <span className="text-white/40">[{stats.interface}]</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-slate-800/40 border border-white/5 px-2.5 py-1 rounded text-[11px] font-mono text-white/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  <span>STANDBY</span>
                </div>
              )}
            </div>

            {stats?.status === 'running' && (
              <div className="hidden lg:flex items-center gap-4 text-xs font-mono text-white/40 divide-x divide-white/5">
                <span className="pl-4">Packets: <span className="text-white">{stats.packet_count}</span></span>
                <span className="pl-4">Flows: <span className="text-white">{stats.flow_count}</span></span>
                <span className="pl-4">Threats: <span className="text-red-400">{stats.threat_count}</span></span>
              </div>
            )}
          </div>

          {/* WebSocket Status Indicator */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#090d18] border border-white/5 px-3 py-1 rounded-full">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#00ff87] shadow-[0_0_8px_#00ff87]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`} />
              <span className="text-[10px] tracking-wider text-white/60 font-mono">
                WS_STATUS: {isConnected ? 'SECURE_TUNNEL' : 'DISCONNECTED'}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content viewport */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
