import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wifi,
  WifiOff,
  Play,
  Pause,
  RefreshCw,
  Zap,
  Shield,
  TrendingUp,
  X,
} from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import streamingService, { StreamingEvent, StreamingConnection } from '@/services/streamingService';

interface LiveStreamingPanelProps {
  onClose?: () => void;
  auditId?: string;
}

export default function LiveStreamingPanel({ onClose, auditId }: LiveStreamingPanelProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [events, setEvents] = useState<StreamingEvent[]>([]);
  const [connections, setConnections] = useState<StreamingConnection[]>([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    criticalAlerts: 0,
    anomaliesDetected: 0,
    complianceIssues: 0,
  });

  const pulseAnim = new Animated.Value(1);

  // Pulse animation for live indicator
  useEffect(() => {
    if (isStreaming) {
      const pulse = () => {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start(() => pulse());
      };
      pulse();
    }
  }, [isStreaming]);

  // Handle streaming events
  const handleStreamEvent = useCallback((event: StreamingEvent) => {
    console.log('Stream event received:', event);
    
    setEvents(prev => [event, ...prev.slice(0, 49)]); // Keep last 50 events
    
    // Update stats
    setStats(prev => ({
      totalEvents: prev.totalEvents + 1,
      criticalAlerts: prev.criticalAlerts + (event.severity === 'critical' ? 1 : 0),
      anomaliesDetected: prev.anomaliesDetected + (event.type === 'anomaly' ? 1 : 0),
      complianceIssues: prev.complianceIssues + (event.type === 'compliance_check' ? 1 : 0),
    }));
  }, []);

  // Handle connection changes
  const handleConnectionChange = useCallback((connection: StreamingConnection) => {
    console.log('Connection status changed:', connection);
    
    setConnections(prev => {
      const existing = prev.find(c => c.id === connection.id);
      if (existing) {
        return prev.map(c => c.id === connection.id ? connection : c);
      } else {
        return [...prev, connection];
      }
    });
  }, []);

  // Start streaming
  const startStreaming = useCallback(async () => {
    console.log('Starting live streaming...');
    
    try {
      // Subscribe to events
      const unsubscribeEvents = streamingService.onEvent(handleStreamEvent);
      const unsubscribeConnections = streamingService.onConnectionChange(handleConnectionChange);
      
      // Connect to multiple streams
      await Promise.all([
        streamingService.connect('transactions'),
        streamingService.connect('risks'),
        streamingService.connect('compliance')
      ]);
      
      setIsStreaming(true);
      
      // Store unsubscribe functions for cleanup
      return () => {
        unsubscribeEvents();
        unsubscribeConnections();
      };
    } catch (error) {
      console.error('Failed to start streaming:', error);
    }
  }, [handleStreamEvent, handleConnectionChange]);

  // Stop streaming
  const stopStreaming = useCallback(() => {
    console.log('Stopping live streaming...');
    
    streamingService.disconnectAll();
    setIsStreaming(false);
    setConnections([]);
  }, []);

  // Toggle streaming
  const toggleStreaming = useCallback(async () => {
    if (isStreaming) {
      stopStreaming();
    } else {
      await startStreaming();
    }
  }, [isStreaming, startStreaming, stopStreaming]);

  // Clear events
  const clearEvents = useCallback(() => {
    setEvents([]);
    setStats({
      totalEvents: 0,
      criticalAlerts: 0,
      anomaliesDetected: 0,
      complianceIssues: 0,
    });
  }, []);

  // Get event icon and color
  const getEventDisplay = (event: StreamingEvent) => {
    const displays = {
      transaction: { icon: TrendingUp, color: COLORS.info, bg: COLORS.info + '20' },
      anomaly: { icon: AlertTriangle, color: COLORS.warning, bg: COLORS.warning + '20' },
      risk_alert: { icon: Shield, color: COLORS.danger, bg: COLORS.danger + '20' },
      compliance_check: { icon: CheckCircle, color: COLORS.success, bg: COLORS.success + '20' },
    };
    return displays[event.type] || displays.transaction;
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    const colors = {
      low: COLORS.success,
      medium: COLORS.warning,
      high: COLORS.danger,
      critical: '#DC2626',
    };
    return colors[severity as keyof typeof colors] || COLORS.gray;
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const StatCard = ({ icon: Icon, title, value, color }: {
    icon: any;
    title: string;
    value: number;
    color: string;
  }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Icon size={20} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  const EventItem = ({ event }: { event: StreamingEvent }) => {
    const display = getEventDisplay(event);
    const severityColor = getSeverityColor(event.severity);
    
    return (
      <View style={styles.eventItem}>
        <View style={styles.eventHeader}>
          <View style={[styles.eventIcon, { backgroundColor: display.bg }]}>
            <display.icon size={16} color={display.color} />
          </View>
          <View style={styles.eventMeta}>
            <Text style={styles.eventTime}>{formatTime(event.timestamp)}</Text>
            <View style={[styles.severityBadge, { backgroundColor: severityColor + '20' }]}>
              <Text style={[styles.severityText, { color: severityColor }]}>
                {event.severity.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
        <Text style={styles.eventType}>{event.type.replace('_', ' ').toUpperCase()}</Text>
        <Text style={styles.eventDescription}>
          {event.data?.description || `${event.type} event from ${event.source}`}
        </Text>
        <Text style={styles.eventSource}>Source: {event.source}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.titleContainer}>
            <Animated.View style={[styles.liveIndicator, { transform: [{ scale: pulseAnim }] }]}>
              <View style={[styles.liveDot, { backgroundColor: isStreaming ? '#EF4444' : COLORS.gray }]} />
            </Animated.View>
            <Text style={styles.title}>Live Streaming</Text>
          </View>
          <Text style={styles.subtitle}>
            {isStreaming ? 'Monitoring real-time data' : 'Streaming paused'}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={toggleStreaming} style={styles.controlButton}>
            {isStreaming ? (
              <Pause size={20} color={COLORS.white} />
            ) : (
              <Play size={20} color={COLORS.white} />
            )}
          </TouchableOpacity>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color={COLORS.gray} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.statsContainer}>
        <StatCard
          icon={Activity}
          title="Total Events"
          value={stats.totalEvents}
          color={COLORS.primary}
        />
        <StatCard
          icon={AlertTriangle}
          title="Critical Alerts"
          value={stats.criticalAlerts}
          color={COLORS.danger}
        />
        <StatCard
          icon={Zap}
          title="Anomalies"
          value={stats.anomaliesDetected}
          color={COLORS.warning}
        />
        <StatCard
          icon={Shield}
          title="Compliance"
          value={stats.complianceIssues}
          color={COLORS.success}
        />
      </View>

      <View style={styles.connectionStatus}>
        <Text style={styles.sectionTitle}>Connection Status</Text>
        <View style={styles.connections}>
          {connections.length > 0 ? (
            connections.map((conn) => (
              <View key={conn.id} style={styles.connectionItem}>
                {conn.status === 'connected' ? (
                  <Wifi size={16} color={COLORS.success} />
                ) : (
                  <WifiOff size={16} color={COLORS.danger} />
                )}
                <Text style={styles.connectionText}>{conn.id}</Text>
                <View style={[
                  styles.statusDot,
                  { backgroundColor: conn.status === 'connected' ? COLORS.success : COLORS.danger }
                ]} />
              </View>
            ))
          ) : (
            <Text style={styles.noConnections}>No active connections</Text>
          )}
        </View>
      </View>

      <View style={styles.eventsSection}>
        <View style={styles.eventsSectionHeader}>
          <Text style={styles.sectionTitle}>Live Events</Text>
          <TouchableOpacity onPress={clearEvents} style={styles.clearButton}>
            <RefreshCw size={16} color={COLORS.gray} />
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.eventsList} showsVerticalScrollIndicator={false}>
          {events.length > 0 ? (
            events.map((event) => (
              <EventItem key={event.id} event={event} />
            ))
          ) : (
            <View style={styles.noEvents}>
              <Activity size={48} color={COLORS.lightGray} />
              <Text style={styles.noEventsText}>
                {isStreaming ? 'Waiting for events...' : 'Start streaming to see live events'}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  liveIndicator: {
    marginRight: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray,
  },
  controlButton: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    backgroundColor: COLORS.lightGray,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  statTitle: {
    fontSize: 10,
    color: COLORS.gray,
    marginTop: 2,
  },
  connectionStatus: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  connections: {
    gap: 8,
  },
  connectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  connectionText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.text,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  noConnections: {
    textAlign: 'center',
    color: COLORS.gray,
    fontStyle: 'italic',
    padding: 20,
  },
  eventsSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  eventsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
  },
  clearText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  eventsList: {
    flex: 1,
  },
  eventItem: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventTime: {
    fontSize: 12,
    color: COLORS.gray,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  severityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  eventType: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 20,
  },
  eventSource: {
    fontSize: 12,
    color: COLORS.gray,
    fontStyle: 'italic',
  },
  noEvents: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  noEventsText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 16,
  },
});