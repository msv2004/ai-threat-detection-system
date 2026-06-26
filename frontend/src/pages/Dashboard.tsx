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
import PageHeader from '../components/ui/PageHeader';
import Badge, { severityToBadgeVariant } from '../components/ui/Badge';
import { InfoTip } from '../components/ui/Tooltip';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonCard } from '../components/ui/Skeleton';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Play,
  Square,
  Activity,
  AlertTriangle,
  Cpu,
  Radio,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Database,
  Flame,
  BarChart3,
  Shield,
  Clock,
  Zap,
  ChevronRight,
  X,
  CheckCircle2,
  Server,
  Globe,
  Settings
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

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

  const activeModel = models?.find(m => m.is_active);

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
  const displayThreats = threatsList ? threatsList.slice(0, 8) : [];

  // Local history buffer for Recharts live telemetry
  const [liveHistory, setLiveHistory] = useState<any[]>([]);

  useEffect(() => {
    if (isSniffing && activeSessionStats) {
      setLiveHistory(prev => {
        const next = [...prev, {
          time: new Date().toLocaleTimeString().slice(-8),
          packets: activeSessionStats.packet_count || 0,
          flows: activeSessionStats.flow_count || 0,
          threats: activeSessionStats.threat_count || 0,
        }].slice(-15); // Buffer size 15
        return next;
      });
    } else if (!isSniffing && liveHistory.length > 0) {
      setLiveHistory([]);
    }
  }, [isSniffing, activeSessionStats?.packet_count, activeSessionStats?.flow_count]);

  const isNewUser = !isOverviewLoading && !overview?.total_predictions && displayThreats.length === 0;

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">Operational Overview</h2>
          <p className="text-xs text-text-secondary mt-0.5">Real-time intrusion classification system monitoring</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['overview'] });
              queryClient.invalidateQueries({ queryKey: ['threats'] });
            }}
            className="btn btn-secondary btn-sm flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Sync Data
          </button>
        </div>
      </div>

      {/* Active Attack Alert Banner */}
      {isUnderAttack && (
        <div className="p-4 bg-semantic-critical/10 border border-semantic-critical/20 rounded-xl flex items-center justify-between gap-4 animate-pulse glow-critical">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-semantic-critical shrink-0" />
            <div>
              <h4 className="text-xs font-extrabold text-semantic-critical uppercase tracking-wider">Active threat vectors intercepted</h4>
              <p className="text-[10px] text-text-secondary mt-0.5">High risk anomaly network flows detected in streams. Urgent inspection advised.</p>
            </div>
          </div>
          <Link to="/threats" className="btn btn-danger btn-sm shrink-0 rounded-lg">
            Investigate Feed
          </Link>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isOverviewLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            {/* Active Model */}
            <div className="card p-5 hover:border-accent-border/30 transition-all flex flex-col justify-between group">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[9px] font-extrabold text-text-tertiary uppercase tracking-widest block">Active Pipeline Model</span>
                  <span className="text-sm font-bold text-white block truncate" title={activeModel ? activeModel.algorithm : 'No Deployed Model'}>
                    {activeModel ? activeModel.algorithm : 'No Model Deployed'}
                  </span>
                </div>
                <div className="p-2 rounded bg-surface-2 group-hover:bg-accent/10 transition-colors">
                  <Cpu className="w-4 h-4 text-accent" />
                </div>
              </div>
              <div className="text-[10px] text-text-secondary font-mono-data mt-4 flex justify-between items-center">
                <span>{activeModel ? `v${activeModel.version}` : 'Run Training'}</span>
                {activeModel && (
                  <span className="text-semantic-success">
                    {((activeModel.accuracy || 0.95) * 100).toFixed(1)}% Acc
                  </span>
                )}
              </div>
            </div>

            {/* Incident Counter */}
            <div className="card p-5 hover:border-semantic-investigate/30 transition-all flex flex-col justify-between group">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[9px] font-extrabold text-text-tertiary uppercase tracking-widest block">Threats Isolated Today</span>
                  <span className="text-xl font-black text-white block font-mono-data">{threatsToday}</span>
                </div>
                <div className="p-2 rounded bg-surface-2 group-hover:bg-semantic-investigate/10 transition-colors">
                  <AlertTriangle className="w-4 h-4 text-semantic-investigate" />
                </div>
              </div>
              <div className="text-[10px] text-text-secondary font-mono-data mt-4">
                <span>{overview?.total_predictions || 0} total logs evaluated</span>
              </div>
            </div>

            {/* Critical Count */}
            <div className={`card p-5 transition-all flex flex-col justify-between group ${criticalCount > 0 ? 'border-semantic-critical/20 glow-critical' : 'hover:border-semantic-critical/20'}`}>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[9px] font-extrabold text-text-tertiary uppercase tracking-widest block">Critical Intrusion Detections</span>
                  <span className={`text-xl font-black block font-mono-data ${criticalCount > 0 ? 'text-semantic-critical' : 'text-white'}`}>{criticalCount}</span>
                </div>
                <div className="p-2 rounded bg-surface-2 group-hover:bg-semantic-critical/10 transition-colors">
                  <ShieldAlert className="w-4 h-4 text-semantic-critical" />
                </div>
              </div>
              <div className="text-[10px] text-text-secondary font-mono-data mt-4">
                <span className={criticalCount > 0 ? 'text-semantic-critical font-bold' : ''}>
                  {criticalCount > 0 ? 'Urgent Mitigation Required' : 'No Critical Anomalies'}
                </span>
              </div>
            </div>

            {/* Average Latency */}
            <div className="card p-5 hover:border-semantic-success/20 transition-all flex flex-col justify-between group">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[9px] font-extrabold text-text-tertiary uppercase tracking-widest block">Inference latency</span>
                  <span className="text-xl font-black text-white block font-mono-data">
                    {overview?.average_latency ? `${overview.average_latency.toFixed(2)}ms` : '—'}
                  </span>
                </div>
                <div className="p-2 rounded bg-surface-2 group-hover:bg-semantic-success/10 transition-colors">
                  <Activity className="w-4 h-4 text-semantic-success" />
                </div>
              </div>
              <div className="text-[10px] text-text-secondary font-mono-data mt-4">
                <span>Per-flow classification speed</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        
        {/* Left Console Configuration */}
        <div className="xl:col-span-1 space-y-4">
          
          {/* Sniffer Controller */}
          <div className="card p-5 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-border-default pb-3">
              <h3 className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-accent" />
                Sniffer Engine
              </h3>
              <InfoTip content="Configure and control local network adapter capture sniffing or PCAP files replaying." />
            </div>

            {isSniffing ? (
              <div className="space-y-4 text-xs font-semibold">
                <div className="flex items-center gap-2 p-2 rounded bg-semantic-success/5 border border-semantic-success/20">
                  <span className="w-2 h-2 rounded-full bg-semantic-success animate-pulse" />
                  <span className="text-[10px] font-bold text-semantic-success uppercase">STREAM ACTIVE</span>
                  <span className="text-[10px] font-mono-data text-text-tertiary ml-auto">{activeSessionStats?.interface}</span>
                </div>

                <div className="space-y-2 font-mono-data text-[11px] text-text-secondary">
                  <div className="flex justify-between border-b border-border-subtle pb-1">
                    <span>Packets Read</span>
                    <span className="text-white font-bold">{activeSessionStats?.packet_count || 0}</span>
                  </div>
                  <div className="flex justify-between border-b border-border-subtle pb-1">
                    <span>Active Flows</span>
                    <span className="text-white font-bold">{activeSessionStats?.flow_count || 0}</span>
                  </div>
                  <div className="flex justify-between border-b border-border-subtle pb-1">
                    <span>Anomalous Hits</span>
                    <span className="text-semantic-critical font-bold">{activeSessionStats?.threat_count || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Run Duration</span>
                    <span className="text-white font-bold">{activeSessionStats?.duration_seconds ? `${activeSessionStats.duration_seconds.toFixed(0)}s` : '0s'}</span>
                  </div>
                </div>

                <button 
                  onClick={() => stopCaptureMutation.mutate()} 
                  className="btn btn-danger w-full btn-sm flex justify-center items-center gap-1"
                >
                  <Square className="w-3.5 h-3.5 fill-current" /> Terminate Sniffer
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Sniffer mode selector */}
                <div className="space-y-1.5">
                  <span className="block text-[9px] font-extrabold text-text-tertiary uppercase tracking-wider">Capture Mode</span>
                  <div className="grid grid-cols-2 gap-1 bg-surface-0 p-1 rounded-lg border border-border-subtle">
                    <button
                      onClick={() => setCaptureMode('live')}
                      className={`py-1.5 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${captureMode === 'live' ? 'bg-accent/10 text-accent border border-accent-border/30' : 'text-text-tertiary hover:text-white'}`}
                    >Live Adapter</button>
                    <button
                      onClick={() => setCaptureMode('offline')}
                      className={`py-1.5 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${captureMode === 'offline' ? 'bg-accent/10 text-accent border border-accent-border/30' : 'text-text-tertiary hover:text-white'}`}
                    >PCAP Replay</button>
                  </div>
                </div>

                {captureMode === 'live' ? (
                  <div className="space-y-1.5">
                    <span className="block text-[9px] font-extrabold text-text-tertiary uppercase tracking-wider">Network Adapter Interface</span>
                    <input
                      type="text"
                      value={captureInterface}
                      onChange={(e) => setCaptureInterface(e.target.value)}
                      placeholder="e.g. Wi-Fi, eth0"
                      className="input input-sm rounded-lg font-mono-data"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <span className="block text-[9px] font-extrabold text-text-tertiary uppercase tracking-wider">PCAP Dump File Path</span>
                      <input
                        type="text"
                        value={pcapFilePath}
                        onChange={(e) => setPcapFilePath(e.target.value)}
                        className="input input-sm rounded-lg font-mono-data text-[10px]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <span className="block text-[9px] font-extrabold text-text-tertiary uppercase tracking-wider">Replay Speed Rate (x)</span>
                      <input
                        type="number"
                        step="0.5"
                        min="0.1"
                        value={replaySpeed}
                        onChange={(e) => setReplaySpeed(parseFloat(e.target.value))}
                        className="input input-sm rounded-lg font-mono-data"
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={handleStartCapture}
                  disabled={startCaptureMutation.isPending || !activeModel}
                  className="btn btn-primary w-full btn-sm flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Initialize Sniffer
                </button>
                
                {!activeModel && (
                  <div className="p-3 bg-semantic-warning/5 border border-semantic-warning/20 text-semantic-warning text-[10px] leading-relaxed rounded-lg">
                    ⚠️ Deployment of an active trained classifier from the model registry is required to parse ingestion flows.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Shortcuts */}
          <div className="card p-5 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase border-b border-border-default pb-2">Quick Shortcuts</h4>
            <div className="space-y-1">
              {[
                { label: 'Upload Log CSVs', icon: Database, path: '/datasets', color: 'text-semantic-info hover:bg-semantic-info/5' },
                { label: 'Model Training Console', icon: Flame, path: '/training', color: 'text-semantic-ai hover:bg-semantic-ai/5' },
                { label: 'Feature Registry & Importance', icon: Cpu, path: '/models', color: 'text-accent hover:bg-accent/5' },
                { label: 'Drill Down Incidents', icon: ShieldAlert, path: '/threats', color: 'text-semantic-critical hover:bg-semantic-critical/5' },
              ].map(action => (
                <Link
                  key={action.path}
                  to={action.path}
                  className="flex items-center gap-2.5 p-2 rounded-lg transition-colors group hover:bg-surface-2"
                >
                  <action.icon className={`w-4 h-4 ${action.color.split(' ')[0]}`} />
                  <span className="text-xs text-text-secondary group-hover:text-text-primary transition-colors font-semibold">{action.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-text-tertiary ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* Right Dashboard Data Panels */}
        <div className="xl:col-span-3 space-y-6">
          
          {/* Live streams charts rendering */}
          {isSniffing && liveHistory.length > 0 && (
            <div className="card p-5 space-y-4 text-left">
              <div>
                <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2">
                  <Activity className="w-4 h-4 text-accent animate-pulse" />
                  Live Ingress Flow Rates (Packets / Anomalies)
                </h3>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={liveHistory} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPackets" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                    <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" fontSize={9} />
                    <YAxis stroke="rgba(255,255,255,0.2)" fontSize={9} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#070b13', border: '1px solid rgba(59,130,246,0.1)' }} labelStyle={{ color: '#fff', fontSize: '10px' }} itemStyle={{ fontSize: '10px' }} />
                    <Area type="monotone" dataKey="packets" stroke="#06b6d4" fillOpacity={1} fill="url(#colorPackets)" name="Packets Ingress" />
                    <Area type="monotone" dataKey="threats" stroke="#ef4444" fillOpacity={1} fill="url(#colorThreats)" name="Anomalies Isolated" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* First onboarding steps */}
          {isNewUser && (
            <div className="card p-6 border-l-4 border-l-semantic-info bg-semantic-info/5 text-left space-y-4">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded bg-semantic-info/10 border border-semantic-info/20 flex items-center justify-center text-semantic-info shrink-0">
                  <Zap className="w-5.5 h-5.5" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-white">First System Operations Steps</h4>
                  <p className="text-xs text-text-secondary leading-relaxed max-w-xl">
                    Get started by going to the **Datasets** module to ingest network capture tables, scaling features, and training custom machine learning classifiers (SVMs, Decision Trees, or Random Forests) to detect anomalies.
                  </p>
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    <Link to="/datasets" className="btn btn-primary btn-sm rounded-lg flex items-center gap-1">
                      <Database className="w-3.5 h-3.5" /> Upload CSV
                    </Link>
                    <Link to="/training" className="btn btn-secondary btn-sm rounded-lg flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-semantic-warning" /> AI Console
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Incidents feed container */}
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-border-default flex items-center justify-between bg-surface-1/40">
              <div>
                <h3 className="text-xs font-bold text-white uppercase">Ingress Security Feed</h3>
                <p className="text-[10px] text-text-secondary mt-0.5">Real-time classification log records</p>
              </div>
              <Link to="/threats" className="btn btn-ghost btn-sm text-accent hover:text-accent-hover font-bold flex items-center gap-1">
                View Full Feed <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {isThreatsLoading ? (
              <div className="p-12 text-center text-xs text-text-secondary font-mono-data flex justify-center items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-accent" />
                Parsing databases...
              </div>
            ) : displayThreats.length === 0 ? (
              <EmptyState
                icon={Shield}
                title="No threat anomalies logged"
                description="Network packet captures evaluate clean. Turn on the sniffing adapter console to launch real-time monitoring."
                action={<Link to="/datasets" className="btn btn-primary btn-sm rounded-lg"><Database className="w-3.5 h-3.5" /> Upload Dataset</Link>}
              />
            ) : (
              <div className="divide-y divide-border-subtle text-xs font-semibold text-left">
                {displayThreats.map((threat: any) => (
                  <div
                    key={threat.id}
                    onClick={() => setSelectedThreat(threat)}
                    className="p-4 flex items-center justify-between gap-4 hover:bg-surface-2 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <Badge variant={severityToBadgeVariant(threat.severity)}>
                        {threat.severity}
                      </Badge>
                      <div className="min-w-0 space-y-1">
                        <div className="text-white font-bold truncate">{threat.attack_category}</div>
                        <div className="text-[10px] text-text-tertiary font-mono-data flex items-center gap-1">
                          <span className="text-accent">{threat.mitre_technique_id || 'T1000'}</span>
                          <span>·</span>
                          <span className="truncate">{threat.src_ip && `${threat.src_ip} → ${threat.dst_ip}`}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-right">
                      <span className="hidden sm:block text-[10px] text-text-tertiary">
                        {threat.created_at ? formatDistanceToNow(new Date(threat.created_at), { addSuffix: true }) : 'Just now'}
                      </span>
                      <ChevronRight className="w-4 h-4 text-text-tertiary" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Slide-out Incident detail drawer */}
      <AnimatePresence>
        {selectedThreat && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
              onClick={() => setSelectedThreat(null)}
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="w-full max-w-lg bg-surface-1 border-l border-border-strong h-full overflow-y-auto z-10 shadow-2xl relative flex flex-col"
            >
              {/* Header */}
              <div className="sticky top-0 bg-surface-1/90 backdrop-blur-md border-b border-border-default p-5 flex items-center justify-between z-20">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-widest">Anomaly Investigation</h3>
                  <span className="text-[9px] text-text-tertiary font-mono-data block mt-1 uppercase tracking-wider">INCIDENT ID: {selectedThreat.id.substring(0, 8)}...</span>
                </div>
                <button onClick={() => setSelectedThreat(null)} className="btn btn-ghost btn-sm rounded-lg hover:bg-surface-2 cursor-pointer">
                  <X className="w-4 h-4" /> Close
                </button>
              </div>

              {/* Contents */}
              <div className="p-5 space-y-6 text-xs text-left">
                {/* Risk classification summary */}
                <div className="card p-4 space-y-3 border-l-4 border-l-semantic-critical bg-surface-0">
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-bold text-text-tertiary uppercase tracking-widest">Risk classification</span>
                    <Badge variant={severityToBadgeVariant(selectedThreat.severity)}>
                      {selectedThreat.severity}
                    </Badge>
                  </div>
                  <h4 className="text-base font-black text-white">{selectedThreat.attack_category}</h4>
                  <div className="text-[10px] text-text-secondary leading-relaxed">
                    MITRE Mapping: <strong className="text-accent">{selectedThreat.mitre_technique_id}</strong> — {selectedThreat.mitre_technique_name || 'Exploitation of Public-Facing Application'}
                  </div>
                </div>

                {/* Log Header info */}
                <div className="space-y-2">
                  <span className="block text-[9px] font-bold text-text-tertiary uppercase tracking-widest">Network Log Header signature</span>
                  <div className="grid grid-cols-2 gap-3.5 text-xs text-text-secondary font-mono-data">
                    <div className="bg-surface-0 border border-border-subtle p-3 rounded-lg">
                      <span className="text-[8px] text-text-tertiary block font-bold uppercase tracking-wider">Source Vector</span>
                      <strong className="text-white mt-1 block">{selectedThreat.src_ip || '—'}</strong>
                    </div>
                    <div className="bg-surface-0 border border-border-subtle p-3 rounded-lg">
                      <span className="text-[8px] text-text-tertiary block font-bold uppercase tracking-wider">Destination target</span>
                      <strong className="text-white mt-1 block">{selectedThreat.dst_ip || '—'}</strong>
                    </div>
                    <div className="bg-surface-0 border border-border-subtle p-3 rounded-lg">
                      <span className="text-[8px] text-text-tertiary block font-bold uppercase tracking-wider">Port / Protocol</span>
                      <strong className="text-white mt-1 block">{selectedThreat.dst_port || '—'} / {selectedThreat.protocol || '—'}</strong>
                    </div>
                    <div className="bg-surface-0 border border-border-subtle p-3 rounded-lg">
                      <span className="text-[8px] text-text-tertiary block font-bold uppercase tracking-wider">Inference speed</span>
                      <strong className="text-white mt-1 block">{selectedThreat.processing_latency ? `${(selectedThreat.processing_latency * 1000).toFixed(1)} ms` : '—'}</strong>
                    </div>
                  </div>
                </div>

                {/* VirusTotal Reputation */}
                <div className="space-y-2">
                  <span className="block text-[9px] font-bold text-text-tertiary uppercase tracking-widest">Threat Intel reputation index</span>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-surface-0 border border-border-subtle p-3.5 rounded-lg">
                      <span className="text-[8px] text-text-tertiary block font-bold uppercase tracking-wider">AbuseIPDB Score</span>
                      <strong className="text-base font-black text-semantic-investigate block mt-1.5 font-mono-data">{selectedThreat.abuseipdb_score || 0}%</strong>
                    </div>
                    <div className="bg-surface-0 border border-border-subtle p-3.5 rounded-lg">
                      <span className="text-[8px] text-text-tertiary block font-bold uppercase tracking-wider">VirusTotal Positive hits</span>
                      <strong className="text-base font-black text-semantic-critical block mt-1.5 font-mono-data">{selectedThreat.virustotal_score || 0} / 10</strong>
                    </div>
                  </div>
                </div>

                {/* Mitigation advices */}
                <div className="space-y-2 text-left">
                  <span className="block text-[9px] font-bold text-text-tertiary uppercase tracking-widest">Incident Action recommendations</span>
                  <div className="bg-surface-0 border border-border-subtle p-4 rounded-lg leading-relaxed text-text-secondary">
                    {selectedThreat.recommended_action || 'Inspect the origin address logs, block packet routing at the perimeter firewall, and run localized antivirus/malware scanners on target host nodes.'}
                  </div>
                </div>

                {/* Resolution trigger actions */}
                <div className="space-y-2">
                  <span className="block text-[9px] font-bold text-text-tertiary uppercase tracking-widest">Routing Incident status</span>
                  <div className="flex gap-2">
                    {['Open', 'Investigating', 'Resolved', 'Dismissed'].map((statusOption) => {
                      const isCurrent = selectedThreat.resolution_status?.toLowerCase() === statusOption.toLowerCase() ||
                                        (statusOption === 'Open' && !selectedThreat.resolution_status);
                      return (
                        <button
                          key={statusOption}
                          disabled={updateThreatStatusMutation.isPending}
                          onClick={() => updateThreatStatusMutation.mutate({ id: selectedThreat.id, status: statusOption })}
                          className={`flex-1 py-2.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-accent border-accent text-surface-0 shadow-md'
                              : 'bg-surface-0 border-border-strong text-text-secondary hover:text-white hover:border-slate-600'
                          }`}
                        >
                          {statusOption}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
