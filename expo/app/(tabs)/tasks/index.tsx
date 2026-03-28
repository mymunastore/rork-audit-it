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
  CheckSquare,
  Square,
  Clock,
  AlertCircle,
  Calendar,
  User,
  Plus,
} from "lucide-react-native";
import { COLORS } from "@/constants/colors";
import { useAudit } from "@/providers/AuditProvider";

export default function TasksScreen() {
  const { tasks, toggleTask, addTask } = useAudit();
  const [filter, setFilter] = useState("All");
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const filters = ["All", "Pending", "In Progress", "Completed", "Overdue"];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return COLORS.success;
      case "In Progress":
        return COLORS.info;
      case "Overdue":
        return COLORS.danger;
      default:
        return COLORS.warning;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return COLORS.danger;
      case "Medium":
        return COLORS.warning;
      default:
        return COLORS.info;
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === "All") return true;
    return task.status === filter;
  });

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addTask({
        id: Date.now().toString(),
        title: newTaskTitle,
        description: "",
        status: "Pending",
        priority: "Medium",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        assignee: "Current User",
        completed: false,
        category: "Review",
      });
      setNewTaskTitle("");
      setShowAddTask(false);
    }
  };

  const TaskItem = ({ task }: { task: any }) => (
    <TouchableOpacity 
      style={styles.taskItem}
      onPress={() => toggleTask(task.id)}
      activeOpacity={0.7}
    >
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => toggleTask(task.id)}
      >
        {task.completed ? (
          <CheckSquare size={24} color={COLORS.success} />
        ) : (
          <Square size={24} color={COLORS.gray} />
        )}
      </TouchableOpacity>
      
      <View style={styles.taskContent}>
        <View style={styles.taskHeader}>
          <Text style={[
            styles.taskTitle,
            task.completed && styles.taskTitleCompleted
          ]}>
            {task.title}
          </Text>
          <View style={[
            styles.priorityBadge,
            { backgroundColor: getPriorityColor(task.priority) + "20" }
          ]}>
            <Text style={[
              styles.priorityText,
              { color: getPriorityColor(task.priority) }
            ]}>
              {task.priority}
            </Text>
          </View>
        </View>
        
        {task.description ? (
          <Text style={styles.taskDescription} numberOfLines={2}>
            {task.description}
          </Text>
        ) : null}
        
        <View style={styles.taskMeta}>
          <View style={styles.metaItem}>
            <Calendar size={14} color={COLORS.gray} />
            <Text style={styles.metaText}>{task.dueDate}</Text>
          </View>
          <View style={styles.metaItem}>
            <User size={14} color={COLORS.gray} />
            <Text style={styles.metaText}>{task.assignee}</Text>
          </View>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(task.status) + "20" }
          ]}>
            <Text style={[
              styles.statusText,
              { color: getStatusColor(task.status) }
            ]}>
              {task.status}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {filters.map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterChip,
              filter === f && styles.filterChipActive
            ]}
            onPress={() => setFilter(f)}
          >
            <Text style={[
              styles.filterText,
              filter === f && styles.filterTextActive
            ]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Clock size={20} color={COLORS.warning} />
          <Text style={styles.statValue}>{tasks.filter(t => t.status === "Pending").length}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statItem}>
          <AlertCircle size={20} color={COLORS.info} />
          <Text style={styles.statValue}>{tasks.filter(t => t.status === "In Progress").length}</Text>
          <Text style={styles.statLabel}>In Progress</Text>
        </View>
        <View style={styles.statItem}>
          <CheckSquare size={20} color={COLORS.success} />
          <Text style={styles.statValue}>{tasks.filter(t => t.completed).length}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      {showAddTask && (
        <View style={styles.addTaskContainer}>
          <TextInput
            style={styles.addTaskInput}
            placeholder="Enter task title..."
            value={newTaskTitle}
            onChangeText={setNewTaskTitle}
            placeholderTextColor={COLORS.gray}
            autoFocus
          />
          <View style={styles.addTaskActions}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => {
                setShowAddTask(false);
                setNewTaskTitle("");
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleAddTask}
            >
              <Text style={styles.saveButtonText}>Add Task</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView style={styles.tasksList} showsVerticalScrollIndicator={false}>
        {filteredTasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </ScrollView>

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setShowAddTask(true)}
      >
        <Plus size={24} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 60,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  filterTextActive: {
    color: COLORS.white,
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  addTaskContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  addTaskInput: {
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 12,
  },
  addTaskActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cancelButtonText: {
    color: COLORS.gray,
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "500",
  },
  tasksList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  taskItem: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  checkbox: {
    marginRight: 12,
    marginTop: 2,
  },
  taskContent: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  taskTitleCompleted: {
    textDecorationLine: "line-through",
    color: COLORS.gray,
  },
  taskDescription: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: "600",
  },
  taskMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
    fontWeight: "500",
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});