import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { X, Download, Share2, ZoomIn, ZoomOut } from "lucide-react-native";
import { COLORS } from "@/constants/colors";
import { router } from "expo-router";

export default function DocumentViewerScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Financial_Statement_Q4.pdf</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton}>
            <Download size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Share2 size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.documentContainer}>
        <View style={styles.documentPlaceholder}>
          <Text style={styles.placeholderText}>
            Document Preview
          </Text>
          <Text style={styles.placeholderSubtext}>
            PDF viewer would be integrated here
          </Text>
        </View>
      </ScrollView>

      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolButton}>
          <ZoomOut size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.pageInfo}>Page 1 of 12</Text>
        <TouchableOpacity style={styles.toolButton}>
          <ZoomIn size={20} color={COLORS.text} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.text,
    marginHorizontal: 12,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  documentContainer: {
    flex: 1,
  },
  documentPlaceholder: {
    flex: 1,
    height: 600,
    margin: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.gray,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 8,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 20,
  },
  toolButton: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.lightGray,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  pageInfo: {
    fontSize: 14,
    color: COLORS.text,
  },
});