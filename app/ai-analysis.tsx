import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { X, Send, Sparkles } from "lucide-react-native";
import { COLORS } from "@/constants/colors";
import { router } from "expo-router";

export default function AIAnalysisScreen() {
  const [query, setQuery] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const handleAnalyze = async () => {
    if (!query.trim()) return;
    
    setIsAnalyzing(true);
    
    try {
      const response = await fetch("https://toolkit.rork.com/text/llm/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: "You are an AI financial auditor assistant. Provide concise, professional analysis of financial data and audit queries."
            },
            {
              role: "user",
              content: query
            }
          ]
        }),
      });

      const data = await response.json();
      setResults([...results, query, data.completion]);
      setQuery("");
    } catch (error) {
      console.error("Analysis error:", error);
      setResults([...results, query, "Error performing analysis. Please try again."]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>AI Financial Analysis</Text>
        <Sparkles size={24} color={COLORS.primary} />
      </View>

      <ScrollView style={styles.chatContainer}>
        {results.length === 0 ? (
          <View style={styles.emptyState}>
            <Sparkles size={48} color={COLORS.gray} />
            <Text style={styles.emptyTitle}>Ask AI About Your Audit</Text>
            <Text style={styles.emptyText}>
              Get instant insights about financial statements, risk assessments, and compliance issues
            </Text>
          </View>
        ) : (
          results.map((message, index) => (
            <View
              key={index}
              style={[
                styles.message,
                index % 2 === 0 ? styles.userMessage : styles.aiMessage
              ]}
            >
              <Text style={[
                styles.messageText,
                index % 2 === 0 ? styles.userMessageText : styles.aiMessageText
              ]}>
                {message}
              </Text>
            </View>
          ))
        )}
        {isAnalyzing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={styles.loadingText}>AI is analyzing...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask about financial data..."
          value={query}
          onChangeText={setQuery}
          placeholderTextColor={COLORS.gray}
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendButton, !query.trim() && styles.sendButtonDisabled]}
          onPress={handleAnalyze}
          disabled={!query.trim() || isAnalyzing}
        >
          <Send size={20} color={COLORS.white} />
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
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginHorizontal: 12,
  },
  chatContainer: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 40,
  },
  message: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    maxWidth: "80%",
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.primary,
  },
  aiMessage: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userMessageText: {
    color: COLORS.white,
  },
  aiMessageText: {
    color: COLORS.text,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
});