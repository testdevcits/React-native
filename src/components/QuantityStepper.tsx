import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { colors } from '../utils/colors';
import fonts from '../utils/fonts';

interface QuantityStepperProps {
  value: number;
  onChange: (newValue: number) => void;
  max?: number;
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  value,
  onChange,
  max = 99,
}) => {
  const handleDecrement = () => {
    if (value > 0) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleDecrement}
        style={styles.button}
        activeOpacity={0.7}
      >
        <AppText variant="subtitle" color={colors.textMedium} style={styles.btnText}>
          -
        </AppText>
      </TouchableOpacity>
      <View style={styles.valueContainer}>
        <AppText variant="medium" color={colors.textDark}>
          {value}
        </AppText>
      </View>
      <TouchableOpacity
        onPress={handleIncrement}
        style={styles.button}
        activeOpacity={0.7}
      >
        <AppText variant="subtitle" color={colors.textMedium} style={styles.btnText}>
          +
        </AppText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    height: 36,
  },
  button: {
    width: 32,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.borderLight,
  },
  btnText: {
    fontSize: 18,
    fontFamily: fonts.bold,
    marginTop: -2,
  },
  valueContainer: {
    paddingHorizontal: 12,
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
