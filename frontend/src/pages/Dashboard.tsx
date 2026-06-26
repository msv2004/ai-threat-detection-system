import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  detectionService,
  analyticsService,
  threatService,
  modelService
} from '../services/api';
import { useSocketStore } from '../stores/socketStore';
import Badge, { severityToBadgeVariant } from '../components/ui/Badge';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  BarChart,
  Bar
} from 'recharts';
import {
  Play,
  Square,
  Activity,
  AlertTriangle,
  Cpu,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Database,
  Shield,
  Clock,
  Zap,
  ChevronRight,
  X,
  CheckCircle2,
  Server,
  Globe,
  Settings,
  Terminal as TerminalIcon,
  Eye,
  Radio,
  Wifi,
  ArrowUpRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

// KPI Metric Card component matching sample1.png
function KPICard({ label, value, unit, trend, trendUp }: {
  label: string; value: string; unit?: string; trend: string; trendUp: boolean;
}) {
  return (
    <div className="kpi-card">
      <div className="flex items-start justify-between">
        <div className="text-xs text-text-secondary font-medium">{label}</div>
        <div className={`flex items-center gap-0.5 text-[11px] font-bold font-mono-data ${trendUp ? 'text-semantic-success' : 'text-semantic-critical'}`}>
          {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {trend}
        </div>
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
        {unit && <span className="text-sm text-text-tertiary font-medium">{unit}</span>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { alerts, isConnected, isUnderAttack, stats: wsStats } = useSocketStore();
  const [selectedThreat, setSelectedThreat] = useState<any>(null);

  // Capture session configurations
  const [captureInterface, setCaptureInterface] = useState('Wi-Fi');
  const [captureMode, setCaptureMode] = useState<'live' | 'offline'>('live');
  const [pcapFilePath, setPcapFilePath] = useState('datasets/sample_attack.pcap');
  const [replaySpeed, setReplaySpeed] = useState(1.0);

  // Queries
  const { data: overview, isLoading: isOverviewLoading } = useQuery({
    queryKey: ['overview'],
    queryFn: analyticsService.overview,
    refetchInterval: 5000,
  });

  const { data: threatsList, isLoading: isThreatsLoading } = useQuery({
    queryKey: ['threats'],
    queryFn: () => threatService.list(),
  });

  const { data: sessionStatus } = useQuery({
    queryKey: ['detection_status'],
    queryFn: detectionService.status,
    refetchInterval: 2000,
  });

  const { data: models } = useQuery({
    queryKey: ['models'],
    queryFn: modelService.list,
  });

  const activeModel = models?.find((m: any) => m.is_active);

  // Mutations
  const startCaptureMutation = useMutation({
    mutationFn: detectionService.start,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['detection_status'] }),
  });

  const stopCaptureMutation = useMutation({
    mutationFn: detectionService.stop,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['detection_status'] }),
  });

  const updateThreatStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      threatService.updateStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['threats'] });
      queryClient.invalidateQueries({ queryKey: ['overview'] });
      if (selectedThreat && selectedThreat.id === data.id) setSelectedThreat(data);
    }
  });

  const handleStartCapture = () => {
    startCaptureMutation.mutate({
      interface: captureInterface,
      mode: captureMode,
      file_path: captureMode === 'offline' ? pcapFilePath : undefined,
      replay_speed: captureMode === 'offline' ? replaySpeed : undefined,
    });
  };

  const activeSessionStats = wsStats || sessionStatus;
  const isSniffing = activeSessionStats?.status === 'running';
  const criticalCount = overview?.critical_threats || 0;
  const threatsToday = overview?.threats_today || 0;
  const displayThreats = threatsList ? threatsList.slice(0, 5) : [];

  // Live history for chart
  const [liveHistory, setLiveHistory] = useState<any[]>([]);

  useEffect(() => {
    if (isSniffing && activeSessionStats) {
      setLiveHistory(prev => {
        const next = [...prev, {
          time: new Date().toLocaleTimeString().slice(-8),
          packets: activeSessionStats.packet_count || 0,
          flows: activeSessionStats.flow_count || 0,
          threats: activeSessionStats.threat_count || 0,
        }].slice(-15);
        return next;
      });
    } else if (!isSniffing && liveHistory.length > 0) {
      setLiveHistory([]);
    }
  }, [isSniffing, activeSessionStats?.packet_count, activeSessionStats?.flow_count]);

  // Static chart data for display
  const threatActivityData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${String(i).padStart(2, '0')}:00`,
    threats: Math.floor(Math.random() * 80) + 20,
  }));

  const severityData = [
    { name: 'Critical', value: overview?.critical_threats || 2, color: '#ff4757' },
    { name: 'High', value: 3, color: '#f97316' },
    { name: 'Medium', value: 5, color: '#eab308' },
    { name: 'Low', value: 8, color: '#00e676' },
    { name: 'Info', value: 4, color: '#3b82f6' },
  ];

  const radarData = [
    { subject: 'Network', A: 85 },
    { subject: 'Endpoint', A: 72 },
    { subject: 'Email', A: 60 },
    { subject: 'Data', A: 78 },
    { subject: 'Compliance', A: 90 },
  ];

  const attackTypeData = [
    { name: 'DDoS', count: 340 },
    { name: 'SQLi', count: 270 },
    { name: 'XSS', count: 180 },
    { name: 'BruteForce', count: 120 },
    { name: 'Phishing', count: 85 },
    { name: 'Malware', count: 45 },
  ];

  // Simulated log stream
  const [logStream, setLogStream] = useState<string[]>([
    'INFO  [WAF] Suspicious network activity detected',
    'INFO  [DLP] Malware signature matched',
    'INFO  [IDS] System health check passed',
    'INFO  [Email Gateway] File access anomaly',
    'DEBUG [WAF] User privilege escalation attempted',
    'DEBUG [EDR] System health check passed',
    'DEBUG [SIEM] Malware signature matched',
    'WARN  [Firewall] Policy violation detected',
  ]);

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl text-white heading-display tracking-wider">SOC Overview</h2>
          <p className="text-sm text-text-secondary mt-0.5">Security Operations Center Dashboard</p>
        </div>
        <div className="flex gap-2">
          {criticalCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-semantic-critical/10 border border-semantic-critical/20 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-semantic-critical pulse-red" />
              <span className="text-xs font-bold text-semantic-critical">{criticalCount} Critical Alert{criticalCount > 1 ? 's' : ''}</span>
            </div>
          )}
          <div className="flex items-center gap-2 px-4 py-2 bg-accent/5 border border-accent/15 rounded-lg">
            <Shield className="w-4 h-4 text-accent" />
            <span className="text-xs font-bold text-accent">System Online</span>
          </div>
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard label="Threats Blocked" value={overview?.total_predictions ? String(Math.floor(overview.total_predictions * 0.87)) : '0'} trend="12.5%" trendUp={true} />
        <KPICard label="Incidents Resolved" value={String(overview?.resolved_threats || 0)} trend="5.2%" trendUp={false} />
        <KPICard label="Mean Time to Detect" value="4" unit="min" trend="18.3%" trendUp={false} />
        <KPICard label="Mean Time to Respond" value="28" unit="min" trend="8.7%" trendUp={false} />
        <KPICard label="Vulnerabilities" value={String(overview?.critical_threats || 0)} trend="3.1%" trendUp={true} />
        <KPICard label="Endpoints Protected" value={overview?.total_predictions ? String(Math.floor(overview.total_predictions * 0.94)) : '0'} trend="2.4%" trendUp={true} />
      </div>

      {/* Active Threats + Attack Map Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Active Threats */}
        <div className="lg:col-span-2 card-static p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-accent" />
              <h3 className="text-base text-white heading-display tracking-wider">Active Threats</h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-semantic-critical bg-semantic-critical/10 px-2 py-0.5 rounded">Live</span>
          </div>

          <div className="space-y-2">
            {isThreatsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton h-16 rounded-lg" />
              ))
            ) : displayThreats.length === 0 ? (
              <div className="py-8 text-center text-text-tertiary text-xs">No active threats detected</div>
            ) : (
              displayThreats.map((threat: any, i: number) => (
                <div
                  key={threat.id}
                  onClick={() => setSelectedThreat(threat)}
                  className="flex items-center justify-between p-3 rounded-lg bg-surface-2/40 border border-border-subtle hover:border-border-default cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      threat.severity === 'critical' ? 'bg-semantic-critical pulse-red' :
                      threat.severity === 'high' ? 'bg-semantic-investigate' :
                      'bg-semantic-warning'
                    }`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono-data text-text-tertiary">THR-{new Date(threat.created_at).getFullYear()}-{String(i + 1).padStart(3, '0')}</span>
                        <span className="text-xs font-bold text-accent truncate max-w-[200px]">{threat.attack_type || threat.source_ip}</span>
                      </div>
                      <div className="text-[10px] text-text-tertiary flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(threat.created_at), { addSuffix: true })} • {threat.detection_source || 'Network IDS'}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold font-mono-data text-white">{(threat.confidence * 10).toFixed(1)}</span>
                </div>
              ))
            )}
          </div>

          {displayThreats.length > 0 && (
            <Link to="/threats" className="flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-hover mt-3 transition-colors">
              View All Threats <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* Live Attack Map */}
        <div className="lg:col-span-3 card-static p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-accent" />
                <h3 className="text-base text-white heading-display tracking-wider">Live Attack Map</h3>
              </div>
              <p className="text-[11px] text-text-tertiary mt-0.5">Global intrusion telemetry, command paths, and sinkhole pulses</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono-data text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/15">
                <Shield className="w-3 h-3 inline mr-1" />8 vectors
              </span>
              <span className="text-[10px] font-mono-data text-semantic-critical bg-semantic-critical/10 px-2 py-0.5 rounded border border-semantic-critical/15">
                <Activity className="w-3 h-3 inline mr-1" />Live telemetry
              </span>
            </div>
          </div>

          {/* SVG World Map */}
          <div className="relative bg-surface-0 rounded-lg border border-border-subtle p-4 h-[280px] overflow-hidden">
            <svg viewBox="0 0 800 400" className="w-full h-full opacity-30">
              {/* Simplified continent outlines */}
              <path d="M150,120 Q180,100 220,110 T280,105 Q300,95 340,100 T380,90 L370,130 Q350,140 330,135 T290,140 Q260,150 230,145 T180,140 Z" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-accent/40" />
              <path d="M350,80 Q400,60 450,70 T520,65 Q560,55 600,60 T680,55 L690,100 Q660,120 620,115 T560,120 Q520,130 480,125 T400,120 Z" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-accent/40" />
              <path d="M200,180 Q230,170 260,175 T300,170 L310,220 Q280,240 250,235 T210,230 Z" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-accent/40" />
              <path d="M450,100 Q500,85 550,90 T620,85 L640,160 Q610,180 560,175 T480,170 Q450,160 440,140 Z" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-accent/40" />
              <path d="M620,180 Q680,160 720,170 T760,165 L770,260 Q740,280 700,275 T640,270 Q610,260 600,240 Z" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-accent/40" />
            </svg>
            {/* Attack pulse dots */}
            {[
              { x: '25%', y: '35%', label: 'USA', color: 'semantic-critical' },
              { x: '65%', y: '25%', label: 'Russia', color: 'semantic-critical' },
              { x: '72%', y: '35%', label: 'China', color: 'semantic-critical' },
              { x: '58%', y: '40%', label: 'Iran', color: 'semantic-investigate' },
              { x: '45%', y: '60%', label: 'Nigeria', color: 'semantic-warning' },
              { x: '35%', y: '70%', label: 'Brazil', color: 'semantic-warning' },
            ].map((dot, i) => (
              <div key={i} className="absolute" style={{ left: dot.x, top: dot.y }}>
                <div className={`w-3 h-3 rounded-full bg-${dot.color} pulse-red opacity-80`} />
                <span className="absolute left-4 top-0 text-[9px] font-mono-data text-text-tertiary whitespace-nowrap">{dot.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row - matching sample2.png */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Threat Activity (24h) */}
        <div className="card-static p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-accent" />
            <h3 className="text-base text-white heading-display tracking-wider">Threat Activity (24h)</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={liveHistory.length > 0 ? liveHistory : threatActivityData}>
              <defs>
                <linearGradient id="threatGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#00d4ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,212,255,0.05)" />
              <XAxis dataKey={liveHistory.length > 0 ? 'time' : 'hour'} stroke="#556677" tick={{ fontSize: 10 }} />
              <YAxis stroke="#556677" tick={{ fontSize: 10 }} />
              <RechartsTooltip
                contentStyle={{ background: '#0c1222', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 8, fontSize: 11 }}
              />
              <Area
                type="monotone"
                dataKey={liveHistory.length > 0 ? 'threats' : 'threats'}
                stroke="#00d4ff"
                strokeWidth={2}
                fill="url(#threatGrad)"
                dot={{ r: 3, fill: '#00d4ff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Severity Distribution */}
        <div className="card-static p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-accent" />
            <h3 className="text-base text-white heading-display tracking-wider">Severity Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={severityData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip
                contentStyle={{ background: '#0c1222', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 8, fontSize: 11 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-4 mt-2">
            {severityData.map(s => (
              <div key={s.name} className="flex items-center gap-1.5 text-[10px] text-text-secondary">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
                {s.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Security Posture + Attack Types + Log Stream */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Security Posture Radar */}
        <div className="card-static p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base text-white heading-display tracking-wider">Security Posture</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-accent font-mono-data">78.5</span>
              <span className="text-xs text-text-tertiary">/100</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="rgba(0,212,255,0.08)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#8899a6' }} />
              <Radar dataKey="A" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Attack Types Bar Chart */}
        <div className="card-static p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-accent" />
            <h3 className="text-base text-white heading-display tracking-wider">Attack Types</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={attackTypeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,212,255,0.05)" />
              <XAxis dataKey="name" stroke="#556677" tick={{ fontSize: 9 }} />
              <YAxis stroke="#556677" tick={{ fontSize: 10 }} />
              <RechartsTooltip
                contentStyle={{ background: '#0c1222', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 8, fontSize: 11 }}
              />
              <Bar dataKey="count" fill="#00d4ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Live Log Stream */}
        <div className="card-static p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TerminalIcon className="w-4 h-4 text-accent" />
              <h3 className="text-base text-white heading-display tracking-wider">Live Log Stream</h3>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-semantic-success pulse-emerald" />
              <span className="text-[10px] text-text-tertiary font-medium">Streaming</span>
            </div>
          </div>
          <div className="bg-surface-0 rounded-lg border border-border-subtle p-3 h-[220px] overflow-y-auto font-mono-data text-[10px] space-y-1.5">
            {logStream.map((log, i) => {
              const time = new Date(Date.now() - (logStream.length - i) * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
              const isWarn = log.startsWith('WARN');
              const isDebug = log.startsWith('DEBUG');
              return (
                <div key={i} className="flex gap-3 leading-relaxed">
                  <span className="text-text-tertiary shrink-0">{time}</span>
                  <span className={`font-bold shrink-0 ${isWarn ? 'text-semantic-warning' : isDebug ? 'text-text-tertiary' : 'text-semantic-success'}`}>
                    {log.split(' ')[0]}
                  </span>
                  <span className="text-text-secondary">{log.substring(log.indexOf(' ') + 1)}</span>
                </div>
              );
            })}
            <div className="w-2 h-3 bg-accent/60 inline-block animate-pulse" />
          </div>
        </div>
      </div>

      {/* Capture Control Panel */}
      <div className="card-static p-5">
        <div className="flex items-center gap-2 mb-4">
          <Radio className="w-4 h-4 text-accent" />
          <h3 className="text-base text-white heading-display tracking-wider">Network Capture Engine</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-[10px] text-text-tertiary uppercase tracking-wider mb-1.5 font-bold">Interface</label>
            <input
              value={captureInterface}
              onChange={(e) => setCaptureInterface(e.target.value)}
              className="input input-sm"
              placeholder="Wi-Fi"
            />
          </div>
          <div>
            <label className="block text-[10px] text-text-tertiary uppercase tracking-wider mb-1.5 font-bold">Mode</label>
            <select
              value={captureMode}
              onChange={(e) => setCaptureMode(e.target.value as 'live' | 'offline')}
              className="input input-sm"
            >
              <option value="live">Live Capture</option>
              <option value="offline">PCAP Replay</option>
            </select>
          </div>
          {captureMode === 'offline' && (
            <div>
              <label className="block text-[10px] text-text-tertiary uppercase tracking-wider mb-1.5 font-bold">PCAP Path</label>
              <input
                value={pcapFilePath}
                onChange={(e) => setPcapFilePath(e.target.value)}
                className="input input-sm"
              />
            </div>
          )}
          <div>
            {isSniffing ? (
              <button
                onClick={() => stopCaptureMutation.mutate()}
                disabled={stopCaptureMutation.isPending}
                className="btn btn-danger w-full flex items-center justify-center gap-2"
              >
                <Square className="w-3.5 h-3.5" />
                Stop Capture
              </button>
            ) : (
              <button
                onClick={handleStartCapture}
                disabled={startCaptureMutation.isPending}
                className="btn btn-primary w-full flex items-center justify-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Start Capture
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Threat Detail Drawer */}
      <AnimatePresence>
        {selectedThreat && (
          <>
            <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setSelectedThreat(null)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-surface-1 border-l border-border-default z-50 overflow-y-auto p-6 space-y-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base text-white heading-display tracking-wider">Threat Investigation</h3>
                <button onClick={() => setSelectedThreat(null)} className="p-1.5 rounded-lg hover:bg-surface-2 text-text-secondary">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-surface-2 rounded-lg border border-border-default">
                  <div className="text-[10px] text-text-tertiary uppercase tracking-wider mb-1">Source IP</div>
                  <div className="text-sm font-mono-data text-accent font-bold">{selectedThreat.source_ip}</div>
                </div>
                <div className="p-4 bg-surface-2 rounded-lg border border-border-default">
                  <div className="text-[10px] text-text-tertiary uppercase tracking-wider mb-1">Destination</div>
                  <div className="text-sm font-mono-data text-white font-bold">{selectedThreat.destination_ip}:{selectedThreat.destination_port}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-surface-2 rounded-lg border border-border-default">
                    <div className="text-[10px] text-text-tertiary uppercase tracking-wider mb-1">Severity</div>
                    <span className={`badge-${selectedThreat.severity}`}>{selectedThreat.severity}</span>
                  </div>
                  <div className="p-4 bg-surface-2 rounded-lg border border-border-default">
                    <div className="text-[10px] text-text-tertiary uppercase tracking-wider mb-1">Confidence</div>
                    <div className="text-sm font-mono-data text-white font-bold">{(selectedThreat.confidence * 100).toFixed(1)}%</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => updateThreatStatusMutation.mutate({ id: selectedThreat.id, status: 'resolved' })}
                    className="btn btn-primary btn-sm flex-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Resolve
                  </button>
                  <button
                    onClick={() => updateThreatStatusMutation.mutate({ id: selectedThreat.id, status: 'investigating' })}
                    className="btn btn-secondary btn-sm flex-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Investigate
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
