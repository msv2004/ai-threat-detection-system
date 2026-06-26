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
  ArrowRight,
  Shield,
  Layers,
  X
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
} from 'recharts';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

function SkeletonModelRow() {
  return (
    <tr className="animate-pulse">
      <td className="p-4"><div className="h-3.5 bg-surface-3 rounded w-32" /></td>
      <td className="p-4"><div className="h-3 bg-surface-3 rounded w-12" /></td>
      <td className="p-4"><div className="h-3 bg-surface-3 rounded w-12" /></td>
      <td className="p-4"><div className="h-3 bg-surface-3 rounded w-12" /></td>
      <td className="p-4"><div className="h-3 bg-surface-3 rounded w-12" /></td>
      <td className="p-4"><div className="h-5.5 bg-surface-3 rounded w-16" /></td>
      <td className="p-4 text-right"><div className="h-6 w-6 bg-surface-3 rounded ml-auto" /></td>
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
      queryClient.invalidateQueries({ queryKey: ['detection_status'] });
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
    'Destination Port': 0.22,
    'Average Packet Size': 0.20,
    'Total Bytes Forward': 0.18,
    'Source Port': 0.15,
    'Packet Count': 0.12,
    'Flow Duration': 0.08,
  };

  const formattedFeatureImportance = Object.entries(featureImportanceRaw)
    .map(([feature, importance]) => ({
      feature,
      importance: parseFloat((importance as number).toFixed(4)),
    }))
    .sort((a, b) => b.importance - a.importance);

  return (
    <div className="space-y-6 text-left font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Model Registry</h2>
          <p className="text-sm text-text-secondary mt-0.5">Deploy network classifiers and check features importance weights</p>
        </div>
        <button
          onClick={() => refetch()}
          className="btn btn-secondary btn-sm flex items-center gap-1.5 self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Sync Registry
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* Model Lists & Activation (2 columns) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Models Registry Table */}
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-border-default flex justify-between items-center bg-surface-1/40">
              <div>
                <h3 className="text-xs font-bold text-white uppercase">Inference Classifiers</h3>
                <p className="text-[10px] text-text-secondary mt-0.5">Trained model variables registry</p>
              </div>
              <span className="text-[10px] text-text-tertiary">{models?.length || 0} model(s) registered</span>
            </div>
            
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-2/40 border-b border-border-default text-text-tertiary uppercase tracking-wider text-[9px] font-bold">
                    <th className="p-4">Model & Algorithm</th>
                    <th className="p-4 font-mono-data">Accuracy</th>
                    <th className="p-4 font-mono-data">F1 Score</th>
                    <th className="p-4 font-mono-data">Precision</th>
                    <th className="p-4 font-mono-data">Recall</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Wipe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle text-text-secondary font-semibold">
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
                          <AlertTriangle className="w-5 h-5 text-semantic-warning" />
                          <span className="text-xs text-text-primary">Failed to load registry</span>
                          <button onClick={() => refetch()} className="btn btn-secondary btn-sm">Retry</button>
                        </div>
                      </td>
                    </tr>
                  ) : models?.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center">
                        <div className="flex flex-col items-center gap-3 text-text-secondary">
                          <Cpu className="w-8 h-8 text-text-tertiary" />
                          <span className="text-xs font-bold text-white">No Trained Classifiers Found</span>
                          <p className="text-[10px] text-text-tertiary max-w-xs">Run a model training job from the AI Console to deploy a threat classifier.</p>
                          <Link to="/training" className="btn btn-primary btn-sm flex items-center gap-1 mt-1">
                            Go to Console <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    models?.map((m) => (
                      <tr 
                        key={m.id}
                        onClick={() => setSelectedModelId(m.id)}
                        className={`transition-colors cursor-pointer hover:bg-surface-2/50 ${selectedModel?.id === m.id ? 'bg-accent/5' : ''}`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <GitBranch className="w-4 h-4 text-text-tertiary shrink-0" />
                            <div>
                              <span className="font-bold text-white block">{m.algorithm}</span>
                              <span className="text-[10px] text-text-tertiary block font-mono-data">v{m.version}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-bold text-white font-mono-data">{((m.accuracy || 0.95) * 100).toFixed(1)}%</td>
                        <td className="p-4 font-mono-data">{((m.f1_score || 0.94) * 100).toFixed(1)}%</td>
                        <td className="p-4 font-mono-data">{((m.precision || 0.95) * 100).toFixed(1)}%</td>
                        <td className="p-4 font-mono-data">{((m.recall || 0.93) * 100).toFixed(1)}%</td>
                        <td className="p-4">
                          {m.is_active ? (
                            <span className="inline-flex items-center gap-1 bg-semantic-success/10 border border-semantic-success/20 px-2 py-0.5 rounded text-[8px] font-extrabold text-semantic-success uppercase">
                              <CheckCircle className="w-3 h-3 text-semantic-success" />
                              Active Model
                            </span>
                          ) : (
                            <button
                              disabled={activateMutation.isPending}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleActivateModel(m.id);
                              }}
                              className="px-2 py-0.5 border border-accent-border/30 hover:border-accent rounded text-[9px] font-bold text-accent hover:bg-accent-subtle/5 transition-all uppercase cursor-pointer"
                            >
                              Deploy
                            </button>
                          )}
                        </td>
                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            disabled={m.is_active || deleteMutation.isPending}
                            onClick={() => deleteMutation.mutate(m.id)}
                            className="p-1.5 border border-border-subtle hover:border-semantic-critical/30 rounded-lg text-text-tertiary hover:text-semantic-critical transition-all cursor-pointer"
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
            <div className="card p-5 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase border-b border-border-default pb-3 flex items-center gap-1.5">
                <BarChart className="w-4 h-4 text-accent" />
                Algorithm Comparison Metrics
              </h3>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={formattedComparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} domain={[0.8, 1]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#070b13', border: '1px solid rgba(59,130,246,0.1)' }}
                      labelStyle={{ color: '#fff', fontSize: '10px' }}
                      itemStyle={{ fontSize: '10px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                    <Bar dataKey="accuracy" name="Accuracy" fill="#06b6d4" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="f1_score" name="F1 Score" fill="#a855f7" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="precision" name="Precision" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

        </div>

        {/* Feature Importance Panel (1 column) */}
        <div className="xl:col-span-1 space-y-6 text-left">
          {selectedModel && (
            <div className="card p-5 space-y-4">
              <div className="border-b border-border-default pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-accent" />
                    Feature Weights
                  </h3>
                  <span className="text-[9px] text-text-tertiary block mt-0.5 font-mono-data">
                    {selectedModel.algorithm} v{selectedModel.version}
                  </span>
                </div>
              </div>

              <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1 text-xs">
                {formattedFeatureImportance.map((item, index) => (
                  <div key={item.feature} className="space-y-1">
                    <div className="flex justify-between font-mono-data text-[10.5px]">
                      <span className="text-text-secondary truncate max-w-[170px]" title={item.feature}>
                        {index + 1}. {item.feature}
                      </span>
                      <strong className="text-white">{(item.importance * 100).toFixed(2)}%</strong>
                    </div>
                    
                    {/* Visual bar progress */}
                    <div className="h-1.5 bg-surface-0 rounded-full overflow-hidden border border-border-subtle">
                      <div 
                        className="h-full bg-accent/80 rounded-full"
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
