import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/constants/theme';

export default function GroceryScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Grocery List</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.emptyState}>
          <Ionicons name="cart-outline" size={64} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No grocery lists</Text>
          <Text style={styles.emptySubtitle}>
            Generate a list from your meal plan
          </Text>
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
    header: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.lg,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: 100,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      marginTop: spacing.md,
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: spacing.xs,
      textAlign: 'center',
    },
  });
