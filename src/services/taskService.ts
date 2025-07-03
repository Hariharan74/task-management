import { useState, useEffect } from 'react';
import { storeData, getData } from '../utils/storage';
import { Task } from '../types';
import { useAuth } from './authService';
export const useTasks = (userId:string) => {
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  // Add refresh capability
  const refreshTasks = async (currentUserId = userId) => {
    setLoading(true);
    try {
      const storedTasks = await getData(`tasks_${currentUserId}`);
      setTasks(storedTasks ? JSON.parse(storedTasks) : []);
    } catch (error) {
      console.error('Failed to refresh tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshTasks(userId);
  }, [userId]);

  const addTask = async (currentUserId=userId,task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      completed: false,
    };
    const updatedTasks = [...tasks, newTask];
    await storeData(`tasks_${currentUserId}`, JSON.stringify(updatedTasks));
    setTasks(updatedTasks);
    return newTask;
  };

  const updateTask = async (taskId: string,currentUserId=userId, updates: Partial<Task>) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    );
    await storeData(`tasks_${currentUserId}`, JSON.stringify(updatedTasks));
    setTasks(updatedTasks);
  };

  const deleteTask = async (taskId: string,currentUserId = userId) => {
    try {
      // Optimistic update
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);
      
      // Persist to storage
      const res = await storeData(`tasks_${currentUserId}`, JSON.stringify(updatedTasks));
      // refreshTasks()
      return true;
    } catch (error) {
      // Revert on error
      setTasks(tasks);
      console.error('Delete failed:', error);
      return false;
    }
  };

  return { 
    tasks, 
    loading, 
    addTask, 
    updateTask, 
    deleteTask,
    refreshTasks  // Expose refresh function
  };
};