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
  Server
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { alerts, isConnected, isUnderAttack, stats: wsStats } = useSocketStore();
  const [selectedThreat, setSelectedThreat] = useState<any>(null);

  // Capture session settings
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
    <div className="space-y-8 font-sans">
      <PageHeader
        title="Dashboard"
        description="Autonomous threat classification, volumetric analytics, and intrusion diagnostics."
      />

      {/* First-time user onboarding banner */}
      {isNewUser && (
        <div className="card p-6 border-l-4 border-l-blue-500 bg-blue-500/[0.02] shadow-lg animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center shrink-0">
              <Zap className="w-5.5 h-5.5 text-blue-400" />
            </div>
            <div className="space-y-3">
              <h3 className="text-[15px] font-bold text-white">Welcome to Aegis Security Operations</h3>
              <p className="text-xs text-text-secondary leading-relaxed max-w-2xl">
                Get started by going to the **Datasets** module to ingest network capture tables, scaling features, and training custom machine learning classifiers (SVMs, Decision Trees, or Random Forests) to detect anomalies.
              </p>
              <div className="flex flex-wrap gap-2.5">
                <Link to="/datasets" className="btn btn-primary btn-sm rounded-lg">
                  <Database className="w-3.5 h-3.5" /> Upload Dataset
                </Link>
                <Link to="/training" className="btn btn-secondary btn-sm rounded-lg">
                  <Flame className="w-3.5 h-3.5 text-orange-400" /> Train Model
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active attack overlay alert */}
      {isUnderAttack && (
        <div className="card p-5 border-l-4 border-l-red-500 bg-red-500/[0.03] glow-critical animate-pulse border-red-500/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
            <div className="flex items-start gap-3.5">
              <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-extrabold text-red-400 uppercase tracking-wide">Threat Mitigation Required</h3>
                <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                  High-severity intrusion flows detected in active streaming telemetry. Review addresses and firewall recommend lists immediately.
                </p>
              </div>
            </div>
            <Link to="/threats" className="btn btn-sm btn-danger shrink-0 rounded-lg">
              Mitigate Threats
            </Link>
          </div>
        </div>
      )}

      {/* Core KPI cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isOverviewLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            {/* Active Model */}
            <div className="card p-5.5 hover:border-blue-500/20 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Active Model</span>
                  <Cpu className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-[17px] font-black text-white truncate" title={activeModel ? activeModel.algorithm : 'No model deployed'}>
                  {activeModel ? activeModel.algorithm : 'Inactive'}
                </div>
              </div>
              <div className="text-[11px] text-text-secondary mt-3">
                {activeModel ? `v${activeModel.version} · ${((activeModel.accuracy || 0) * 100).toFixed(1)}% accuracy` : 'No active model deployed'}
              </div>
            </div>

            {/* Incident Counter */}
            <div className="card p-5.5 hover:border-orange-500/20 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Threats Today</span>
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                </div>
                <div className="text-2xl font-black text-white">
                  {threatsToday}
                </div>
              </div>
              <div className="text-[11px] text-text-secondary mt-3">
                {overview?.total_predictions || 0} total predictions analyzed
              </div>
            </div>

            {/* Critical Severity Card */}
            <div className={`card p-5.5 transition-all flex flex-col justify-between ${criticalCount > 0 ? 'border-red-500/30 glow-critical' : 'hover:border-red-500/20'}`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Critical Incidents</span>
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                </div>
                <div className={`text-2xl font-black ${criticalCount > 0 ? 'text-red-500' : 'text-white'}`}>
                  {criticalCount}
                </div>
              </div>
              <div className="text-[11px] text-text-secondary mt-3">
                {criticalCount > 0 ? 'Immediate resolution required' : 'No critical alerts active'}
              </div>
            </div>

            {/* Average Latency */}
            <div className="card p-5.5 hover:border-emerald-500/20 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Avg Latency</span>
                  <Activity className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-white">
                  {overview?.average_latency ? `${overview.average_latency.toFixed(2)}ms` : '—'}
                </div>
              </div>
              <div className="text-[11px] text-text-secondary mt-3">
                Per-flow AI classification speed
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main dashboard content layout splits */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Left Side: Detection engine setup */}
        <div className="xl:col-span-1 space-y-5">
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <Radio className="w-4 h-4 text-blue-400" />
                Detection Console
              </h3>
              <InfoTip content="Start sniffer. Select live adapter sniffing or offline PCAP replay speeds." />
            </div>

            {isSniffing ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Sniffing Live</span>
                  <span className="text-xs text-text-tertiary font-semibold ml-auto">{activeSessionStats?.interface}</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-text-secondary">
                    <span>Packets Captured</span>
                    <span className="font-mono-data font-bold text-white">{activeSessionStats?.packet_count || 0}</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>Analyzed Flows</span>
                    <span className="font-mono-data font-bold text-white">{activeSessionStats?.flow_count || 0}</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>Anomalous Hits</span>
                    <span className="font-mono-data font-bold text-red-400">{activeSessionStats?.threat_count || 0}</span>
                  </div>
                  <div className="flex justify-between text-text-secondary border-t border-white/5 pt-2.5 mt-2.5">
                    <span>Run Duration</span>
                    <span className="font-mono-data font-bold text-white">
                      {activeSessionStats?.duration_seconds ? `${activeSessionStats.duration_seconds.toFixed(0)}s` : '0s'}
                    </span>
                  </div>
                </div>

                <button onClick={() => stopCaptureMutation.mutate()} className="btn btn-danger w-full btn-sm rounded-lg">
                  <Square className="w-3.5 h-3.5 fill-red-400" /> Stop Detection
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[10px] text-text-tertiary font-bold uppercase tracking-wider mb-1.5">Sniffing Mode</label>
                  <div className="grid grid-cols-2 gap-1.5 bg-surface-0 p-1 rounded-lg border border-border-subtle">
                    <button
                      onClick={() => setCaptureMode('live')}
                      className={`text-center py-1.5 rounded-md text-xs font-bold transition-all ${captureMode === 'live' ? 'bg-blue-500/10 text-blue-400' : 'text-text-tertiary hover:text-text-secondary'}`}
                    >Live Adapter</button>
                    <button
                      onClick={() => setCaptureMode('offline')}
                      className={`text-center py-1.5 rounded-md text-xs font-bold transition-all ${captureMode === 'offline' ? 'bg-blue-500/10 text-blue-400' : 'text-text-tertiary hover:text-text-secondary'}`}
                    >PCAP Replay</button>
                  </div>
                </div>

                {captureMode === 'live' ? (
                  <div>
                    <label className="block text-[10px] text-text-tertiary font-bold uppercase tracking-wider mb-1.5">Network Interface</label>
                    <input
                      type="text"
                      value={captureInterface}
                      onChange={(e) => setCaptureInterface(e.target.value)}
                      placeholder="e.g. Wi-Fi, eth0"
                      className="input input-sm rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] text-text-tertiary font-bold uppercase tracking-wider mb-1.5">PCAP File Path</label>
                      <input type="text" value={pcapFilePath} onChange={(e) => setPcapFilePath(e.target.value)} className="input input-sm rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-text-tertiary font-bold uppercase tracking-wider mb-1.5">Replay Speed</label>
                      <input type="number" step="0.5" min="0" value={replaySpeed} onChange={(e) => setReplaySpeed(parseFloat(e.target.value))} className="input input-sm rounded-lg" />
                    </div>
                  </div>
                )}

                <button 
                  onClick={handleStartCapture} 
                  disabled={startCaptureMutation.isPending || !activeModel} 
                  className="btn btn-primary w-full btn-sm rounded-lg"
                >
                  <Play className="w-3.5 h-3.5 fill-white" /> Start Sniffing
                </button>
                {!activeModel && (
                  <div className="text-[10px] text-amber-400 flex items-start gap-1 p-2 bg-amber-500/5 border border-amber-500/10 rounded-lg leading-relaxed">
                    <InfoTip content="An active trained model must be deployed in the Models registry before starting live classification." />
                    <span>Deploys model first to start stream.</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions navigation links */}
          <div className="card p-5 space-y-3.5">
            <h3 className="text-sm font-semibold text-text-primary">Quick Actions</h3>
            <div className="space-y-1">
              {[
                { label: 'Upload CSV Dataset', icon: Database, path: '/datasets', color: 'text-blue-400 hover:bg-blue-500/5' },
                { label: 'Model Training Console', icon: Flame, path: '/training', color: 'text-orange-400 hover:bg-orange-500/5' },
                { label: 'Drill-Down Analytics', icon: BarChart3, path: '/analytics', color: 'text-emerald-400 hover:bg-emerald-500/5' },
                { label: 'System Settings config', icon: Clock, path: '/settings', color: 'text-text-secondary hover:bg-white/5' },
              ].map(action => (
                <Link
                  key={action.path}
                  to={action.path}
                  className="flex items-center gap-3 p-2.5 rounded-lg transition-colors group hover:bg-surface-2"
                >
                  <action.icon className={`w-4 h-4 ${action.color.split(' ')[0]}`} />
                  <span className="text-[13px] text-text-secondary group-hover:text-text-primary transition-colors">{action.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-text-tertiary ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Live telemetry charts and incident listings */}
        <div className="xl:col-span-3 space-y-6">
          
          {/* Live Telemetry graph rendering when sniffing */}
          {isSniffing && liveHistory.length > 0 && (
            <div className="card p-5 space-y-4 animate-fade-in">
              <div>
                <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  Live Stream Traffic Rates (Packets / Flows)
                </h3>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={liveHistory} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPackets" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                    <XAxis dataKey="time" stroke="rgba(255,255,255,0.15)" fontSize={9} />
                    <YAxis stroke="rgba(255,255,255,0.15)" fontSize={9} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#090e18', border: '1px solid rgba(56,189,248,0.1)' }} labelStyle={{ color: '#fff' }} />
                    <Area type="monotone" dataKey="packets" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorPackets)" name="Packets" />
                    <Area type="monotone" dataKey="threats" stroke="#ef4444" fillOpacity={1} fill="url(#colorThreats)" name="Threats" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Incident Feed listing */}
          <div className="card overflow-hidden">
            <div className="p-5 flex items-center justify-between border-b border-white/5">
              <div>
                <h3 className="text-sm font-semibold text-text-primary">Recent Incidents Feed</h3>
                <p className="text-[11px] text-text-secondary mt-0.5">Telemetry classification logs and anomaly alerts</p>
              </div>
              <Link to="/threats" className="btn btn-ghost btn-sm text-blue-400 font-bold hover:text-blue-300">
                Drill Down Incidents <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {isThreatsLoading ? (
              <div className="p-12 flex items-center justify-center gap-2.5 text-text-secondary text-xs">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                Querying security repositories...
              </div>
            ) : displayThreats.length === 0 ? (
              <EmptyState
                icon={ShieldAlert}
                title="No incidents captured"
                description="All packet analysis lines classified clean. Start the sniffing engine to begin monitoring."
                action={<Link to="/datasets" className="btn btn-primary btn-sm rounded-lg"><Database className="w-3.5 h-3.5" /> Upload Dataset</Link>}
              />
            ) : (
              <div className="divide-y divide-white/5">
                {displayThreats.map((threat: any) => (
                  <div
                    key={threat.id}
                    onClick={() => setSelectedThreat(threat)}
                    className="px-5 py-4 flex items-center justify-between gap-4 table-row-hover cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <Badge variant={severityToBadgeVariant(threat.severity)}>
                        {threat.severity}
                      </Badge>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-white truncate">{threat.attack_category}</div>
                        <div className="text-[11px] text-text-tertiary mt-1 font-mono-data">
                          {threat.mitre_technique_id || 'MITRE T1000'} · {threat.src_ip && `${threat.src_ip} → ${threat.dst_ip}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0 text-right">
                      <div className="hidden sm:block">
                        <div className="text-[11px] text-text-tertiary">
                          {threat.created_at ? formatDistanceToNow(new Date(threat.created_at), { addSuffix: true }) : 'Just now'}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-text-tertiary" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Incident Detail Drawer panel overlay */}
      {selectedThreat && (
        <div className="fixed inset-0 z-50 flex justify-end animate-overlay" onClick={() => setSelectedThreat(null)}>
          <div className="w-full max-w-lg bg-[#090e18] border-l border-border-strong h-full overflow-y-auto animate-slide-in-right shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
            
            {/* Header */}
            <div className="sticky top-0 bg-[#090e18]/90 backdrop-blur-md border-b border-border-default p-5 flex items-center justify-between z-10">
              <div>
                <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">Incident Details</h2>
                <span className="text-[10px] text-text-tertiary font-mono-data">{selectedThreat.id}</span>
              </div>
              <button onClick={() => setSelectedThreat(null)} className="btn btn-ghost btn-sm rounded-lg hover:bg-surface-2">
                <X className="w-4 h-4" /> Close
              </button>
            </div>

            <div className="p-5 space-y-6">
              
              {/* Classification Summary */}
              <div className="card p-4 space-y-3 bg-[#0f172a] border-border-default shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Risk Matrix Class</span>
                  <Badge variant={severityToBadgeVariant(selectedThreat.severity)}>
                    {selectedThreat.severity}
                  </Badge>
                </div>
                <div className="text-[17px] font-extrabold text-white">{selectedThreat.attack_category}</div>
                <div className="text-xs text-text-secondary leading-relaxed">
                  MITRE ATT&CK Mapping: <span className="text-blue-400 font-bold">{selectedThreat.mitre_technique_id}</span> — {selectedThreat.mitre_technique_name || 'Exploitation of Public-Facing Application'}
                </div>
              </div>

              {/* Network Details */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-extrabold text-text-tertiary uppercase tracking-wider">Network Log Headers</h4>
                <div className="grid grid-cols-2 gap-3.5 text-xs text-text-secondary">
                  <div className="bg-[#0f172a]/60 border border-border-default p-3.5 rounded-xl">
                    <span className="text-[9px] text-text-tertiary block font-semibold uppercase tracking-wider">Origin Address</span>
                    <div className="font-mono-data font-bold text-white mt-1">{selectedThreat.src_ip || '—'}</div>
                  </div>
                  <div className="bg-[#0f172a]/60 border border-border-default p-3.5 rounded-xl">
                    <span className="text-[9px] text-text-tertiary block font-semibold uppercase tracking-wider">Destination</span>
                    <div className="font-mono-data font-bold text-white mt-1">{selectedThreat.dst_ip || '—'}</div>
                  </div>
                  <div className="bg-[#0f172a]/60 border border-border-default p-3.5 rounded-xl">
                    <span className="text-[9px] text-text-tertiary block font-semibold uppercase tracking-wider">Port / Protocol</span>
                    <div className="font-mono-data font-bold text-white mt-1">{selectedThreat.dst_port || '—'} / {selectedThreat.protocol || '—'}</div>
                  </div>
                  <div className="bg-[#0f172a]/60 border border-border-default p-3.5 rounded-xl">
                    <span className="text-[9px] text-text-tertiary block font-semibold uppercase tracking-wider">Inference Speed</span>
                    <div className="font-mono-data font-bold text-white mt-1">{selectedThreat.processing_latency ? `${(selectedThreat.processing_latency * 1000).toFixed(1)} ms` : '—'}</div>
                  </div>
                </div>
              </div>

              {/* Threat Intelligence scoring */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-extrabold text-text-tertiary uppercase tracking-wider">Threat Intel Reputations</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="card bg-[#0f172a]/60 p-4 text-center border-border-default">
                    <span className="text-[9px] text-text-tertiary block font-semibold uppercase tracking-wider">AbuseIPDB Score</span>
                    <div className="text-xl font-black text-orange-400 mt-1.5">{selectedThreat.abuseipdb_score || 0}%</div>
                  </div>
                  <div className="card bg-[#0f172a]/60 p-4 text-center border-border-default">
                    <span className="text-[9px] text-text-tertiary block font-semibold uppercase tracking-wider">VirusTotal Hits</span>
                    <div className="text-xl font-black text-red-500 mt-1.5">{selectedThreat.virustotal_score || 0} / 10</div>
                  </div>
                </div>
              </div>

              {/* Action recommendations */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-extrabold text-text-tertiary uppercase tracking-wider">Mitigation Recommendations</h4>
                <div className="card p-4 text-xs text-text-secondary leading-relaxed bg-[#0f172a]/60 border-border-default">
                  {selectedThreat.recommended_action || 'Inspect the origin address logs, block packet routing at the perimeter firewall, and run localized antivirus/malware scanners on target host nodes.'}
                </div>
              </div>

              {/* Incident Resolution Status updates */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-extrabold text-text-tertiary uppercase tracking-wider">Resolve Status</h4>
                <div className="flex gap-2">
                  {['Open', 'Investigating', 'Resolved', 'Dismissed'].map((statusOption) => {
                    const isCurrent = selectedThreat.resolution_status?.toLowerCase() === statusOption.toLowerCase() ||
                                      (statusOption === 'Open' && !selectedThreat.resolution_status);
                    return (
                      <button
                        key={statusOption}
                        disabled={updateThreatStatusMutation.isPending}
                        onClick={() => updateThreatStatusMutation.mutate({ id: selectedThreat.id, status: statusOption })}
                        className={`flex-1 py-2.5 rounded-lg text-xs font-bold border transition-all ${
                          isCurrent
                            ? 'bg-[#0ea5e9] border-[#0ea5e9] text-white shadow-md shadow-sky-500/10'
                            : 'bg-[#0f172a]/60 border-border-default text-text-tertiary hover:text-text-secondary hover:border-slate-700'
                        }`}
                      >
                        {statusOption}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
