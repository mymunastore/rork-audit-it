import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  FileText,
  Download,
  Share2,
  Calendar,
  TrendingUp,
  FileBarChart,
  Shield,
  Clock,
  User,
  Activity,
} from "lucide-react-native";
import { COLORS } from "@/constants/colors";
import { LinearGradient } from "expo-linear-gradient";
import { useAudit } from "@/providers/AuditProvider";

export default function ReportsScreen() {
  const { auditTrails } = useAudit();
  const [activeTab, setActiveTab] = useState<'reports' | 'trails' | 'compliance'>('reports');
  const reports = [
    {
      id: "1",
      title: "Q4 2023 Financial Audit Report",
      type: "Quarterly Report",
      date: "Dec 31, 2023",
      status: "Final",
      size: "2.4 MB",
      icon: FileBarChart,
      color: COLORS.primary,
    },
    {
      id: "2",
      title: "Risk Assessment Summary",
      type: "Risk Report",
      date: "Jan 15, 2024",
      status: "Draft",
      size: "1.8 MB",
      icon: TrendingUp,
      color: COLORS.danger,
    },
    {
      id: "3",
      title: "Compliance Review 2023",
      type: "Compliance",
      date: "Jan 10, 2024",
      status: "Final",
      size: "3.1 MB",
      icon: FileText,
      color: COLORS.success,
    },
  ];

  const ReportCard = ({ report }: { report: any }) => {
    const Icon = report.icon;
    return (
      <TouchableOpacity style={styles.reportCard} activeOpacity={0.8}>
        <LinearGradient
          colors={[report.color + "10", report.color + "05"]}
          style={styles.reportGradient}
        >
          <View style={styles.reportHeader}>
            <View style={[styles.iconContainer, { backgroundColor: report.color + "20" }]}>
              <Icon size={24} color={report.color} />
            </View>
            <View style={styles.reportInfo}>
              <Text style={styles.reportTitle} numberOfLines={1}>
                {report.title}
              </Text>
              <Text style={styles.reportType}>{report.type}</Text>
            </View>
          </View>
          
          <View style={styles.reportMeta}>
            <View style={styles.metaItem}>
              <Calendar size={14} color={COLORS.gray} />
              <Text style={styles.metaText}>{report.date}</Text>
            </View>
            <View style={styles.metaItem}>
              <FileText size={14} color={COLORS.gray} />
              <Text style={styles.metaText}>{report.size}</Text>
            </View>
            <View style={[
              styles.statusBadge,
              { backgroundColor: report.status === "Final" ? COLORS.success + "20" : COLORS.warning + "20" }
            ]}>
              <Text style={[
                styles.statusText,
                { color: report.status === "Final" ? COLORS.success : COLORS.warning }
              ]}>
                {report.status}
              </Text>
            </View>
          </View>
          
          <View style={styles.reportActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Download size={18} color={COLORS.primary} />
              <Text style={styles.actionText}>Download</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Share2 size={18} color={COLORS.primary} />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const AuditTrailItem = ({ trail }: { trail: any }) => (
    <View style={styles.trailItem}>
      <View style={styles.trailIcon}>
        <Activity size={16} color={COLORS.primary} />
      </View>
      <View style={styles.trailContent}>
        <Text style={styles.trailAction}>{trail.action}</Text>
        <Text style={styles.trailDetails}>{trail.details}</Text>
        <View style={styles.trailMeta}>
          <View style={styles.trailMetaItem}>
            <User size={12} color={COLORS.gray} />
            <Text style={styles.trailMetaText}>{trail.userName}</Text>
          </View>
          <View style={styles.trailMetaItem}>
            <Clock size={12} color={COLORS.gray} />
            <Text style={styles.trailMetaText}>
              {new Date(trail.timestamp).toLocaleString()}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const ComplianceItem = ({ title, status, description }: { title: string; status: string; description: string }) => (
    <View style={styles.complianceItem}>
      <View style={styles.complianceHeader}>
        <Shield size={20} color={status === 'Compliant' ? COLORS.success : COLORS.warning} />
        <View style={styles.complianceInfo}>
          <Text style={styles.complianceTitle}>{title}</Text>
          <Text style={styles.complianceDescription}>{description}</Text>
        </View>
        <View style={[
          styles.complianceStatus,
          { backgroundColor: status === 'Compliant' ? COLORS.success + '20' : COLORS.warning + '20' }
        ]}>
          <Text style={[
            styles.complianceStatusText,
            { color: status === 'Compliant' ? COLORS.success : COLORS.warning }
          ]}>
            {status}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'reports':
        return (
          <View style={styles.reportsSection}>
            <Text style={styles.sectionTitle}>Recent Reports</Text>
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </View>
        );
      case 'trails':
        return (
          <View style={styles.trailsSection}>
            <Text style={styles.sectionTitle}>Audit Trail</Text>
            <Text style={styles.sectionSubtitle}>
              Complete log of all audit activities and changes
            </Text>
            {auditTrails.slice(0, 10).map((trail) => (
              <AuditTrailItem key={trail.id} trail={trail} />
            ))}
          </View>
        );
      case 'compliance':
        return (
          <View style={styles.complianceSection}>
            <Text style={styles.sectionTitle}>Compliance Status</Text>
            <Text style={styles.sectionSubtitle}>
              Regulatory compliance and standards adherence
            </Text>
            <ComplianceItem
              title="GAAP Compliance"
              status="Compliant"
              description="All financial statements follow GAAP standards"
            />
            <ComplianceItem
              title="SOX Section 404"
              status="Compliant"
              description="Internal controls assessment completed"
            />
            <ComplianceItem
              title="IFRS Standards"
              status="Review Required"
              description="Some discrepancies found in revenue recognition"
            />
            <ComplianceItem
              title="Data Privacy (GDPR)"
              status="Compliant"
              description="All audit data properly encrypted and secured"
            />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reports & Compliance</Text>
        <Text style={styles.headerSubtitle}>
          Comprehensive audit reporting and compliance tracking
        </Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'reports' && styles.activeTab]}
          onPress={() => setActiveTab('reports')}
        >
          <FileBarChart size={18} color={activeTab === 'reports' ? COLORS.white : COLORS.gray} />
          <Text style={[styles.tabText, activeTab === 'reports' && styles.activeTabText]}>Reports</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'trails' && styles.activeTab]}
          onPress={() => setActiveTab('trails')}
        >
          <Activity size={18} color={activeTab === 'trails' ? COLORS.white : COLORS.gray} />
          <Text style={[styles.tabText, activeTab === 'trails' && styles.activeTabText]}>Audit Trail</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'compliance' && styles.activeTab]}
          onPress={() => setActiveTab('compliance')}
        >
          <Shield size={18} color={activeTab === 'compliance' ? COLORS.white : COLORS.gray} />
          <Text style={[styles.tabText, activeTab === 'compliance' && styles.activeTabText]}>Compliance</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'reports' && (
        <>
          <View style={styles.quickStats}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Total Reports</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>This Month</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>2</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.generateButton}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.generateGradient}
            >
              <FileBarChart size={24} color={COLORS.white} />
              <Text style={styles.generateText}>Generate New Report</Text>
            </LinearGradient>
          </TouchableOpacity>
        </>
      )}

      {renderTabContent()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
  },
  quickStats: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },
  generateButton: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  generateGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  generateText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  reportsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 16,
  },
  reportCard: {
    marginBottom: 16,
  },
  reportGradient: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reportHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 2,
  },
  reportType: {
    fontSize: 14,
    color: COLORS.gray,
  },
  reportMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.gray,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: "auto",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  reportActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "500",
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: "500",
  },
  activeTabText: {
    color: COLORS.white,
  },
  trailsSection: {
    padding: 20,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 16,
  },
  trailItem: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  trailIcon: {
    width: 32,
    height: 32,
    backgroundColor: COLORS.primary + "20",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  trailContent: {
    flex: 1,
  },
  trailAction: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  trailDetails: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 8,
  },
  trailMeta: {
    flexDirection: "row",
    gap: 16,
  },
  trailMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  trailMetaText: {
    fontSize: 12,
    color: COLORS.gray,
  },
  complianceSection: {
    padding: 20,
  },
  complianceItem: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  complianceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  complianceInfo: {
    flex: 1,
  },
  complianceTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  complianceDescription: {
    fontSize: 14,
    color: COLORS.gray,
  },
  complianceStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  complianceStatusText: {
    fontSize: 12,
    fontWeight: "600",
  },
});