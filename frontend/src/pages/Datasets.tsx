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
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="p-4"><div className="h-3 bg-white/10 rounded w-40" /></td>
      <td className="p-4"><div className="h-3 bg-white/10 rounded w-16" /></td>
      <td className="p-4"><div className="h-3 bg-white/10 rounded w-20" /></td>
      <td className="p-4"><div className="h-3 bg-white/10 rounded w-24" /></td>
      <td className="p-4 text-right"><div className="h-6 w-6 bg-white/10 rounded ml-auto" /></td>
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
      // If we got a new dataset that is ready, and we don't have a selection, auto-select it
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
      setUploadError(err.message || 'File upload failed. Check file format and size (max 5MB).');
      setUploading(false);
      setUploadProgress(0);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: datasetService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
      setDeleteTargetId(null);
      // Clear selected dataset if it was deleted
      if (selectedDatasetId === deleteTargetId) {
        setSelectedDatasetId('');
        localStorage.removeItem('selected_dataset_id');
      }
      if (selectedProfileDatasetId === deleteTargetId) {
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
    
    // Validate file size (5MB limit)
    if (uploadFile.size > 5 * 1024 * 1024) {
      setUploadError('File exceeds the 5MB size limit. Please use a smaller dataset slice.');
      return;
    }
    
    // Validate file type
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

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) setUploadFile(file);
  }, []);

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Datasets</h1>
          <p className="text-text-secondary text-sm mt-1">Upload network traffic CSVs and configure the preprocessing pipeline.</p>
        </div>
        <button
          onClick={() => { refetchDatasets(); refetchJobs(); }}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 bg-surface-1 border border-border-subtle hover:border-border-default text-text-secondary hover:text-text-primary px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-accent' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Info guidance banner */}
      <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 flex gap-3 items-start">
        <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
        <div className="text-xs text-text-secondary">
          <span className="font-semibold text-text-primary block mb-1">Accepted formats: CSV only (max 5MB)</span>
          Compatible datasets: <a href="https://www.unb.ca/cic/datasets/ids-2017.html" target="_blank" rel="noreferrer" className="text-accent hover:underline">CIC-IDS2017</a>, <a href="https://research.unsw.edu.au/projects/unsw-nb15-dataset" target="_blank" rel="noreferrer" className="text-accent hover:underline">UNSW-NB15</a>, NSL-KDD, or any labeled network traffic CSV.
          After uploading, run preprocessing to generate train/test splits before training a model.
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Upload & Preprocess forms (1 column) */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* File Upload card */}
          <div className="card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 border-b border-border-subtle pb-3">
              <Upload className="w-4 h-4 text-accent" />
              Upload Dataset
            </h3>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-border-default hover:border-accent/50 rounded-xl p-6 flex flex-col items-center justify-center bg-surface-0 transition-colors cursor-pointer text-center"
              >
                <Database className="w-8 h-8 text-text-tertiary mb-3" />
                <span className="text-xs text-text-secondary font-medium">
                  Drag & drop your CSV file here
                </span>
                <span className="text-[10px] text-text-tertiary mt-1">or click below to browse</span>
                
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    setUploadError(null);
                    e.target.files && setUploadFile(e.target.files[0]);
                  }}
                  className="hidden"
                  id="dataset-uploader"
                />
                
                <label 
                  htmlFor="dataset-uploader"
                  className="mt-4 px-3 py-1.5 border border-border-default hover:border-accent rounded-lg bg-surface-2 text-text-secondary hover:text-accent text-xs font-semibold transition-colors cursor-pointer"
                >
                  {uploadFile ? 'Change File' : 'Browse CSV File'}
                </label>

                {uploadFile && (
                  <div className="flex items-center gap-1.5 mt-3">
                    <FileText className="w-3 h-3 text-accent" />
                    <span className="text-[10px] text-accent font-semibold truncate max-w-[160px]">
                      {uploadFile.name} ({(uploadFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                )}
              </div>

              {uploadError && (
                <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg">
                  <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  {uploadError}
                </div>
              )}

              {uploadSuccess && (
                <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                  Dataset uploaded successfully! Select it below to preprocess.
                </div>
              )}

              {uploading && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-text-secondary font-semibold">
                    <span>Ingesting File...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-surface-2 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-accent h-1.5 transition-all duration-300 rounded-full" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={uploading || !uploadFile}
                className="w-full bg-accent/10 hover:bg-accent/20 border border-accent/30 hover:border-accent/50 text-accent py-2.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Uploading ({uploadProgress}%)
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    Upload Dataset
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Preprocessing setup Console */}
          <div className="card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 border-b border-border-subtle pb-3">
              <Settings2 className="w-4 h-4 text-accent" />
              Preprocessing Console
            </h3>

            <form onSubmit={handleStartPreprocessing} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] text-text-tertiary mb-1.5 uppercase tracking-wider font-semibold">Select Dataset</label>
                <select
                  value={selectedDatasetId}
                  onChange={(e) => {
                    setSelectedDatasetId(e.target.value);
                    localStorage.setItem('selected_dataset_id', e.target.value);
                  }}
                  required
                  className="w-full bg-surface-0 border border-border-subtle rounded-lg px-3 py-2 text-text-secondary hover:border-border-default focus:outline-none focus:border-accent transition-colors"
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
                <label className="block text-[10px] text-text-tertiary mb-1.5 uppercase tracking-wider font-semibold">Target Label Column</label>
                <input
                  type="text"
                  value={targetColumn}
                  onChange={(e) => setTargetColumn(e.target.value)}
                  placeholder="e.g. Label"
                  className="w-full bg-surface-0 border border-border-subtle rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-text-tertiary mb-1.5 uppercase tracking-wider font-semibold">Missing Values</label>
                  <select
                    value={missingStrategy}
                    onChange={(e) => setMissingStrategy(e.target.value)}
                    className="w-full bg-surface-0 border border-border-subtle rounded-lg px-2.5 py-2 text-text-secondary focus:outline-none focus:border-accent"
                  >
                    <option value="mean">Mean fill</option>
                    <option value="median">Median fill</option>
                    <option value="most_frequent">Most Freq</option>
                    <option value="drop">Drop Rows</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-text-tertiary mb-1.5 uppercase tracking-wider font-semibold">Feature Scaling</label>
                  <select
                    value={scalingStrategy}
                    onChange={(e) => setScalingStrategy(e.target.value)}
                    className="w-full bg-surface-0 border border-border-subtle rounded-lg px-2.5 py-2 text-text-secondary focus:outline-none focus:border-accent"
                  >
                    <option value="standard">StandardScaler</option>
                    <option value="min-max">MinMax scaling</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-text-tertiary mb-1.5 uppercase tracking-wider font-semibold">Categoricals</label>
                  <select
                    value={encodingStrategy}
                    onChange={(e) => setEncodingStrategy(e.target.value)}
                    className="w-full bg-surface-0 border border-border-subtle rounded-lg px-2.5 py-2 text-text-secondary focus:outline-none focus:border-accent"
                  >
                    <option value="label">Label encoding</option>
                    <option value="one-hot">One-Hot encode</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-text-tertiary mb-1.5 uppercase tracking-wider font-semibold">Test Split</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.05"
                    max="0.5"
                    value={testSize}
                    onChange={(e) => setTestSize(parseFloat(e.target.value))}
                    className="w-full bg-surface-0 border border-border-subtle rounded-lg px-2.5 py-2 text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={startPreprocessingMutation.isPending || !selectedDatasetId}
                className="w-full bg-accent/10 hover:bg-accent/20 border border-accent/30 hover:border-accent/50 text-accent py-2.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-accent" />
                {startPreprocessingMutation.isPending ? 'Starting...' : 'Compile Dataset'}
              </button>
            </form>
          </div>

        </div>

        {/* Database files & Preprocessing queue (2 columns) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Datasets Table */}
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-border-subtle flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-primary">Ingested Datasets</h3>
              <span className="text-[10px] text-text-tertiary">{datasets?.length || 0} file(s)</span>
            </div>
            
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-2/50 border-b border-border-subtle text-text-tertiary uppercase tracking-wider text-[10px] font-semibold">
                    <th className="p-4">Filename</th>
                    <th className="p-4">Size</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Uploaded</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {isDatasetsLoading ? (
                    <>
                      <SkeletonRow />
                      <SkeletonRow />
                      <SkeletonRow />
                    </>
                  ) : isDatasetsError ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center">
                        <div className="flex flex-col items-center gap-2 text-text-secondary">
                          <AlertTriangle className="w-6 h-6 text-amber-400" />
                          <p className="text-xs font-semibold">Could not load datasets</p>
                          <p className="text-[11px] text-text-tertiary">The backend may be starting up (cold start ~15s). Try refreshing.</p>
                          <button
                            onClick={() => refetchDatasets()}
                            className="mt-2 px-3 py-1.5 bg-surface-2 border border-border-default rounded-lg text-xs font-semibold hover:border-border-strong transition-colors"
                          >
                            Retry
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : datasets?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-surface-2 border border-border-subtle flex items-center justify-center">
                            <Database className="w-6 h-6 text-text-tertiary" />
                          </div>
                          <p className="text-sm font-semibold text-text-primary">No datasets uploaded yet</p>
                          <p className="text-xs text-text-secondary max-w-xs">Upload a labeled network traffic CSV (e.g. CIC-IDS2017) to get started.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    datasets?.map((d) => (
                      <tr 
                        key={d.id}
                        onClick={() => (d.status === 'ready' || d.status === 'completed') && setSelectedProfileDatasetId(d.id)}
                        className={`transition-colors cursor-pointer hover:bg-surface-2/50 ${selectedProfileDatasetId === d.id ? 'bg-accent/5' : ''}`}
                      >
                        <td className="p-4 font-semibold text-text-primary max-w-xs truncate">{d.filename}</td>
                        <td className="p-4 text-text-secondary">{(d.size_bytes / 1024 / 1024).toFixed(2)} MB</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 border rounded-md text-[9px] font-bold uppercase
                            ${(d.status === 'ready' || d.status === 'completed') ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 
                              d.status === 'failed' ? 'text-red-400 bg-red-500/10 border-red-500/20' : 
                              'text-amber-400 bg-amber-500/10 border-amber-500/20 animate-pulse'}`}
                          >
                            {d.status}
                          </span>
                        </td>
                        <td className="p-4 text-text-tertiary text-[10px]">
                          {formatDistanceToNow(new Date(d.created_at), { addSuffix: true })}
                        </td>
                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            disabled={deleteMutation.isPending}
                            onClick={() => setDeleteTargetId(d.id)}
                            className="p-1.5 border border-border-subtle hover:border-red-500/30 rounded-lg text-text-tertiary hover:text-red-400 transition-all"
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
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-border-subtle">
              <h3 className="text-sm font-semibold text-text-primary">Preprocessing Task Queue</h3>
            </div>
            
            <div className="p-4 space-y-3 max-h-56 overflow-y-auto">
              {isJobsLoading ? (
                <div className="space-y-3">
                  {[1,2].map(i => (
                    <div key={i} className="h-14 bg-surface-2 rounded-lg animate-pulse border border-border-subtle" />
                  ))}
                </div>
              ) : isJobsError ? (
                <div className="text-center py-4 flex flex-col items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <p className="text-xs text-text-secondary">Could not load preprocessing jobs.</p>
                  <button onClick={() => refetchJobs()} className="text-xs text-accent hover:underline">Retry</button>
                </div>
              ) : preprocessingJobs?.length === 0 ? (
                <div className="text-center py-6 flex flex-col items-center gap-2">
                  <Settings2 className="w-5 h-5 text-text-tertiary" />
                  <p className="text-xs text-text-secondary">No preprocessing jobs yet. Upload a dataset and compile it above.</p>
                </div>
              ) : (
                preprocessingJobs?.map((job) => (
                  <div key={job.id} className="bg-surface-2 p-3 rounded-lg border border-border-subtle flex flex-col gap-2 text-xs">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="font-semibold text-text-primary">Job: {job.id.substring(0, 8)}</div>
                        <span className="text-[10px] text-text-tertiary">
                          {job.config?.scaling_strategy} scaling · split {job.config?.test_size}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 border rounded-md text-[9px] font-bold uppercase
                          ${job.status === 'completed' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 
                            job.status === 'failed' ? 'text-red-400 bg-red-500/10 border-red-500/20' : 
                            'text-amber-400 bg-amber-500/10 border-amber-500/20 animate-pulse'}`}
                        >
                          {job.status}
                        </span>
                        {job.processed_dataset && (
                          <span className="text-[10px] text-accent font-semibold bg-accent/10 border border-accent/20 px-1.5 py-0.5 rounded">
                            {job.processed_dataset.train_samples} train rows
                          </span>
                        )}
                      </div>
                    </div>
                    {job.status === 'failed' && job.error_message && (
                      <div className="text-[10px] text-red-400 bg-red-500/5 border border-red-500/10 p-2 rounded flex items-start gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{job.error_message}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Profiling Report */}
          {selectedProfileDatasetId && (
            <div className="card p-5 space-y-4">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 border-b border-border-subtle pb-3">
                <Info className="w-4 h-4 text-accent" />
                Dataset Profile Report
              </h3>

              {isProfileLoading ? (
                <div className="text-center py-6 flex flex-col items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-accent" />
                  <span className="text-xs text-text-secondary">Generating statistical summary...</span>
                </div>
              ) : isProfileError ? (
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-4 rounded-xl flex gap-3 items-start text-xs leading-relaxed">
                  <AlertTriangle className="w-4.5 h-4.5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block mb-1">Profile Report not generated yet</span>
                    You must compile this dataset first using the Preprocessing Console. This splits features, standardizes scales, and profiles key metrics like missing value ratios and classes.
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-text-secondary">
                  <div className="space-y-3">
                    <div>
                      <span className="text-[9px] text-text-tertiary uppercase font-semibold">Duplicate Rows</span>
                      <div className="text-sm font-bold text-text-primary mt-0.5">{datasetProfile.duplicate_rows} rows</div>
                    </div>
                    <div>
                      <span className="text-[9px] text-text-tertiary uppercase font-semibold">Numeric Features</span>
                      <div className="text-text-secondary font-mono mt-1 max-h-24 overflow-y-auto border border-border-subtle p-2 bg-surface-0 rounded-lg text-[10px]">
                        {datasetProfile.numeric_features?.join(', ') || 'None'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-[9px] text-text-tertiary uppercase font-semibold">Class Distribution</span>
                      <div className="mt-1.5 space-y-1.5 bg-surface-0 border border-border-subtle p-3 rounded-lg">
                        {Object.entries(datasetProfile.class_distribution || {}).map(([label, count]: [string, any]) => (
                          <div key={label} className="flex justify-between font-mono text-[10px]">
                            <span className="text-text-tertiary">{label === '1' || label === '1.0' ? 'Malicious (1)' : 'Benign (0)'}:</span>
                            <span className="text-text-primary font-bold">{count} rows</span>
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
      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-1 border border-border-strong rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2.5 text-red-500">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 className="text-sm font-bold">Delete Dataset</h3>
              </div>
              <button onClick={() => setDeleteTargetId(null)} className="text-text-tertiary hover:text-text-primary">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Are you sure you want to permanently delete this dataset? This will remove all related preprocessing runs and trained models. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="px-4 py-2 border border-border-default rounded-lg bg-surface-2 text-text-secondary hover:text-text-primary text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteTargetId)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-2"
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete permanently'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
