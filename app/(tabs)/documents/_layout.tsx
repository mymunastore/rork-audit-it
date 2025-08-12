import { Stack } from "expo-router";
import React from "react";
import { COLORS } from "@/constants/colors";

export default function DocumentsLayout() {
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
          title: "Documents",
        }} 
      />
    </Stack>
  );
}