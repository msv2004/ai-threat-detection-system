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
  Calendar
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Training() {
  const queryClient = useQueryClient();
  
  // Job trigger states
  const [selectedJobId, setSelectedJobId] = useState<string>(''); // Preprocessing job ID (to fetch processed dataset)
  const [algorithm, setAlgorithm] = useState('Random Forest');

  // Queries
  const { data: trainingJobs, isLoading: isJobsLoading, refetch } = useQuery({
    queryKey: ['training_jobs'],
    queryFn: modelService.listJobs,
    refetchInterval: 3000, // Poll active training runs
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
          <h1 className="text-xl font-bold text-white tracking-wider uppercase m-0 leading-none">Training Console</h1>
          <span className="text-[10px] text-white/40 tracking-widest mt-1 block">TUNE HYPERPARAMETERS & ORCHESTRATE MODEL TRAINING JOBS</span>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 bg-[#090d18] border border-white/10 hover:border-white/20 text-white/60 hover:text-white px-3.5 py-1.5 rounded-lg text-xs uppercase tracking-wider transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Console
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Hyperparameter Settings (1 column) */}
        <div className="xl:col-span-1 space-y-6">
          <div className="glass-panel p-5 rounded-xl border border-white/5 space-y-4">
            <h3 className="text-xs font-bold text-white tracking-widest uppercase border-b border-white/5 pb-3 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              Tune Hyperparameters
            </h3>

            <form onSubmit={handleTrainSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] text-white/40 mb-1 uppercase tracking-wider">PROCESSED TRAINING DATASET</label>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  required
                  className="w-full bg-[#070b13] border border-white/10 rounded px-3 py-2 text-white/80 focus:outline-none focus:border-[#06b6d4]"
                >
                  <option value="">-- Choose Compiled Dataset --</option>
                  {completedPrepJobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {getDatasetName(job.dataset_id)} (samples: {job.processed_dataset?.train_samples})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-white/40 mb-1 uppercase tracking-wider">CLASSIFICATION ALGORITHM</label>
                <div className="space-y-2">
                  {['Random Forest', 'Decision Tree', 'Logistic Regression', 'Isolation Forest'].map((algo) => (
                    <label 
                      key={algo}
                      className={`
                        flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                        ${algorithm === algo 
                          ? 'bg-cyan-500/10 border-cyan-500/30 text-[#06b6d4]' 
                          : 'bg-[#070b13] border-white/5 text-white/60 hover:text-white'}
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
                      <span className="font-bold text-xs uppercase">{algo}</span>
                    </label>
                  ))}
                </div>
              </div>

              {trainMutation.isError && (
                <div className="p-3 bg-red-950/20 border border-red-500/20 text-red-400 rounded-lg">
                  {(trainMutation.error as any).message || 'Failed to initialize training job'}
                </div>
              )}

              <button
                type="submit"
                disabled={trainMutation.isPending || !selectedJobId}
                className="w-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-500/50 text-[#06b6d4] py-2.5 rounded-lg text-xs uppercase tracking-wider font-bold transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-[#06b6d4]" />
                Compile Model
              </button>
            </form>
          </div>
        </div>

        {/* Training Jobs Logs timeline (2 columns) */}
        <div className="xl:col-span-2 space-y-6">
          <div className="glass-panel rounded-xl border border-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5 bg-[#0a0f1d]/50">
              <h3 className="text-xs font-bold text-white tracking-widest uppercase m-0 leading-none">Model Training Runs Logs</h3>
            </div>
            
            <div className="divide-y divide-white/5">
              {isJobsLoading ? (
                <div className="text-center py-8 text-white/40 text-xs">Loading training queue records...</div>
              ) : trainingJobs?.length === 0 ? (
                <div className="text-center py-8 text-white/30 text-xs">No training records found. Trigger one to start.</div>
              ) : (
                trainingJobs?.map((job) => (
                  <div key={job.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 border rounded text-[9px] font-bold uppercase ${getStatusBadgeClass(job.status)}`}>
                          {job.status}
                        </span>
                        <span className="text-white font-bold">{job.algorithm}</span>
                        <span className="text-white/40 text-[10px]">ID: {job.id.substring(0, 8)}</span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-[10px] text-white/50">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Ingested {getDatasetName(job.dataset_id)}
                        </span>
                        {job.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Time: {job.duration.toFixed(2)}s
                          </span>
                        )}
                      </div>

                      {job.error_message && (
                        <div className="p-3 bg-red-950/25 border border-red-500/20 text-red-400 text-[10px] rounded-lg mt-2 flex items-start gap-2">
                          <XCircle className="w-4 h-4 shrink-0 text-red-500" />
                          <span>Traceback: {job.error_message}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-white/40 text-[10px] shrink-0 font-mono">
                      {job.started_at ? formatDistanceToNow(new Date(job.started_at), { addSuffix: true }) : 'Waiting in queue'}
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
