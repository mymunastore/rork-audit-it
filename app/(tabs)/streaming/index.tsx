import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import LiveStreamingPanel from '@/components/LiveStreamingPanel';

export default function StreamingScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LiveStreamingPanel />
    </SafeAreaView>
  );
}