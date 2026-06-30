import { create } from 'zustand';
import { ThreatAlert, DetectionStatistics } from '../types';

interface SocketState {
  socket: WebSocket | null;
  isConnected: boolean;
  alerts: ThreatAlert[];
  stats: DetectionStatistics | null;
  isUnderAttack: boolean;
  queryClient: any;
  lastAlertTime: number | null;

  connect: () => void;
  disconnect: () => void;
  clearAlerts: () => void;
  setQueryClient: (client: any) => void;
}

export const useSocketStore = create<SocketState>((set, get) => {
  let reconnectTimeout: any = null;

  const handleMessage = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      const queryClient = get().queryClient;

      if (data.type === 'threat_alert') {
        const newAlert: ThreatAlert = {
          ...data,
          timestamp: new Date().toISOString(),
        };

        // If severity is critical or high, set under attack state
        const isCriticalOrHigh = ['critical', 'high'].includes(data.severity.toLowerCase());
        
        set((state) => {
          const updatedAlerts = [newAlert, ...state.alerts].slice(0, 100);
          return {
            alerts: updatedAlerts,
            isUnderAttack: isCriticalOrHigh ? true : state.isUnderAttack,
            lastAlertTime: Date.now(),
          };
        });

        // Trigger query updates for threats and analytics
        if (queryClient) {
          queryClient.invalidateQueries({ queryKey: ['threats'] });
          queryClient.invalidateQueries({ queryKey: ['analytics'] });
        }
      } else if (data.type === 'detection_stats') {
        set({ stats: data.stats });
      } else if (data.type === 'system_event') {
        // Bridged backend events!
        const eventType = data.event_type;
        
        if (queryClient) {
          if (eventType.startsWith('training_')) {
            queryClient.invalidateQueries({ queryKey: ['training_jobs'] });
            queryClient.invalidateQueries({ queryKey: ['models'] });
          } else if (eventType.startsWith('dataset_')) {
            queryClient.invalidateQueries({ queryKey: ['datasets'] });
            queryClient.invalidateQueries({ queryKey: ['preprocessing_jobs'] });
          } else if (eventType.startsWith('detection_')) {
            queryClient.invalidateQueries({ queryKey: ['detection_status'] });
            queryClient.invalidateQueries({ queryKey: ['detection_sessions'] });
          } else if (eventType === 'threat_status_updated' || eventType === 'threat_generated') {
            queryClient.invalidateQueries({ queryKey: ['threats'] });
            queryClient.invalidateQueries({ queryKey: ['analytics'] });
          }
        }
      }
    } catch (err) {
      console.error('Error parsing WS message:', err);
    }
  };

  return {
    socket: null,
    isConnected: false,
    alerts: [],
    stats: null,
    isUnderAttack: false,
    queryClient: null,
    lastAlertTime: null,

    setQueryClient: (queryClient) => {
      set({ queryClient });
    },

    connect: () => {
      if (get().socket) return;

      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      // In development, the backend runs on port 8000, while frontend runs on 5173
      const wsHost = import.meta.env.VITE_API_URL
        ? import.meta.env.VITE_API_URL.replace(/^http/, 'ws')
        : `${wsProtocol}//${window.location.hostname}:8000`;

      const token = localStorage.getItem('access_token');
      const wsUrl = `${wsHost}/ws/alerts${token ? `?token=${token}` : ''}`;
      console.log('Connecting to WebSocket:', wsUrl);

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
        set({ isConnected: true, socket: ws });
        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout);
          reconnectTimeout = null;
        }
      };

      ws.onmessage = handleMessage;

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        set({ isConnected: false, socket: null });
        // Attempt reconnect after 3 seconds
        if (!reconnectTimeout) {
          reconnectTimeout = setTimeout(() => {
            reconnectTimeout = null;
            get().connect();
          }, 3000);
        }
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        ws.close();
      };
    },

    disconnect: () => {
      const socket = get().socket;
      if (socket) {
        socket.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
      set({ socket: null, isConnected: false });
    },

    clearAlerts: () => {
      set({ alerts: [], isUnderAttack: false, lastAlertTime: null });
    },
  };
});
