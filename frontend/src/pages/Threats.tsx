import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { threatService } from '../services/api';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  AlertTriangle, 
  ChevronRight, 
  ShieldCheck,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronDown,
  ArrowUpDown
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import Badge, { severityToBadgeVariant, statusToBadgeVariant } from '../components/ui/Badge';

function SkeletonThreatRow() {
  return (
    <tr className="animate-pulse">
      <td className="p-4"><div className="h-4 bg-surface-3 rounded w-16" /></td>
      <td className="p-4"><div className="h-3.5 bg-surface-3 rounded w-28" /></td>
      <td className="p-4"><div className="h-3 bg-surface-3 rounded w-36" /></td>
      <td className="p-4"><div className="h-3 bg-surface-3 rounded w-24" /></td>
      <td className="p-4"><div className="h-3 bg-surface-3 rounded w-16" /></td>
      <td className="p-4"><div className="h-4.5 bg-surface-3 rounded w-16" /></td>
      <td className="p-4"><div className="h-3 bg-surface-3 rounded w-20" /></td>
    </tr>
  );
}

export default function Threats() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedThreat, setSelectedThreat] = useState<any>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sorting states
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1); // reset to first page on sort
  };

  // Client side filtering & sorting
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

  // Sort logic
  const sortedThreats = [...filteredThreats].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    // Fallbacks
    if (sortField === 'created_at') {
      valA = valA ? new Date(valA).getTime() : 0;
      valB = valB ? new Date(valB).getTime() : 0;
    } else if (sortField === 'severity') {
      const rank: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
      valA = rank[a.severity?.toLowerCase()] || 0;
      valB = rank[b.severity?.toLowerCase()] || 0;
    } else {
      valA = valA ? valA.toString().toLowerCase() : '';
      valB = valB ? valB.toString().toLowerCase() : '';
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Paginated subset
  const totalPages = Math.max(Math.ceil(sortedThreats.length / itemsPerPage), 1);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedThreats = sortedThreats.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-text-tertiary ml-1 inline" />;
    return <ChevronDown className={`w-3 h-3 text-accent ml-1 inline transition-transform duration-200 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />;
  };

  return (
    <div className="space-y-6 text-left font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">Incident Feed</h2>
          <p className="text-xs text-text-secondary mt-0.5 font-sans font-semibold">Search, audit and mitigate anomalous network logs</p>
        </div>
        <button
          onClick={() => refetch()}
          className="btn btn-secondary btn-sm flex items-center gap-1.5 self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Sync Incidents
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="card p-4 flex flex-col md:flex-row gap-4 bg-surface-1 text-xs">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-text-tertiary absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            placeholder="Filter by classification category, source IP, or MITRE code..."
            className="w-full bg-surface-0 border border-border-strong rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder-text-tertiary focus:outline-none focus:border-accent transition-all font-mono-data"
          />
        </div>

        {/* Severity filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
          <select
            value={severityFilter}
            onChange={(e) => { setSeverityFilter(e.target.value); setCurrentPage(1); }}
            className="input rounded-lg py-2.5 bg-surface-0 text-text-secondary text-xs focus:border-accent"
          >
            <option value="All">All Severities</option>
            <option value="critical">Critical Only</option>
            <option value="high">High Severity</option>
            <option value="medium">Medium Severity</option>
            <option value="low">Low Severity</option>
          </select>
        </div>

        {/* Resolution status filter */}
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="input rounded-lg py-2.5 bg-surface-0 text-text-secondary text-xs focus:border-accent"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open Only</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>
      </div>

      {/* Incident Log Table Grid */}
      <div className="card overflow-hidden text-left">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs font-semibold">
            <thead>
              <tr className="bg-surface-2/40 border-b border-border-default text-text-tertiary uppercase tracking-wider text-[9px] font-bold select-none">
                <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('severity')}>
                  Severity {getSortIcon('severity')}
                </th>
                <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('attack_category')}>
                  Attack Classification {getSortIcon('attack_category')}
                </th>
                <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('src_ip')}>
                  Source Vector {getSortIcon('src_ip')}
                </th>
                <th className="p-4">MITRE ATT&CK Mapping</th>
                <th className="p-4">VT Reputation</th>
                <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('resolution_status')}>
                  Status {getSortIcon('resolution_status')}
                </th>
                <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('created_at')}>
                  Detected Time {getSortIcon('created_at')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-text-secondary">
              {isLoading ? (
                <>
                  <SkeletonThreatRow />
                  <SkeletonThreatRow />
                  <SkeletonThreatRow />
                </>
              ) : isError ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-semantic-warning" />
                      <span className="text-xs text-text-primary">Failed to load threats database</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedThreats.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <div className="flex flex-col items-center gap-3 text-text-secondary">
                      <ShieldCheck className="w-8 h-8 text-text-tertiary" />
                      <span className="text-xs font-bold text-white">No threat incidents found</span>
                      <p className="text-[10px] text-text-tertiary max-w-xs">No records match current parameters. Modify filters or start the sniffing capture stream.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedThreats.map((threat) => (
                  <tr
                    key={threat.id}
                    onClick={() => setSelectedThreat(threat)}
                    className="hover:bg-surface-2 transition-colors cursor-pointer"
                  >
                    <td className="p-4">
                      <Badge variant={severityToBadgeVariant(threat.severity)}>
                        {threat.severity}
                      </Badge>
                    </td>
                    <td className="p-4 font-bold text-white">{threat.attack_category}</td>
                    <td className="p-4 font-mono-data">
                      <div className="text-white">
                        {threat.src_ip || '192.168.1.10'} → {threat.dst_ip || '10.0.0.45'}
                      </div>
                      <div className="text-[10px] text-text-tertiary mt-0.5">
                        Port: {threat.dst_port || 80} / {threat.protocol || 'TCP'}
                      </div>
                    </td>
                    <td className="p-4 font-mono-data text-accent">
                      <span className="font-bold">{threat.mitre_technique_id}</span>
                      <span className="text-text-tertiary text-[10px] block mt-0.5 font-sans font-semibold">{threat.mitre_technique_name}</span>
                    </td>
                    <td className="p-4 font-mono-data">
                      <div className="text-white font-bold">{threat.virustotal_score || 9}% VT</div>
                      <div className="text-[9px] text-text-tertiary mt-0.5">AbuseIP: {threat.abuseipdb_score || 85}%</div>
                    </td>
                    <td className="p-4">
                      <Badge variant={statusToBadgeVariant(threat.resolution_status)} dot>
                        {threat.resolution_status || 'Open'}
                      </Badge>
                    </td>
                    <td className="p-4 text-text-tertiary font-mono-data text-[10px]">
                      {threat.created_at ? formatDistanceToNow(new Date(threat.created_at), { addSuffix: true }) : 'Just now'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div className="p-4 bg-surface-1/50 border-t border-border-default flex items-center justify-between text-xs text-text-secondary select-none">
            <span className="text-[10.5px]">
              Showing <strong className="text-white">{startIndex + 1}</strong> to <strong className="text-white">{Math.min(startIndex + itemsPerPage, sortedThreats.length)}</strong> of <strong className="text-white">{sortedThreats.length}</strong> incidents
            </span>
            
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-2.5 py-1.5 border border-border-strong rounded-lg hover:border-slate-600 transition-all disabled:opacity-30 cursor-pointer flex items-center"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Prev
              </button>
              <div className="flex items-center px-1 font-mono-data font-bold text-white">
                Page {currentPage} of {totalPages}
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1.5 border border-border-strong rounded-lg hover:border-slate-600 transition-all disabled:opacity-30 cursor-pointer flex items-center"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Incident Detail Sidebar Drawer */}
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
              className="w-full max-w-lg bg-surface-1 border-l border-border-strong h-full p-6 overflow-y-auto flex flex-col z-10 shadow-2xl relative"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-border-default pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-semantic-critical shrink-0" />
                  <div>
                    <h2 className="text-xs font-bold text-white uppercase tracking-widest leading-none">Threat Analysis Playbook</h2>
                    <span className="text-[9px] text-text-tertiary block font-mono-data mt-1.5 uppercase tracking-wider leading-none">INCIDENT: {selectedThreat.id.substring(0, 8)}...</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedThreat(null)}
                  className="btn btn-ghost btn-sm rounded-lg hover:bg-surface-2 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Info contents */}
              <div className="flex-1 space-y-6 text-xs text-left font-semibold text-text-secondary">
                
                {/* Classification card */}
                <div className="bg-surface-0 p-4 rounded-xl border border-border-strong space-y-3 border-l-4 border-l-semantic-critical">
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] text-text-tertiary uppercase tracking-widest">ANOMALY VECTOR TYPE</span>
                    <Badge variant={severityToBadgeVariant(selectedThreat.severity)}>
                      {selectedThreat.severity}
                    </Badge>
                  </div>
                  <div className="text-sm font-black text-white">{selectedThreat.attack_category}</div>
                  <div className="text-[10px] text-text-tertiary font-mono-data uppercase">MITRE Technique: <span className="text-accent font-bold">{selectedThreat.mitre_technique_id} - {selectedThreat.mitre_technique_name}</span></div>
                </div>

                {/* Network statistics */}
                <div className="space-y-2">
                  <span className="block text-[9px] text-text-tertiary uppercase tracking-widest">NETWORK LOG SIGNATURE</span>
                  <div className="bg-surface-0 p-3 rounded-lg border border-border-subtle space-y-2.5 font-mono-data text-[11px]">
                    <div className="flex justify-between border-b border-border-subtle pb-1">
                      <span className="text-text-tertiary">SOURCE VECTOR ADDRESS</span>
                      <span className="text-white font-bold">{selectedThreat.src_ip || '—'}</span>
                    </div>
                    <div className="flex justify-between border-b border-border-subtle pb-1">
                      <span className="text-text-tertiary">DESTINATION TARGET ADDR</span>
                      <span className="text-white font-bold">{selectedThreat.dst_ip || '—'}</span>
                    </div>
                    <div className="flex justify-between border-b border-border-subtle pb-1">
                      <span className="text-text-tertiary">PORT / PROTOCOL SIGNALS</span>
                      <span className="text-white font-bold">{selectedThreat.dst_port || 80} / {selectedThreat.protocol || 'TCP'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-tertiary">CORRELATION ID HASH</span>
                      <span className="text-accent text-[9px] select-all max-w-[170px] truncate" title={selectedThreat.id}>{selectedThreat.id}</span>
                    </div>
                  </div>
                </div>

                {/* Threat intelligence reputation */}
                <div className="space-y-2">
                  <span className="block text-[9px] text-text-tertiary uppercase tracking-widest">INTELLIGENCE ENRICHMENT INDEX</span>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-surface-0 p-3 rounded-lg border border-border-subtle">
                      <span className="text-[8px] text-text-tertiary block font-bold uppercase tracking-wider">VIRUSTOTAL REPUTATION</span>
                      <div className="text-base font-black text-semantic-critical mt-1.5 font-mono-data">
                        {selectedThreat.virustotal_score || 9} / 10
                      </div>
                    </div>
                    <div className="bg-surface-0 p-3 rounded-lg border border-border-subtle">
                      <span className="text-[8px] text-text-tertiary block font-bold uppercase tracking-wider">ABUSEIPDB CONFIDENCE</span>
                      <div className="text-base font-black text-semantic-investigate mt-1.5 font-mono-data">
                        {selectedThreat.abuseipdb_score || 85}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mitigations */}
                <div className="space-y-2">
                  <span className="block text-[9px] text-text-tertiary uppercase tracking-widest">MITIGATION PLAYBOOK PROCEDURE</span>
                  <div className="bg-surface-0 p-4 rounded-lg border border-border-subtle text-text-secondary text-[11px] leading-relaxed">
                    {selectedThreat.recommended_action || 'Block offending source IP at network firewalls. Isolate targeted systems for audit logs inspections. Check active process list for unauthorized sockets.'}
                  </div>
                </div>

                {/* Status workflow */}
                <div className="space-y-3 pt-4 border-t border-border-default">
                  <label className="block text-[9px] text-text-tertiary uppercase tracking-widest">INCIDENT PLAYBOOK RESOLUTION STATUS</label>
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
                            flex-1 py-2.5 border rounded-lg font-bold transition-all text-[10px] uppercase text-center cursor-pointer
                            ${isCurrent 
                              ? 'bg-accent border-accent text-surface-0 shadow-md' 
                              : 'bg-surface-0 border-border-strong text-text-secondary hover:text-white hover:border-slate-600'}
                          `}
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
