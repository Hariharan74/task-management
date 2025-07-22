import React, { useState, useEffect } from 'react';
import { Modal, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import DateTimePicker from 'react-native-date-picker';


const CustomDateTimePicker = ({
  isVisible,
  selectedDate,
  onConfirm,
  onCancel,
  setFieldValue,
}) => {
  // Track the current date in state
  const [currentDate, setCurrentDate] = useState(new Date(selectedDate));

  useEffect(() => {
    setCurrentDate(new Date(selectedDate));
  }, [selectedDate, isVisible]);

  const handleDateChange = (newDate: Date) => {
    setCurrentDate(new Date(newDate));
  };

  const handleConfirm = () => {
    onConfirm(currentDate);  // Just call onConfirm with the date
    // Don't call setFieldValue here - let the parent handle it
  };

  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.headerText}>Select Date</Text>

          <DateTimePicker
            date={currentDate}
            mode="datetime"
            onDateChange={handleDateChange}
            minimumDate={new Date()}
            minuteInterval={1}
            androidVariant="iosClone"
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={onCancel} style={styles.buttonSpacing}>
              <Text style={styles.cancelText}>cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm} style={styles.buttonSpacing}>
              <Text style={styles.confirmText}>ok</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};


const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  headerText: {
    alignSelf: 'flex-start',
    fontSize: 18,
    // fontWeight: 'bold',
    color: '#1E3BA3', // Blue color
    marginBottom: 15,
  },
  pickerContainer: {
    transform: [{ scale: 0.9 }], // Reduce size by 10%
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    marginTop: 15,
    paddingHorizontal: 20,
  },
  buttonSpacing: {
    marginLeft: 20, // Space between buttons
  },
  cancelText: {
    color: '#1E3BA3', // Blue color
    fontSize: 15,
  },
  confirmText: {
    color: '#1E3BA3', // Blue color
    fontSize: 15,
  },
});
export default CustomDateTimePicker;