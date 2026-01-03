import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/lib/supabase';
import { spacing, borderRadius } from '@/constants/theme';

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'recipeapp://reset-password',
      });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert(
          'Check Your Email',
          'If an account exists with this email, you will receive a password reset link.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter your email and we'll send you a link to reset your password.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                accessibilityLabel="Email input"
              />
            </View>

            <Pressable
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleResetPassword}
              disabled={isLoading}
              accessibilityLabel="Send reset link button"
              accessibilityRole="button"
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Send Reset Link</Text>
              )}
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Remember your password? </Text>
            <Link href="/(auth)/login" asChild>
              <Pressable>
                <Text style={styles.linkText}>Sign In</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    keyboardView: {
      flex: 1,
    },
    content: {
      flex: 1,
      padding: spacing.lg,
      justifyContent: 'center',
    },
    header: {
      marginBottom: spacing.xl,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: spacing.sm,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      lineHeight: 22,
    },
    form: {
      gap: spacing.md,
    },
    inputContainer: {
      gap: spacing.xs,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
    },
    input: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      fontSize: 16,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      alignItems: 'center',
      marginTop: spacing.sm,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: spacing.xl,
    },
    footerText: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    linkText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '500',
    },
  });
