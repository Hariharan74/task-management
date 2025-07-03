import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Task } from '../types';
import { Ionicons } from '@expo/vector-icons';

interface TaskFormProps {
  initialValues?: Partial<Task>;
  onSubmit: (values: { title: string; description: string; dueDate: string }) => void;
  onCancel?: () => void;
}


const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  description: Yup.string(),
  dueDate: Yup.string()
    .required('Due date is required')
    .test(
      'valid-datetime',
      'Date must be in YYYY-MM-DD HH:MM AM/PM format (e.g. 2025-07-05 02:43 PM)',
      (value) => {
        if (!value) return false;
        
        // Check basic format first
        if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2} [AP]M$/.test(value)) {
          return false;
        }
        
        // Parse the components
        const [dateStr, timeStr, period] = value.split(' ');
        const [hoursStr, minutesStr] = timeStr.split(':');
        
        // Convert to 24-hour format
        let hours = parseInt(hoursStr, 10);
        const minutes = parseInt(minutesStr, 10);
        
        if (period === 'PM' && hours < 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        
        // Validate time components
        if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
          return false;
        }
        
        // Validate date components
        const [year, month, day] = dateStr.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        
        return (
          date.getFullYear() === year &&
          date.getMonth() === month - 1 &&
          date.getDate() === day
        );
      }
    )
});
const TaskForm: React.FC<TaskFormProps> = ({ initialValues, onSubmit, onCancel }) => {
  return (
    <Formik
      initialValues={{
        title: initialValues?.title || '',
        description: initialValues?.description || '',
        dueDate: initialValues?.dueDate || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      }}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.formTitle}>Add Task</Text>
            {onCancel && (
              <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#636e72" />
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.labelContainer}>
            <Text style={styles.label}>Title</Text>
            <Text style={styles.requiredStar}>*</Text>
          </View>
          <TextInput
            style={[
              styles.input,
              touched.title && errors.title ? styles.inputError : null
            ]}
            placeholder="Enter task title"
            placeholderTextColor="#95a5a6"
            onChangeText={handleChange('title')}
            onBlur={handleBlur('title')}
            value={values.title}
          />
          {touched.title && errors.title && (
            <Text style={styles.error}>{errors.title}</Text>
          )}

          <Text style={styles.desclabel}>Description</Text>
          <TextInput
            style={[styles.input, styles.descriptionInput]}
            placeholder="Enter task description"
            placeholderTextColor="#95a5a6"
            onChangeText={handleChange('description')}
            onBlur={handleBlur('description')}
            value={values.description}
            multiline
            numberOfLines={4}
          />

          <View style={styles.labelContainer}>
            <Text style={styles.label}>Due Date</Text>
            <Text style={styles.requiredStar}>*</Text>
          </View>
          <TextInput
            style={[
              styles.input,
              touched.dueDate && errors.dueDate ? styles.inputError : null
            ]}
            placeholder="YYYY-MM-DD HH:MM "
            placeholderTextColor="#95a5a6"
            onChangeText={handleChange('dueDate')}
            onBlur={handleBlur('dueDate')}
            value={values.dueDate}
            keyboardType="numbers-and-punctuation"
          />
          {touched.dueDate && errors.dueDate && (
            <Text style={styles.error}>{errors.dueDate}</Text>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Save Task</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Formik>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    // color: '#2d3436',
    color: '#1E3BA3'
  },
  closeButton: {
    padding: 4,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#636e72',
  },
  desclabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#636e72',
    marginBottom: 8,
  },
  requiredStar: {
    color: '#e74c3c',
    marginLeft: 4,
    fontSize: 14,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#dfe6e9',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 15,
    color: '#2d3436',
    backgroundColor: '#f8f9fa',
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  descriptionInput: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  error: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  submitButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#0984e3',
  },
  submitButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default TaskForm;