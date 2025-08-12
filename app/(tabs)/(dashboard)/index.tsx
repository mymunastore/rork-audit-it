import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Activity,
  User,
  LogOut,
  Bot,
  Settings,
} from "lucide-react-native";
import { COLORS } from "@/constants/colors";
import { useAudit } from "@/providers/AuditProvider";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function DashboardScreen() {
  const { auditStats, currentAudits, user, logout, aiService } = useAudit();
  const aiStatus = aiService.getAPIStatus();

  const handleLogout = async () => {
    await logout();
  };

  const StatCard = ({ 
    icon: Icon, 
    title, 
    value, 
    subtitle, 
    color, 
    gradient 
  }: { 
    icon: any; 
    title: string; 
    value: string | number; 
    subtitle: string; 
    color: string;
    gradient: readonly [string, string, ...string[]];
  }) => (
    <TouchableOpacity style={styles.statCard} activeOpacity={0.8}>
      <LinearGradient
        colors={gradient}
        style={styles.statCardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.statCardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: color + "20" }]}>
            <Icon size={24} color={color} />
          </View>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statSubtitle}>{subtitle}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const AuditItem = ({ audit }: { audit: any }) => (
    <TouchableOpacity style={styles.auditItem} activeOpacity={0.7}>
      <View style={styles.auditHeader}>
        <View>
          <Text style={styles.auditCompany}>{audit.company}</Text>
          <Text style={styles.auditPeriod}>{audit.period}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: audit.statusColor + "20" }]}>
          <Text style={[styles.statusText, { color: audit.statusColor }]}>
            {audit.status}
          </Text>
        </View>
      </View>
      <View style={styles.auditProgress}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${audit.progress}%`,
                backgroundColor: audit.statusColor 
              }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>{audit.progress}%</Text>
      </View>
      <View style={styles.auditFooter}>
        <View style={styles.auditMeta}>
          <Clock size={14} color={COLORS.gray} />
          <Text style={styles.auditMetaText}>Due: {audit.dueDate}</Text>
        </View>
        <View style={styles.auditMeta}>
          <AlertTriangle size={14} color={audit.riskLevel === "High" ? COLORS.danger : COLORS.warning} />
          <Text style={styles.auditMetaText}>Risk: {audit.riskLevel}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Welcome back, {user?.name?.split(' ')[0] || 'User'}!</Text>
          <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <User size={20} color={COLORS.primary} />
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <LogOut size={18} color={COLORS.gray} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          icon={Activity}
          title="Active Audits"
          value={auditStats.active}
          subtitle="In progress"
          color={COLORS.primary}
          gradient={[COLORS.primary + "10", COLORS.primary + "05"] as const}
        />
        <StatCard
          icon={CheckCircle}
          title="Completed"
          value={auditStats.completed}
          subtitle="This month"
          color={COLORS.success}
          gradient={[COLORS.success + "10", COLORS.success + "05"] as const}
        />
        <StatCard
          icon={AlertTriangle}
          title="High Risk"
          value={auditStats.highRisk}
          subtitle="Items flagged"
          color={COLORS.danger}
          gradient={[COLORS.danger + "10", COLORS.danger + "05"] as const}
        />
        <StatCard
          icon={FileText}
          title="Documents"
          value={auditStats.documents}
          subtitle="Processed"
          color={COLORS.info}
          gradient={[COLORS.info + "10", COLORS.info + "05"] as const}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Current Audits</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        {currentAudits.map((audit, index) => (
          <AuditItem key={index} audit={audit} />
        ))}
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark] as const}
              style={styles.actionGradient}
            >
              <TrendingUp size={24} color={COLORS.white} />
              <Text style={styles.actionText}>Start Analysis</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <LinearGradient
              colors={[COLORS.info, COLORS.infoDark] as const}
              style={styles.actionGradient}
            >
              <FileText size={24} color={COLORS.white} />
              <Text style={styles.actionText}>Upload Doc</Text>
            </LinearGradient>
          </TouchableOpacity>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 10 : 20,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    marginLeft: 16,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.primary + "20",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutButton: {
    width: 36,
    height: 36,
    backgroundColor: COLORS.lightGray,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  greeting: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.text,
  },
  date: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 10,
    gap: 10,
  },
  statCard: {
    width: (width - 40) / 2,
    marginBottom: 5,
  },
  statCardGradient: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  statTitle: {
    fontSize: 14,
    color: COLORS.gray,
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: COLORS.gray,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
  },
  seeAll: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "500",
  },
  auditItem: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  auditHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  auditCompany: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  auditPeriod: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  auditProgress: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.lightGray,
    borderRadius: 3,
    marginRight: 10,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.gray,
    minWidth: 35,
  },
  auditFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  auditMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  auditMetaText: {
    fontSize: 12,
    color: COLORS.gray,
  },
  quickActions: {
    padding: 20,
    paddingTop: 0,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
  },
  actionGradient: {
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    gap: 8,
  },
  actionText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
});