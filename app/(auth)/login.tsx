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

export default function LoginScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter your email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        Alert.alert('Login Failed', error.message);
      } else {
        router.replace('/(tabs)');
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
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
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

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
                accessibilityLabel="Password input"
              />
            </View>

            <Link href="/(auth)/forgot-password" asChild>
              <Pressable style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </Pressable>
            </Link>

            <Pressable
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              accessibilityLabel="Sign in button"
              accessibilityRole="button"
            >
              {isLoading ? (
                <ActivityIndicator color={colors.text} />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Link href="/(auth)/signup" asChild>
              <Pressable>
                <Text style={styles.linkText}>Sign Up</Text>
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
      marginBottom: spacing.xs,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
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
    forgotPassword: {
      alignSelf: 'flex-end',
    },
    forgotPasswordText: {
      color: colors.primary,
      fontSize: 14,
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
