import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {
  Play,
  Square,
  Settings,
  RotateCcw,
  Monitor,
  Camera,
  Mic,
  MicOff,
  Share2,
} from 'lucide-react-native';
import { COLORS } from '@/constants/colors';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Audio } from 'expo-av';



interface RTMPStreamingPanelProps {
  onClose?: () => void;
  auditId?: string;
}

interface StreamConfig {
  rtmpUrl: string;
  streamKey: string;
  quality: 'low' | 'medium' | 'high' | 'ultra';
  bitrate: number;
  fps: number;
  resolution: string;
  aiEnhanced: boolean;
  autoTranscription: boolean;
  realTimeAnalysis: boolean;
}

interface ViewerConfig {
  streamUrl: string;
  autoplay: boolean;
  muted: boolean;
  quality: 'auto' | 'low' | 'medium' | 'high';
}

const defaultStreamConfig: StreamConfig = {
  rtmpUrl: 'rtmp://live.audit-it.com/live',
  streamKey: '',
  quality: 'medium',
  bitrate: 2500,
  fps: 30,
  resolution: '1280x720',
  aiEnhanced: true,
  autoTranscription: true,
  realTimeAnalysis: false,
};

const defaultViewerConfig: ViewerConfig = {
  streamUrl: '',
  autoplay: true,
  muted: false,
  quality: 'auto',
};

export default function RTMPStreamingPanel({ onClose, auditId }: RTMPStreamingPanelProps) {
  const [mode, setMode] = useState<'viewer' | 'publisher'>('viewer');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [streamConfig, setStreamConfig] = useState<StreamConfig>(defaultStreamConfig);
  const [viewerConfig, setViewerConfig] = useState<ViewerConfig>(defaultViewerConfig);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [streamStats, setStreamStats] = useState({
    bitrate: 0,
    fps: 0,
    viewers: 0,
    duration: 0,
    dropped: 0,
  });

  const [showSettings, setShowSettings] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<CameraType>('back');
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [permission, requestPermission] = useCameraPermissions();
  
  const streamStartTime = useRef<Date | null>(null);
  const statsInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const requestPermissions = useCallback(async () => {
    try {
      if (!permission?.granted) {
        await requestPermission();
      }
      
      if (Platform.OS !== 'web') {
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
      }
    } catch (error) {
      console.error('Permission request failed:', error);
    }
  }, [permission, requestPermission]);

  // Request permissions on mount
  useEffect(() => {
    requestPermissions();
  }, [requestPermissions]);

  // Update stream duration
  useEffect(() => {
    if (isStreaming && streamStartTime.current) {
      const interval = setInterval(() => {
        const duration = Math.floor((Date.now() - streamStartTime.current!.getTime()) / 1000);
        setStreamStats(prev => ({ ...prev, duration }));
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isStreaming]);



  const startStreaming = useCallback(async () => {
    if (!streamConfig.rtmpUrl || !streamConfig.streamKey) {
      Alert.alert('Error', 'Please enter RTMP URL and Stream Key');
      return;
    }

    try {
      setConnectionStatus('connecting');
      console.log('🔴 Starting RTMP stream...', streamConfig);
      
      // Simulate connection process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      streamStartTime.current = new Date();
      setIsStreaming(true);
      setConnectionStatus('connected');
      
      // Start mock stats updates
      statsInterval.current = setInterval(() => {
        setStreamStats(prev => ({
          ...prev,
          bitrate: streamConfig.bitrate + Math.floor(Math.random() * 200 - 100),
          fps: streamConfig.fps + Math.floor(Math.random() * 4 - 2),
          viewers: Math.floor(Math.random() * 50) + 1,
          dropped: prev.dropped + Math.floor(Math.random() * 3),
        }));
      }, 3000);
      
      console.log('✅ RTMP stream started successfully');
    } catch (error) {
      console.error('❌ Failed to start stream:', error);
      setConnectionStatus('error');
      Alert.alert('Stream Error', 'Failed to start RTMP stream. Please check your configuration.');
    }
  }, [streamConfig]);

  const stopStreaming = useCallback(() => {
    console.log('⏹️ Stopping RTMP stream...');
    
    setIsStreaming(false);
    setConnectionStatus('disconnected');
    streamStartTime.current = null;
    
    if (statsInterval.current) {
      clearInterval(statsInterval.current);
      statsInterval.current = null;
    }
    
    setStreamStats({
      bitrate: 0,
      fps: 0,
      viewers: 0,
      duration: 0,
      dropped: 0,
    });
    
    console.log('✅ RTMP stream stopped');
  }, []);

  const startViewing = useCallback(async () => {
    if (!viewerConfig.streamUrl) {
      Alert.alert('Error', 'Please enter a stream URL');
      return;
    }

    try {
      setConnectionStatus('connecting');
      console.log('📺 Starting stream viewer...', viewerConfig.streamUrl);
      
      // Simulate connection
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsViewing(true);
      setConnectionStatus('connected');
      
      console.log('✅ Stream viewer started');
    } catch (error) {
      console.error('❌ Failed to start viewer:', error);
      setConnectionStatus('error');
      Alert.alert('Viewer Error', 'Failed to connect to stream. Please check the URL.');
    }
  }, [viewerConfig]);

  const stopViewing = useCallback(() => {
    console.log('⏹️ Stopping stream viewer...');
    setIsViewing(false);
    setConnectionStatus('disconnected');
    console.log('✅ Stream viewer stopped');
  }, []);

  const toggleCamera = useCallback(() => {
    setCameraFacing((current: CameraType) => current === 'back' ? 'front' : 'back');
  }, []);

  const toggleMic = useCallback(() => {
    setIsMicEnabled(prev => !prev);
  }, []);

  const toggleCameraEnabled = useCallback(() => {
    setIsCameraEnabled(prev => !prev);
  }, []);

  const copyStreamUrl = useCallback(() => {
    const fullUrl = `${streamConfig.rtmpUrl}/${streamConfig.streamKey}`;
    // In a real app, you'd use Clipboard API
    Alert.alert('Stream URL', fullUrl);
  }, [streamConfig]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return COLORS.success;
      case 'connecting': return COLORS.warning;
      case 'error': return COLORS.danger;
      default: return COLORS.gray;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return mode === 'publisher' ? 'Streaming Live' : 'Connected';
      case 'connecting': return 'Connecting...';
      case 'error': return 'Connection Error';
      default: return 'Disconnected';
    }
  };

  const StreamPreview = () => {
    if (mode === 'publisher' && isCameraEnabled && permission?.granted) {
      return (
        <View style={styles.previewContainer}>
          <CameraView
            style={styles.cameraPreview}
            facing={cameraFacing}
          >
            <View style={styles.cameraOverlay}>
              <View style={styles.cameraControls}>
                <TouchableOpacity onPress={toggleCamera} style={styles.cameraButton}>
                  <RotateCcw size={20} color={COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity onPress={toggleCameraEnabled} style={styles.cameraButton}>
                  <Camera size={20} color={COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity onPress={toggleMic} style={styles.cameraButton}>
                  {isMicEnabled ? (
                    <Mic size={20} color={COLORS.white} />
                  ) : (
                    <MicOff size={20} color={COLORS.danger} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </CameraView>
        </View>
      );
    }

    if (mode === 'viewer' && isViewing) {
      return (
        <View style={styles.previewContainer}>
          <View style={styles.videoPlaceholder}>
            <Monitor size={48} color={COLORS.gray} />
            <Text style={styles.placeholderText}>Stream Preview</Text>
            <Text style={styles.placeholderSubtext}>{viewerConfig.streamUrl}</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.previewContainer}>
        <View style={styles.videoPlaceholder}>
          {mode === 'publisher' ? (
            <>
              <Camera size={48} color={COLORS.gray} />
              <Text style={styles.placeholderText}>Camera Preview</Text>
              <Text style={styles.placeholderSubtext}>Start streaming to see preview</Text>
            </>
          ) : (
            <>
              <Monitor size={48} color={COLORS.gray} />
              <Text style={styles.placeholderText}>Stream Viewer</Text>
              <Text style={styles.placeholderSubtext}>Enter stream URL to watch</Text>
            </>
          )}
        </View>
      </View>
    );
  };

  const StreamStats = () => {
    if (!isStreaming && !isViewing) return null;

    return (
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Stream Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Duration</Text>
            <Text style={styles.statValue}>{formatDuration(streamStats.duration)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Bitrate</Text>
            <Text style={styles.statValue}>{streamStats.bitrate} kbps</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>FPS</Text>
            <Text style={styles.statValue}>{streamStats.fps}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Viewers</Text>
            <Text style={styles.statValue}>{streamStats.viewers}</Text>
          </View>
        </View>
      </View>
    );
  };

  const ConfigPanel = () => {
    if (mode === 'publisher') {
      return (
        <View style={styles.configPanel}>
          <Text style={styles.configTitle}>Publisher Settings</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>RTMP URL</Text>
            <TextInput
              style={styles.textInput}
              value={streamConfig.rtmpUrl}
              onChangeText={(text) => setStreamConfig(prev => ({ ...prev, rtmpUrl: text }))}
              placeholder="rtmp://live.audit-it.com/live"
              placeholderTextColor={COLORS.gray}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Stream Key</Text>
            <TextInput
              style={styles.textInput}
              value={streamConfig.streamKey}
              onChangeText={(text) => setStreamConfig(prev => ({ ...prev, streamKey: text }))}
              placeholder="Enter your stream key"
              placeholderTextColor={COLORS.gray}
              secureTextEntry
            />
          </View>
          
          <View style={styles.qualitySelector}>
            <Text style={styles.inputLabel}>Quality</Text>
            <View style={styles.qualityButtons}>
              {(['low', 'medium', 'high', 'ultra'] as const).map((quality) => (
                <TouchableOpacity
                  key={quality}
                  style={[
                    styles.qualityButton,
                    streamConfig.quality === quality && styles.qualityButtonActive
                  ]}
                  onPress={() => setStreamConfig(prev => ({ ...prev, quality }))}
                >
                  <Text style={[
                    styles.qualityButtonText,
                    streamConfig.quality === quality && styles.qualityButtonTextActive
                  ]}>
                    {quality.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.aiSection}>
            <Text style={styles.aiSectionTitle}>🤖 AI Features</Text>
            
            <View style={styles.switchGroup}>
              <TouchableOpacity
                style={styles.switchItem}
                onPress={() => setStreamConfig(prev => ({ ...prev, aiEnhanced: !prev.aiEnhanced }))}
              >
                <Text style={styles.switchLabel}>AI Enhancement</Text>
                <View style={[styles.switch, streamConfig.aiEnhanced && styles.switchActive]}>
                  <View style={[styles.switchThumb, streamConfig.aiEnhanced && styles.switchThumbActive]} />
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.switchItem}
                onPress={() => setStreamConfig(prev => ({ ...prev, autoTranscription: !prev.autoTranscription }))}
              >
                <Text style={styles.switchLabel}>Auto Transcription</Text>
                <View style={[styles.switch, streamConfig.autoTranscription && styles.switchActive]}>
                  <View style={[styles.switchThumb, streamConfig.autoTranscription && styles.switchThumbActive]} />
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.switchItem}
                onPress={() => setStreamConfig(prev => ({ ...prev, realTimeAnalysis: !prev.realTimeAnalysis }))}
              >
                <Text style={styles.switchLabel}>Real-time Analysis</Text>
                <View style={[styles.switch, streamConfig.realTimeAnalysis && styles.switchActive]}>
                  <View style={[styles.switchThumb, streamConfig.realTimeAnalysis && styles.switchThumbActive]} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.configPanel}>
        <Text style={styles.configTitle}>Viewer Settings</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Stream URL</Text>
          <TextInput
            style={styles.textInput}
            value={viewerConfig.streamUrl}
            onChangeText={(text) => setViewerConfig(prev => ({ ...prev, streamUrl: text }))}
            placeholder="rtmp://stream.example.com/live/streamkey"
            placeholderTextColor={COLORS.gray}
          />
        </View>
        
        <View style={styles.switchGroup}>
          <TouchableOpacity
            style={styles.switchItem}
            onPress={() => setViewerConfig(prev => ({ ...prev, autoplay: !prev.autoplay }))}
          >
            <Text style={styles.switchLabel}>Autoplay</Text>
            <View style={[styles.switch, viewerConfig.autoplay && styles.switchActive]}>
              <View style={[styles.switchThumb, viewerConfig.autoplay && styles.switchThumbActive]} />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.switchItem}
            onPress={() => setViewerConfig(prev => ({ ...prev, muted: !prev.muted }))}
          >
            <Text style={styles.switchLabel}>Muted</Text>
            <View style={[styles.switch, viewerConfig.muted && styles.switchActive]}>
              <View style={[styles.switchThumb, viewerConfig.muted && styles.switchThumbActive]} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>RTMP Streaming</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
            {connectionStatus === 'connecting' && (
              <ActivityIndicator size="small" color={getStatusColor()} style={{ marginLeft: 8 }} />
            )}
          </View>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => setShowSettings(!showSettings)}
            style={styles.headerButton}
          >
            <Settings size={20} color={COLORS.gray} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'viewer' && styles.modeButtonActive]}
          onPress={() => setMode('viewer')}
        >
          <Monitor size={20} color={mode === 'viewer' ? COLORS.white : COLORS.gray} />
          <Text style={[styles.modeButtonText, mode === 'viewer' && styles.modeButtonTextActive]}>
            Viewer
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.modeButton, mode === 'publisher' && styles.modeButtonActive]}
          onPress={() => setMode('publisher')}
        >
          <Camera size={20} color={mode === 'publisher' ? COLORS.white : COLORS.gray} />
          <Text style={[styles.modeButtonText, mode === 'publisher' && styles.modeButtonTextActive]}>
            Publisher
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <StreamPreview />
        
        <StreamStats />
        
        {showSettings && <ConfigPanel />}
        
        <View style={styles.controls}>
          {mode === 'publisher' ? (
            <View style={styles.controlsRow}>
              <TouchableOpacity
                style={[styles.controlButton, styles.primaryButton]}
                onPress={isStreaming ? stopStreaming : startStreaming}
                disabled={connectionStatus === 'connecting'}
              >
                {isStreaming ? (
                  <Square size={20} color={COLORS.white} />
                ) : (
                  <Play size={20} color={COLORS.white} />
                )}
                <Text style={styles.controlButtonText}>
                  {isStreaming ? 'Stop Stream' : 'Start Stream'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.controlButton, styles.secondaryButton]}
                onPress={copyStreamUrl}
              >
                <Share2 size={20} color={COLORS.primary} />
                <Text style={[styles.controlButtonText, { color: COLORS.primary }]}>
                  Share
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.controlButton, styles.primaryButton, { flex: 1 }]}
              onPress={isViewing ? stopViewing : startViewing}
              disabled={connectionStatus === 'connecting'}
            >
              {isViewing ? (
                <Square size={20} color={COLORS.white} />
              ) : (
                <Play size={20} color={COLORS.white} />
              )}
              <Text style={styles.controlButtonText}>
                {isViewing ? 'Stop Viewing' : 'Start Viewing'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeSelector: {
    flexDirection: 'row',
    margin: 20,
    marginBottom: 16,
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  modeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray,
  },
  modeButtonTextActive: {
    color: COLORS.white,
  },
  content: {
    flex: 1,
  },
  previewContainer: {
    margin: 20,
    marginTop: 0,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.black,
    aspectRatio: 16 / 9,
  },
  cameraPreview: {
    flex: 1,
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    padding: 16,
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  cameraButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
    marginTop: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: COLORS.lightGray,
    textAlign: 'center',
  },
  statsContainer: {
    margin: 20,
    marginTop: 0,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  configPanel: {
    margin: 20,
    marginTop: 0,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  configTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },
  qualitySelector: {
    marginBottom: 16,
  },
  qualityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  qualityButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  qualityButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  qualityButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray,
  },
  qualityButtonTextActive: {
    color: COLORS.white,
  },
  switchGroup: {
    gap: 16,
  },
  switchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  switch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  switchActive: {
    backgroundColor: COLORS.primary,
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    alignSelf: 'flex-start',
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
  controls: {
    padding: 20,
    paddingTop: 0,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    flex: 1,
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  controlButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  aiSection: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  aiSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 12,
  },
});