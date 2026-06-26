import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modelService, preprocessingService, datasetService } from '../services/api';
import { 
  Flame, 
  Play, 
  Cpu, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Info,
  Calendar,
  Database,
  ArrowRight,
  Sliders,
  Terminal as TerminalIcon,
  TrendingUp,
  Award
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

function SkeletonJobRow() {
  return (
    <div className="p-4 flex items-center justify-between animate-pulse border-b border-border-subtle">
      <div className="space-y-2">
        <div className="h-3 bg-surface-2 rounded w-40" />
        <div className="h-2.5 bg-surface-2 rounded w-28" />
      </div>
      <div className="h-2.5 bg-surface-2 rounded w-16" />
    </div>
  );
}

export default function Training() {
  const queryClient = useQueryClient();
  
  // Job trigger states
  const [selectedJobId, setSelectedJobId] = useState<string>(''); 
  const [algorithm, setAlgorithm] = useState('Random Forest');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [trainingProgress, setTrainingProgress] = useState(0);

  const [estimators, setEstimators] = useState(100);
  const [maxDepth, setMaxDepth] = useState(12);
  const [modelName, setModelName] = useState('');

  // Queries
  const { data: trainingJobs, isLoading: isJobsLoading, isError: isJobsError, refetch } = useQuery({
    queryKey: ['training_jobs'],
    queryFn: modelService.listJobs,
    refetchInterval: 3000, 
    retry: 1,
  });

  const { data: preprocessingJobs } = useQuery({
    queryKey: ['preprocessing_jobs'],
    queryFn: preprocessingService.listJobs,
  });

  const { data: datasets } = useQuery({
    queryKey: ['datasets'],
    queryFn: datasetService.list,
  });

  const { data: models } = useQuery({
    queryKey: ['models'],
    queryFn: modelService.list,
  });

  // Completed preprocessing datasets
  const completedPrepJobs = preprocessingJobs?.filter(
    (job) => job.status === 'completed' && job.processed_dataset
  ) || [];

  const getDatasetName = (datasetId: string) => {
    const d = datasets?.find(ds => ds.id === datasetId);
    return d ? d.filename : 'Unknown Dataset';
  };

  // Find running job to show active console status
  const activeRunningJob = trainingJobs?.find(j => j.status === 'running');

  // Find best registered model
  const bestModel = models && models.length > 0
    ? [...models].sort((a, b) => (b.accuracy || 0) - (a.accuracy || 0))[0]
    : null;

  // Simulator Logs for running jobs
  useEffect(() => {
    let interval: any;
    if (activeRunningJob) {
      setTerminalLogs([
        `[${new Date().toLocaleTimeString()}] [INFO] Starting training job configuration allocation...`,
        `[${new Date().toLocaleTimeString()}] [INFO] Load target features split arrays.`,
        `[${new Date().toLocaleTimeString()}] [INFO] Hyperparameter specs: estimators=${estimators}, max_depth=${maxDepth}`
      ]);
      setTrainingProgress(10);
      
      let step = 0;
      const logsSequence = [
        "Standardizing columns distribution scale bounds...",
        "Executing feature node weights fit allocations...",
        "Running model cross validation sweeps...",
        "Evaluating confusion matrix nodes recall values...",
        "Model training weights optimized successfully."
      ];

      interval = setInterval(() => {
        if (step < logsSequence.length) {
          setTerminalLogs(prev => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] [INFO] ${logsSequence[step]}`
          ]);
          setTrainingProgress(prev => Math.min(prev + 18, 95));
          step++;
        } else {
          setTerminalLogs(prev => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] [SUCCESS] Model weights serialized. Syncing registry.`
          ]);
          setTrainingProgress(100);
          clearInterval(interval);
        }
      }, 2000);
    } else {
      setTerminalLogs([]);
      setTrainingProgress(0);
    }

    return () => clearInterval(interval);
  }, [activeRunningJob]);

  // Mutation
  const trainMutation = useMutation({
    mutationFn: modelService.train,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training_jobs'] });
      queryClient.invalidateQueries({ queryKey: ['models'] });
      setSelectedJobId('');
    }
  });

  const handleTrainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobId) return;

    const prepJob = completedPrepJobs.find(j => j.id === selectedJobId);
    if (!prepJob || !prepJob.processed_dataset) return;

    const finalModelName = modelName.trim() || `${algorithm.replace(/\s+/g, '_')}_${Date.now()}`;

    trainMutation.mutate({
      processed_dataset_id: prepJob.processed_dataset.id,
      algorithm,
      model_name: finalModelName,
      hyperparameters: algorithm === 'Random Forest'
        ? { n_estimators: estimators, max_depth: maxDepth }
        : { max_depth: maxDepth },
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'text-semantic-success bg-semantic-success/10 border-semantic-success/20';
      case 'failed':
        return 'text-semantic-critical bg-semantic-critical/10 border-semantic-critical/20';
      case 'running':
        return 'text-semantic-warning bg-semantic-warning/10 border-semantic-warning/20 animate-pulse';
      default:
        return 'text-text-tertiary bg-surface-2 border-border-default';
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl text-white heading-display tracking-wider">AI Training Console</h2>
          <p className="text-sm text-text-secondary mt-0.5">Deploy training parameters and execute classifiers pipelines</p>
        </div>
        <button
          onClick={() => refetch()}
          className="btn btn-secondary btn-sm flex items-center gap-1.5 self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Sync Console
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* Left Hyperparameter Panel */}
        <div className="xl:col-span-1 space-y-6">
          <div className="card p-5 space-y-4">
            <h3 className="text-base text-white flex items-center gap-1.5 border-b border-border-default pb-3 heading-display tracking-wider">
              <Sliders className="w-4 h-4 text-accent" />
              Tune Classifier Model
            </h3>

            <form onSubmit={handleTrainSubmit} className="space-y-4 text-xs font-semibold">
              {/* Select dataset */}
              <div>
                <label className="block text-[9px] text-text-tertiary mb-1.5 uppercase tracking-wider">Compiled Preprocess Dataset</label>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  required
                  className="input rounded-lg"
                >
                  <option value="">-- Choose Compiled Dataset --</option>
                  {completedPrepJobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {getDatasetName(job.dataset_id)} ({job.processed_dataset?.train_samples} samples)
                    </option>
                  ))}
                </select>
                {completedPrepJobs.length === 0 && (
                  <p className="mt-2 text-[10px] text-semantic-warning flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" /> No compiled datasets available.{' '}
                    <Link to="/datasets" className="underline font-bold text-accent">Compile datasets</Link>
                  </p>
                )}
              </div>

              {/* Model Name */}
              <div>
                <label className="block text-[9px] text-text-tertiary mb-1.5 uppercase tracking-wider">Model Name <span className="normal-case opacity-60">(optional, auto-generated if blank)</span></label>
                <input
                  type="text"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder={`${algorithm.replace(/\s+/g, '_')}_v1`}
                  maxLength={100}
                  className="input rounded-lg"
                />
              </div>

              {/* Algorithm select cards */}
              <div className="space-y-1.5">
                <label className="block text-[9px] text-text-tertiary uppercase tracking-wider">Classifier Algorithm</label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { name: 'Random Forest', desc: 'Ensemble model of multiple decision trees', icon: Cpu },
                    { name: 'Decision Tree', desc: 'Single tree mapping feature splits', icon: Sliders },
                    { name: 'Logistic Regression', desc: 'Linear classification boundary solver', icon: TrendingUp },
                    { name: 'Isolation Forest', desc: 'Unsupervised anomaly segmentation metrics', icon: AlertTriangle }
                  ].map((algo) => (
                    <div 
                      key={algo.name}
                      onClick={() => setAlgorithm(algo.name)}
                      className={`
                        p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3
                        ${algorithm === algo.name 
                          ? 'bg-accent-subtle border-accent/40 text-accent' 
                          : 'bg-surface-0/40 border-border-default text-text-secondary hover:text-white hover:border-slate-600'}
                      `}
                    >
                      <algo.icon className="w-4 h-4 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-white leading-none">{algo.name}</div>
                        <span className="text-[9px] text-text-tertiary block mt-1 leading-normal font-medium">{algo.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hyperparameter adjustments sliders */}
              <div className="space-y-3 pt-2 border-t border-border-default">
                <span className="block text-[9px] text-text-tertiary uppercase tracking-wider">Hyperparameter Overrides</span>
                
                {algorithm === 'Random Forest' && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] text-text-secondary">
                      <span>Estimators Tree count</span>
                      <span className="font-mono-data text-white">{estimators}</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="200"
                      step="10"
                      value={estimators}
                      onChange={(e) => setEstimators(parseInt(e.target.value))}
                      className="w-full h-1 bg-surface-0 rounded-lg cursor-pointer accent-accent"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] text-text-secondary">
                    <span>Maximum Depth Limit</span>
                    <span className="font-mono-data text-white">{maxDepth}</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="20"
                    value={maxDepth}
                    onChange={(e) => setMaxDepth(parseInt(e.target.value))}
                    className="w-full h-1 bg-surface-0 rounded-lg cursor-pointer accent-accent"
                  />
                </div>
              </div>

              {trainMutation.isError && (
                <div className="p-3 bg-semantic-critical/10 border border-semantic-critical/20 text-semantic-critical rounded-lg flex items-start gap-2">
                  <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{(trainMutation.error as any).message || 'Failed to initialize training job'}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={trainMutation.isPending || !selectedJobId || !!activeRunningJob}
                className="w-full btn btn-primary flex items-center justify-center gap-1.5 uppercase font-mono-data text-xs tracking-wider"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {trainMutation.isPending ? 'Queuing job...' : 'Compile Model'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Logs & Analytics (2 Columns) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Best Model card */}
          {bestModel && (
            <div className="card p-5 border-l-4 border-l-semantic-ai bg-semantic-ai/5 text-left flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-semantic-ai/10 border border-semantic-ai/20 flex items-center justify-center text-semantic-ai shrink-0">
                  <Award className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-semantic-ai heading-display tracking-wider">Top Deployed Model Registry</h4>
                  <span className="text-sm font-bold text-white mt-0.5 block">{bestModel.algorithm} v{bestModel.version}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4 text-center shrink-0 font-mono-data text-[11px]">
                <div className="bg-surface-1 border border-border-default px-2 py-1 rounded">
                  <span className="text-[8px] text-text-tertiary block font-bold">ACC</span>
                  <strong className="text-white">{(bestModel.accuracy * 100).toFixed(1)}%</strong>
                </div>
                <div className="bg-surface-1 border border-border-default px-2 py-1 rounded">
                  <span className="text-[8px] text-text-tertiary block font-bold">F1</span>
                  <strong className="text-white">{(bestModel.f1_score * 100).toFixed(1)}%</strong>
                </div>
                <div className="bg-surface-1 border border-border-default px-2 py-1 rounded">
                  <span className="text-[8px] text-text-tertiary block font-bold">PREC</span>
                  <strong className="text-white">{(bestModel.precision * 100).toFixed(1)}%</strong>
                </div>
                <div className="bg-surface-1 border border-border-default px-2 py-1 rounded">
                  <span className="text-[8px] text-text-tertiary block font-bold">REC</span>
                  <strong className="text-white">{(bestModel.recall * 100).toFixed(1)}%</strong>
                </div>
              </div>
            </div>
          )}

          {/* Active Logs Terminal Console */}
          {activeRunningJob && (
            <div className="card p-5 space-y-4 text-left border-accent-border/30 shadow-[0_0_15px_rgba(6,182,212,0.03)]">
              <div className="flex items-center justify-between border-b border-border-default pb-3">
                <h4 className="text-base text-white flex items-center gap-1.5 heading-display tracking-wider">
                  <TerminalIcon className="w-4 h-4 text-accent animate-pulse" />
                  Live Pipeline Logs
                </h4>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-text-tertiary" />
                  <span className="text-[10px] text-text-tertiary font-mono-data font-bold">EST COMPILATION: ~12 SEC</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-mono-data font-bold text-text-tertiary">
                  <span>OPTIMIZING WEIGHT VECTORS...</span>
                  <span className="text-accent">{trainingProgress}%</span>
                </div>
                <div className="w-full bg-surface-0 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="progress-animated h-full rounded-full transition-all duration-300"
                    style={{ width: `${trainingProgress}%` }}
                  />
                </div>
              </div>

              {/* Logs terminal output */}
              <div className="bg-surface-0 border border-border-strong rounded-xl p-4 h-48 overflow-y-auto font-mono-data text-[10px] text-text-secondary space-y-1.5 scrollbar-thin">
                {terminalLogs.map((log, i) => (
                  <div key={i} className="leading-relaxed">
                    <span className="text-accent">{log.slice(0, 10)}</span>
                    <span className="text-white">{log.slice(10)}</span>
                  </div>
                ))}
                <div className="w-2 h-3.5 bg-accent/80 inline-block animate-pulse ml-1 align-middle" />
              </div>
            </div>
          )}

          {/* Training Logs timeline history */}
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-border-default bg-surface-1/40">
              <h3 className="text-base text-white heading-display tracking-wider">Compilation Job History</h3>
            </div>
            
            <div className="divide-y divide-border-subtle text-xs font-semibold text-left">
              {isJobsLoading ? (
                <>
                  <SkeletonJobRow />
                  <SkeletonJobRow />
                  <SkeletonJobRow />
                </>
              ) : isJobsError ? (
                <div className="p-10 text-center flex flex-col items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-semantic-warning" />
                  <span className="text-sm text-text-primary">Failed loading training jobs</span>
                </div>
              ) : trainingJobs?.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center gap-3 text-text-secondary">
                  <Database className="w-8 h-8 text-text-tertiary" />
                  <span className="text-xs font-bold text-white">No training history registered</span>
                  <p className="text-[10px] text-text-tertiary max-w-xs">Select a dataset slice from the left tuning panel to launch a training run.</p>
                </div>
              ) : (
                trainingJobs?.map((job) => (
                  <div key={job.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 border rounded-md text-[8px] font-extrabold uppercase ${getStatusBadge(job.status)}`}>
                          {job.status}
                        </span>
                        <span className="text-white font-bold">{job.algorithm}</span>
                        <span className="text-text-tertiary font-mono-data text-[9px]">ID: {job.id.substring(0, 8)}...</span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-[10px] text-text-tertiary font-mono-data">
                        <span className="flex items-center gap-1">
                          <Database className="w-3.5 h-3.5" />
                          {getDatasetName(job.dataset_id)}
                        </span>
                        {job.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {job.duration.toFixed(2)}s
                          </span>
                        )}
                      </div>

                      {job.error_message && (
                        <div className="p-2.5 bg-semantic-critical/5 border border-semantic-critical/10 text-semantic-critical text-[10px] rounded-lg mt-2 flex items-start gap-1 font-mono-data">
                          <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-semantic-critical" />
                          <span>{job.error_message}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-text-tertiary font-mono-data text-[10px] shrink-0 text-right">
                      {job.started_at ? formatDistanceToNow(new Date(job.started_at), { addSuffix: true }) : 'Queued'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
