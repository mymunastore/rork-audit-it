import React from "react";
import type { LucideIcon } from "lucide-react-native";
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
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Activity,
  User,
  LogOut,
  Wifi,
  WifiOff,
  Bell,
  Plus,
  FolderOpen,
  Settings,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { COLORS } from "@/constants/colors";
import { useAudit } from "@/providers/AuditProvider";

const { width } = Dimensions.get("window");

type AuditCardData = {
  id: string;
  company: string;
  period: string;
  status: string;
  statusColor: string;
  progress: number;
  dueDate: string;
  riskLevel: string;
};

type StatCardProps = {
  icon: LucideIcon;
  title: string;
  value: string | number;
  subtitle: string;
  color: string;
  gradient: readonly [string, string, ...string[]];
};

function StatCard({ icon: Icon, title, value, subtitle, color, gradient }: StatCardProps) {
  return (
    <TouchableOpacity style={styles.statCard} activeOpacity={0.85} testID={`stat-card-${title}`}>
      <LinearGradient colors={gradient} style={styles.statCardGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.statCardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
            <Icon size={22} color={color} />
          </View>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statSubtitle}>{subtitle}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

function AuditItem({ audit, onPress }: { audit: AuditCardData; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.auditItem} activeOpacity={0.8} onPress={onPress} testID={`audit-card-${audit.id}`}>
      <View style={styles.auditHeader}>
        <View style={styles.auditCopy}>
          <Text style={styles.auditCompany}>{audit.company}</Text>
          <Text style={styles.auditPeriod}>{audit.period}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${audit.statusColor}20` }]}>
          <Text style={[styles.statusText, { color: audit.statusColor }]}>{audit.status}</Text>
        </View>
      </View>

      <View style={styles.auditProgress}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${audit.progress}%`, backgroundColor: audit.statusColor }]} />
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
}

export default function DashboardScreen() {
  const { auditStats, currentAudits, user, logout, streamingStats, recentStreamEvents } = useAudit();

  const handleLogout = async () => {
    console.log("Logging out user");
    await logout();
  };

  const openRoute = (pathname: string, params?: Record<string, string>) => {
    console.log("Opening route", pathname, params ?? {});
    if (params) {
      router.push({ pathname: pathname as never, params });
      return;
    }
    router.push(pathname as never);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} testID="dashboard-screen">
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Welcome back, {user?.name?.split(" ")[0] ?? "User"}!</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <TouchableOpacity style={styles.headerIconButton} onPress={() => openRoute("/(tabs)/(dashboard)/notifications")} testID="notifications-button">
            <Bell size={18} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconButton} onPress={() => openRoute("/(tabs)/(dashboard)/settings")} testID="settings-button">
            <Settings size={18} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.avatar}>
            <User size={20} color={COLORS.primary} />
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton} testID="logout-button">
            <LogOut size={18} color={COLORS.gray} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.heroPanel}>
        <LinearGradient colors={[COLORS.darkPrimary, COLORS.primaryDark] as const} style={styles.heroGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Text style={styles.heroEyebrow}>Audit command center</Text>
          <Text style={styles.heroTitle}>Launch engagements, review risks, and move from landing to execution.</Text>
          <Text style={styles.heroSubtitle}>The main landing flow now connects into project creation, notifications, settings, and detailed project review.</Text>

          <View style={styles.heroActions}>
            <TouchableOpacity style={styles.primaryHeroButton} onPress={() => openRoute("/(tabs)/(dashboard)/create-audit")} testID="create-audit-button">
              <Plus size={18} color={COLORS.white} />
              <Text style={styles.primaryHeroButtonText}>New Audit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryHeroButton} onPress={() => openRoute("/(tabs)/(dashboard)/projects")} testID="projects-button">
              <FolderOpen size={18} color={COLORS.white} />
              <Text style={styles.secondaryHeroButtonText}>Projects</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.statsGrid}>
        <StatCard icon={Activity} title="Active Audits" value={auditStats.active} subtitle="In progress" color={COLORS.primary} gradient={[`${COLORS.primary}10`, `${COLORS.primary}05`] as const} />
        <StatCard icon={CheckCircle} title="Completed" value={auditStats.completed} subtitle="This month" color={COLORS.success} gradient={[`${COLORS.success}10`, `${COLORS.success}05`] as const} />
        <StatCard icon={AlertTriangle} title="High Risk" value={auditStats.highRisk} subtitle="Items flagged" color={COLORS.danger} gradient={[`${COLORS.danger}10`, `${COLORS.danger}05`] as const} />
        <StatCard icon={FileText} title="Documents" value={auditStats.documents} subtitle="Processed" color={COLORS.info} gradient={[`${COLORS.info}10`, `${COLORS.info}05`] as const} />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Current Audits</Text>
          <TouchableOpacity onPress={() => openRoute("/(tabs)/(dashboard)/projects")} testID="see-all-projects-button">
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {currentAudits.map((audit) => (
          <AuditItem key={audit.id} audit={audit} onPress={() => openRoute("/(tabs)/(dashboard)/audit-details", { id: audit.id })} />
        ))}
      </View>

      <View style={styles.streamingStatus}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Live Streaming</Text>
          <View style={styles.streamingIndicator}>
            {streamingStats.isConnected ? <Wifi size={16} color={COLORS.success} /> : <WifiOff size={16} color={COLORS.gray} />}
            <Text style={[styles.streamingText, { color: streamingStats.isConnected ? COLORS.success : COLORS.gray }]}>
              {streamingStats.isConnected ? "Connected" : "Disconnected"}
            </Text>
          </View>
        </View>

        <View style={styles.streamingStatsRow}>
          <View style={styles.streamingStat}>
            <Text style={styles.streamingStatValue}>{streamingStats.totalEvents}</Text>
            <Text style={styles.streamingStatLabel}>Events</Text>
          </View>
          <View style={styles.streamingStat}>
            <Text style={[styles.streamingStatValue, { color: COLORS.danger }]}>{streamingStats.criticalAlerts}</Text>
            <Text style={styles.streamingStatLabel}>Critical</Text>
          </View>
          <View style={styles.streamingStat}>
            <Text style={styles.streamingStatValue}>{recentStreamEvents.length}</Text>
            <Text style={styles.streamingStatLabel}>Recent</Text>
          </View>
        </View>

        {recentStreamEvents.length > 0 ? (
          <View style={styles.recentEvents}>
            <Text style={styles.recentEventsTitle}>Recent Events</Text>
            {recentStreamEvents.slice(0, 3).map((event) => (
              <View key={event.id} style={styles.recentEventItem}>
                <View
                  style={[
                    styles.eventSeverityDot,
                    {
                      backgroundColor:
                        event.severity === "critical"
                          ? COLORS.danger
                          : event.severity === "high"
                            ? COLORS.warning
                            : COLORS.info,
                    },
                  ]}
                />
                <View style={styles.eventContent}>
                  <Text style={styles.eventType}>{event.type.replace("_", " ").toUpperCase()}</Text>
                  <Text style={styles.eventDescription} numberOfLines={1}>
                    {event.data?.description ?? `${event.type} from ${event.source}`}
                  </Text>
                </View>
                <Text style={styles.eventTime}>
                  {new Date(event.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyStreamingState}>
            <Text style={styles.emptyStreamingTitle}>No live events yet</Text>
            <Text style={styles.emptyStreamingSubtitle}>Start the RTMP stream to populate real-time transaction alerts.</Text>
          </View>
        )}
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={() => openRoute("/(tabs)/streaming")} testID="start-streaming-button">
            <LinearGradient colors={[COLORS.primary, COLORS.primaryDark] as const} style={styles.actionGradient}>
              <Activity size={24} color={COLORS.white} />
              <Text style={styles.actionText}>Live Stream</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => openRoute("/(tabs)/(dashboard)/create-audit")} testID="create-audit-shortcut-button">
            <LinearGradient colors={[COLORS.info, COLORS.infoDark] as const} style={styles.actionGradient}>
              <FileText size={24} color={COLORS.white} />
              <Text style={styles.actionText}>Create Audit</Text>
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
    gap: 16,
  },
  headerLeft: {
    flex: 1,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatar: {
    width: 40,
    height: 40,
    backgroundColor: `${COLORS.primary}20`,
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
  heroPanel: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  heroGradient: {
    borderRadius: 24,
    padding: 20,
    gap: 8,
  },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: COLORS.accent,
  },
  heroTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "700",
    color: COLORS.white,
    maxWidth: 520,
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.white,
    opacity: 0.88,
    maxWidth: 540,
  },
  heroActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
  },
  primaryHeroButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  primaryHeroButtonText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 14,
  },
  secondaryHeroButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: `${COLORS.white}16`,
    borderWidth: 1,
    borderColor: `${COLORS.white}24`,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  secondaryHeroButtonText: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 10,
    gap: 10,
    paddingTop: 4,
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
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  auditCopy: {
    flex: 1,
    paddingRight: 12,
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
    fontSize: 13,
    color: COLORS.gray,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  auditProgress: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.gray,
    minWidth: 34,
    textAlign: "right",
  },
  auditFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  auditMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  auditMetaText: {
    fontSize: 12,
    color: COLORS.gray,
  },
  streamingStatus: {
    marginHorizontal: 20,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  streamingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  streamingText: {
    fontSize: 13,
    fontWeight: "600",
  },
  streamingStatsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  streamingStat: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
  },
  streamingStatValue: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
  },
  streamingStatLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },
  recentEvents: {
    gap: 10,
  },
  recentEventsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },
  recentEventItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.background,
    borderRadius: 14,
    padding: 12,
  },
  eventSeverityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  eventContent: {
    flex: 1,
  },
  eventType: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.text,
  },
  eventDescription: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  eventTime: {
    fontSize: 11,
    color: COLORS.gray,
  },
  emptyStreamingState: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 14,
  },
  emptyStreamingTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  emptyStreamingSubtitle: {
    fontSize: 12,
    color: COLORS.gray,
    lineHeight: 18,
  },
  quickActions: {
    padding: 20,
    paddingBottom: 32,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  actionGradient: {
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
    gap: 10,
  },
  actionText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "700",
  },
});
