import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { spacing, borderRadius } from '@/constants/theme';

export default function RecipesScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Recipes</Text>
        <Pressable
          style={styles.addButton}
          onPress={() => router.push('/recipe/create')}
          accessibilityLabel="Add new recipe"
          accessibilityRole="button"
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.emptyState}>
          <Ionicons name="book-outline" size={64} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No recipes yet</Text>
          <Text style={styles.emptySubtitle}>
            Start building your recipe collection
          </Text>
          <Pressable
            style={styles.emptyButton}
            onPress={() => router.push('/recipe/create')}
            accessibilityLabel="Create your first recipe"
            accessibilityRole="button"
          >
            <Text style={styles.emptyButtonText}>Add Your First Recipe</Text>
          </Pressable>
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
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
    },
    addButton: {
      backgroundColor: colors.primary,
      width: 40,
      height: 40,
      borderRadius: borderRadius.full,
      justifyContent: 'center',
      alignItems: 'center',
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
    emptyButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      marginTop: spacing.lg,
    },
    emptyButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });
