import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

type TabBarIconProps = {
  color: string;
  size: number;
  focused: boolean;
};

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Recipes',
          tabBarIcon: ({ color, size }: TabBarIconProps) => (
            <Ionicons name="book-outline" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: 'Recipes tab',
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, size }: TabBarIconProps) => (
            <Ionicons name="compass-outline" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: 'Discover tab',
        }}
      />
      <Tabs.Screen
        name="meal-plan"
        options={{
          title: 'Meal Plan',
          tabBarIcon: ({ color, size }: TabBarIconProps) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: 'Meal plan tab',
        }}
      />
      <Tabs.Screen
        name="grocery"
        options={{
          title: 'Grocery',
          tabBarIcon: ({ color, size }: TabBarIconProps) => (
            <Ionicons name="cart-outline" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: 'Grocery tab',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }: TabBarIconProps) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
          tabBarAccessibilityLabel: 'Profile tab',
        }}
      />
    </Tabs>
  );
}
