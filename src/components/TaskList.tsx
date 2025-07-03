import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { Task } from '../types';

interface TaskListProps {
  tasks: Task[];
  onTaskPress: (taskId: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onTaskPress }) => {
  return (
    <FlatList
      data={tasks}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity 
          style={styles.taskItem}
          onPress={() => onTaskPress(item.id)}
        >
          <Text style={styles.taskTitle}>{item.title}</Text>
          {item.description && <Text style={styles.taskDescription}>{item.description}</Text>}
          <Text style={styles.taskDueDate}>
            Due: {new Date(item.dueDate).toLocaleDateString()}
            {item.completed && ' - Completed'}
          </Text>
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No tasks found</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  taskItem: {
    padding: 15,
    // borderBottomWidth: 1,
    // borderBottomColor: '#eee',
    backgroundColor: 'white',
    marginBottom: 5,
    borderRadius: 5,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  taskDescription: {
    color: '#666',
    marginVertical: 5,
  },
  taskDueDate: {
    color: '#888',
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
});

export default TaskList;