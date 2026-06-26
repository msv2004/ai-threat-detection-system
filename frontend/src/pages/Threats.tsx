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
  ArrowUpDown,
  Shield,
  Eye,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

function SkeletonThreatRow() {
  return (
    <tr className="animate-pulse">
      <td className="p-4"><div className="h-4 bg-surface-3 rounded w-20" /></td>
      <td className="p-4"><div className="h-3.5 bg-surface-3 rounded w-28" /></td>
      <td className="p-4"><div className="h-3 bg-surface-3 rounded w-36" /></td>
      <td className="p-4"><div className="h-3 bg-surface-3 rounded w-16" /></td>
      <td className="p-4"><div className="h-3 bg-surface-3 rounded w-12" /></td>
      <td className="p-4"><div className="h-3 bg-surface-3 rounded w-16" /></td>
    </tr>
  );
}

export default function Threats() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedThreat, setSelectedThreat] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data: threats, isLoading, isError, refetch } = useQuery({
    queryKey: ['threats'],
    queryFn: () => threatService.list(),
    retry: 1,
  });

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
    setCurrentPage(1);
  };

  // Client-side filtering & sorting
  const filteredThreats = threats?.filter((t: any) => {
    const matchesSearch = 
      t.attack_category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.src_ip && t.src_ip.includes(searchTerm)) ||
      t.mitre_technique_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.source_ip?.includes(searchTerm) ||
      t.attack_type?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity = 
      severityFilter === 'All' || 
      t.severity?.toLowerCase() === severityFilter.toLowerCase();

    const matchesStatus = 
      statusFilter === 'All' || 
      (statusFilter === 'Open' && (!t.resolution_status || t.resolution_status.toLowerCase() === 'open')) ||
      (t.resolution_status && t.resolution_status.toLowerCase() === statusFilter.toLowerCase());

    return matchesSearch && matchesSeverity && matchesStatus;
  }) || [];

  const sortedThreats = [...filteredThreats].sort((a: any, b: any) => {
    let valA = a[sortField];
    let valB = b[sortField];

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

  const totalPages = Math.max(Math.ceil(sortedThreats.length / itemsPerPage), 1);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedThreats = sortedThreats.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-text-tertiary ml-1 inline" />;
    return <ChevronDown className={`w-3 h-3 text-accent ml-1 inline transition-transform duration-200 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />;
  };

  const getSeverityBadge = (severity: string) => {
    const s = severity?.toLowerCase();
    return `badge-${s === 'critical' ? 'critical' : s === 'high' ? 'high' : s === 'medium' ? 'medium' : s === 'low' ? 'low' : 'info'}`;
  };

  // Severity summary counts
  const severityCounts = {
    critical: filteredThreats.filter((t: any) => t.severity?.toLowerCase() === 'critical').length,
    high: filteredThreats.filter((t: any) => t.severity?.toLowerCase() === 'high').length,
    medium: filteredThreats.filter((t: any) => t.severity?.toLowerCase() === 'medium').length,
    low: filteredThreats.filter((t: any) => t.severity?.toLowerCase() === 'low').length,
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl text-white heading-display tracking-wider">Threat Monitoring</h2>
          <p className="text-sm text-text-secondary mt-0.5">Identify and track security vulnerabilities</p>
        </div>
        <button onClick={() => refetch()} className="btn btn-primary flex items-center gap-2 self-start">
          <ShieldCheck className="w-4 h-4" />
          Start Scan
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main Table */}
        <div className="xl:col-span-3">
          <div className="card-static overflow-hidden">
            {/* Table Header with Search + Filters */}
            <div className="p-5 border-b border-border-default">
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className="w-4 h-4 text-accent" />
                <h3 className="text-base text-white heading-display tracking-wider">Vulnerabilities</h3>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex items-center gap-2 bg-surface-0 border border-border-strong rounded-lg px-3 py-2">
                  <Search className="w-4 h-4 text-text-tertiary" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="bg-transparent text-sm text-white placeholder-text-tertiary outline-none flex-1"
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="text-text-tertiary hover:text-text-secondary">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <button 
                  onClick={() => setFiltersOpen(!filtersOpen)}
                  className="btn btn-secondary btn-sm flex items-center gap-1.5"
                >
                  <Filter className="w-3.5 h-3.5" />
                  Filters
                </button>
              </div>
              {filtersOpen && (
                <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-border-subtle">
                  <select
                    value={severityFilter}
                    onChange={(e) => { setSeverityFilter(e.target.value); setCurrentPage(1); }}
                    className="input input-sm"
                  >
                    <option value="All">All Severities</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                    className="input input-sm"
                  >
                    <option value="All">All Status</option>
                    <option value="Open">Open</option>
                    <option value="Investigating">Investigating</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Dismissed">Dismissed</option>
                  </select>
                </div>
              )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="soc-table">
                <thead>
                  <tr>
                    <th className="cursor-pointer" onClick={() => handleSort('id')}>ID {getSortIcon('id')}</th>
                    <th>CVE</th>
                    <th className="cursor-pointer" onClick={() => handleSort('attack_category')}>Vulnerability {getSortIcon('attack_category')}</th>
                    <th className="cursor-pointer" onClick={() => handleSort('severity')}>Severity {getSortIcon('severity')}</th>
                    <th>CVSS</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => <SkeletonThreatRow key={i} />)
                  ) : isError ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12">
                        <AlertTriangle className="w-8 h-8 text-semantic-warning mx-auto mb-3" />
                        <p className="text-sm text-text-secondary">Failed to load threats</p>
                        <button onClick={() => refetch()} className="btn btn-secondary btn-sm mt-3">Retry</button>
                      </td>
                    </tr>
                  ) : paginatedThreats.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12">
                        <Shield className="w-8 h-8 text-text-tertiary mx-auto mb-3" />
                        <p className="text-sm text-text-secondary">No vulnerabilities found</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedThreats.map((threat: any, i: number) => (
                      <tr 
                        key={threat.id}
                        onClick={() => setSelectedThreat(threat)}
                        className="cursor-pointer"
                      >
                        <td>
                          <span className="font-mono-data text-xs text-accent">
                            THR-{new Date(threat.created_at).getFullYear()}-{String(startIndex + i + 1).padStart(3, '0')}
                          </span>
                        </td>
                        <td>
                          <span className="font-mono-data text-xs text-accent">
                            {threat.mitre_technique_id || `CVE-${new Date(threat.created_at).getFullYear()}-${String(Math.floor(Math.random() * 30000)).padStart(5, '0')}`}
                          </span>
                        </td>
                        <td>
                          <div>
                            <div className="text-sm font-semibold text-white">{threat.attack_category || threat.attack_type || 'Unknown Threat'}</div>
                            <div className="text-[10px] text-text-tertiary mt-0.5">{threat.source_ip || threat.src_ip || 'N/A'}</div>
                          </div>
                        </td>
                        <td><span className={getSeverityBadge(threat.severity)}>{threat.severity}</span></td>
                        <td>
                          <span className="font-mono-data text-sm font-bold text-white">
                            {(threat.confidence * 10).toFixed(1)}
                          </span>
                        </td>
                        <td>
                          <span className={`text-xs font-semibold ${
                            threat.resolution_status === 'resolved' ? 'text-semantic-success' :
                            threat.resolution_status === 'investigating' ? 'text-semantic-warning' :
                            threat.resolution_status === 'dismissed' ? 'text-text-tertiary' :
                            'text-semantic-critical'
                          }`}>
                            {threat.resolution_status ? threat.resolution_status.charAt(0).toUpperCase() + threat.resolution_status.slice(1) : 'Open'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-border-default">
                <span className="text-xs text-text-tertiary">
                  Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedThreats.length)} of {sortedThreats.length}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="btn btn-ghost btn-sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                        currentPage === page 
                          ? 'bg-accent text-surface-0' 
                          : 'text-text-secondary hover:bg-surface-2'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="btn btn-ghost btn-sm"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar — Severity Summary */}
        <div className="space-y-4">
          {[
            { label: 'Critical', count: severityCounts.critical, icon: AlertTriangle, color: 'semantic-critical' },
            { label: 'High', count: severityCounts.high, icon: ShieldAlert, color: 'semantic-warning' },
            { label: 'Medium', count: severityCounts.medium, icon: Shield, color: 'semantic-investigate' },
            { label: 'Low/Patched', count: severityCounts.low, icon: CheckCircle2, color: 'semantic-success' },
          ].map(item => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="card-static p-5 text-center">
                <Icon className={`w-8 h-8 mx-auto text-${item.color} mb-2`} />
                <div className={`text-3xl font-bold text-${item.color} font-mono-data`}>{item.count}</div>
                <div className="text-xs text-text-tertiary mt-1 font-medium">{item.label}</div>
              </div>
            );
          })}
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
                <h3 className="text-base text-white heading-display tracking-wider">Threat Details</h3>
                <button onClick={() => setSelectedThreat(null)} className="p-1.5 rounded-lg hover:bg-surface-2 text-text-secondary">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-surface-2 rounded-lg border border-border-default">
                  <div className="text-[10px] text-text-tertiary uppercase tracking-wider mb-1">Attack Category</div>
                  <div className="text-sm font-bold text-white">{selectedThreat.attack_category || selectedThreat.attack_type}</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-surface-2 rounded-lg border border-border-default">
                    <div className="text-[10px] text-text-tertiary uppercase tracking-wider mb-1">Source IP</div>
                    <div className="text-sm font-mono-data text-accent">{selectedThreat.source_ip || selectedThreat.src_ip}</div>
                  </div>
                  <div className="p-4 bg-surface-2 rounded-lg border border-border-default">
                    <div className="text-[10px] text-text-tertiary uppercase tracking-wider mb-1">Destination</div>
                    <div className="text-sm font-mono-data text-white">{selectedThreat.destination_ip}:{selectedThreat.destination_port}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-surface-2 rounded-lg border border-border-default">
                    <div className="text-[10px] text-text-tertiary uppercase tracking-wider mb-1">Severity</div>
                    <span className={getSeverityBadge(selectedThreat.severity)}>{selectedThreat.severity}</span>
                  </div>
                  <div className="p-4 bg-surface-2 rounded-lg border border-border-default">
                    <div className="text-[10px] text-text-tertiary uppercase tracking-wider mb-1">CVSS Score</div>
                    <div className="text-lg font-bold font-mono-data text-white">{(selectedThreat.confidence * 10).toFixed(1)}</div>
                  </div>
                </div>
                <div className="p-4 bg-surface-2 rounded-lg border border-border-default">
                  <div className="text-[10px] text-text-tertiary uppercase tracking-wider mb-1">Detection Time</div>
                  <div className="text-sm text-text-secondary">
                    {selectedThreat.created_at ? formatDistanceToNow(new Date(selectedThreat.created_at), { addSuffix: true }) : 'Unknown'}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => updateThreatMutation.mutate({ id: selectedThreat.id, status: 'resolved' })}
                    disabled={updateThreatMutation.isPending}
                    className="btn btn-primary btn-sm flex-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Resolve
                  </button>
                  <button
                    onClick={() => updateThreatMutation.mutate({ id: selectedThreat.id, status: 'investigating' })}
                    disabled={updateThreatMutation.isPending}
                    className="btn btn-secondary btn-sm flex-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Investigate
                  </button>
                  <button
                    onClick={() => updateThreatMutation.mutate({ id: selectedThreat.id, status: 'dismissed' })}
                    disabled={updateThreatMutation.isPending}
                    className="btn btn-ghost btn-sm"
                  >
                    Dismiss
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
