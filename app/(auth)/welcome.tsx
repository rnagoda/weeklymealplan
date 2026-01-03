import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/constants/theme';

export default function WelcomeScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <View style={styles.iconContainer}>
            <Ionicons name="restaurant" size={64} color={colors.primary} />
          </View>
          <Text style={styles.title}>Recipe App</Text>
          <Text style={styles.subtitle}>
            Save recipes, plan meals, and create grocery lists with ease
          </Text>
        </View>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Ionicons name="book-outline" size={24} color={colors.primary} />
            <Text style={styles.featureText}>Organize your recipes</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="calendar-outline" size={24} color={colors.primary} />
            <Text style={styles.featureText}>Plan your weekly meals</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="cart-outline" size={24} color={colors.primary} />
            <Text style={styles.featureText}>Generate grocery lists</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="people-outline" size={24} color={colors.primary} />
            <Text style={styles.featureText}>Share with friends</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Link href="/(auth)/signup" asChild>
            <Pressable
              style={styles.primaryButton}
              accessibilityLabel="Get started"
              accessibilityRole="button"
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
            </Pressable>
          </Link>

          <Link href="/(auth)/login" asChild>
            <Pressable
              style={styles.secondaryButton}
              accessibilityLabel="Sign in to existing account"
              accessibilityRole="button"
            >
              <Text style={styles.secondaryButtonText}>
                Already have an account? Sign In
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      padding: spacing.lg,
      justifyContent: 'space-between',
    },
    hero: {
      alignItems: 'center',
      paddingTop: spacing.xxl,
    },
    iconContainer: {
      width: 120,
      height: 120,
      borderRadius: borderRadius.xl,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    title: {
      fontSize: 36,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: spacing.sm,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      paddingHorizontal: spacing.lg,
    },
    features: {
      gap: spacing.md,
    },
    feature: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      gap: spacing.md,
    },
    featureText: {
      fontSize: 16,
      color: colors.text,
    },
    actions: {
      gap: spacing.md,
      paddingBottom: spacing.lg,
    },
    primaryButton: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      alignItems: 'center',
    },
    primaryButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '600',
    },
    secondaryButton: {
      padding: spacing.md,
      alignItems: 'center',
    },
    secondaryButtonText: {
      color: colors.primary,
      fontSize: 16,
    },
  });
