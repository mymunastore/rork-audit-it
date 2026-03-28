import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import RTMPStreamingPanel from '@/components/RTMPStreamingPanel';

export default function StreamingScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <RTMPStreamingPanel />
    </SafeAreaView>
  );
}