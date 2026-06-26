import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { colors } from '../utils/colors';
import fonts from '../utils/fonts';

interface AppTextProps extends TextProps {
  variant?: 'caption' | 'body' | 'medium' | 'title' | 'subtitle' | 'header' | 'bold';
  color?: string;
}

export const AppText: React.FC<AppTextProps> = ({
  children,
  style,
  variant = 'body',
  color = colors.textDark,
  ...props
}) => {
  return (
    <Text style={[styles[variant], { color }, style]} {...props}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  caption: {
    fontSize: 12,
    fontFamily: fonts.regular,
    letterSpacing: 0.2,
  },
  body: {
    fontSize: 14,
    fontFamily: fonts.regular,
    lineHeight: 20,
  },
  medium: {
    fontSize: 14,
    fontFamily: fonts.medium,
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    letterSpacing: 0.1,
  },
  title: {
    fontSize: 18,
    fontFamily: fonts.bold,
    letterSpacing: 0.1,
  },
  header: {
    fontSize: 24,
    fontFamily: fonts.extraBold,
    letterSpacing: 0.2,
  },
  bold: {
    fontSize: 14,
    fontFamily: fonts.bold,
  },
});
