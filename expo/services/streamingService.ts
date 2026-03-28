import { Platform } from 'react-native';

interface StreamingEvent {
  id: string;
  type: 'transaction' | 'anomaly' | 'risk_alert' | 'compliance_check';
  timestamp: string;
  data: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  auditId?: string;
  source: string;
}

interface StreamingConnection {
  id: string;
  url: string;
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastHeartbeat?: string;
}

type EventCallback = (event: StreamingEvent) => void;
type ConnectionCallback = (connection: StreamingConnection) => void;

class StreamingService {
  private connections: Map<string, WebSocket> = new Map();
  private eventCallbacks: Set<EventCallback> = new Set();
  private connectionCallbacks: Set<ConnectionCallback> = new Set();
  private reconnectAttempts: Map<string, number> = new Map();
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval = 30000;
  private heartbeatTimers: Map<string, any> = new Map();

  // Mock streaming endpoints for demo
  private mockEndpoints = {
    transactions: 'wss://demo-audit-stream.rork.com/transactions',
    risks: 'wss://demo-audit-stream.rork.com/risks',
    compliance: 'wss://demo-audit-stream.rork.com/compliance'
  };

  constructor() {
    console.log('🔄 StreamingService initialized');
  }

  // Connect to a streaming endpoint
  async connect(streamId: string, endpoint?: string): Promise<boolean> {
    try {
      const url = endpoint || this.mockEndpoints.transactions;
      
      if (this.connections.has(streamId)) {
        console.log(`⚠️ Connection ${streamId} already exists`);
        return true;
      }

      console.log(`🔌 Connecting to stream: ${streamId}`);
      
      // For web compatibility, check if WebSocket is available
      if (typeof WebSocket === 'undefined') {
        console.log('⚠️ WebSocket not available, using mock streaming');
        this.startMockStreaming(streamId);
        return true;
      }

      const ws = new WebSocket(url);
      this.connections.set(streamId, ws);

      ws.onopen = () => {
        console.log(`✅ Connected to stream: ${streamId}`);
        this.reconnectAttempts.set(streamId, 0);
        this.startHeartbeat(streamId);
        this.notifyConnectionChange({
          id: streamId,
          url,
          status: 'connected',
          lastHeartbeat: new Date().toISOString()
        });
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleStreamEvent(streamId, data);
        } catch (error) {
          console.error(`❌ Error parsing stream data for ${streamId}:`, error);
        }
      };

      ws.onclose = () => {
        console.log(`🔌 Connection closed: ${streamId}`);
        this.cleanup(streamId);
        this.attemptReconnect(streamId, url);
      };

      ws.onerror = (error) => {
        console.error(`❌ WebSocket error for ${streamId}:`, error);
        this.notifyConnectionChange({
          id: streamId,
          url,
          status: 'error'
        });
      };

      return true;
    } catch (error) {
      console.error(`❌ Failed to connect to stream ${streamId}:`, error);
      // Fallback to mock streaming
      this.startMockStreaming(streamId);
      return false;
    }
  }

  // Start mock streaming for demo purposes
  private startMockStreaming(streamId: string) {
    console.log(`🎭 Starting mock streaming for: ${streamId}`);
    
    this.notifyConnectionChange({
      id: streamId,
      url: 'mock://demo-stream',
      status: 'connected',
      lastHeartbeat: new Date().toISOString()
    });

    // Generate mock events every 5-15 seconds
    const generateMockEvent = () => {
      const eventTypes = ['transaction', 'anomaly', 'risk_alert', 'compliance_check'] as const;
      const severities = ['low', 'medium', 'high', 'critical'] as const;
      const sources = ['ERP_SAP', 'QuickBooks', 'Oracle_NetSuite', 'Manual_Entry'];
      
      const mockEvent: StreamingEvent = {
        id: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        timestamp: new Date().toISOString(),
        severity: severities[Math.floor(Math.random() * severities.length)],
        source: sources[Math.floor(Math.random() * sources.length)],
        data: this.generateMockEventData()
      };

      this.handleStreamEvent(streamId, mockEvent);
    };

    // Initial event
    setTimeout(generateMockEvent, 2000);
    
    // Recurring events
    const interval = setInterval(() => {
      if (this.connections.has(streamId) || this.connections.size > 0) {
        generateMockEvent();
      } else {
        clearInterval(interval);
      }
    }, Math.random() * 10000 + 5000) as any; // 5-15 seconds
  }

  private generateMockEventData() {
    const eventData = {
      transaction: {
        transactionId: `TXN_${Math.random().toString(36).substr(2, 9)}`,
        amount: Math.floor(Math.random() * 100000) + 1000,
        account: `ACC_${Math.floor(Math.random() * 9999) + 1000}`,
        description: 'Large transaction detected',
        currency: 'USD'
      },
      anomaly: {
        anomalyType: 'unusual_pattern',
        description: 'Unusual spending pattern detected in expense category',
        confidence: Math.floor(Math.random() * 40) + 60, // 60-100%
        affectedAccounts: [`ACC_${Math.floor(Math.random() * 9999) + 1000}`]
      },
      risk_alert: {
        riskType: 'fraud_indicator',
        description: 'Multiple transactions from same IP address',
        riskScore: Math.floor(Math.random() * 50) + 50, // 50-100
        recommendedAction: 'Review and verify transactions'
      },
      compliance_check: {
        regulation: 'SOX_404',
        status: Math.random() > 0.7 ? 'violation' : 'warning',
        description: 'Internal control deficiency detected',
        remediation: 'Update control procedures'
      }
    };

    const types = Object.keys(eventData) as (keyof typeof eventData)[];
    const randomType = types[Math.floor(Math.random() * types.length)];
    return eventData[randomType];
  }

  // Handle incoming stream events
  private handleStreamEvent(streamId: string, data: any) {
    const event: StreamingEvent = {
      id: data.id || `${streamId}_${Date.now()}`,
      type: data.type || 'transaction',
      timestamp: data.timestamp || new Date().toISOString(),
      severity: data.severity || 'medium',
      source: data.source || streamId,
      data: data.data || data
    };

    console.log(`📡 Stream event received:`, event.type, event.severity);
    
    // Notify all event callbacks
    this.eventCallbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('❌ Error in event callback:', error);
      }
    });
  }

  // Start heartbeat for connection health
  private startHeartbeat(streamId: string) {
    const timer = setInterval(() => {
      const ws = this.connections.get(streamId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() }));
        this.notifyConnectionChange({
          id: streamId,
          url: ws.url,
          status: 'connected',
          lastHeartbeat: new Date().toISOString()
        });
      } else {
        this.cleanup(streamId);
      }
    }, this.heartbeatInterval);

    this.heartbeatTimers.set(streamId, timer);
  }

  // Attempt to reconnect
  private attemptReconnect(streamId: string, url: string) {
    const attempts = this.reconnectAttempts.get(streamId) || 0;
    
    if (attempts < this.maxReconnectAttempts) {
      console.log(`🔄 Attempting to reconnect ${streamId} (${attempts + 1}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.reconnectAttempts.set(streamId, attempts + 1);
        this.connect(streamId, url);
      }, this.reconnectDelay * Math.pow(2, attempts)); // Exponential backoff
    } else {
      console.log(`❌ Max reconnection attempts reached for ${streamId}`);
      this.notifyConnectionChange({
        id: streamId,
        url,
        status: 'error'
      });
    }
  }

  // Clean up connection resources
  private cleanup(streamId: string) {
    const timer = this.heartbeatTimers.get(streamId);
    if (timer) {
      clearInterval(timer);
      this.heartbeatTimers.delete(streamId);
    }
    
    this.connections.delete(streamId);
    this.notifyConnectionChange({
      id: streamId,
      url: '',
      status: 'disconnected'
    });
  }

  // Disconnect from a stream
  disconnect(streamId: string) {
    console.log(`🔌 Disconnecting from stream: ${streamId}`);
    
    const ws = this.connections.get(streamId);
    if (ws) {
      ws.close();
    }
    
    this.cleanup(streamId);
  }

  // Disconnect all streams
  disconnectAll() {
    console.log('🔌 Disconnecting all streams');
    
    this.connections.forEach((ws, streamId) => {
      ws.close();
      this.cleanup(streamId);
    });
  }

  // Subscribe to stream events
  onEvent(callback: EventCallback) {
    this.eventCallbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.eventCallbacks.delete(callback);
    };
  }

  // Subscribe to connection changes
  onConnectionChange(callback: ConnectionCallback) {
    this.connectionCallbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.connectionCallbacks.delete(callback);
    };
  }

  // Notify connection changes
  private notifyConnectionChange(connection: StreamingConnection) {
    this.connectionCallbacks.forEach(callback => {
      try {
        callback(connection);
      } catch (error) {
        console.error('❌ Error in connection callback:', error);
      }
    });
  }

  // Get connection status
  getConnectionStatus(streamId: string): StreamingConnection | null {
    const ws = this.connections.get(streamId);
    if (!ws) return null;

    return {
      id: streamId,
      url: ws.url,
      status: ws.readyState === WebSocket.OPEN ? 'connected' : 'disconnected'
    };
  }

  // Get all active connections
  getActiveConnections(): StreamingConnection[] {
    const connections: StreamingConnection[] = [];
    
    this.connections.forEach((ws, streamId) => {
      connections.push({
        id: streamId,
        url: ws.url,
        status: ws.readyState === WebSocket.OPEN ? 'connected' : 'disconnected'
      });
    });
    
    return connections;
  }

  // Check if service is available
  isAvailable(): boolean {
    return typeof WebSocket !== 'undefined' || Platform.OS !== 'web';
  }
}

// Export singleton instance
export const streamingService = new StreamingService();
export default streamingService;
export type { StreamingEvent, StreamingConnection };