import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import { spacing, borderRadius } from '@/constants/theme';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user, profile, signOut: clearAuth } = useAuthStore();
  const styles = createStyles(colors);

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          clearAuth();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color={colors.textMuted} />
          </View>
          <Text style={styles.displayName}>
            {profile?.display_name || 'User'}
          </Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <View style={styles.menuSection}>
          <Pressable
            style={styles.menuItem}
            accessibilityLabel="Edit profile"
            accessibilityRole="button"
          >
            <Ionicons name="person-outline" size={24} color={colors.text} />
            <Text style={styles.menuItemText}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </Pressable>

          <Pressable
            style={styles.menuItem}
            accessibilityLabel="Settings"
            accessibilityRole="button"
          >
            <Ionicons name="settings-outline" size={24} color={colors.text} />
            <Text style={styles.menuItemText}>Settings</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </Pressable>

          <Pressable
            style={styles.menuItem}
            accessibilityLabel="Friends"
            accessibilityRole="button"
          >
            <Ionicons name="people-outline" size={24} color={colors.text} />
            <Text style={styles.menuItemText}>Friends</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </Pressable>
        </View>

        <Pressable
          style={styles.signOutButton}
          onPress={handleSignOut}
          accessibilityLabel="Sign out"
          accessibilityRole="button"
        >
          <Ionicons name="log-out-outline" size={24} color={colors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
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
    profileSection: {
      alignItems: 'center',
      paddingVertical: spacing.xl,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: borderRadius.full,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    displayName: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
    },
    email: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    menuSection: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      overflow: 'hidden',
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    menuItemText: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      marginLeft: spacing.md,
    },
    signOutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.md,
      marginTop: spacing.xl,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
    },
    signOutText: {
      fontSize: 16,
      color: colors.error,
      marginLeft: spacing.sm,
      fontWeight: '500',
    },
  });
