import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { ArrowRight, FolderKanban } from "lucide-react-native";
import { COLORS } from "@/constants/colors";
import { useAudit } from "@/providers/AuditProvider";

export default function ProjectsScreen() {
  const { currentAudits } = useAudit();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} testID="projects-screen">
      <View style={styles.heroCard}>
        <FolderKanban size={22} color={COLORS.primary} />
        <Text style={styles.title}>All projects</Text>
        <Text style={styles.subtitle}>A clean project listing for every audit launched from the landing dashboard.</Text>
      </View>

      {currentAudits.map((audit) => (
        <TouchableOpacity
          key={audit.id}
          style={styles.projectCard}
          onPress={() => router.push({ pathname: "/(tabs)/(dashboard)/audit-details" as never, params: { id: audit.id } })}
          testID={`project-card-${audit.id}`}
        >
          <View style={styles.projectCopy}>
            <Text style={styles.projectTitle}>{audit.company}</Text>
            <Text style={styles.projectSubtitle}>{audit.period} • {audit.status}</Text>
            <Text style={styles.projectMeta}>Due {audit.dueDate} • {audit.riskLevel} risk</Text>
          </View>
          <ArrowRight size={18} color={COLORS.primary} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, gap: 14 },
  heroCard: { backgroundColor: COLORS.white, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: COLORS.border, gap: 8 },
  title: { fontSize: 26, fontWeight: "700", color: COLORS.text },
  subtitle: { fontSize: 14, lineHeight: 20, color: COLORS.gray },
  projectCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  projectCopy: { flex: 1, gap: 4 },
  projectTitle: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  projectSubtitle: { fontSize: 13, color: COLORS.gray },
  projectMeta: { fontSize: 12, color: COLORS.gray },
});
