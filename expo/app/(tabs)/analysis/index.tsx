import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  FileSearch,
  Sparkles,
} from "lucide-react-native";
import { COLORS } from "@/constants/colors";
import { LinearGradient } from "expo-linear-gradient";
import { useAudit } from "@/providers/AuditProvider";

const { width } = Dimensions.get("window");

export default function AnalysisScreen() {
  const { analysisResults } = useAudit();
  const [isAnalyzing, setIsAnalyzing] = useState(false);


  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 3000);
  };

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    color 
  }: { 
    title: string; 
    value: string; 
    change: string; 
    icon: any; 
    color: string;
  }) => (
    <TouchableOpacity style={styles.metricCard} activeOpacity={0.8}>
      <View style={styles.metricHeader}>
        <View style={[styles.metricIcon, { backgroundColor: color + "20" }]}>
          <Icon size={20} color={color} />
        </View>
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <View style={styles.metricChange}>
        <TrendingUp size={14} color={change.startsWith("+") ? COLORS.success : COLORS.danger} />
        <Text style={[
          styles.metricChangeText,
          { color: change.startsWith("+") ? COLORS.success : COLORS.danger }
        ]}>
          {change}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const RiskItem = ({ risk }: { risk: any }) => (
    <View style={styles.riskItem}>
      <View style={[styles.riskIndicator, { backgroundColor: risk.color }]} />
      <View style={styles.riskContent}>
        <Text style={styles.riskTitle}>{risk.title}</Text>
        <Text style={styles.riskDescription}>{risk.description}</Text>
        <View style={styles.riskMeta}>
          <View style={[styles.riskBadge, { backgroundColor: risk.color + "20" }]}>
            <Text style={[styles.riskBadgeText, { color: risk.color }]}>
              {risk.level}
            </Text>
          </View>
          <Text style={styles.riskCategory}>{risk.category}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Brain size={32} color={COLORS.white} />
          <Text style={styles.headerTitle}>AI-Powered Analysis</Text>
          <Text style={styles.headerSubtitle}>
            Leverage advanced AI to analyze financial statements and identify risks
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.actionSection}>
        <TouchableOpacity 
          style={styles.analyzeButton}
          onPress={handleRunAnalysis}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <ActivityIndicator color={COLORS.white} />
              <Text style={styles.analyzeButtonText}>Analyzing...</Text>
            </>
          ) : (
            <>
              <Sparkles size={20} color={COLORS.white} />
              <Text style={styles.analyzeButtonText}>Run AI Analysis</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.metricsSection}>
        <Text style={styles.sectionTitle}>Key Financial Metrics</Text>
        <View style={styles.metricsGrid}>
          <MetricCard
            title="Revenue"
            value="$2.4M"
            change="+12.5%"
            icon={TrendingUp}
            color={COLORS.success}
          />
          <MetricCard
            title="Expenses"
            value="$1.8M"
            change="+8.3%"
            icon={BarChart3}
            color={COLORS.warning}
          />
          <MetricCard
            title="Net Profit"
            value="$600K"
            change="+24.1%"
            icon={PieChart}
            color={COLORS.info}
          />
          <MetricCard
            title="Cash Flow"
            value="$450K"
            change="-5.2%"
            icon={FileSearch}
            color={COLORS.danger}
          />
        </View>
      </View>

      <View style={styles.riskSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Risk Assessment</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>View Details</Text>
          </TouchableOpacity>
        </View>
        {analysisResults.risks.map((risk, index) => (
          <RiskItem key={index} risk={risk} />
        ))}
      </View>

      <View style={styles.insightsSection}>
        <Text style={styles.sectionTitle}>AI Insights</Text>
        <View style={styles.insightCard}>
          <LinearGradient
            colors={[COLORS.info + "10", COLORS.info + "05"]}
            style={styles.insightGradient}
          >
            <CheckCircle size={24} color={COLORS.info} />
            <Text style={styles.insightTitle}>Revenue Growth Pattern</Text>
            <Text style={styles.insightText}>
              The AI has detected a consistent upward trend in revenue over the past 4 quarters, 
              with an average growth rate of 12.5%. This indicates strong market performance.
            </Text>
          </LinearGradient>
        </View>
        <View style={styles.insightCard}>
          <LinearGradient
            colors={[COLORS.warning + "10", COLORS.warning + "05"]}
            style={styles.insightGradient}
          >
            <AlertTriangle size={24} color={COLORS.warning} />
            <Text style={styles.insightTitle}>Expense Optimization Opportunity</Text>
            <Text style={styles.insightText}>
              Operating expenses have increased by 8.3% while revenue grew by 12.5%. 
              Consider reviewing operational efficiency to improve profit margins.
            </Text>
          </LinearGradient>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 24,
    paddingTop: 20,
  },
  headerContent: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.white,
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
    textAlign: "center",
    marginTop: 8,
  },
  actionSection: {
    padding: 20,
    alignItems: "center",
  },
  analyzeButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  analyzeButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  metricsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metricCard: {
    width: (width - 52) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  metricTitle: {
    fontSize: 14,
    color: COLORS.gray,
    flex: 1,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  metricChange: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metricChangeText: {
    fontSize: 14,
    fontWeight: "500",
  },
  riskSection: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  seeAll: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "500",
  },
  riskItem: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  riskIndicator: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
  },
  riskContent: {
    flex: 1,
  },
  riskTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  riskDescription: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 8,
  },
  riskMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  riskBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  riskCategory: {
    fontSize: 12,
    color: COLORS.gray,
  },
  insightsSection: {
    padding: 20,
  },
  insightCard: {
    marginBottom: 12,
  },
  insightGradient: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 8,
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
  },
});