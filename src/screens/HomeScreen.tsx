import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Modal, SafeAreaView, Alert, Dimensions } from 'react-native';
import { useTasks } from '../services/taskService';
import { useAuth } from '../services/authService';
import TaskForm from '../components/TaskForm';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import Icon from 'react-native-vector-icons/MaterialIcons';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { tasks, loading, addTask, updateTask, refreshTasks, deleteTask } = useTasks(user?.id || '');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [selectedTaskValue, setSelectedTaskValue] = useState({ title: '', description: '', dueDate: '' });
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [mode, setMode] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refreshTasks(user?.id);
    });
    return unsubscribe;
  }, [navigation, refreshTasks, user?.id]);

  const handleAddTask = async (values: { title: string; description: string; dueDate: string }) => {
    try {
      await addTask(user?.id || '', values);
      setShowFormModal(false);
      refreshTasks(user?.id || '');
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  const handleUpdate = async (values: { title: string; description: string; dueDate: string }) => {
    await updateTask(selectedTask || '', user?.id || '', values);
    setIsEditing(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshTasks(user?.id || '');
    setIsRefreshing(false);
  };

  const handleTaskOptions = (taskId: string, event: any, values: any) => {
    const { pageX, pageY } = event.nativeEvent;
    setMenuPosition({
      x: pageX - 100,
      y: pageY - 100,
    });
    setSelectedTask(taskId);
    setSelectedTaskValue(values);
    setMode('new');
    setSelectedOption(null);
    setShowMenu(true);
  };

  const handleEdit = () => {
    setSelectedOption('edit');
    setTimeout(() => {
      setShowMenu(false);
      setShowFormModal(true);
      setMode('edit');
    }, 300);
  };

  const triggerEdit = async (values: { title: string; description: string; dueDate: string }) => {
    if (selectedTask) {
      await updateTask(selectedTask, user?.id || '', values);
      setIsEditing(false);
      setMode('new');
      setShowFormModal(false);
      refreshTasks(user?.id || '');
    }
  };

  const handleDelete = () => {
    setSelectedOption('delete');
    setTimeout(async () => {
      setShowMenu(false);
      if (selectedTask) {
        try {
          await deleteTask(selectedTask);
          refreshTasks(user?.id || '');
        } catch (error) {
          console.error('Failed to delete task:', error);
        }
      }
    }, 300);
  };

  if (loading && !isRefreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView scrollEnabled={false} style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: '#1E3BA3' }]}>Tasks Management</Text>
      </View>

      {/* Scrollable Content */}
      <View style={styles.listContainer} scrollEnabled={true}>
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.taskItemContainer}>
              <TouchableOpacity
                style={[
                  styles.taskItem,
                  styles.taskCard,
                  item.completed && { borderLeftColor: '#2ecc71' }
                ]}
                onPress={() => navigation.navigate('TaskDetail', {
                  taskId: item.id,
                  onTaskDeleted: refreshTasks
                })}
              >
                <View style={styles.taskHeader}>
                  <Text style={styles.taskTitle}>{item.title}</Text>
                  <TouchableOpacity
                    onPress={(e) => handleTaskOptions(item.id, e, item)}
                    style={styles.taskOptionsButton}
                  >
                    <Icon name="more-vert" size={24} color="#888" />
                  </TouchableOpacity>
                </View>
                {item.description && (
                  <Text style={styles.taskDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                )}
                <Text style={styles.taskDueDate}>
                  {new Date(item.dueDate).toLocaleDateString('en-US', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  }).replace(/(\d+)\/(\d+)\/(\d+),?/, '$2/$1/$3 ')}
                  {item.completed && (
                    <Text style={styles.completedText}> ✓ Completed</Text>
                  )}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No tasks found{"\n"}
                Tap "Add Task" to create your first task
              </Text>
            </View>
          }
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={styles.listContent}
        />
      </View>

      {/* Custom Menu */}
      {showMenu && (
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={[styles.menuContainer, { left: menuPosition.x, top: menuPosition.y }]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleEdit}
            >
              {selectedOption === 'edit' && <Icon name="check" size={18} color="rgb(45, 52, 54)" style={styles.checkIcon} />}
              <Text style={styles.menuItemText}>Edit</Text>
              
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleDelete}
            >
              {selectedOption === 'delete' && <Icon name="check" size={18} color="rgb(45, 52, 54)" style={styles.checkIcon} />}

              <Text style={[styles.menuItemText, styles.deleteText]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      {/* Fixed Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="home" size={24} color="#888" />
          <Text style={[styles.navText, { color: '#888' }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="miscellaneous-services" size={24} color="#888" />
          <Text style={styles.navText}>Service</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="notifications" size={24} color="#888" />
          <Text style={styles.navText}>Activity</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => {
            setMode('new');
            setShowFormModal(true);
          }}
        >
          <View style={styles.addTaskContainer}>
            <Icon name="add" size={24} color="#888" />
            <Text style={[styles.navText, { color: '#888' }]}>Add Task</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Task Form Modal */}
      <Modal
        visible={showFormModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFormModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TaskForm
              onSubmit={mode === 'edit' ? triggerEdit : handleAddTask}
              onCancel={() => setShowFormModal(false)}
              initialValues={mode === 'edit' ? {
                title: selectedTaskValue.title,
                description: selectedTaskValue.description,
                dueDate: selectedTaskValue.dueDate 
              } : {
                title: '',
                description: '',
                dueDate: `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`
              }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#ffffff',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  listContainer: {
    maxHeight: '85%',
    flex: 1,
    paddingTop: 50,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 9,
  },
  taskItemContainer: {
    paddingHorizontal: 9,
    marginBottom: 12,
  },
  taskItem: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskTitle: {
    fontSize: 15,
    color: '#2d3436',
  },
  taskOptionsButton: {
    padding: 4,
    marginLeft: 8,
  },
  taskDescription: {
    fontSize: 14,
    color: '#636e72',
    lineHeight: 20,
    marginBottom: 8,
  },
  taskDueDate: {
    fontSize: 14,
    color: '#636e72',
  },
  completedText: {
    color: '#2ecc71',
    fontWeight: '500',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    textAlign: 'center',
    color: '#95a5a6',
    fontSize: 16,
    lineHeight: 24,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  taskCard: {
    borderLeftWidth: 0,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  navItem: {
    alignItems: 'center',
    padding: 8,
    flex: 1,
  },
  navText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  addTaskContainer: {
    alignItems: 'center',
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 100,
  },
  menuContainer: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 100,
    zIndex: 101,
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 15,
  },
  deleteText: {
    // color: '#e74c3c',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 4,
  },
  checkIcon: {
    marginLeft: 0,
  },
});

export default HomeScreen;