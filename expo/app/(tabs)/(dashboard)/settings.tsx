import React from "react";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { LockKeyhole, MoonStar, Shield, Users } from "lucide-react-native";
import { COLORS } from "@/constants/colors";

const SETTINGS = [
  { id: "security", title: "Biometric sign-in", icon: LockKeyhole, enabled: true },
  { id: "residency", title: "Geo residency controls", icon: Shield, enabled: true },
  { id: "workspace", title: "Shared team workspace", icon: Users, enabled: true },
  { id: "darkmode", title: "Dark mode preview", icon: MoonStar, enabled: false },
] as const;

export default function SettingsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} testID="settings-screen">
      <View style={styles.heroCard}>
        <Text style={styles.title}>Workspace settings</Text>
        <Text style={styles.subtitle}>A clean control surface for security, team, and compliance preferences.</Text>
      </View>

      {SETTINGS.map((item) => {
        const Icon = item.icon;
        return (
          <View key={item.id} style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={styles.iconWrap}>
                <Icon size={18} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.settingTitle}>{item.title}</Text>
                <Text style={styles.settingSubtitle}>Configured for the Audit It workspace experience.</Text>
              </View>
            </View>
            <Switch value={item.enabled} trackColor={{ false: COLORS.border, true: COLORS.primary }} thumbColor={COLORS.white} />
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, gap: 14 },
  heroCard: { backgroundColor: COLORS.white, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: COLORS.border, gap: 8 },
  title: { fontSize: 26, fontWeight: "700", color: COLORS.text },
  subtitle: { fontSize: 14, lineHeight: 20, color: COLORS.gray },
  settingRow: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  settingLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  iconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: `${COLORS.primary}12`, alignItems: "center", justifyContent: "center" },
  settingTitle: { fontSize: 15, fontWeight: "700", color: COLORS.text },
  settingSubtitle: { fontSize: 13, color: COLORS.gray, marginTop: 2 },
});
