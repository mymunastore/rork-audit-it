import React, { useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { Building2, ChevronRight, ShieldAlert, Sparkles } from "lucide-react-native";
import { COLORS } from "@/constants/colors";
import { useAudit } from "@/providers/AuditProvider";

const RISK_LEVELS = ["Low", "Medium", "High"] as const;
const STEPS = ["Client", "Scope", "Launch"] as const;

export default function CreateAuditScreen() {
  const { createAudit, user } = useAudit();
  const [company, setCompany] = useState<string>("");
  const [period, setPeriod] = useState<string>("Q1 2026");
  const [riskLevel, setRiskLevel] = useState<(typeof RISK_LEVELS)[number]>("Medium");

  const canContinue = useMemo(() => company.trim().length > 1 && period.trim().length > 1, [company, period]);

  const handleCreateAudit = () => {
    if (!canContinue) {
      Alert.alert("Missing information", "Please complete the company and period fields.");
      return;
    }

    console.log("Creating audit from wizard", { company, period, riskLevel });
    const audit = createAudit({
      company: company.trim(),
      period: period.trim(),
      riskLevel,
      createdBy: user?.email,
    });

    router.replace({ pathname: "/(tabs)/(dashboard)/audit-details" as never, params: { id: audit.id } });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} testID="create-audit-screen">
      <View style={styles.heroCard}>
        <View style={styles.heroBadge}>
          <Sparkles size={16} color={COLORS.primary} />
          <Text style={styles.heroBadgeText}>Guided setup</Text>
        </View>
        <Text style={styles.title}>Start a new audit workspace</Text>
        <Text style={styles.subtitle}>Move from intake to execution with a clean three-step launch flow.</Text>

        <View style={styles.stepsRow}>
          {STEPS.map((step, index) => (
            <View key={step} style={styles.stepPill}>
              <Text style={styles.stepIndex}>{index + 1}</Text>
              <Text style={styles.stepLabel}>{step}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.label}>Client / Company</Text>
        <View style={styles.inputRow}>
          <Building2 size={18} color={COLORS.gray} />
          <TextInput
            value={company}
            onChangeText={setCompany}
            placeholder="Acme Holdings Ltd"
            placeholderTextColor={COLORS.gray}
            style={styles.input}
            testID="company-input"
          />
        </View>

        <Text style={styles.label}>Audit period</Text>
        <TextInput
          value={period}
          onChangeText={setPeriod}
          placeholder="Q1 2026"
          placeholderTextColor={COLORS.gray}
          style={styles.standaloneInput}
          testID="period-input"
        />

        <Text style={styles.label}>Initial risk posture</Text>
        <View style={styles.chipRow}>
          {RISK_LEVELS.map((level) => {
            const active = level === riskLevel;
            return (
              <TouchableOpacity
                key={level}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setRiskLevel(level)}
                testID={`risk-chip-${level.toLowerCase()}`}
              >
                <ShieldAlert size={16} color={active ? COLORS.white : COLORS.text} />
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{level}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Launch summary</Text>
          <Text style={styles.summaryText}>Owner: {user?.name ?? "Audit lead"}</Text>
          <Text style={styles.summaryText}>Timeline: 21-day default review window</Text>
          <Text style={styles.summaryText}>Automation: AI parsing and live stream ready</Text>
        </View>
      </View>

      <TouchableOpacity style={[styles.ctaButton, !canContinue && styles.ctaButtonDisabled]} onPress={handleCreateAudit} testID="submit-create-audit-button">
        <Text style={styles.ctaText}>Create Audit</Text>
        <ChevronRight size={18} color={COLORS.white} />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  heroCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    backgroundColor: `${COLORS.primary}12`,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  heroBadgeText: {
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.gray,
  },
  stepsRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  stepPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  stepIndex: {
    width: 22,
    height: 22,
    borderRadius: 11,
    textAlign: "center",
    textAlignVertical: "center",
    overflow: "hidden",
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "700",
    paddingTop: 3,
  },
  stepLabel: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: "600",
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    backgroundColor: COLORS.background,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    color: COLORS.text,
    fontSize: 15,
  },
  standaloneInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: COLORS.background,
    color: COLORS.text,
    fontSize: 15,
  },
  chipRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.background,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.text,
    fontWeight: "600",
  },
  chipTextActive: {
    color: COLORS.white,
  },
  summaryCard: {
    marginTop: 18,
    backgroundColor: `${COLORS.primary}08`,
    borderRadius: 18,
    padding: 16,
    gap: 6,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },
  summaryText: {
    fontSize: 13,
    color: COLORS.gray,
  },
  ctaButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  ctaButtonDisabled: {
    opacity: 0.7,
  },
  ctaText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
  },
});
