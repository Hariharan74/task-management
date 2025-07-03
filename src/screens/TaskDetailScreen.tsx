import React from 'react';
import { ScrollView, View, Text, StyleSheet, Button, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTasks } from '../services/taskService';
import { useAuth } from '../services/authService';
import TaskForm from '../components/TaskForm';
import ConfirmationDialog from '../components/ConfirmationDialog';

const TaskDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { taskId, } = route.params as { taskId: string };
  const { user } = useAuth();

  const { tasks, updateTask, deleteTask } = useTasks(user?.id || '');



  const task = tasks.find(t => t.id === taskId);
  const [isEditing, setIsEditing] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleUpdate = async (values: { title: string; description: string; dueDate: string }) => {
    await updateTask(taskId, user?.id || '', values);
    setIsEditing(false);
  };

  const handleDeleteConfirm = async () => {
    setShowDeleteDialog(false);
    setIsDeleting(true);
    try {
      await deleteTask(taskId, user?.id || '');
      // Wait a brief moment to ensure state updates propagate
      await new Promise(resolve => setTimeout(resolve, 100));
      route.params?.onTaskDeleted?.(); // Call the refresh callback
      navigation.goBack();
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!task) {
    return (
      <View style={styles.container}>
        <Text>Task not found</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      {isEditing ? (
        <TaskForm
          initialValues={{
            title: task.title,
            description: task.description || '',
            dueDate: task.dueDate,
          }}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <>
          {/* Fixed Header Section */}
          <View style={styles.header}>
            <Text style={styles.title}>{task.title}</Text>

            <View style={styles.dateRow}>
              <View style={styles.dateContainer}>
                <Text style={styles.dateLabel}>Due Date</Text>
                <Text style={styles.dateValue}>
                  {new Date(task.dueDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </View>

              <View style={styles.dateContainer}>
                <Text style={styles.dateLabel}>Created</Text>
                <Text style={styles.dateValue}>
                  {new Date(task.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </View>
            </View>
          </View>

          {/* Scrollable Description Only */}
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={{ paddingBottom: 20 }} // Extra space at bottom
          >
            <Text style={styles.description}>
              {task.description || 'No description provided'}
            </Text>
          </ScrollView>

          {/* Fixed Footer Buttons */}
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.deleteButton, isDeleting && styles.disabledButton]}
              onPress={() => setShowDeleteDialog(true)}
              disabled={isDeleting}
            >
              <Text style={styles.buttonText}>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <ConfirmationDialog
        visible={showDeleteDialog}
        title="Delete Task"
        message="Are you sure you want to delete this task?"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f8f9fa',
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2d3436',
    marginBottom: 20,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  dateContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#636e72',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 15,
    color: '#2d3436',
  },
  scrollContainer: {
    height: 200, // Fixed height for scrollable area
    borderWidth: 1,
    borderColor: '#dfe6e9',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#ffffff',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#636e72',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#dfe6e9',
  },
  editButton: {
    backgroundColor: '#0984e3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
  },
  deleteButton: {
    backgroundColor: '#d63031',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
export default TaskDetailScreen;