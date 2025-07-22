import React from 'react';
import { ScrollView, View, Text, StyleSheet, Button, TouchableOpacity, ActivityIndicator, Dimensions, Image } from 'react-native';
import TaskForm from '../components/TaskForm';
import { useAuth } from '../services/authService';
import { useTasks } from '../services/taskService';
import Icon from 'react-native-vector-icons/MaterialIcons';
const { width, height } = Dimensions.get('window');
const Taskscreen = ({ navigation }) => {
    const { user, logout } = useAuth();
    const { tasks, loading, addTask, updateTask, refreshTasks, deleteTask } = useTasks(user?.id || '');
    const handleAddTask = async (values: { header: string, title: string; description: string; dueDate: string }) => {
        try {
            await addTask(user?.id || '', values);
            refreshTasks(user?.id || '');
            if (values.header == 'Add Task') {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Home' }]
                });
            }
        } catch (error) {
            console.error('Failed to add task:', error);
        }
    };
    return (
        <View style={styles.container}>
            <TaskForm
                initialValues={{
                    header: 'Add Task',
                    mode: 'add',
                    title: '',
                    description: '',
                    dueDate: '',
                }}
                onSubmit={handleAddTask}
                onCancel={() => false}
            />
            <View style={styles.bottomNav}>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => {
                        navigation.navigate('Home')
                    }}
                >
                    {/* <Icon name="home" size={24} color="#888" /> */}
                    <Image
                            source={require('../assets/Home.png')}
                            style={{ width: 24, height: 24 }}

                        />
                    <Text style={[styles.navText, { color: '000000' }]}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    {/* <Icon name="miscellaneous-services" size={24} color="#888" /> */}
                    <Image
                            source={require('../assets/Service.png')}
                            style={{ width: 24, height: 24 }}

                        />
                    <Text style={styles.navText}>Service</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    {/* <Icon name="notifications" size={24} color="#888" /> */}
                    <Image
                            source={require('../assets/Activity.png')}
                            style={{ width: 24, height: 24 }}

                        />
                    <Text style={styles.navText}>Activity</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => {


                    }}
                >
                    <View style={styles.addTaskContainer}>
                        {/* <Icon name="add" size={24} color="#888" /> */}
                        <Image
                            source={require('../assets/TaskAdd.png')}
                            style={{ width: 24, height: 24 }}

                        />
                        <Text style={[styles.navText, { color: '#000000' }]}>Add Task</Text>
                    </View>
                </TouchableOpacity>
            </View>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        height: height,
        width: width,
        // padding: 24,
        backgroundColor: '#f8f9fa',
    },
    loadingContainer: {
        height: '100%',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa', // Match your container background
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
        color: '000000',
        marginTop: 4,
    },
    addTaskContainer: {
        alignItems: 'center',
    },
});
export default Taskscreen;