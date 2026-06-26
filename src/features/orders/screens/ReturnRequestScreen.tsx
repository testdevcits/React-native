import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { AppText } from '../../../components/AppText';
import { AppButton } from '../../../components/AppButton';
import { AppInput } from '../../../components/AppInput';
import { useReturnsStore } from '../../returns/store/returnsStore';

export const ReturnRequestScreen = ({ route, navigation }: any) => {
  const { orderId, order } = route.params;
  const { createReturnRequest, isLoading } = useReturnsStore();

  const [selectedReason, setSelectedReason] = useState<'defective' | 'wrong_item' | 'not_needed' | 'other'>('defective');
  const [selectedResolution, setSelectedResolution] = useState<'refund' | 'replacement'>('refund');
  const [description, setDescription] = useState('');
  
  // Select items to return
  const [itemsToReturn, setItemsToReturn] = useState<Array<{ orderItemId: string; quantity: number }>>(() => {
    // Default to return all items with quantity 1
    return order.items?.map((item: any) => ({
      orderItemId: item.id || item.productId, // Fallback if item.id doesn't exist
      quantity: item.quantity,
    })) || [];
  });

  const reasons = [
    { label: 'Defective / Damaged', value: 'defective' },
    { label: 'Wrong Item Delivered', value: 'wrong_item' },
    { label: 'Not Needed Anymore', value: 'not_needed' },
    { label: 'Other', value: 'other' },
  ];

  const resolutions = [
    { label: 'Refund to Original Mode', value: 'refund' },
    { label: 'Replacement / Exchange', value: 'replacement' },
  ];

  const handleSubmit = async () => {
    if (description.trim().length < 5) {
      Alert.alert('Required', 'Please enter a description (at least 5 characters).');
      return;
    }

    const payload = {
      orderId,
      items: itemsToReturn.map(item => ({
        orderItemId: item.orderItemId,
        quantity: item.quantity,
        reason: selectedReason,
      })),
      reason: selectedReason,
      description,
      resolution: selectedResolution,
      photos: [],
    };

    const success = await createReturnRequest(payload);
    if (success) {
      Alert.alert('Success', 'Return request submitted successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('ReturnsTab'),
        },
      ]);
    } else {
      Alert.alert('Error', 'Failed to submit return request.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.card}>
        <AppText variant="subtitle" color="#2D3748" style={styles.sectionTitle}>
          Select Return Reason
        </AppText>
        {reasons.map((r) => {
          const isSelected = selectedReason === r.value;
          return (
            <TouchableOpacity
              key={r.value}
              style={[styles.optionRow, isSelected && styles.optionSelected]}
              onPress={() => setSelectedReason(r.value as any)}
            >
              <AppText variant="body" color={isSelected ? '#3182CE' : '#4A5568'}>
                {r.label}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.card}>
        <AppText variant="subtitle" color="#2D3748" style={styles.sectionTitle}>
          Select Resolution
        </AppText>
        {resolutions.map((res) => {
          const isSelected = selectedResolution === res.value;
          return (
            <TouchableOpacity
              key={res.value}
              style={[styles.optionRow, isSelected && styles.optionSelected]}
              onPress={() => setSelectedResolution(res.value as any)}
            >
              <AppText variant="body" color={isSelected ? '#3182CE' : '#4A5568'}>
                {res.label}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.card}>
        <AppText variant="subtitle" color="#2D3748" style={styles.sectionTitle}>
          Additional Information
        </AppText>
        <AppInput
          label="Detailed Description"
          placeholder="Please describe the issue in detail"
          multiline
          numberOfLines={4}
          style={styles.descriptionInput}
          value={description}
          onChangeText={setDescription}
        />
      </View>

      <AppButton
        title="Submit Return Request"
        onPress={handleSubmit}
        isLoading={isLoading}
        style={styles.submitBtn}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  sectionTitle: {
    marginBottom: 12,
  },
  optionRow: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  optionSelected: {
    borderColor: '#3182CE',
    backgroundColor: '#EBF8FF',
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  submitBtn: {
    marginVertical: 16,
  },
});
