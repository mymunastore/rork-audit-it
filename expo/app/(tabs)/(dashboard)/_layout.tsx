import { Stack } from "expo-router";
import React from "react";
import { COLORS } from "@/constants/colors";

export default function DashboardLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: "600",
        },
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "Audit Dashboard",
        }} 
      />
      <Stack.Screen 
        name="create-audit" 
        options={{ 
          title: "Create Audit",
        }} 
      />
      <Stack.Screen 
        name="notifications" 
        options={{ 
          title: "Notifications",
        }} 
      />
      <Stack.Screen 
        name="settings" 
        options={{ 
          title: "Workspace Settings",
        }} 
      />
      <Stack.Screen 
        name="audit-details" 
        options={{ 
          title: "Audit Overview",
        }} 
      />
      <Stack.Screen 
        name="projects" 
        options={{ 
          title: "Projects",
        }} 
      />
    </Stack>
  );
}