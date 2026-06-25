import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { datasetService, preprocessingService } from '../services/api';
import { 
  Database, 
  Upload, 
  Trash2, 
  Settings2, 
  Play, 
  TrendingUp, 
  RefreshCw, 
  Loader2, 
  AlertTriangle,
  Info,
  CheckCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Datasets() {
  const queryClient = useQueryClient();
  
  // File upload states
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Preprocessing configuration states
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [targetColumn, setTargetColumn] = useState('Label');
  const [missingStrategy, setMissingStrategy] = useState('mean');
  const [scalingStrategy, setScalingStrategy] = useState('standard');
  const [encodingStrategy, setEncodingStrategy] = useState('label');
  const [testSize, setTestSize] = useState(0.2);

  // Active view states
  const [selectedProfileDatasetId, setSelectedProfileDatasetId] = useState<string>('');

  // Queries
  const { data: datasets, isLoading: isDatasetsLoading } = useQuery({
    queryKey: ['datasets'],
    queryFn: datasetService.list,
  });

  const { data: preprocessingJobs, isLoading: isJobsLoading } = useQuery({
    queryKey: ['preprocessing_jobs'],
    queryFn: preprocessingService.listJobs,
    refetchInterval: 3000, // Poll active jobs
  });

  const { data: datasetProfile } = useQuery({
    queryKey: ['dataset_profile', selectedProfileDatasetId],
    queryFn: () => preprocessingService.getReport(selectedProfileDatasetId),
    enabled: !!selectedProfileDatasetId,
  });

  // Mutations
  const uploadMutation = useMutation({
    mutationFn: datasetService.upload,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
      setUploadFile(null);
      setUploading(false);
    },
    onError: (err: any) => {
      setUploadError(err.message || 'File upload failed');
      setUploading(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: datasetService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
    }
  });

  const startPreprocessingMutation = useMutation({
    mutationFn: preprocessingService.start,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preprocessing_jobs'] });
      setSelectedDatasetId('');
    }
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    setUploading(true);
    setUploadError(null);
    uploadMutation.mutate(uploadFile);
  };

  const handleStartPreprocessing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDatasetId) return;
    startPreprocessingMutation.mutate({
      dataset_id: selectedDatasetId,
      target_column: targetColumn,
      missing_value_strategy: missingStrategy,
      scaling_strategy: scalingStrategy,
      encoding_strategy: encodingStrategy,
      test_size: testSize,
      random_state: 42
    });
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wider uppercase m-0 leading-none">Dataset Manager</h1>
          <span className="text-[10px] text-white/40 tracking-widest mt-1 block">INGEST CAPTURE LOGS & PREPARE INFERENCE MATRICES</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Upload & Preprocess forms (1 column) */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* File Upload card */}
          <div className="glass-panel p-5 rounded-xl border border-white/5 space-y-4">
            <h3 className="text-xs font-bold text-white tracking-widest uppercase border-b border-white/5 pb-3 flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#06b6d4]" />
              Ingest Capture Logs
            </h3>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="border border-dashed border-white/10 rounded-lg p-6 flex flex-col items-center justify-center bg-[#070b13] hover:border-cyan-500/50 transition-colors">
                <Database className="w-8 h-8 text-white/20 mb-3" />
                <span className="text-[10px] text-white/40 text-center uppercase tracking-wide">
                  CSV or PCAP network traffic log
                </span>
                
                <input
                  type="file"
                  accept=".csv,.pcap"
                  onChange={(e) => e.target.files && setUploadFile(e.target.files[0])}
                  className="hidden"
                  id="dataset-uploader"
                />
                
                <label 
                  htmlFor="dataset-uploader"
                  className="mt-4 px-3 py-1.5 border border-white/10 hover:border-[#06b6d4] rounded bg-slate-900 text-white/80 hover:text-[#06b6d4] text-[10px] font-bold uppercase transition-colors cursor-pointer"
                >
                  {uploadFile ? 'Change File' : 'Browse File'}
                </label>

                {uploadFile && (
                  <span className="text-[10px] text-[#06b6d4] font-bold mt-3 text-center truncate max-w-xs">
                    Selected: {uploadFile.name} ({(uploadFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                )}
              </div>

              {uploadError && (
                <div className="p-3 bg-red-950/20 border border-red-500/20 text-red-400 text-[10px] rounded-lg">
                  {uploadError}
                </div>
              )}

              <button
                type="submit"
                disabled={uploading || !uploadFile}
                className="w-full bg-[#06b6d4]/10 hover:bg-[#06b6d4]/20 border border-[#06b6d4]/30 hover:border-[#06b6d4]/50 text-[#06b6d4] py-2.5 rounded-lg text-xs uppercase tracking-wider font-bold transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Ingesting raw bits...
                  </>
                ) : (
                  <span>Upload Dataset</span>
                )}
              </button>
            </form>
          </div>

          {/* Preprocessing setup Console */}
          <div className="glass-panel p-5 rounded-xl border border-white/5 space-y-4">
            <h3 className="text-xs font-bold text-white tracking-widest uppercase border-b border-white/5 pb-3 flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-[#06b6d4]" />
              Preprocessing Console
            </h3>

            <form onSubmit={handleStartPreprocessing} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] text-white/40 mb-1 uppercase tracking-wider">SELECT RAW DATASET</label>
                <select
                  value={selectedDatasetId}
                  onChange={(e) => setSelectedDatasetId(e.target.value)}
                  required
                  className="w-full bg-[#070b13] border border-white/10 rounded px-3 py-2 text-white/80 focus:outline-none focus:border-[#06b6d4]"
                >
                  <option value="">-- Choose Ingested File --</option>
                  {datasets?.filter(d => d.status === 'completed' && d.format.toLowerCase() === 'csv').map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.filename}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-white/40 mb-1 uppercase tracking-wider">TARGET LABEL COLUMN</label>
                <input
                  type="text"
                  value={targetColumn}
                  onChange={(e) => setTargetColumn(e.target.value)}
                  className="w-full bg-[#070b13] border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-[#06b6d4]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-white/40 mb-1 uppercase tracking-wider">MISSING VALUE</label>
                  <select
                    value={missingStrategy}
                    onChange={(e) => setMissingStrategy(e.target.value)}
                    className="w-full bg-[#070b13] border border-white/10 rounded px-2.5 py-1.5 text-white/80 focus:outline-none"
                  >
                    <option value="mean">Mean fill</option>
                    <option value="median">Median fill</option>
                    <option value="most_frequent">Most Freq</option>
                    <option value="drop">Drop Rows</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-white/40 mb-1 uppercase tracking-wider">FEATURE SCALING</label>
                  <select
                    value={scalingStrategy}
                    onChange={(e) => setScalingStrategy(e.target.value)}
                    className="w-full bg-[#070b13] border border-white/10 rounded px-2.5 py-1.5 text-white/80 focus:outline-none"
                  >
                    <option value="standard">StandardScaler</option>
                    <option value="min-max">MinMax scaling</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-white/40 mb-1 uppercase tracking-wider">CATEGORICALS</label>
                  <select
                    value={encodingStrategy}
                    onChange={(e) => setEncodingStrategy(e.target.value)}
                    className="w-full bg-[#070b13] border border-white/10 rounded px-2.5 py-1.5 text-white/80 focus:outline-none"
                  >
                    <option value="label">Label encoding</option>
                    <option value="one-hot">One-Hot encode</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-white/40 mb-1 uppercase tracking-wider">TEST SIZE SPLIT</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.05"
                    max="0.5"
                    value={testSize}
                    onChange={(e) => setTestSize(parseFloat(e.target.value))}
                    className="w-full bg-[#070b13] border border-white/10 rounded px-2.5 py-1.5 text-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={startPreprocessingMutation.isPending || !selectedDatasetId}
                className="w-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-500/50 text-[#06b6d4] py-2.5 rounded-lg text-xs uppercase tracking-wider font-bold transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-[#06b6d4]" />
                Compile Dataset
              </button>
            </form>
          </div>

        </div>

        {/* Database files & Preprocessing queue (2 columns) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Datasets Table */}
          <div className="glass-panel rounded-xl border border-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5 bg-[#0a0f1d]/50">
              <h3 className="text-xs font-bold text-white tracking-widest uppercase m-0 leading-none">Ingested Datasets</h3>
            </div>
            
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#080d18]/50 border-b border-white/5 text-white/40 uppercase tracking-wider font-bold">
                    <th className="p-4">FILENAME</th>
                    <th className="p-4">SIZE</th>
                    <th className="p-4">STATUS</th>
                    <th className="p-4">INGESTED</th>
                    <th className="p-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {isDatasetsLoading ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-white/40">
                        Loading database catalog...
                      </td>
                    </tr>
                  ) : datasets?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-white/30">
                        No ingested datasets found.
                      </td>
                    </tr>
                  ) : (
                    datasets?.map((d) => (
                      <tr 
                        key={d.id}
                        onClick={() => d.status === 'completed' && setSelectedProfileDatasetId(d.id)}
                        className={`transition-colors cursor-pointer hover:bg-white/[0.01] ${selectedProfileDatasetId === d.id ? 'bg-cyan-500/[0.03]' : ''}`}
                      >
                        <td className="p-4 font-bold text-white max-w-xs truncate">{d.filename}</td>
                        <td className="p-4 text-white/60">{(d.size_bytes / 1024 / 1024).toFixed(2)} MB</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 border rounded text-[9px] font-bold uppercase
                            ${d.status === 'completed' ? 'text-emerald-400 bg-emerald-950/20 border-emerald-500/30' : 
                              d.status === 'failed' ? 'text-red-400 bg-red-950/20 border-red-500/30' : 
                              'text-yellow-400 bg-yellow-950/10 border-yellow-500/30 animate-pulse'}
                          `}>
                            {d.status}
                          </span>
                        </td>
                        <td className="p-4 text-white/40 text-[10px]">
                          {formatDistanceToNow(new Date(d.created_at), { addSuffix: true })}
                        </td>
                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            disabled={deleteMutation.isPending}
                            onClick={() => deleteMutation.mutate(d.id)}
                            className="p-1.5 border border-white/10 hover:border-red-500/30 rounded text-white/40 hover:text-red-400 transition-all cursor-pointer"
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

          {/* Preprocessing Jobs List */}
          <div className="glass-panel rounded-xl border border-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5 bg-[#0a0f1d]/50">
              <h3 className="text-xs font-bold text-white tracking-widest uppercase m-0 leading-none">Preprocessing Task Queue</h3>
            </div>
            
            <div className="p-4 space-y-3.5 max-h-56 overflow-y-auto">
              {isJobsLoading ? (
                <div className="text-center py-4 text-white/40 text-xs">Loading queue pipeline...</div>
              ) : preprocessingJobs?.length === 0 ? (
                <div className="text-center py-4 text-white/30 text-xs">No preprocessing task logs found.</div>
              ) : (
                preprocessingJobs?.map((job) => (
                  <div key={job.id} className="bg-[#070b13] p-3 rounded-lg border border-white/5 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <div className="font-bold text-white">JOB: {job.id.substring(0, 8)}</div>
                      <span className="text-[10px] text-white/40">
                        Algorithm scaling: {job.config.scaling_strategy} scaling • split {job.config.test_size}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 border rounded text-[9px] font-bold uppercase
                        ${job.status === 'completed' ? 'text-emerald-400 bg-emerald-950/20 border-emerald-500/30' : 
                          job.status === 'failed' ? 'text-red-400 bg-red-950/20 border-red-500/30' : 
                          'text-yellow-400 bg-yellow-950/10 border-yellow-500/30 animate-pulse'}
                      `}>
                        {job.status}
                      </span>
                      {job.processed_dataset && (
                        <span className="text-[10px] text-cyan-500 font-bold bg-[#06b6d4]/10 border border-[#06b6d4]/20 px-1.5 py-0.5 rounded">
                          TRAIN: {job.processed_dataset.train_samples}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Profiling Report Preview panel */}
          {selectedProfileDatasetId && (
            <div className="glass-panel p-5 rounded-xl border border-white/5 space-y-4">
              <h3 className="text-xs font-bold text-[#06b6d4] tracking-widest uppercase border-b border-white/5 pb-3 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Dataset Profiling Report
              </h3>

              {!datasetProfile ? (
                <div className="text-center py-6 text-white/40 text-xs">
                  <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
                  Generating statistical summaries...
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-white/70">
                  <div className="space-y-3">
                    <div>
                      <span className="text-[9px] text-white/40 uppercase">DUPLICATE ROWS FOUND</span>
                      <div className="text-sm font-bold text-white mt-0.5">{datasetProfile.duplicate_rows} rows</div>
                    </div>
                    <div>
                      <span className="text-[9px] text-white/40 uppercase">NUMERIC FEATURE VECTORS</span>
                      <div className="text-white font-mono mt-1 max-h-24 overflow-y-auto border border-white/5 p-2 bg-[#070b13] rounded">
                        {datasetProfile.numeric_features.join(', ') || 'None'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-[9px] text-white/40 uppercase">CLASS LABELS DISTRIBUTION</span>
                      <div className="mt-1.5 space-y-1.5 bg-[#070b13] border border-white/5 p-3 rounded">
                        {Object.entries(datasetProfile.class_distribution).map(([label, count]: [string, any]) => (
                          <div key={label} className="flex justify-between font-mono">
                            <span className="text-white/50">{label === '1' || label === '1.0' ? 'MALICIOUS (1)' : 'BENIGN (0)'}:</span>
                            <span className="text-white font-bold">{count} rows</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
