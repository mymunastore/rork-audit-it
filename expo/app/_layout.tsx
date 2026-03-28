import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuditProvider, useAudit } from "@/providers/AuditProvider";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isAuthenticated, isInitialized } = useAudit();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === "(tabs)";

    if (!isAuthenticated && inAuthGroup) {
      router.replace("/login");
    } else if (isAuthenticated && !inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, isInitialized, segments, router]);

  useEffect(() => {
    if (isInitialized) {
      SplashScreen.hideAsync();
    }
  }, [isInitialized]);

  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="document-viewer" options={{ 
        title: "Document Viewer",
        presentation: "modal" 
      }} />
      <Stack.Screen name="ai-analysis" options={{ 
        title: "AI Analysis",
        presentation: "modal" 
      }} />
    </Stack>
  );
}

function AuthWrapper() {
  return <RootLayoutNav />;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuditProvider>
          <AuthWrapper />
        </AuditProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}