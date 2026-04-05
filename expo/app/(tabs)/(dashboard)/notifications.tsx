import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { BellRing, CircleAlert, ShieldCheck, Sparkles } from "lucide-react-native";
import { COLORS } from "@/constants/colors";
import { useAudit } from "@/providers/AuditProvider";

const STATIC_ITEMS = [
  { id: "1", title: "Streaming source healthy", body: "Kafka bridge and RTMP ingest are currently available.", tone: "good" },
  { id: "2", title: "Q4 discrepancy requires review", body: "A high variance was found in recent automated analysis output.", tone: "alert" },
  { id: "3", title: "Partner summary ready", body: "Management letter draft is prepared for stakeholder review.", tone: "info" },
] as const;

export default function NotificationsScreen() {
  const { recentStreamEvents } = useAudit();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} testID="notifications-screen">
      <View style={styles.heroCard}>
        <BellRing size={22} color={COLORS.primary} />
        <Text style={styles.title}>Notifications</Text>
        <Text style={styles.subtitle}>Alerts from streaming, AI review, and audit workflow appear here.</Text>
      </View>

      {STATIC_ITEMS.map((item) => {
        const iconColor = item.tone === "good" ? COLORS.success : item.tone === "alert" ? COLORS.danger : COLORS.primary;
        const Icon = item.tone === "good" ? ShieldCheck : item.tone === "alert" ? CircleAlert : Sparkles;

        return (
          <View key={item.id} style={styles.card}>
            <View style={[styles.iconWrap, { backgroundColor: `${iconColor}14` }]}>
              <Icon size={18} color={iconColor} />
            </View>
            <View style={styles.cardCopy}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardBody}>{item.body}</Text>
            </View>
          </View>
        );
      })}

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Recent stream alerts</Text>
        {recentStreamEvents.length === 0 ? (
          <Text style={styles.emptyText}>No live alerts yet. Once streaming starts, event alerts will appear here.</Text>
        ) : (
          recentStreamEvents.slice(0, 6).map((event) => (
            <View key={event.id} style={styles.eventRow}>
              <View style={[styles.eventDot, { backgroundColor: event.severity === "critical" ? COLORS.danger : COLORS.warning }]} />
              <View style={styles.cardCopy}>
                <Text style={styles.cardTitle}>{event.type.replace(/_/g, " ")}</Text>
                <Text style={styles.cardBody}>{event.data?.description ?? event.source}</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, gap: 14 },
  heroCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  title: { fontSize: 26, fontWeight: "700", color: COLORS.text },
  subtitle: { fontSize: 14, lineHeight: 20, color: COLORS.gray },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    flexDirection: "row",
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  cardCopy: { flex: 1, gap: 4 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: COLORS.text, textTransform: "capitalize" },
  cardBody: { fontSize: 13, lineHeight: 19, color: COLORS.gray },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  emptyText: { fontSize: 13, lineHeight: 19, color: COLORS.gray },
  eventRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  eventDot: { width: 10, height: 10, borderRadius: 5, marginTop: 6 },
});
