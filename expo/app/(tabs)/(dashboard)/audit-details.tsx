import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { BadgeAlert, CalendarClock, ShieldCheck, Users } from "lucide-react-native";
import { COLORS } from "@/constants/colors";
import { useAudit } from "@/providers/AuditProvider";

export default function AuditDetailsScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const { currentAudits, auditTrails } = useAudit();

  const audit = useMemo(() => currentAudits.find((item) => item.id === params.id) ?? currentAudits[0], [currentAudits, params.id]);
  const relatedTrails = useMemo(() => auditTrails.filter((trail) => trail.auditId === audit?.id).slice(0, 5), [audit?.id, auditTrails]);

  if (!audit) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>Audit not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} testID="audit-details-screen">
      <View style={styles.heroCard}>
        <Text style={styles.title}>{audit.company}</Text>
        <Text style={styles.subtitle}>{audit.period} • {audit.status}</Text>
        <View style={styles.metricsRow}>
          <View style={styles.metricPill}><CalendarClock size={16} color={COLORS.primary} /><Text style={styles.metricText}>{audit.dueDate}</Text></View>
          <View style={styles.metricPill}><BadgeAlert size={16} color={COLORS.warning} /><Text style={styles.metricText}>{audit.riskLevel} risk</Text></View>
          <View style={styles.metricPill}><ShieldCheck size={16} color={COLORS.success} /><Text style={styles.metricText}>{audit.progress}% complete</Text></View>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Assigned team</Text>
        {audit.assignedTo.map((person) => (
          <View key={person} style={styles.row}>
            <Users size={16} color={COLORS.primary} />
            <Text style={styles.rowText}>{person}</Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Latest audit trail</Text>
        {relatedTrails.length === 0 ? (
          <Text style={styles.emptyTrail}>No audit trail activity yet for this engagement.</Text>
        ) : (
          relatedTrails.map((trail) => (
            <View key={trail.id} style={styles.trailRow}>
              <Text style={styles.trailTitle}>{trail.action}</Text>
              <Text style={styles.trailBody}>{trail.details}</Text>
              <Text style={styles.trailTime}>{new Date(trail.timestamp).toLocaleString()}</Text>
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
  heroCard: { backgroundColor: COLORS.white, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: COLORS.border, gap: 12 },
  title: { fontSize: 28, fontWeight: "700", color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.gray },
  metricsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metricPill: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 999, backgroundColor: COLORS.background, paddingHorizontal: 12, paddingVertical: 10 },
  metricText: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  sectionCard: { backgroundColor: COLORS.white, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: COLORS.border, gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  rowText: { fontSize: 14, color: COLORS.text },
  trailRow: { gap: 4, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  trailTitle: { fontSize: 14, fontWeight: "700", color: COLORS.text },
  trailBody: { fontSize: 13, lineHeight: 19, color: COLORS.gray },
  trailTime: { fontSize: 12, color: COLORS.gray },
  emptyWrap: { flex: 1, backgroundColor: COLORS.background, alignItems: "center", justifyContent: "center" },
  emptyText: { fontSize: 15, color: COLORS.gray },
  emptyTrail: { fontSize: 13, color: COLORS.gray },
});
