import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Task } from '../types';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { format, parse } from 'date-fns';
import CustomDateTimePicker from './CustomDateTimePicker';
import { useNavigation } from '@react-navigation/native';
const { width, height } = Dimensions.get('window');


interface TaskFormProps {
  initialValues?: Partial<Task>;
  onSubmit: (values: {header:string, title: string; description: string; dueDate: string }) => void;
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
        try {
          const date = parse(value, 'yyyy-MM-dd hh:mm a', new Date());
          return !isNaN(date.getTime());
        } catch {
          return false;
        }
      }
    )
});

const TaskForm: React.FC<TaskFormProps> = ({ initialValues, onSubmit, onCancel }) => {
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const navigation = useNavigation();

  const [selectedDate, setSelectedDate] = useState<Date>(
    initialValues?.dueDate
      ? parse(initialValues.dueDate, 'yyyy-MM-dd hh:mm a', new Date())
      : new Date()
  );

  const handleDateConfirm = (date: Date, setFieldValue: (field: string, value: string) => void) => {
    setSelectedDate(date);
    setFieldValue('dueDate', format(date, 'yyyy-MM-dd hh:mm a'));
    setDatePickerOpen(false);
  };
  return (
    <Formik
      initialValues={{
        header: initialValues?.header,
        mode: initialValues?.mode,
        title: initialValues?.title || '',
        description: initialValues?.description || '',
        dueDate: initialValues?.dueDate || format(new Date(), 'yyyy-MM-dd hh:mm a'),
      }}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
        <View style={values.mode != 'edit' ? styles.container : styles.editContainer}>
          <View style={styles.header}>
            <Text style={styles.formTitle}>{values.header}</Text>
            {onCancel && (
              <TouchableOpacity onPress={onCancel} style={values.mode != 'edit' ? styles.closeButtonNone : styles.closeButton}>
                <MaterialIcons name="close" size={24} color="#636e72" />
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

          <TouchableOpacity onPress={() => setDatePickerOpen(true)}>
            <TextInput
              style={[
                styles.input,
                touched.dueDate && errors.dueDate ? styles.inputError : null
              ]}
              placeholder="YYYY-MM-DD HH:MM AM/PM"
              placeholderTextColor="#95a5a6"
              value={values.dueDate}
              editable={false}
              pointerEvents="none"
            />
          </TouchableOpacity>

          {touched.dueDate && errors.dueDate && (
            <Text style={styles.error}>{errors.dueDate}</Text>
          )}


          <CustomDateTimePicker
            isVisible={datePickerOpen}
            selectedDate={selectedDate}
            onConfirm={(date) => handleDateConfirm(date, setFieldValue)}
            onCancel={() => setDatePickerOpen(false)}
            setFieldValue={setFieldValue}  // Pass the Formik setFieldValue
          />

          <View style={values.header == 'Add Task' ? styles.buttonContainer : styles.singlebuttonContainer}>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Save</Text>
            </TouchableOpacity>

            {values.header == 'Add Task' && <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Home' }]
                });
              }}
            >
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            }
          </View>
        </View>
      )}
    </Formik>
  );
};


const styles = StyleSheet.create({
  container: {
    height: height,
    padding: 24,
    backgroundColor: '#ffffff',
    // borderRadius: 12,
    // shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  editContainer: {
    padding: 24,
    backgroundColor: '#ffffff',
    // borderRadius: 12,
    // shadowColor: '#000',
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
  closeButtonNone: {
    // padding: 4,
    display: 'none'
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
    // borderWidth: 1,
    borderColor: '#dfe6e9',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 15,
    color: '#747e81ff',
    backgroundColor: '#ebeef0ff',
    // backgroundColor: '#f8f9fa',
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
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  singlebuttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  submitButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 40,
    backgroundColor: '#0984e3',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    // borderRadius: 40,
    // backgroundColor: '#0984e3',
  },
  submitButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default TaskForm;

