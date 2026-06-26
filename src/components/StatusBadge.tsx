import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { colors } from '../utils/colors';
import fonts from '../utils/fonts';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const normalized = status.toLowerCase();
  
  let backgroundColor = colors.bgCard;
  let textColor = colors.textMedium;

  if (normalized === 'pending' || normalized === 'requested') {
    backgroundColor = colors.warningBg;
    textColor = colors.warningText;
  } else if (normalized === 'confirmed' || normalized === 'approved' || normalized === 'completed' || normalized === 'delivered') {
    backgroundColor = colors.successBg;
    textColor = colors.successText;
  } else if (normalized === 'processing' || normalized === 'shipped') {
    backgroundColor = colors.primaryLight;
    textColor = colors.primary;
  } else if (normalized === 'cancelled' || normalized === 'rejected') {
    backgroundColor = colors.dangerBg;
    textColor = colors.dangerText;
  }

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <AppText variant="caption" color={textColor} style={styles.text}>
        {status.toUpperCase()}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 0.5,
  },
});
