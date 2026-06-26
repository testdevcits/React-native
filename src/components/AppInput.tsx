import React, { forwardRef, useState } from 'react';
import { View, TextInput, TextInputProps, StyleSheet, TouchableOpacity } from 'react-native';
import { AppText } from './AppText';
import { colors } from '../utils/colors';
import { Eye, EyeOff } from 'lucide-react-native';
import fonts from '../utils/fonts';

interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: any;
  leftIcon?: React.ReactNode;
  isPassword?: boolean;
}

export const AppInput = forwardRef<TextInput, AppInputProps>(
  ({ label, error, containerStyle, style, leftIcon, isPassword = false, secureTextEntry, ...props }, ref) => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const isSecure = isPassword && !passwordVisible;

    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <AppText variant="medium" color={colors.textMedium} style={styles.label}>
            {label}
          </AppText>
        )}
        <View style={[
          styles.inputWrapper,
          isFocused ? styles.inputWrapperFocused : null,
          error ? styles.inputWrapperError : null,
        ]}>
          {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
          
          <TextInput
            ref={ref}
            style={[styles.input, style]}
            placeholderTextColor={colors.textMuted}
            secureTextEntry={isSecure}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />

          {isPassword && (
            <TouchableOpacity
              onPress={() => setPasswordVisible(!passwordVisible)}
              style={styles.rightIconContainer}
              activeOpacity={0.7}
            >
              {passwordVisible ? (
                <EyeOff size={20} color={colors.textLight} />
              ) : (
                <Eye size={20} color={colors.textLight} />
              )}
            </TouchableOpacity>
          )}
        </View>
        
        {error && (
          <AppText variant="caption" color={colors.danger} style={styles.errorText}>
            {error}
          </AppText>
        )}
      </View>
    );
  }
);

AppInput.displayName = 'AppInput';

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    width: '100%',
  },
  label: {
    marginBottom: 6,
    fontFamily: fonts.medium,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    borderRadius: 14,
    backgroundColor: colors.bgLight,
    paddingHorizontal: 14,
  },
  inputWrapperFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  inputWrapperError: {
    borderColor: colors.danger,
  },
  leftIconContainer: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: colors.textDark,
    fontFamily: fonts.regular,
    padding: 0, // Reset vertical padding for android vertical alignment
  },
  rightIconContainer: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    paddingHorizontal: 4,
  },
  errorText: {
    marginTop: 4,
    marginLeft: 4,
    fontFamily: fonts.regular,
  },
});
