import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/hooks/useTheme';

export default function Index() {
  const { session, isLoading } = useAuthStore();
  const { colors } = useTheme();

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (session) {
    return <Redirect href="/(tabs)" />;
  }

  // Redirect to welcome/landing screen for unauthenticated users
  return <Redirect href="/(auth)/welcome" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
