import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { threatService } from '../services/api';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  AlertTriangle, 
  ChevronRight, 
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function SkeletonThreatRow() {
  return (
    <tr className="animate-pulse">
      <td className="p-4"><div className="h-4 bg-white/10 rounded w-16" /></td>
      <td className="p-4"><div className="h-3 bg-white/10 rounded w-28" /></td>
      <td className="p-4"><div className="h-3 bg-white/10 rounded w-28" /></td>
      <td className="p-4"><div className="h-3 bg-white/10 rounded w-20" /></td>
      <td className="p-4"><div className="h-3 bg-white/10 rounded w-14" /></td>
      <td className="p-4"><div className="h-4 bg-white/10 rounded w-20" /></td>
      <td className="p-4"><div className="h-3 bg-white/10 rounded w-24" /></td>
    </tr>
  );
}

export default function Threats() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedThreat, setSelectedThreat] = useState<any>(null);

  // Fetch all threats
  const { data: threats, isLoading, isError, refetch } = useQuery({
    queryKey: ['threats'],
    queryFn: () => threatService.list(),
    retry: 1,
  });

  // Status update mutation
  const updateThreatMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      threatService.updateStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['threats'] });
      queryClient.invalidateQueries({ queryKey: ['overview'] });
      if (selectedThreat && selectedThreat.id === data.id) {
        setSelectedThreat(data);
      }
    }
  });

  // Client side filtering
  const filteredThreats = threats?.filter((t) => {
    const matchesSearch = 
      t.attack_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.src_ip && t.src_ip.includes(searchTerm)) ||
      t.mitre_technique_id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity = 
      severityFilter === 'All' || 
      t.severity.toLowerCase() === severityFilter.toLowerCase();

    const matchesStatus = 
      statusFilter === 'All' || 
      (statusFilter === 'Open' && (!t.resolution_status || t.resolution_status.toLowerCase() === 'open')) ||
      (t.resolution_status && t.resolution_status.toLowerCase() === statusFilter.toLowerCase());

    return matchesSearch && matchesSeverity && matchesStatus;
  }) || [];

  const getSeverityClass = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'text-red-400 bg-red-950/20 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-950/20 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-950/10 border-yellow-500/20';
      default: return 'text-cyan-400 bg-cyan-950/20 border-cyan-500/30';
    }
  };

  const getStatusClass = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'resolved': return 'text-emerald-400 bg-emerald-950/20 border-emerald-500/30';
      case 'investigating': return 'text-amber-400 bg-amber-950/20 border-amber-500/30';
      case 'dismissed': return 'text-white/40 bg-slate-900 border-white/5';
      default: return 'text-red-400 bg-red-950/20 border-red-500/30';
    }
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wider uppercase m-0 leading-none">Incident Logs Registry</h1>
          <span className="text-[10px] text-white/40 tracking-widest mt-1 block">SEARCH & AUDIT SYSTEM THREAT INTEL VECTORS</span>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 bg-[#090d18] border border-white/10 hover:border-white/20 text-white/60 hover:text-white px-3.5 py-1.5 rounded-lg text-xs uppercase tracking-wider transition-colors cursor-pointer self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Database
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-[#0a0f1d] border border-white/5 rounded-xl p-4 flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by category, source IP, or MITRE code..."
            className="w-full bg-[#070b13] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#06b6d4] transition-colors"
          />
        </div>

        {/* Severity filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-white/40" />
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-[#06b6d4]"
          >
            <option value="All">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Resolution status filter */}
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-white/40" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#070b13] border border-white/10 rounded-lg px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-[#06b6d4]"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>
      </div>

      {/* Incident Log Table Grid */}
      <div className="bg-[#0a0f1d] border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-[#080d18]/50 border-b border-white/5 text-white/40 font-bold uppercase tracking-wider">
                <th className="p-4">SEVERITY</th>
                <th className="p-4">ATTACK CLASSIFICATION</th>
                <th className="p-4">SOURCE VECTOR (IP/PORT)</th>
                <th className="p-4">MITRE MAPPING</th>
                <th className="p-4">REPUTATION</th>
                <th className="p-4">STATUS</th>
                <th className="p-4">DETECTED TIME</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80">
              {isLoading ? (
                <>
                  <SkeletonThreatRow />
                  <SkeletonThreatRow />
                  <SkeletonThreatRow />
                  <SkeletonThreatRow />
                </>
              ) : isError ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <AlertTriangle className="w-6 h-6 text-amber-400" />
                      <p className="text-sm font-semibold text-white">Could not load threat logs</p>
                      <p className="text-xs text-white/50">The backend may be warming up. Check your connection and try again.</p>
                      <button
                        onClick={() => refetch()}
                        className="px-3 py-1.5 bg-white/5 border border-white/10 hover:border-white/20 rounded-lg text-xs font-semibold text-white/70 hover:text-white transition-colors mt-1"
                      >
                        Retry
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredThreats.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6 text-white/30" />
                      </div>
                      <p className="text-sm font-semibold text-white">No threats found</p>
                      <p className="text-xs text-white/40 max-w-xs">
                        {searchTerm || severityFilter !== 'All' || statusFilter !== 'All'
                          ? 'No threats match your current filters. Try broadening your search.'
                          : 'No threats detected yet. Upload a dataset and run detection from the Dashboard to populate this log.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredThreats.map((threat) => (
                  <tr
                    key={threat.id}
                    onClick={() => setSelectedThreat(threat)}
                    className="hover:bg-white/[0.01] cursor-pointer transition-colors"
                  >
                    <td className="p-4">
                      <span className={`px-2 py-0.5 border rounded text-[9px] font-bold uppercase ${getSeverityClass(threat.severity)}`}>
                        {threat.severity}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-white text-xs">{threat.attack_category}</td>
                    <td className="p-4">
                      <div className="font-mono text-white/70">
                        {threat.src_ip || '192.168.1.10'} → {threat.dst_ip || '10.0.0.45'}
                      </div>
                      <div className="text-[10px] text-white/40 mt-0.5">
                        Port: {threat.dst_port || 80} / {threat.protocol || 'TCP'}
                      </div>
                    </td>
                    <td className="p-4 text-white/70">
                      <span className="text-[#06b6d4] font-bold">{threat.mitre_technique_id}</span>
                      <span className="text-white/40 text-[10px] block mt-0.5">{threat.mitre_technique_name}</span>
                    </td>
                    <td className="p-4">
                      <div className="text-white/80 font-bold">{threat.virustotal_score || 90}% VT</div>
                      <div className="text-[10px] text-white/40 mt-0.5">AbuseIP: {threat.abuseipdb_score || 85}%</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 border rounded text-[9px] font-bold uppercase ${getStatusClass(threat.resolution_status)}`}>
                        {threat.resolution_status || 'Open'}
                      </span>
                    </td>
                    <td className="p-4 text-white/50 text-[10px]">
                      {threat.created_at ? formatDistanceToNow(new Date(threat.created_at), { addSuffix: true }) : 'Just now'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Threat Detail Sidebar Drawer */}
      {selectedThreat && (
        <div className="fixed inset-0 z-50 bg-[#080b11]/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-lg bg-[#0a0f1d] border-l border-white/10 h-full p-6 overflow-y-auto flex flex-col font-mono">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider m-0">Threat Analysis Details</h2>
              </div>
              <button 
                onClick={() => setSelectedThreat(null)}
                className="text-white/40 hover:text-white text-xs border border-white/10 px-2 py-1 rounded"
              >
                CLOSE [ESC]
              </button>
            </div>

            {/* Info contents */}
            <div className="flex-1 space-y-6 text-xs">
              
              {/* Classification card */}
              <div className="bg-[#070b13] p-4 rounded-lg border border-white/5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white/40">ANOMALY TYPE</span>
                  <span className={`px-2.5 py-0.5 border rounded text-[9px] font-bold uppercase ${getSeverityClass(selectedThreat.severity)}`}>
                    {selectedThreat.severity}
                  </span>
                </div>
                <div className="text-base text-white font-bold">{selectedThreat.attack_category}</div>
                <div className="text-white/40 text-[11px]">MITRE mapping: <span className="text-[#06b6d4]">{selectedThreat.mitre_technique_id} - {selectedThreat.mitre_technique_name}</span></div>
              </div>

              {/* Network statistics */}
              <div className="space-y-2">
                <h4 className="text-[10px] text-white/40 uppercase tracking-widest">NETWORK SIGNATURE</h4>
                <div className="bg-[#070b13] p-3 rounded-lg border border-white/5 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/40">SOURCE ADDRESS</span>
                    <span className="text-white">{selectedThreat.src_ip || '192.168.1.10'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">DESTINATION TARGET</span>
                    <span className="text-white">{selectedThreat.dst_ip || '10.0.0.45'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">PORT / PROTOCOL</span>
                    <span className="text-white">{selectedThreat.dst_port || 80} / {selectedThreat.protocol || 'TCP'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">CORRELATION ID</span>
                    <span className="text-[#06b6d4] text-[10px] truncate w-40 text-right" title={selectedThreat.id}>{selectedThreat.id}</span>
                  </div>
                </div>
              </div>

              {/* Threat intelligence reputation */}
              <div className="space-y-2">
                <h4 className="text-[10px] text-white/40 uppercase tracking-widest">INTELLIGENCE ENRICHMENT</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#070b13] p-3 rounded-lg border border-white/5">
                    <span className="text-[9px] text-white/40 block text-center">VIRUSTOTAL REPUTATION</span>
                    <div className="text-lg font-bold text-red-400 mt-1 text-center">
                      {selectedThreat.virustotal_score || 9}/10
                    </div>
                  </div>
                  <div className="bg-[#070b13] p-3 rounded-lg border border-white/5">
                    <span className="text-[9px] text-white/40 block text-center">ABUSEIPDB CONFIDENCE</span>
                    <div className="text-lg font-bold text-orange-400 mt-1 text-center">
                      {selectedThreat.abuseipdb_score || 85}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Mitigations */}
              <div className="space-y-2">
                <h4 className="text-[10px] text-white/40 uppercase tracking-widest">MITIGATION PLAYBOOK</h4>
                <div className="bg-[#070b13] p-4.5 rounded-lg border border-white/5 text-white/70 text-xs">
                  <p className="font-bold text-[#06b6d4] mb-2">Technique Strategy: {selectedThreat.mitre_technique_id}</p>
                  <p className="leading-relaxed">
                    {selectedThreat.recommended_action || 'Block offending source IP at network firewalls. Isolate targeted systems for audit logs inspections. Check active process list for unauthorized sockets.'}
                  </p>
                </div>
              </div>

              {/* Status workflow */}
              <div className="space-y-3 border-t border-white/5 pt-4">
                <label className="block text-[10px] text-white/40 uppercase tracking-widest">INCIDENT PLAYBOOK RESOLUTION STATUS</label>
                <div className="flex gap-2">
                  {['Open', 'Investigating', 'Resolved', 'Dismissed'].map((statusOption) => {
                    const isCurrent = selectedThreat.resolution_status?.toLowerCase() === statusOption.toLowerCase() || 
                                      (statusOption === 'Open' && !selectedThreat.resolution_status);
                    return (
                      <button
                        key={statusOption}
                        disabled={updateThreatMutation.isPending}
                        onClick={() => updateThreatMutation.mutate({ id: selectedThreat.id, status: statusOption })}
                        className={`
                          flex-1 py-2 border rounded font-bold transition-all text-[10px] uppercase text-center cursor-pointer
                          ${isCurrent 
                            ? 'bg-cyan-500/10 border-cyan-500/50 text-[#06b6d4]' 
                            : 'bg-[#070b13] border-white/5 text-white/50 hover:text-white'}
                        `}
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
