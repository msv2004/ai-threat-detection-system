import React, { useState } from 'react';
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
  ArrowRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

function SkeletonJobRow() {
  return (
    <div className="p-5 flex items-center justify-between animate-pulse border-b border-border-subtle">
      <div className="space-y-2">
        <div className="h-3 bg-surface-2 rounded w-48" />
        <div className="h-2.5 bg-surface-2 rounded w-32" />
      </div>
      <div className="h-2.5 bg-surface-2 rounded w-20" />
    </div>
  );
}

export default function Training() {
  const queryClient = useQueryClient();
  
  // Job trigger states
  const [selectedJobId, setSelectedJobId] = useState<string>(''); // Preprocessing job ID (to fetch processed dataset)
  const [algorithm, setAlgorithm] = useState('Random Forest');

  // Queries
  const { data: trainingJobs, isLoading: isJobsLoading, isError: isJobsError, refetch } = useQuery({
    queryKey: ['training_jobs'],
    queryFn: modelService.listJobs,
    refetchInterval: 3000, // Poll active training runs
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

  // Find preprocessing jobs that completed successfully and have a processed dataset
  const completedPrepJobs = preprocessingJobs?.filter(
    (job) => job.status === 'completed' && job.processed_dataset
  ) || [];

  const getDatasetName = (datasetId: string) => {
    const d = datasets?.find(ds => ds.id === datasetId);
    return d ? d.filename : 'Unknown Dataset';
  };

  // Mutation
  const trainMutation = useMutation({
    mutationFn: modelService.train,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training_jobs'] });
      setSelectedJobId('');
    }
  });

  const handleTrainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobId) return;

    // Find the preprocessing job to grab the processed dataset ID
    const prepJob = completedPrepJobs.find(j => j.id === selectedJobId);
    if (!prepJob || !prepJob.processed_dataset) return;

    trainMutation.mutate({
      dataset_id: prepJob.dataset_id,
      processed_dataset_id: prepJob.processed_dataset.id,
      algorithm,
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'text-emerald-400 bg-emerald-950/20 border border-emerald-500/30';
      case 'failed':
        return 'text-red-400 bg-red-950/20 border border-red-500/30';
      case 'running':
        return 'text-yellow-400 bg-yellow-950/10 border border-yellow-500/30 animate-pulse';
      default:
        return 'text-white/40 bg-slate-900 border border-white/5';
    }
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Training Console</h1>
        <p className="text-text-secondary text-sm mt-1">Select a compiled dataset and tune hyperparameters to train a threat detection model.</p>
      </div>
      <button
        onClick={() => refetch()}
        className="inline-flex items-center gap-2 bg-surface-1 border border-border-subtle hover:border-border-default text-text-secondary hover:text-text-primary px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
      >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Console
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Hyperparameter Settings (1 column) */}
        <div className="xl:col-span-1 space-y-6">
          <div className="card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 border-b border-border-subtle pb-3">
              <Flame className="w-4 h-4 text-orange-500" />
              Tune Hyperparameters
            </h3>

            <form onSubmit={handleTrainSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] text-text-tertiary mb-1.5 uppercase tracking-wider font-semibold">Compiled Training Dataset</label>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  required
                  className="w-full bg-surface-0 border border-border-subtle rounded-lg px-3 py-2 text-text-secondary focus:outline-none focus:border-accent transition-colors"
                >
                  <option value="">-- Choose Compiled Dataset --</option>
                  {completedPrepJobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {getDatasetName(job.dataset_id)} ({job.processed_dataset?.train_samples} samples)
                    </option>
                  ))}
                </select>
                {completedPrepJobs.length === 0 && (
                  <p className="mt-1.5 text-[10px] text-amber-400 flex items-center gap-1">
                    <Info className="w-3 h-3" /> No compiled datasets. <Link to="/datasets" className="underline">Upload & preprocess one first</Link>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[10px] text-text-tertiary mb-1.5 uppercase tracking-wider font-semibold">Classification Algorithm</label>
                <div className="space-y-2">
                  {['Random Forest', 'Decision Tree', 'Logistic Regression', 'Isolation Forest'].map((algo) => (
                    <label 
                      key={algo}
                      className={`
                        flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                        ${algorithm === algo 
                          ? 'bg-accent/10 border-accent/30 text-accent' 
                          : 'bg-surface-0 border-border-subtle text-text-secondary hover:text-text-primary hover:border-border-default'}
                      `}
                    >
                      <input
                        type="radio"
                        name="algorithm-selector"
                        checked={algorithm === algo}
                        onChange={() => setAlgorithm(algo)}
                        className="hidden"
                      />
                      <Cpu className="w-4 h-4" />
                      <span className="font-semibold text-xs">{algo}</span>
                    </label>
                  ))}
                </div>
              </div>

              {trainMutation.isError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs flex items-start gap-2">
                  <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  {(trainMutation.error as any).message || 'Failed to initialize training job'}
                </div>
              )}

              <button
                type="submit"
                disabled={trainMutation.isPending || !selectedJobId}
                className="w-full bg-accent/10 hover:bg-accent/20 border border-accent/30 hover:border-accent/50 text-accent py-2.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-accent" />
                {trainMutation.isPending ? 'Starting...' : 'Compile Model'}
              </button>
            </form>
          </div>
        </div>

        {/* Training Jobs Logs timeline (2 columns) */}
        <div className="xl:col-span-2 space-y-6">
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-border-subtle">
              <h3 className="text-sm font-semibold text-text-primary">Training Run Logs</h3>
            </div>
            
            <div className="divide-y divide-border-subtle">
              {isJobsLoading ? (
                <>
                  <SkeletonJobRow />
                  <SkeletonJobRow />
                  <SkeletonJobRow />
                </>
              ) : isJobsError ? (
                <div className="p-10 text-center flex flex-col items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-amber-400" />
                  <p className="text-sm font-semibold text-text-primary">Could not load training runs</p>
                  <p className="text-xs text-text-secondary">Backend may be warming up. Try refreshing in a moment.</p>
                  <button onClick={() => refetch()} className="px-3 py-1.5 bg-surface-2 border border-border-default rounded-lg text-xs font-semibold hover:border-border-strong transition-colors mt-1">Retry</button>
                </div>
              ) : trainingJobs?.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-surface-2 border border-border-subtle flex items-center justify-center">
                    <Database className="w-6 h-6 text-text-tertiary" />
                  </div>
                  <p className="text-sm font-semibold text-text-primary">No training runs yet</p>
                  <p className="text-xs text-text-secondary max-w-xs">Select a compiled preprocessing dataset from the left and choose an algorithm to start your first model training job.</p>
                  <Link to="/datasets" className="mt-1 flex items-center gap-1.5 text-xs text-accent hover:underline font-semibold">
                    Go to Datasets <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                trainingJobs?.map((job) => (
                  <div key={job.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 border rounded-md text-[9px] font-bold uppercase ${getStatusBadgeClass(job.status)}`}>
                          {job.status}
                        </span>
                        <span className="text-text-primary font-semibold">{job.algorithm}</span>
                        <span className="text-text-tertiary text-[10px] font-mono">#{job.id.substring(0, 8)}</span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-[10px] text-text-tertiary">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
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
                        <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] rounded-lg mt-2 flex items-start gap-2">
                          <XCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                          <span>{job.error_message}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-text-tertiary text-[10px] shrink-0">
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
