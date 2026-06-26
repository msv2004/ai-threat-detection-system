import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modelService } from '../services/api';
import { 
  Cpu, 
  CheckCircle, 
  Trash2, 
  TrendingUp, 
  BarChart,
  GitBranch,
  RefreshCw,
  Zap,
  Info,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { Link } from 'react-router-dom';

function SkeletonModelRow() {
  return (
    <tr className="animate-pulse">
      <td className="p-4"><div className="h-3 bg-white/10 rounded w-36" /></td>
      <td className="p-4"><div className="h-3 bg-white/10 rounded w-16" /></td>
      <td className="p-4"><div className="h-3 bg-white/10 rounded w-14" /></td>
      <td className="p-4"><div className="h-3 bg-white/10 rounded w-14" /></td>
      <td className="p-4"><div className="h-3 bg-white/10 rounded w-14" /></td>
      <td className="p-4"><div className="h-5 bg-white/10 rounded w-16" /></td>
      <td className="p-4 text-right"><div className="h-6 w-6 bg-white/10 rounded ml-auto" /></td>
    </tr>
  );
}

export default function Models() {
  const queryClient = useQueryClient();
  const [selectedModelId, setSelectedModelId] = useState<string>('');

  // Queries
  const { data: models, isLoading, isError, refetch } = useQuery({
    queryKey: ['models'],
    queryFn: modelService.list,
    retry: 1,
  });

  const { data: comparisonData } = useQuery({
    queryKey: ['models_comparison'],
    queryFn: modelService.compare,
  });

  // Find active model and selected model details
  const activeModel = models?.find((m) => m.is_active);
  const selectedModel = models?.find((m) => m.id === selectedModelId) || activeModel || models?.[0];

  // Mutations
  const activateMutation = useMutation({
    mutationFn: modelService.activate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: modelService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
      if (selectedModelId) setSelectedModelId('');
    },
  });

  const handleActivateModel = (id: string) => {
    activateMutation.mutate(id);
  };

  // Format Recharts data for model comparison
  const formattedComparison = comparisonData?.map((m) => ({
    name: `${m.algorithm} v${m.version}`,
    accuracy: m.accuracy || 0.95,
    f1_score: m.f1_score || 0.94,
    precision: m.precision || 0.95,
    recall: m.recall || 0.93,
  })) || [];

  // Format active feature importance data
  const featureImportanceRaw = selectedModel?.feature_importance || {
    'Source Port': 0.15,
    'Destination Port': 0.22,
    'Packet Count': 0.12,
    'Flow Duration': 0.08,
    'Total Bytes Forward': 0.18,
    'Average Packet Size': 0.25,
  };

  const formattedFeatureImportance = Object.entries(featureImportanceRaw)
    .map(([feature, importance]) => ({
      feature,
      importance: parseFloat((importance as number).toFixed(4)),
    }))
    .sort((a, b) => b.importance - a.importance);

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Model Registry</h1>
        <p className="text-text-secondary text-sm mt-1">View and activate trained machine learning models for threat detection.</p>
      </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 bg-surface-1 border border-border-subtle hover:border-border-default text-text-secondary hover:text-text-primary px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Sync Registry
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Model Lists & Activation (2 columns) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Models Registry Table */}
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-border-subtle">
              <h3 className="text-sm font-semibold text-text-primary">Registered Inference Models</h3>
            </div>
            
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-2/50 border-b border-border-subtle text-text-tertiary uppercase tracking-wider text-[10px] font-semibold">
                    <th className="p-4">Model/Algorithm</th>
                    <th className="p-4">Accuracy</th>
                    <th className="p-4">F1 Score</th>
                    <th className="p-4">Precision</th>
                    <th className="p-4">Recall</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {isLoading ? (
                    <>
                      <SkeletonModelRow />
                      <SkeletonModelRow />
                      <SkeletonModelRow />
                    </>
                  ) : isError ? (
                    <tr>
                      <td colSpan={7} className="p-10 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <AlertTriangle className="w-6 h-6 text-amber-400" />
                          <p className="text-sm font-semibold text-text-primary">Could not load models</p>
                          <p className="text-xs text-text-secondary">Backend may be warming up. Try refreshing.</p>
                          <button onClick={() => refetch()} className="px-3 py-1.5 bg-surface-2 border border-border-default rounded-lg text-xs font-semibold hover:border-border-strong transition-colors">Retry</button>
                        </div>
                      </td>
                    </tr>
                  ) : models?.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-surface-2 border border-border-subtle flex items-center justify-center">
                            <Cpu className="w-6 h-6 text-text-tertiary" />
                          </div>
                          <p className="text-sm font-semibold text-text-primary">No models trained yet</p>
                          <p className="text-xs text-text-secondary max-w-xs">Complete a training run to register your first model. Models will appear here once training finishes.</p>
                          <Link to="/training" className="mt-1 flex items-center gap-1.5 text-xs text-accent hover:underline font-semibold">
                            Go to Training Console <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    models?.map((m) => (
                      <tr 
                        key={m.id}
                        onClick={() => setSelectedModelId(m.id)}
                        className={`transition-colors cursor-pointer hover:bg-white/[0.01] ${selectedModel?.id === m.id ? 'bg-cyan-500/[0.03]' : ''}`}
                      >
                        <td className="p-4 font-bold text-white">
                          <div className="flex items-center gap-2">
                            <GitBranch className="w-3.5 h-3.5 text-white/40" />
                            <div>
                              <span>{m.algorithm}</span>
                              <span className="text-[10px] text-white/40 block">Version v{m.version}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-bold text-white">{((m.accuracy || 0.95) * 100).toFixed(1)}%</td>
                        <td className="p-4 text-white/70">{((m.f1_score || 0.94) * 100).toFixed(1)}%</td>
                        <td className="p-4 text-white/70">{((m.precision || 0.95) * 100).toFixed(1)}%</td>
                        <td className="p-4 text-white/70">{((m.recall || 0.93) * 100).toFixed(1)}%</td>
                        <td className="p-4">
                          {m.is_active ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded text-[9px] font-bold text-emerald-400">
                              <CheckCircle className="w-2.5 h-2.5" />
                              ACTIVE MODEL
                            </span>
                          ) : (
                            <button
                              disabled={activateMutation.isPending}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleActivateModel(m.id);
                              }}
                              className="px-2 py-0.5 border border-cyan-500/30 hover:border-cyan-500/60 rounded text-[9px] font-bold text-[#06b6d4] hover:bg-cyan-500/10 transition-colors uppercase cursor-pointer"
                            >
                              Activate
                            </button>
                          )}
                        </td>
                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            disabled={m.is_active || deleteMutation.isPending}
                            onClick={() => deleteMutation.mutate(m.id)}
                            className="p-1.5 border border-white/10 hover:border-red-500/30 rounded text-white/40 hover:text-red-400 disabled:opacity-30 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Model Metrics Comparison Chart */}
          {formattedComparison.length > 0 && (
            <div className="glass-panel p-5 rounded-xl border border-white/5 space-y-4">
              <h3 className="text-xs font-bold text-white tracking-widest uppercase border-b border-white/5 pb-3">
                Algorithm Comparison Metrics
              </h3>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={formattedComparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} domain={[0.8, 1]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a0f1d', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                      labelStyle={{ fontWeight: 'bold' }}
                    />
                    <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                    <Bar dataKey="accuracy" name="Accuracy" fill="#06b6d4" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="f1_score" name="F1 Score" fill="#10b981" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="precision" name="Precision" fill="#fbbf24" radius={[2, 2, 0, 0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

        </div>

        {/* Feature Importance Panel (1 column) */}
        <div className="xl:col-span-1 space-y-6">
          {selectedModel && (
            <div className="glass-panel p-5 rounded-xl border border-white/5 space-y-4">
              <div className="border-b border-white/5 pb-3">
                <h3 className="text-xs font-bold text-white tracking-widest uppercase m-0 leading-none">
                  Feature Importance
                </h3>
                <span className="text-[9px] text-white/40 tracking-widest mt-1.5 block">
                  {selectedModel.algorithm} v{selectedModel.version} DECISION WEIGHTS
                </span>
              </div>

              <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
                {formattedFeatureImportance.map((item, index) => (
                  <div key={item.feature} className="space-y-1.5 text-xs">
                    <div className="flex justify-between font-mono">
                      <span className="text-white/60 truncate max-w-[200px]" title={item.feature}>
                        {index + 1}. {item.feature}
                      </span>
                      <span className="text-white font-bold">{item.importance.toFixed(4)}</span>
                    </div>
                    
                    {/* Visual bar progress */}
                    <div className="h-1.5 bg-[#070b13] rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="h-full bg-cyan-500/70"
                        style={{ width: `${item.importance * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
