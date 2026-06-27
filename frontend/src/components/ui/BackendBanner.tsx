import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

export default function BackendBanner() {
  const [dismissed, setDismissed] = useState(false);

  const { isError, isLoading, refetch } = useQuery({
    queryKey: ['health_check'],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/health`);
      if (!res.ok) throw new Error('unhealthy');
      return res.json();
    },
    retry: 2,
    retryDelay: 5000,
    staleTime: 30000,
    refetchInterval: 30000,
  });

  // Auto-dismiss when backend comes online
  useEffect(() => {
    if (!isError && !isLoading) {
      setDismissed(true);
    }
  }, [isError, isLoading]);

  if (dismissed) return null;

  // Show a temporary toast while backend is warming up
  if (isError) {
    return (
      <div className="fixed top-4 inset-x-0 flex justify-center z-50">
        <div className="flex items-center gap-3 px-4 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded shadow-lg animate-fade-in">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <p className="text-amber-300 flex-1 text-sm">
            <span className="font-semibold">Backend warming up —</span> Render.com free tier has a ~15s cold start. All features will load automatically once connected.
          </p>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1 px-2 py-1 border border-amber-500/30 hover:border-amber-500/50 rounded text-amber-400 hover:text-amber-300 transition-colors font-semibold"
          >
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-amber-400/60 hover:text-amber-400 transition-colors p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }
  return null;


}
