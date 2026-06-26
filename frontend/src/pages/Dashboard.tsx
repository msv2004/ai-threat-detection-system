import React, { useState } from 'react';
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
import Badge, { severityToBadgeVariant, statusToBadgeVariant } from '../components/ui/Badge';
import { InfoTip } from '../components/ui/Tooltip';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonCard } from '../components/ui/Skeleton';
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

  // Check if user has any data at all (for first-time guidance)
  const isNewUser = !isOverviewLoading && !overview?.total_predictions && displayThreats.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Security posture overview and real-time threat monitoring."
      />

      {/* First-time user guidance */}
      {isNewUser && (
        <div className="card p-5 border-l-4 border-l-accent bg-accent/[0.03] animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-1">Welcome to Aegis</h3>
              <p className="text-sm text-text-secondary leading-relaxed mb-3">
                Get started by uploading a network traffic dataset, training a detection model, then running threat analysis on your data.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link to="/datasets" className="btn btn-primary btn-sm">
                  <Database className="w-3.5 h-3.5" /> Upload Dataset
                </Link>
                <Link to="/training" className="btn btn-secondary btn-sm">
                  <Flame className="w-3.5 h-3.5" /> Train Model
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active threat alert banner */}
      {isUnderAttack && (
        <div className="card p-4 border-l-4 border-l-severity-critical bg-red-500/[0.04] glow-critical animate-fade-in">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-red-400">Active Threat Detected</h3>
              <p className="text-xs text-text-secondary mt-0.5">
                AI models have classified high-severity traffic in the current detection stream. Review the threat feed for details.
              </p>
            </div>
            <Link to="/threats" className="btn btn-sm btn-danger shrink-0 ml-auto">
              View Threats
            </Link>
          </div>
        </div>
      )}

      {/* KPI cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isOverviewLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            {/* Active Model */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-text-tertiary uppercase tracking-wide">Active Model</span>
                <InfoTip content="The currently deployed machine learning model used for threat classification." />
              </div>
              <div className="text-lg font-bold text-text-primary">
                {activeModel ? activeModel.algorithm : 'None'}
              </div>
              <span className="text-xs text-text-secondary mt-1 block">
                {activeModel ? `v${activeModel.version} · ${((activeModel.accuracy || 0) * 100).toFixed(1)}% accuracy` : 'No model deployed'}
              </span>
            </div>

            {/* Threats Today */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-text-tertiary uppercase tracking-wide">Threats Today</span>
                <InfoTip content="Number of suspicious network flows classified as threats in the last 24 hours." />
              </div>
              <div className="text-2xl font-bold text-text-primary">{threatsToday}</div>
              <span className="text-xs text-text-secondary mt-1 block">
                {overview?.total_predictions || 0} total predictions
              </span>
            </div>

            {/* Critical Events */}
            <div className={`card p-5 ${criticalCount > 0 ? 'border-red-500/20 glow-critical' : ''}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-text-tertiary uppercase tracking-wide">Critical Events</span>
                <InfoTip content="High-severity threats requiring immediate investigation and response." />
              </div>
              <div className={`text-2xl font-bold ${criticalCount > 0 ? 'text-red-400' : 'text-text-primary'}`}>
                {criticalCount}
              </div>
              <span className="text-xs text-text-secondary mt-1 block">
                {criticalCount > 0 ? 'Immediate action required' : 'No critical incidents'}
              </span>
            </div>

            {/* Detection Latency */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-text-tertiary uppercase tracking-wide">Avg. Latency</span>
                <InfoTip content="Average time for the AI model to classify a single network flow." />
              </div>
              <div className="text-2xl font-bold text-text-primary">
                {overview?.average_latency ? `${overview.average_latency.toFixed(2)}ms` : '—'}
              </div>
              <span className="text-xs text-text-secondary mt-1 block">
                Per-flow inference time
              </span>
            </div>
          </>
        )}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

        {/* Detection Engine panel */}
        <div className="xl:col-span-1 space-y-4">
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <Radio className="w-4 h-4 text-accent" />
                Detection Engine
              </h3>
              <InfoTip content="Start or stop the network intrusion detection system. Live mode captures from your network interface; PCAP mode replays recorded traffic." />
            </div>

            {isSniffing ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-xs font-semibold text-emerald-400">Active</span>
                  <span className="text-xs text-text-tertiary ml-auto">{activeSessionStats?.interface}</span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-text-secondary">
                    <span>Packets</span>
                    <span className="font-mono-data font-semibold text-text-primary">{activeSessionStats?.packet_count || 0}</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>Flows</span>
                    <span className="font-mono-data font-semibold text-text-primary">{activeSessionStats?.flow_count || 0}</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>Threats</span>
                    <span className="font-mono-data font-semibold text-red-400">{activeSessionStats?.threat_count || 0}</span>
                  </div>
                  <div className="flex justify-between text-text-secondary border-t border-border-subtle pt-2 mt-2">
                    <span>Duration</span>
                    <span className="font-mono-data font-semibold text-text-primary">
                      {activeSessionStats?.duration_seconds ? `${activeSessionStats.duration_seconds.toFixed(0)}s` : '0s'}
                    </span>
                  </div>
                </div>

                <button onClick={() => stopCaptureMutation.mutate()} className="btn btn-danger w-full btn-sm">
                  <Square className="w-3.5 h-3.5" /> Stop Detection
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">Mode</label>
                  <div className="grid grid-cols-2 gap-1.5 bg-surface-0 p-1 rounded-lg border border-border-subtle">
                    <button
                      onClick={() => setCaptureMode('live')}
                      className={`text-center py-2 rounded-md text-xs font-semibold transition-colors ${captureMode === 'live' ? 'bg-accent/10 text-accent' : 'text-text-tertiary hover:text-text-secondary'}`}
                    >Live Capture</button>
                    <button
                      onClick={() => setCaptureMode('offline')}
                      className={`text-center py-2 rounded-md text-xs font-semibold transition-colors ${captureMode === 'offline' ? 'bg-accent/10 text-accent' : 'text-text-tertiary hover:text-text-secondary'}`}
                    >PCAP Replay</button>
                  </div>
                </div>

                {captureMode === 'live' ? (
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">Network Interface</label>
                    <input
                      type="text"
                      value={captureInterface}
                      onChange={(e) => setCaptureInterface(e.target.value)}
                      placeholder="e.g. eth0, Wi-Fi"
                      className="input input-sm"
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">PCAP File Path</label>
                      <input type="text" value={pcapFilePath} onChange={(e) => setPcapFilePath(e.target.value)} className="input input-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">Replay Speed</label>
                      <input type="number" step="0.5" min="0" value={replaySpeed} onChange={(e) => setReplaySpeed(parseFloat(e.target.value))} className="input input-sm" />
                    </div>
                  </>
                )}

                <button onClick={handleStartCapture} disabled={startCaptureMutation.isPending} className="btn btn-primary w-full btn-sm">
                  <Play className="w-3.5 h-3.5" /> Start Detection
                </button>
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="card p-5 space-y-3">
            <h3 className="text-sm font-semibold text-text-primary">Quick Actions</h3>
            <div className="space-y-1.5">
              {[
                { label: 'Upload Dataset', icon: Database, path: '/datasets', color: 'text-blue-400' },
                { label: 'Train Model', icon: Flame, path: '/training', color: 'text-orange-400' },
                { label: 'View Analytics', icon: BarChart3, path: '/analytics', color: 'text-emerald-400' },
              ].map(action => (
                <Link
                  key={action.path}
                  to={action.path}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-2 transition-colors group"
                >
                  <action.icon className={`w-4 h-4 ${action.color}`} />
                  <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">{action.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-text-tertiary ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent threats */}
        <div className="xl:col-span-3">
          <div className="card overflow-hidden">
            <div className="p-5 flex items-center justify-between border-b border-border-subtle">
              <div>
                <h3 className="text-sm font-semibold text-text-primary">Recent Threats</h3>
                <p className="text-xs text-text-secondary mt-0.5">AI-classified security incidents from recent analysis</p>
              </div>
              <Link to="/threats" className="btn btn-ghost btn-sm text-accent">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {isThreatsLoading ? (
              <div className="p-8 flex items-center justify-center gap-2 text-text-secondary text-sm">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Loading threats...
              </div>
            ) : displayThreats.length === 0 ? (
              <EmptyState
                icon={ShieldAlert}
                title="No threats detected"
                description="No security incidents found. Upload a dataset and run detection to begin analysis."
                action={<Link to="/datasets" className="btn btn-primary btn-sm"><Database className="w-3.5 h-3.5" /> Upload Dataset</Link>}
              />
            ) : (
              <div className="divide-y divide-border-subtle">
                {displayThreats.map((threat: any) => (
                  <div
                    key={threat.id}
                    onClick={() => setSelectedThreat(threat)}
                    className="px-5 py-4 flex items-center justify-between gap-4 table-row-hover cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Badge variant={severityToBadgeVariant(threat.severity)}>
                        {threat.severity}
                      </Badge>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-text-primary truncate">{threat.attack_category}</div>
                        <div className="text-xs text-text-tertiary mt-0.5">
                          {threat.mitre_technique_id} · {threat.src_ip && `${threat.src_ip} → ${threat.dst_ip}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0 text-right">
                      <div className="hidden sm:block">
                        <div className="text-xs text-text-tertiary">
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

      {/* Threat detail drawer */}
      {selectedThreat && (
        <div className="fixed inset-0 z-50 flex justify-end animate-overlay" onClick={() => setSelectedThreat(null)}>
          <div className="w-full max-w-lg bg-surface-1 border-l border-border-subtle h-full overflow-y-auto animate-slide-in-right" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="sticky top-0 bg-surface-1 border-b border-border-subtle p-5 flex items-center justify-between z-10">
              <h2 className="text-base font-semibold text-text-primary">Threat Details</h2>
              <button onClick={() => setSelectedThreat(null)} className="btn btn-ghost btn-sm">
                <X className="w-4 h-4" /> Close
              </button>
            </div>

            <div className="p-5 space-y-6">
              {/* Classification */}
              <div className="card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-text-tertiary">Classification</span>
                  <Badge variant={severityToBadgeVariant(selectedThreat.severity)}>
                    {selectedThreat.severity}
                  </Badge>
                </div>
                <div className="text-lg font-semibold text-text-primary">{selectedThreat.attack_category}</div>
                <div className="text-sm text-text-secondary">
                  MITRE ATT&CK: <span className="text-accent">{selectedThreat.mitre_technique_id}</span> — {selectedThreat.mitre_technique_name}
                </div>
              </div>

              {/* Network details */}
              <div>
                <h4 className="text-xs font-medium text-text-tertiary uppercase tracking-wide mb-3">Network Details</h4>
                <div className="card p-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs text-text-tertiary">Source IP</span>
                    <div className="font-mono-data text-text-primary mt-0.5">{selectedThreat.src_ip || '—'}</div>
                  </div>
                  <div>
                    <span className="text-xs text-text-tertiary">Destination IP</span>
                    <div className="font-mono-data text-text-primary mt-0.5">{selectedThreat.dst_ip || '—'}</div>
                  </div>
                  <div>
                    <span className="text-xs text-text-tertiary">Port / Protocol</span>
                    <div className="font-mono-data text-text-primary mt-0.5">{selectedThreat.dst_port || '—'} / {selectedThreat.protocol || '—'}</div>
                  </div>
                  <div>
                    <span className="text-xs text-text-tertiary">Flow ID</span>
                    <div className="font-mono-data text-text-primary mt-0.5 truncate text-xs" title={selectedThreat.flow_id}>{selectedThreat.flow_id || '—'}</div>
                  </div>
                </div>
              </div>

              {/* Threat intel */}
              <div>
                <h4 className="text-xs font-medium text-text-tertiary uppercase tracking-wide mb-3">Threat Intelligence</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="card p-4 text-center">
                    <span className="text-xs text-text-tertiary">AbuseIPDB</span>
                    <div className="text-xl font-bold text-orange-400 mt-1">{selectedThreat.abuseipdb_score || 0}%</div>
                  </div>
                  <div className="card p-4 text-center">
                    <span className="text-xs text-text-tertiary">VirusTotal</span>
                    <div className="text-xl font-bold text-red-400 mt-1">{selectedThreat.virustotal_score || 0}/10</div>
                  </div>
                </div>
              </div>

              {/* Recommendation */}
              <div>
                <h4 className="text-xs font-medium text-text-tertiary uppercase tracking-wide mb-3">Recommended Action</h4>
                <div className="card p-4 text-sm text-text-secondary leading-relaxed">
                  {selectedThreat.recommended_action || 'Review the source IP and consider blocking at the firewall level. Inspect targeted system logs for indicators of compromise.'}
                </div>
              </div>

              {/* Resolution workflow */}
              <div>
                <h4 className="text-xs font-medium text-text-tertiary uppercase tracking-wide mb-3">Status</h4>
                <div className="flex gap-2">
                  {['Open', 'Investigating', 'Resolved', 'Dismissed'].map((statusOption) => {
                    const isCurrent = selectedThreat.resolution_status?.toLowerCase() === statusOption.toLowerCase() ||
                                      (statusOption === 'Open' && !selectedThreat.resolution_status);
                    return (
                      <button
                        key={statusOption}
                        disabled={updateThreatStatusMutation.isPending}
                        onClick={() => updateThreatStatusMutation.mutate({ id: selectedThreat.id, status: statusOption })}
                        className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all border ${
                          isCurrent
                            ? 'bg-accent/10 border-accent/30 text-accent'
                            : 'bg-surface-2 border-border-subtle text-text-tertiary hover:text-text-secondary hover:border-border-default'
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
