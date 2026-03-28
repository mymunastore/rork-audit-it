import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,

} from "react-native";
import {
  Search,
  Upload,
  FileText,
  File,
  Image,
  Filter,
  Eye,
  Trash2,
  Brain,
  Loader,
} from "lucide-react-native";
import { COLORS } from "@/constants/colors";
import { useAudit } from "@/providers/AuditProvider";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";

export default function DocumentsScreen() {
  const { documents, addDocument, deleteDocument, analyzeDocumentWithAI } = useAudit();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [analyzingDocs, setAnalyzingDocs] = useState<Set<string>>(new Set());

  const categories = ["All", "Financial Statements", "Invoices", "Receipts", "Reports", "Other"];

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText size={24} color={COLORS.danger} />;
      case "image":
        return <Image size={24} color={COLORS.success} />;
      default:
        return <File size={24} color={COLORS.info} />;
    }
  };

  const handleUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const newDoc = {
        id: Date.now().toString(),
        name: `Document_${Date.now()}`,
        type: "image",
        size: "2.4 MB",
        date: new Date().toLocaleDateString(),
        category: "Financial Statements",
        status: "Processing",
        uri: result.assets[0].uri,
      };
      addDocument(newDoc);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAnalyzeDocument = async (docId: string) => {
    setAnalyzingDocs(prev => new Set(prev).add(docId));
    try {
      const result = await analyzeDocumentWithAI(docId);
      if (result.success) {
        console.log('AI Analysis completed:', result.analysis);
      } else {
        console.error('AI Analysis failed:', result.error);
      }
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setAnalyzingDocs(prev => {
        const newSet = new Set(prev);
        newSet.delete(docId);
        return newSet;
      });
    }
  };

  const DocumentItem = ({ doc }: { doc: any }) => {
    const isAnalyzing = analyzingDocs.has(doc.id);
    
    return (
      <View style={styles.documentItem}>
        <View style={styles.documentIcon}>
          {getFileIcon(doc.type)}
        </View>
        <View style={styles.documentInfo}>
          <Text style={styles.documentName} numberOfLines={1}>{doc.name}</Text>
          <View style={styles.documentMeta}>
            <Text style={styles.documentMetaText}>{doc.size}</Text>
            <Text style={styles.documentMetaDot}>•</Text>
            <Text style={styles.documentMetaText}>{doc.date}</Text>
            <Text style={styles.documentMetaDot}>•</Text>
            <View style={[styles.statusBadge, { 
              backgroundColor: doc.status === "Analyzed" ? COLORS.success + "20" : COLORS.warning + "20" 
            }]}>
              <Text style={[styles.statusText, { 
                color: doc.status === "Analyzed" ? COLORS.success : COLORS.warning 
              }]}>
                {isAnalyzing ? "Analyzing..." : doc.status}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.documentActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push("/document-viewer" as any)}
          >
            <Eye size={18} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, isAnalyzing && styles.actionButtonDisabled]}
            onPress={() => handleAnalyzeDocument(doc.id)}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <Loader size={18} color={COLORS.gray} />
            ) : (
              <Brain size={18} color={COLORS.info} />
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => deleteDocument(doc.id)}
          >
            <Trash2 size={18} color={COLORS.danger} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={COLORS.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search documents..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.gray}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.categoryChipActive
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category && styles.categoryTextActive
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.documentsList} showsVerticalScrollIndicator={false}>
        {filteredDocuments.map((doc) => (
          <DocumentItem key={doc.id} doc={doc} />
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
        <Upload size={24} color={COLORS.white} />
        <Text style={styles.uploadText}>Upload Document</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 14,
    color: COLORS.text,
  },
  filterButton: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    maxHeight: 50,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  categoryTextActive: {
    color: COLORS.white,
    fontWeight: "500",
  },
  documentsList: {
    flex: 1,
    padding: 16,
  },
  documentItem: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  documentIcon: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.text,
    marginBottom: 4,
  },
  documentMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  documentMetaText: {
    fontSize: 12,
    color: COLORS.gray,
  },
  documentMetaDot: {
    fontSize: 12,
    color: COLORS.gray,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "500",
  },
  documentActions: {
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
  actionButtonDisabled: {
    opacity: 0.5,
  },
  uploadButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  uploadText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
});