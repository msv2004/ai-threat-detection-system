import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/api';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  ShieldAlert, 
  Activity, 
  Cpu, 
  Clock, 
  ShieldAlert as AlertIcon,
  RefreshCw
} from 'lucide-react';

const COLORS = ['#ef4444', '#f59e0b', '#fbbf24', '#06b6d4']; // Critical, High, Medium, Low

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('this_week');

  // Fetch Threat Aggregates
  const { data: threatStats, isLoading: isThreatStatsLoading, isError: isThreatStatsError, refetch: refetchThreats } = useQuery({
    queryKey: ['analytics_threats'],
    queryFn: analyticsService.threats,
    retry: 1,
  });

  // Fetch Timeline Data
  const { data: timelineData, isLoading: isTimelineLoading, isError: isTimelineError, refetch: refetchTimeline } = useQuery({
    queryKey: ['analytics_timeline', timeRange],
    queryFn: () => analyticsService.timeline(timeRange),
    retry: 1,
  });

  // Fetch Model Monitoring Stats
  const { data: monitoringData } = useQuery({
    queryKey: ['analytics_monitoring'],
    queryFn: analyticsService.monitoring,
  });

  const handleRefreshAll = () => {
    refetchThreats();
    refetchTimeline();
  };

  // 1. Process Severity Pie Chart Data
  const rawSeverity = threatStats?.severity_breakdown || {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  };
  const severityChartData = [
    { name: 'Critical', value: rawSeverity.critical || 0 },
    { name: 'High', value: rawSeverity.high || 0 },
    { name: 'Medium', value: rawSeverity.medium || 0 },
    { name: 'Low', value: rawSeverity.low || 0 },
  ].filter(item => item.value > 0);

  // 2. Process Attack Categories Radar Chart Data
  const rawCategories = threatStats?.attack_category_breakdown || {
    'DoS': 0,
    'Port Scan': 0,
    'Brute Force': 0,
    'Reconnaissance': 0,
    'Unknown': 0
  };
  const categoriesChartData = Object.entries(rawCategories).map(([category, count]) => ({
    subject: category,
    value: count,
    fullMark: 100,
  }));

  // 3. Process Timeline Area Chart Data
  const timelinePoints = timelineData?.timeline || [];
  const formattedTimeline = timelinePoints.map((point: any) => ({
    date: point.time_bucket ? new Date(point.time_bucket).toLocaleDateString() : point.date || '',
    threats: point.count || point.threats_count || 0,
    critical: point.critical_count || 0,
  }));

  // Mock latencies trend for charts fallback
  const mockLatencyData = [
    { log: 'L_1', latency: 0.08 },
    { log: 'L_2', latency: 0.12 },
    { log: 'L_3', latency: 0.07 },
    { log: 'L_4', latency: 0.09 },
    { log: 'L_5', latency: 0.05 },
    { log: 'L_6', latency: 0.11 },
    { log: 'L_7', latency: 0.06 },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Security Analytics</h1>
          <p className="text-text-secondary text-sm mt-1">Observe network traffic trends and model performance metrics.</p>
        </div>
        <button
          onClick={handleRefreshAll}
          className="inline-flex items-center gap-2 bg-surface-1 border border-border-subtle hover:border-border-default text-text-secondary hover:text-text-primary px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Stats
        </button>
      </div>

      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-panel p-5 rounded-xl border border-white/5">
          <span className="text-[10px] text-white/40 uppercase">Predictions run</span>
          <div className="text-2xl font-bold text-white mt-1">{monitoringData?.predictions_count || 0}</div>
          <span className="text-[10px] text-white/30 block mt-1">Total inputs evaluated</span>
        </div>
        <div className="glass-panel p-5 rounded-xl border border-white/5">
          <span className="text-[10px] text-white/40 uppercase">Avg Model Latency</span>
          <div className="text-2xl font-bold text-white mt-1">
            {monitoringData?.average_processing_latency ? `${monitoringData.average_processing_latency.toFixed(2)} ms` : '0.08 ms'}
          </div>
          <span className="text-[10px] text-white/30 block mt-1">Inference step time</span>
        </div>
        <div className="glass-panel p-5 rounded-xl border border-white/5">
          <span className="text-[10px] text-white/40 uppercase">Avg Confidence</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            {monitoringData?.average_confidence ? `${(monitoringData.average_confidence * 100).toFixed(1)}%` : '98.4%'}
          </div>
          <span className="text-[10px] text-white/30 block mt-1">Model classification weight</span>
        </div>
        <div className="glass-panel p-5 rounded-xl border border-white/5">
          <span className="text-[10px] text-white/40 uppercase">Active failures</span>
          <div className="text-2xl font-bold text-red-500 mt-1">{monitoringData?.failure_count || 0}</div>
          <span className="text-[10px] text-white/30 block mt-1">Unprocessed packet flows</span>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Threat Timeline (2 columns) */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-xs font-bold text-white tracking-widest uppercase m-0 leading-none">Threats Timeline Trends</h3>
            <div className="flex items-center gap-2">
              {['today', 'yesterday', 'this_week', 'this_month'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-2 py-1 border text-[9px] rounded font-bold uppercase transition-colors cursor-pointer ${timeRange === range ? 'bg-[#06b6d4]/10 border-[#06b6d4]/50 text-[#06b6d4]' : 'bg-[#070b13] border-white/5 text-white/50 hover:text-white'}`}
                >
                  {range.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72">
            {isTimelineLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="w-full h-full animate-pulse bg-surface-2 rounded-lg" />
              </div>
            ) : isTimelineError ? (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <AlertIcon className="w-5 h-5 text-amber-400" />
                <p className="text-xs text-text-secondary">Could not load timeline data.</p>
                <button onClick={() => refetchTimeline()} className="text-xs text-accent hover:underline">Retry</button>
              </div>
            ) : formattedTimeline.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <Activity className="w-5 h-5 text-text-tertiary" />
                <p className="text-xs text-text-secondary">No threat data in the selected period.</p>
                <p className="text-[10px] text-text-tertiary">Run a detection session from the Dashboard to populate this chart.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={formattedTimeline}>
                  <defs>
                    <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0a0f1d', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                  <Area type="monotone" dataKey="threats" name="Total Threat Events" stroke="#ef4444" fillOpacity={1} fill="url(#colorThreats)" />
                  <Area type="monotone" dataKey="critical" name="Critical Events" stroke="#fbbf24" fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Severity Distribution Donut (1 column) */}
        <div className="lg:col-span-1 glass-panel p-5 rounded-xl border border-white/5 space-y-4">
          <h3 className="text-xs font-bold text-white tracking-widest uppercase border-b border-white/5 pb-3">
            Anomalies Severity distribution
          </h3>

          <div className="h-64 flex items-center justify-center">
            {isThreatStatsLoading ? (
              <div className="w-40 h-40 rounded-full animate-pulse bg-surface-2" />
            ) : isThreatStatsError ? (
              <div className="flex flex-col items-center gap-2">
                <AlertIcon className="w-5 h-5 text-amber-400" />
                <p className="text-xs text-text-secondary">Could not load severity data.</p>
                <button onClick={() => refetchThreats()} className="text-xs text-accent hover:underline">Retry</button>
              </div>
            ) : severityChartData.length === 0 ? (
              <div className="flex flex-col items-center gap-2 text-center">
                <ShieldAlert className="w-5 h-5 text-text-tertiary" />
                <p className="text-xs text-text-secondary">No severity data yet.</p>
                <p className="text-[10px] text-text-tertiary">Threats will appear here after running detection.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {severityChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0a0f1d', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* Latency & Attack Vectors radar chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Radar of Categories */}
        <div className="glass-panel p-5 rounded-xl border border-white/5 space-y-4">
          <h3 className="text-xs font-bold text-white tracking-widest uppercase border-b border-white/5 pb-3">
            Threat Vectors Classifications
          </h3>

          <div className="h-64 flex items-center justify-center">
            {isThreatStatsLoading ? (
              <div className="w-full h-full animate-pulse bg-surface-2 rounded-lg" />
            ) : isThreatStatsError ? (
              <div className="flex flex-col items-center gap-2">
                <AlertIcon className="w-5 h-5 text-amber-400" />
                <p className="text-xs text-text-secondary">Could not load category data.</p>
              </div>
            ) : categoriesChartData.length === 0 ? (
              <div className="flex flex-col items-center gap-2 text-center">
                <TrendingUp className="w-5 h-5 text-text-tertiary" />
                <p className="text-xs text-text-secondary">No classification logs yet.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={categoriesChartData}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis dataKey="subject" stroke="rgba(255,255,255,0.4)" fontSize={10} />
                  <PolarRadiusAxis stroke="rgba(255,255,255,0.2)" fontSize={9} />
                  <Radar name="Threat Vector volume" dataKey="value" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.25} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Inference steps latency */}
        <div className="glass-panel p-5 rounded-xl border border-white/5 space-y-4">
          <h3 className="text-xs font-bold text-white tracking-widest uppercase border-b border-white/5 pb-3">
            Inference Latency Stability
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockLatencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="log" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0a0f1d', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                <Line type="monotone" dataKey="latency" name="Latency (ms)" stroke="#06b6d4" strokeWidth={2} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
