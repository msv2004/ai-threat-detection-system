import React, { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { datasetService, preprocessingService } from '../services/api';
import { 
  Database, 
  Upload, 
  Trash2, 
  Settings2, 
  Play, 
  RefreshCw, 
  Loader2, 
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  FileText,
  X,
  ChevronRight,
  TrendingUp,
  Activity,
  Layers,
  Search
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="p-4"><div className="h-3.5 bg-surface-3 rounded w-44" /></td>
      <td className="p-4"><div className="h-3 bg-surface-3 rounded w-16" /></td>
      <td className="p-4"><div className="h-4 bg-surface-3 rounded w-20" /></td>
      <td className="p-4"><div className="h-3 bg-surface-3 rounded w-28" /></td>
      <td className="p-4 text-right"><div className="h-7 w-7 bg-surface-3 rounded ml-auto" /></td>
    </tr>
  );
}

export default function Datasets() {
  const queryClient = useQueryClient();
  
  // File upload states
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  // Preprocessing configuration states
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>(() => {
    return localStorage.getItem('selected_dataset_id') || '';
  });
  const [targetColumn, setTargetColumn] = useState('Label');
  const [missingStrategy, setMissingStrategy] = useState('mean');
  const [scalingStrategy, setScalingStrategy] = useState('standard');
  const [encodingStrategy, setEncodingStrategy] = useState('label');
  const [testSize, setTestSize] = useState(0.2);

  // Active view states
  const [selectedProfileDatasetId, setSelectedProfileDatasetId] = useState<string>('');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Queries
  const { data: datasets, isLoading: isDatasetsLoading, isError: isDatasetsError, refetch: refetchDatasets, isFetching: isDatasetsFetching } = useQuery({
    queryKey: ['datasets'],
    queryFn: datasetService.list,
    retry: 1,
  });

  const { data: preprocessingJobs, isLoading: isJobsLoading, isError: isJobsError, refetch: refetchJobs, isFetching: isJobsFetching } = useQuery({
    queryKey: ['preprocessing_jobs'],
    queryFn: preprocessingService.listJobs,
    refetchInterval: 3000,
    retry: 1,
  });

  const { data: datasetProfile, isLoading: isProfileLoading, isError: isProfileError } = useQuery({
    queryKey: ['dataset_profile', selectedProfileDatasetId],
    queryFn: () => preprocessingService.getReport(selectedProfileDatasetId),
    enabled: !!selectedProfileDatasetId,
    retry: false,
  });

  const isRefreshing = isDatasetsFetching || isJobsFetching;

  // Track dataset list changes to auto-select newly processed ones
  const [prevDatasetCount, setPrevDatasetCount] = useState(0);
  useEffect(() => {
    if (datasets) {
      if (datasets.length > prevDatasetCount) {
        const readyDataset = datasets.find(d => d.status === 'ready' || d.status === 'completed');
        if (readyDataset && !selectedDatasetId) {
          setSelectedDatasetId(readyDataset.id);
          localStorage.setItem('selected_dataset_id', readyDataset.id);
        }
      }
      setPrevDatasetCount(datasets.length);
    }
  }, [datasets, prevDatasetCount, selectedDatasetId]);

  // Mutations
  const uploadMutation = useMutation({
    mutationFn: (file: File) => datasetService.upload(file, (progress) => setUploadProgress(progress)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
      setUploadFile(null);
      setUploading(false);
      setUploadProgress(0);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 4000);
    },
    onError: (err: any) => {
      setUploadError(err.message || 'File upload failed. Check format and size (max 5MB).');
      setUploading(false);
      setUploadProgress(0);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: datasetService.delete,
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(['datasets'], (oldDatasets: any[] | undefined) => {
        if (!oldDatasets) return [];
        return oldDatasets.filter(d => d.id !== deletedId);
      });
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
      queryClient.invalidateQueries({ queryKey: ['preprocessing_jobs'] });
      queryClient.invalidateQueries({ queryKey: ['training_jobs'] });
      queryClient.invalidateQueries({ queryKey: ['models'] });
      
      setDeleteTargetId(null);
      if (selectedDatasetId === deletedId) {
        setSelectedDatasetId('');
        localStorage.removeItem('selected_dataset_id');
      }
      if (selectedProfileDatasetId === deletedId) {
        setSelectedProfileDatasetId('');
      }
    },
    onError: (err: any) => {
      alert(`Delete failed: ${err.message || 'Server error'}`);
      setDeleteTargetId(null);
    }
  });

  const startPreprocessingMutation = useMutation({
    mutationFn: preprocessingService.start,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preprocessing_jobs'] });
    }
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    
    if (uploadFile.size > 5 * 1024 * 1024) {
      setUploadError('File exceeds the 5MB size limit. Please use a smaller dataset slice.');
      return;
    }
    
    if (!uploadFile.name.endsWith('.csv')) {
      setUploadError('Only .csv files are supported. Convert PCAP files using CICFlowMeter first.');
      return;
    }
    
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

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setUploadError(null);
      setUploadFile(file);
    }
  }, []);

  const filteredDatasets = datasets?.filter(d => 
    d.filename.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl text-white heading-display tracking-wider">Data Ingestion</h2>
          <p className="text-sm text-text-secondary mt-0.5">Upload and preprocess network capture datasets</p>
        </div>
        <button
          onClick={() => { refetchDatasets(); refetchJobs(); }}
          disabled={isRefreshing}
          className="btn btn-secondary btn-sm flex items-center gap-1.5 self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-accent' : ''}`} />
          Sync Ingestion
        </button>
      </div>

      {/* Info Warning banner */}
      <div className="p-4 bg-semantic-info/5 border border-semantic-info/20 rounded-xl flex gap-3 items-start">
        <Info className="w-5 h-5 text-semantic-info shrink-0 mt-0.5" />
        <div className="text-xs text-text-secondary leading-relaxed">
          <span className="font-bold text-white block mb-1">Supported Format: Labeled Network Capture CSV (Max 5MB)</span>
          Compatible formats include <a href="https://www.unb.ca/cic/datasets/ids-2017.html" target="_blank" rel="noreferrer" className="text-accent hover:underline">CIC-IDS2017</a>, <a href="https://research.unsw.edu.au/projects/unsw-nb15-dataset" target="_blank" rel="noreferrer" className="text-accent hover:underline">UNSW-NB15</a>, or equivalent sheets. Preprocessing splits data into train/test splits before compilation.
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* Left Forms (1 Column) */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* Upload card */}
          <div className="card p-5 space-y-4">
            <h3 className="text-base text-white flex items-center gap-1.5 border-b border-border-default pb-3 heading-display tracking-wider">
              <Upload className="w-4 h-4 text-accent" />
              Ingest Log CSV
            </h3>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs font-semibold">
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`
                  border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center bg-white/[0.01] transition-colors cursor-pointer text-center
                  ${dragActive ? 'border-accent bg-accent/5' : 'border-white/[0.08] hover:border-accent/40'}
                `}
              >
                <Database className="w-8 h-8 text-text-secondary mb-2" />
                <span className="text-xs text-text-secondary">Drag & drop CSV file here</span>
                <span className="text-[10px] text-text-secondary/40 mt-1">Maximum size limit 5MB</span>
                
                <input
                  type="file"
                  accept=".csv"
                  disabled={uploading}
                  onChange={(e) => {
                    setUploadError(null);
                    e.target.files && setUploadFile(e.target.files[0]);
                  }}
                  className="hidden"
                  id="dataset-uploader"
                />
                
                <label 
                  htmlFor="dataset-uploader"
                  className="mt-4 px-4 py-2 border border-white/[0.10] hover:border-accent rounded-xl bg-white/[0.04] text-text-secondary hover:text-white text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer"
                >
                  {uploadFile ? 'Replace Selection' : 'Select Ingestion File'}
                </label>

                {uploadFile && (
                  <div className="flex items-center gap-1.5 mt-4 text-[10px] text-accent font-mono-data bg-accent/5 border border-accent/15 px-2 py-1 rounded">
                    <FileText className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[150px] font-bold">{uploadFile.name}</span>
                    <span>({(uploadFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                )}
              </div>

              {uploadError && (
                <div className="p-3 bg-semantic-critical/10 border border-semantic-critical/20 text-semantic-critical rounded-lg flex items-start gap-2">
                  <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadSuccess && (
                <div className="p-3 bg-semantic-success/10 border border-semantic-success/20 text-semantic-success rounded-lg flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>Inflow Ingested! Select file below to preprocess.</span>
                </div>
              )}

              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] font-mono-data text-text-secondary">
                    <span>TRANSMITTING BINDINGS...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-white/[0.05] rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-accent h-full transition-all duration-300 rounded-full" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={uploading || !uploadFile}
                className="w-full btn btn-primary flex justify-center items-center gap-1.5 text-xs font-mono-data uppercase tracking-wider"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Transmitting...
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    Transmit Ingestion
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Preprocessing setup Console */}
          <div className="card p-5 space-y-4">
            <h3 className="text-base text-white flex items-center gap-1.5 border-b border-border-default pb-3 heading-display tracking-wider">
              <Settings2 className="w-4 h-4 text-accent" />
              Preprocessing Console
            </h3>

            <form onSubmit={handleStartPreprocessing} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-[9px] text-text-secondary mb-2 uppercase tracking-wider font-semibold">Select Ingested File</label>
                <select
                  value={selectedDatasetId}
                  onChange={(e) => {
                    setSelectedDatasetId(e.target.value);
                    localStorage.setItem('selected_dataset_id', e.target.value);
                  }}
                  required
                  className="input rounded-xl"
                >
                  <option value="">-- Choose Ingested File --</option>
                  {datasets?.filter(d => (d.status === 'ready' || d.status === 'completed') && (d.dataset_type?.toLowerCase() === 'csv' || d.filename?.toLowerCase().endsWith('.csv'))).map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.filename}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] text-text-secondary mb-2 uppercase tracking-wider font-semibold">Target Label Column</label>
                <input
                  type="text"
                  value={targetColumn}
                  onChange={(e) => setTargetColumn(e.target.value)}
                  placeholder="e.g. Label"
                  className="input rounded-xl font-mono-data"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] text-text-secondary mb-2 uppercase tracking-wider font-semibold">Missing values</label>
                  <select
                    value={missingStrategy}
                    onChange={(e) => setMissingStrategy(e.target.value)}
                    className="input rounded-xl"
                  >
                    <option value="mean">Mean fill</option>
                    <option value="median">Median fill</option>
                    <option value="most_frequent">Most Freq</option>
                    <option value="drop">Drop Rows</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] text-text-secondary mb-2 uppercase tracking-wider font-semibold">Feature Scaling</label>
                  <select
                    value={scalingStrategy}
                    onChange={(e) => setScalingStrategy(e.target.value)}
                    className="input rounded-xl"
                  >
                    <option value="standard">StandardScaler</option>
                    <option value="min-max">MinMax scaler</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] text-text-secondary mb-2 uppercase tracking-wider font-semibold">Categorical Encoding</label>
                  <select
                    value={encodingStrategy}
                    onChange={(e) => setEncodingStrategy(e.target.value)}
                    className="input rounded-xl"
                  >
                    <option value="label">Label encoding</option>
                    <option value="one-hot">One-Hot encode</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] text-text-secondary mb-2 uppercase tracking-wider font-semibold">Test Split Ratio</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.05"
                    max="0.5"
                    value={testSize}
                    onChange={(e) => setTestSize(parseFloat(e.target.value))}
                    className="input rounded-xl font-mono-data"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={startPreprocessingMutation.isPending || !selectedDatasetId}
                className="w-full btn btn-primary flex justify-center items-center gap-1.5 text-xs font-mono-data uppercase tracking-wider"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {startPreprocessingMutation.isPending ? 'Starting run...' : 'Run Preprocess'}
              </button>
            </form>
          </div>

        </div>

        {/* Right Data lists (2 Columns) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Datasets Table list */}
           <div className="card overflow-hidden">
            <div className="p-5 border-b border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/[0.01]">
              <div>
                <h3 className="text-base text-white heading-display tracking-wider">Ingested Repositories</h3>
                <p className="text-[10px] text-text-secondary mt-0.5">Isolated log packets files</p>
              </div>
              
              {/* Search filter */}
              <div className="relative w-full sm:w-44">
                <Search className="w-3.5 h-3.5 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/[0.10] rounded-xl pl-8 pr-3 py-1.5 text-[10px] text-white outline-none focus:border-accent"
                />
              </div>
            </div>
            
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-2/40 border-b border-border-default text-text-tertiary uppercase tracking-wider text-[9px] font-bold">
                    <th className="p-4">Filename</th>
                    <th className="p-4">Size</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Uploaded</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle text-text-secondary font-semibold">
                  {isDatasetsLoading ? (
                    <>
                      <SkeletonRow />
                      <SkeletonRow />
                      <SkeletonRow />
                    </>
                  ) : isDatasetsError ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-semantic-warning" />
                          <span className="text-xs text-text-primary">Failed loading database</span>
                          <button onClick={() => refetchDatasets()} className="btn btn-secondary btn-sm mt-1">Retry</button>
                        </div>
                      </td>
                    </tr>
                  ) : filteredDatasets.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-text-secondary">
                        <div className="flex flex-col items-center gap-3">
                          <Database className="w-8 h-8 text-text-tertiary" />
                          <span className="text-xs font-bold text-white">No Ingested CSV Files</span>
                          <p className="text-[10px] text-text-tertiary max-w-xs">Transmit a CSV file from the left upload panel to start ingestion.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredDatasets.map((d) => (
                      <tr 
                        key={d.id}
                        onClick={() => (d.status === 'ready' || d.status === 'completed') && setSelectedProfileDatasetId(d.id)}
                        className={`transition-colors cursor-pointer hover:bg-surface-2/50 ${selectedProfileDatasetId === d.id ? 'bg-accent/5' : ''}`}
                      >
                        <td className="p-4 font-bold text-white max-w-xs truncate">{d.filename}</td>
                        <td className="p-4 font-mono-data">{(d.size_bytes / 1024 / 1024).toFixed(2)} MB</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 border rounded-md text-[8px] font-extrabold uppercase
                            ${(d.status === 'ready' || d.status === 'completed') ? 'text-semantic-success bg-semantic-success/10 border-semantic-success/20' : 
                              d.status === 'failed' ? 'text-semantic-critical bg-semantic-critical/10 border-semantic-critical/20' : 
                              'text-semantic-warning bg-semantic-warning/10 border-semantic-warning/20 animate-pulse'}`}
                          >
                            {d.status}
                          </span>
                        </td>
                        <td className="p-4 text-text-tertiary font-mono-data text-[10px]">
                          {formatDistanceToNow(new Date(d.created_at), { addSuffix: true })}
                        </td>
                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            disabled={deleteMutation.isPending}
                            onClick={() => setDeleteTargetId(d.id)}
                            className="p-2 border border-white/[0.06] hover:border-semantic-critical/30 rounded-xl text-text-secondary hover:text-semantic-critical hover:bg-semantic-critical/5 transition-all cursor-pointer"
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

          {/* Preprocessing Jobs List queue */}
          <div className="card overflow-hidden">
            <div className="p-5 border-b border-white/[0.06] bg-white/[0.01]">
              <h3 className="text-base text-white heading-display tracking-wider">Preprocessing Queue Logs</h3>
            </div>
            
            <div className="p-4 space-y-3 max-h-56 overflow-y-auto">
              {isJobsLoading ? (
                <div className="space-y-3">
                  <div className="h-12 bg-surface-2 rounded-lg animate-pulse border border-border-subtle" />
                  <div className="h-12 bg-surface-2 rounded-lg animate-pulse border border-border-subtle" />
                </div>
              ) : isJobsError ? (
                <div className="text-center py-4 flex flex-col items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-semantic-warning" />
                  <span className="text-xs text-text-secondary">Failed to fetch preprocessing pipeline</span>
                </div>
              ) : preprocessingJobs?.length === 0 ? (
                <div className="text-center py-6 text-text-tertiary flex flex-col items-center gap-1">
                  <Settings2 className="w-5 h-5" />
                  <span className="text-xs font-semibold">No preprocessing pipeline triggers logged</span>
                </div>
              ) : (
                preprocessingJobs?.map((job) => (
                  <div key={job.id} className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.05] flex flex-col gap-2 text-xs text-left">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="font-bold text-white font-mono-data text-[11px]">JOB ID: {job.id.substring(0, 8)}...</div>
                        <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">
                          Scaler: {job.config?.scaling_strategy} · Encoding: {job.config?.encoding_strategy}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span className={`px-2.5 py-0.5 border rounded-lg text-[8px] font-extrabold uppercase
                          ${job.status === 'completed' ? 'text-semantic-success bg-semantic-success/10 border-semantic-success/20' : 
                            job.status === 'failed' ? 'text-semantic-critical bg-semantic-critical/10 border-semantic-critical/20' : 
                            'text-semantic-warning bg-semantic-warning/10 border-semantic-warning/20 animate-pulse'}`}
                        >
                          {job.status}
                        </span>
                        {job.processed_dataset && (
                          <span className="text-[10px] text-accent font-semibold bg-accent/5 border border-accent/15 px-2 py-0.5 rounded-lg font-mono-data">
                            {job.processed_dataset.train_samples} samples
                          </span>
                        )}
                      </div>
                    </div>
                    {job.status === 'failed' && job.error_message && (
                      <div className="text-[10px] text-semantic-critical bg-semantic-critical/5 border border-semantic-critical/10 p-2.5 rounded-lg flex items-start gap-1 font-mono-data">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{job.error_message}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Dataset profiling summary details */}
          <AnimatePresence>
            {selectedProfileDatasetId && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="card p-6 space-y-4 text-left rounded-2xl bg-black/20"
              >
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <h3 className="text-base text-white flex items-center gap-1.5 heading-display tracking-wider">
                    <Layers className="w-4 h-4 text-accent" />
                    Inflow profile statistics
                  </h3>
                  <button onClick={() => setSelectedProfileDatasetId('')} className="text-text-tertiary hover:text-white cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {isProfileLoading ? (
                  <div className="text-center py-6 flex flex-col items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-accent" />
                    <span className="text-xs text-text-secondary">Profiling dataset logs...</span>
                  </div>
                ) : isProfileError ? (
                  <div className="bg-semantic-warning/5 border border-semantic-warning/20 text-semantic-warning p-4 rounded-xl flex gap-3 items-start text-xs leading-relaxed">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block mb-1">Preprocess profile not compiled</strong>
                      You must select this dataset and run the compiler preprocessing from the console configuration on the left first.
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-text-secondary">
                    <div className="space-y-4">
                      <div>
                        <span className="text-[9px] text-text-secondary uppercase font-semibold tracking-wider">Duplicate Record Rows</span>
                        <div className="text-sm font-bold text-white mt-1 font-mono-data">{datasetProfile.duplicate_rows} rows</div>
                      </div>
                      <div>
                        <span className="text-[9px] text-text-secondary uppercase font-semibold tracking-wider">Numeric Features ({datasetProfile.numeric_features?.length || 0})</span>
                        <div className="text-text-secondary font-mono-data mt-2 max-h-24 overflow-y-auto border border-white/[0.06] p-3 bg-black/30 rounded-xl text-[10px]">
                          {datasetProfile.numeric_features?.join(', ') || 'None'}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <span className="text-[9px] text-text-secondary uppercase font-semibold tracking-wider">Target label distributions</span>
                        <div className="mt-2 space-y-2.5 bg-black/30 border border-white/[0.06] p-3.5 rounded-xl">
                          {Object.entries(datasetProfile.class_distribution || {}).map(([label, count]: [string, any]) => {
                            const total = Object.values(datasetProfile.class_distribution || {}).reduce((a: any, b: any) => a + b, 0) as number;
                            const pct = total > 0 ? (count / total) * 100 : 0;
                            return (
                              <div key={label} className="space-y-1">
                                <div className="flex justify-between font-mono-data text-[10px]">
                                  <span className="text-text-secondary">{label === '1' || label === '1.0' ? 'Malicious (1)' : 'Benign (0)'}:</span>
                                  <span className="text-white font-bold">{count.toLocaleString()} rows ({pct.toFixed(1)}%)</span>
                                </div>
                                <div className="w-full bg-white/[0.05] rounded-full h-1 overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${label === '1' || label === '1.0' ? 'bg-semantic-critical' : 'bg-semantic-success'}`}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-1/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-left">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 text-semantic-critical">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 className="text-base text-white heading-display tracking-wider">Delete Ingested File</h3>
              </div>
              <button onClick={() => setDeleteTargetId(null)} className="text-text-secondary hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Are you sure you want to permanently delete this dataset? This will remove all related preprocessing runs and trained models. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="btn btn-secondary btn-sm animate-none"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteTargetId)}
                disabled={deleteMutation.isPending}
                className="px-5 py-2.5 bg-semantic-critical hover:bg-red-600 disabled:opacity-40 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(255,71,87,0.2)] hover:shadow-[0_0_30px_rgba(255,71,87,0.4)]"
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Wiping File...
                  </>
                ) : (
                  'Confirm Wipe'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
