import { useState, useEffect, useMemo, useCallback } from "react";
import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
  category: string;
  status: string;
  uri?: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  assignee: string;
  completed: boolean;
  category: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Auditor' | 'Viewer';
  avatar?: string;
  company: string;
}

interface Audit {
  id: string;
  company: string;
  period: string;
  status: string;
  statusColor: string;
  progress: number;
  dueDate: string;
  riskLevel: string;
  assignedTo: string[];
  createdBy: string;
  createdAt: string;
}

interface AuditTrail {
  id: string;
  auditId: string;
  action: string;
  userId: string;
  userName: string;
  timestamp: string;
  details: string;
}



export const [AuditProvider, useAudit] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [auditTrails, setAuditTrails] = useState<AuditTrail[]>([]);
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "1",
      name: "Financial_Statement_Q4_2023.pdf",
      type: "pdf",
      size: "2.4 MB",
      date: "Jan 15, 2024",
      category: "Financial Statements",
      status: "Analyzed",
    },
    {
      id: "2",
      name: "Balance_Sheet_2023.xlsx",
      type: "excel",
      size: "1.2 MB",
      date: "Jan 14, 2024",
      category: "Financial Statements",
      status: "Processing",
    },
    {
      id: "3",
      name: "Invoice_Collection_Dec.pdf",
      type: "pdf",
      size: "3.8 MB",
      date: "Jan 12, 2024",
      category: "Invoices",
      status: "Analyzed",
    },
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Review Q4 Financial Statements",
      description: "Complete review of all Q4 2023 financial statements including balance sheet and income statement",
      status: "In Progress",
      priority: "High",
      dueDate: "Jan 20, 2024",
      assignee: "John Doe",
      completed: false,
      category: "Review",
    },
    {
      id: "2",
      title: "Verify Account Receivables",
      description: "Cross-check all outstanding receivables with client confirmations",
      status: "Pending",
      priority: "Medium",
      dueDate: "Jan 22, 2024",
      assignee: "Jane Smith",
      completed: false,
      category: "Verification",
    },
    {
      id: "3",
      title: "Risk Assessment Report",
      description: "Prepare comprehensive risk assessment based on preliminary findings",
      status: "Completed",
      priority: "High",
      dueDate: "Jan 18, 2024",
      assignee: "John Doe",
      completed: true,
      category: "Reporting",
    },
  ]);

  const auditStats = useMemo(() => ({
    active: 5,
    completed: 12,
    highRisk: 3,
    documents: 48,
  }), []);

  const currentAudits: Audit[] = useMemo(() => [
    {
      id: "1",
      company: "TechCorp Industries",
      period: "Q4 2023",
      status: "In Progress",
      statusColor: "#3B82F6",
      progress: 65,
      dueDate: "Jan 31, 2024",
      riskLevel: "Medium",
      assignedTo: ["john.doe@audit.com", "jane.smith@audit.com"],
      createdBy: "admin@audit.com",
      createdAt: "2024-01-10T10:00:00Z",
    },
    {
      id: "2",
      company: "Global Retail Inc.",
      period: "FY 2023",
      status: "Review",
      statusColor: "#F59E0B",
      progress: 85,
      dueDate: "Jan 25, 2024",
      riskLevel: "Low",
      assignedTo: ["jane.smith@audit.com"],
      createdBy: "admin@audit.com",
      createdAt: "2024-01-08T14:30:00Z",
    },
    {
      id: "3",
      company: "Finance Solutions Ltd.",
      period: "Q3 2023",
      status: "Completed",
      statusColor: "#10B981",
      progress: 100,
      dueDate: "Jan 15, 2024",
      riskLevel: "High",
      assignedTo: ["john.doe@audit.com"],
      createdBy: "admin@audit.com",
      createdAt: "2024-01-05T09:15:00Z",
    },
  ], []);

  const analysisResults = useMemo(() => ({
    risks: [
      {
        title: "Unusual Revenue Spike",
        description: "December revenue shows 45% increase compared to historical average",
        level: "High",
        color: "#EF4444",
        category: "Revenue Recognition",
      },
      {
        title: "Inventory Valuation Discrepancy",
        description: "Physical count differs from book value by 3.2%",
        level: "Medium",
        color: "#F59E0B",
        category: "Asset Valuation",
      },
      {
        title: "Related Party Transactions",
        description: "Multiple transactions with affiliated entities require additional disclosure",
        level: "Low",
        color: "#3B82F6",
        category: "Compliance",
      },
    ],
  }), []);

  const addDocument = useCallback((doc: Document) => {
    setDocuments(prev => [doc, ...prev]);
  }, []);

  const deleteDocument = useCallback((id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id 
        ? { 
            ...task, 
            completed: !task.completed,
            status: !task.completed ? "Completed" : "In Progress"
          }
        : task
    ));
  }, []);

  const addTask = useCallback((task: Task) => {
    setTasks(prev => [task, ...prev]);
    // Add audit trail
    const trail: AuditTrail = {
      id: Date.now().toString(),
      auditId: task.id,
      action: "Task Created",
      userId: user?.id || "unknown",
      userName: user?.name || "Unknown User",
      timestamp: new Date().toISOString(),
      details: `Created task: ${task.title}`,
    };
    setAuditTrails(prev => [trail, ...prev]);
  }, [user]);

  const login = useCallback(async (email: string, password: string) => {
    // Simulate authentication
    const mockUser: User = {
      id: "1",
      name: "John Doe",
      email: email,
      role: "Admin",
      company: "Audit Pro Inc.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    };
    
    setUser(mockUser);
    setIsAuthenticated(true);
    await AsyncStorage.setItem("user", JSON.stringify(mockUser));
    await AsyncStorage.setItem("isAuthenticated", "true");
    
    return { success: true, user: mockUser };
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    setIsAuthenticated(false);
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("isAuthenticated");
    router.replace("/login" as any);
  }, []);

  const analyzeDocumentWithAI = useCallback(async (documentId: string) => {
    try {
      // Find the document
      const document = documents.find(doc => doc.id === documentId);
      if (!document) throw new Error("Document not found");

      // Simulate AI analysis API call
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a financial audit AI assistant. Analyze the provided document and identify potential risks, anomalies, and compliance issues.'
            },
            {
              role: 'user',
              content: `Please analyze this financial document: ${document.name}. Provide insights on potential risks, compliance issues, and recommendations.`
            }
          ]
        })
      });

      const result = await response.json();
      
      // Update document status
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId 
          ? { ...doc, status: "Analyzed" }
          : doc
      ));

      // Add audit trail
      const trail: AuditTrail = {
        id: Date.now().toString(),
        auditId: documentId,
        action: "AI Analysis Completed",
        userId: user?.id || "system",
        userName: user?.name || "AI System",
        timestamp: new Date().toISOString(),
        details: `AI analysis completed for document: ${document.name}`,
      };
      setAuditTrails(prev => [trail, ...prev]);

      return {
        success: true,
        analysis: result.completion,
        risks: [
          {
            title: "AI-Detected Anomaly",
            description: result.completion.substring(0, 100) + "...",
            level: "Medium",
            color: "#F59E0B",
            category: "AI Analysis",
          }
        ]
      };
    } catch (error) {
      console.error('AI Analysis Error:', error);
      return {
        success: false,
        error: 'Failed to analyze document with AI'
      };
    }
  }, [documents, user]);

  // Load data from AsyncStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedTasks = await AsyncStorage.getItem("audit_tasks");
        if (storedTasks) {
          setTasks(JSON.parse(storedTasks));
        }
        
        const storedUser = await AsyncStorage.getItem("user");
        const storedAuth = await AsyncStorage.getItem("isAuthenticated");
        
        if (storedUser && storedAuth === "true") {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
          // Navigate to tabs if authenticated
          setTimeout(() => {
            router.replace("/(tabs)" as any);
          }, 100);
        } else {
          // Navigate to login if not authenticated
          setTimeout(() => {
            router.replace("/login" as any);
          }, 100);
        }
        
        const storedTrails = await AsyncStorage.getItem("audit_trails");
        if (storedTrails) {
          setAuditTrails(JSON.parse(storedTrails));
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error("Error loading data:", error);
        // Navigate to login on error
        setTimeout(() => {
          router.replace("/login" as any);
        }, 100);
        setIsInitialized(true);
      }
    };
    loadData();
  }, []);

  // Save data to AsyncStorage when they change
  useEffect(() => {
    AsyncStorage.setItem("audit_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    AsyncStorage.setItem("audit_trails", JSON.stringify(auditTrails));
  }, [auditTrails]);

  return useMemo(() => ({
    // User & Auth
    user,
    isAuthenticated,
    isInitialized,
    login,
    logout,
    
    // Data
    documents,
    tasks,
    auditStats,
    currentAudits,
    analysisResults,
    auditTrails,
    
    // Actions
    addDocument,
    deleteDocument,
    toggleTask,
    addTask,
    analyzeDocumentWithAI,
  }), [user, isAuthenticated, isInitialized, login, logout, documents, tasks, auditStats, currentAudits, analysisResults, auditTrails, addDocument, deleteDocument, toggleTask, addTask, analyzeDocumentWithAI]);
});