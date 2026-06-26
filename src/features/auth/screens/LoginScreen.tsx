import React from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock } from 'lucide-react-native';
import { AppText } from '../../../components/AppText';
import { AppInput } from '../../../components/AppInput';
import { AppButton } from '../../../components/AppButton';
import { useAuthStore } from '../store/authStore';
import { colors } from '../../../utils/colors';
import fonts from '../../../utils/fonts';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginScreen = ({ navigation }: any) => {
  const { login, isLoading, error, validationErrors, clearErrors } = useAuthStore();
  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  React.useEffect(() => {
    return () => clearErrors();
  }, [clearErrors]);

  const onSubmit = async (data: LoginFormValues) => {
    await login(data);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Soft visual accent overlay */}
        <View style={styles.accentCircle} />
        
        <View style={styles.card}>
          <View style={styles.headerContainer}>
            <AppText variant="header" color={colors.primary} style={styles.headerTitle}>
              ShopCraft
            </AppText>
            <AppText variant="body" color={colors.textLight} style={styles.subtitle}>
              Welcome back! Please login to your account.
            </AppText>
          </View>

          <View style={styles.formContainer}>
            {error && (
              <View style={styles.errorBox}>
                <AppText variant="caption" color={colors.dangerText} style={styles.errorText}>
                  {error}
                </AppText>
              </View>
            )}

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <AppInput
                  label="Email Address"
                  placeholder="E.g. buyer@test.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.email?.message || validationErrors?.email}
                  leftIcon={<Mail size={18} color={colors.textLight} />}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <AppInput
                  label="Password"
                  placeholder="••••••••"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.password?.message || validationErrors?.password}
                  leftIcon={<Lock size={18} color={colors.textLight} />}
                  isPassword
                />
              )}
            />

            <AppButton
              title="Sign In"
              onPress={handleSubmit(onSubmit)}
              isLoading={isLoading}
              style={styles.submitBtn}
            />

            <View style={styles.footer}>
              <AppText variant="body" color={colors.textLight}>
                Don't have an account?{' '}
              </AppText>
              <TouchableOpacity onPress={() => navigation.navigate('Register')} activeOpacity={0.7}>
                <AppText variant="medium" color={colors.primary}>
                  Sign Up
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgLight,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    position: 'relative',
  },
  accentCircle: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.primaryLight,
    opacity: 0.5,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  headerContainer: {
    marginBottom: 28,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: fonts.extraBold,
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 20,
  },
  formContainer: {
    width: '100%',
  },
  errorBox: {
    backgroundColor: colors.dangerBg,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  errorText: {
    fontFamily: fonts.medium,
  },
  submitBtn: {
    marginTop: 16,
    height: 50,
    borderRadius: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
});
