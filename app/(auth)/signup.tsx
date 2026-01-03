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
  ScrollView,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/lib/supabase';
import { spacing, borderRadius } from '@/constants/theme';

export default function SignupScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (!displayName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            display_name: displayName.trim(),
          },
        },
      });

      if (error) {
        Alert.alert('Signup Failed', error.message);
      } else if (data.session) {
        // User is immediately signed in (email confirmation disabled)
        router.replace('/(tabs)');
      } else if (data.user && !data.session) {
        // Email confirmation is required
        Alert.alert(
          'Check Your Email',
          'We sent you a confirmation link. Please check your email to verify your account.',
          [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Start organizing your recipes</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Display Name</Text>
                <TextInput
                  style={styles.input}
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="How should we call you?"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="words"
                  autoComplete="name"
                  accessibilityLabel="Display name input"
                />
              </View>

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
                  placeholder="Create a password"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="new-password"
                  accessibilityLabel="Password input"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm your password"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="new-password"
                  accessibilityLabel="Confirm password input"
                />
              </View>

              <Pressable
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleSignup}
                disabled={isLoading}
                accessibilityLabel="Create account button"
                accessibilityRole="button"
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Create Account</Text>
                )}
              </Pressable>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <Pressable>
                  <Text style={styles.linkText}>Sign In</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
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
    scrollContent: {
      flexGrow: 1,
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
