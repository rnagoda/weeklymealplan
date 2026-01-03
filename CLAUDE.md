# Recipe App Development Guidelines

## Project Context

This is a cross-platform recipe management application built with **Expo (React Native + Web)** and **Supabase** as the backend. The app enables users to save recipes, plan flexible meals, generate shareable grocery lists, and share recipes with friends, followers, or publicly.

**Primary platform:** Web (via Expo for Web), with iOS/Android as secondary targets.

---

## Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Framework | Expo (SDK 52+) | Managed workflow, file-based routing |
| Routing | Expo Router | File-based navigation in `app/` directory |
| Language | TypeScript | Strict mode enabled |
| State (Client) | Zustand | Persisted with AsyncStorage |
| State (Server) | TanStack Query | Caching, background refetch, optimistic updates |
| Backend | Supabase | Auth, Postgres, Realtime, Storage, Edge Functions |
| Styling | StyleSheet + Theme System | Dark mode default, no external CSS-in-JS |
| Push Notifications | Expo Notifications | Triggered via Supabase Edge Functions |

---

## Core Design Principles

### 1. Component Architecture

- Create small, focused components with single responsibilities
- Separate presentational components from container/screen components
- Use functional components with hooks exclusively (no class components)
- Co-locate related files in feature folders
- Export components as named exports for better tree-shaking

```typescript
// Good: Focused, single-purpose component
export function RecipeCard({ recipe, onPress }: RecipeCardProps) {
  // ...
}

// Bad: Component doing too many things
export function RecipeCardWithEditAndDeleteAndShare() {
  // ...
}
```

### 2. File Structure

Organize code by feature, not by type:

```
recipe-app/
├── app/                          # Expo Router screens
│   ├── (auth)/                   # Auth group (unauthenticated)
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/                   # Main tab navigator
│   │   ├── _layout.tsx
│   │   ├── index.tsx             # Recipe collection
│   │   ├── discover.tsx          # Public recipes
│   │   ├── meal-plan.tsx
│   │   ├── grocery.tsx
│   │   └── profile.tsx
│   ├── recipe/
│   │   ├── [id].tsx              # Dynamic route
│   │   ├── create.tsx
│   │   └── cook/[id].tsx
│   └── _layout.tsx               # Root layout
│
├── components/
│   ├── ui/                       # Generic reusable components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── Modal.tsx
│   ├── recipe/                   # Feature-specific components
│   │   ├── RecipeCard.tsx
│   │   ├── RecipeForm.tsx
│   │   └── IngredientList.tsx
│   ├── meal-plan/
│   └── grocery/
│
├── hooks/                        # Custom hooks
│   ├── useAuth.ts
│   ├── useRecipes.ts
│   ├── useMealPlan.ts
│   └── useRealtimeSubscription.ts
│
├── lib/                          # Core utilities and clients
│   ├── supabase.ts               # Supabase client initialization
│   ├── auth.ts
│   └── storage.ts
│
├── stores/                       # Zustand stores
│   ├── authStore.ts
│   └── uiStore.ts
│
├── types/                        # TypeScript definitions
│   ├── database.ts               # Generated Supabase types
│   └── index.ts
│
├── utils/                        # Pure utility functions
│   ├── ingredient-parser.ts
│   ├── ingredient-aggregator.ts
│   └── fraction-utils.ts
│
└── constants/
    ├── theme.ts
    └── categories.ts
```

### 3. TypeScript Standards

- Use TypeScript for all files (`.ts`, `.tsx`)
- Define proper interfaces for props, state, and API responses
- **Never use `any`** — use `unknown` with type guards instead
- Generate database types from Supabase schema
- Use strict mode in `tsconfig.json`

```typescript
// Good: Properly typed with explicit interfaces
interface RecipeCardProps {
  recipe: Recipe;
  onPress: (id: string) => void;
  showAuthor?: boolean;
}

// Bad: Loose typing
function RecipeCard({ recipe, onPress }: any) { ... }
```

**Generate Supabase types:**
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
```

### 4. State Management

**Client State (Zustand):**
- UI state (modals, filters, theme)
- Session/auth state
- Persisted user preferences

```typescript
// stores/uiStore.ts
import { create } from 'zustand';

interface UIState {
  isShareModalOpen: boolean;
  selectedRecipeId: string | null;
  openShareModal: (recipeId: string) => void;
  closeShareModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isShareModalOpen: false,
  selectedRecipeId: null,
  openShareModal: (recipeId) => set({ isShareModalOpen: true, selectedRecipeId: recipeId }),
  closeShareModal: () => set({ isShareModalOpen: false, selectedRecipeId: null }),
}));
```

**Server State (TanStack Query):**
- All data fetched from Supabase
- Handles caching, background refetch, optimistic updates
- Invalidate queries after mutations

```typescript
// hooks/useRecipes.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useRecipes() {
  return useQuery({
    queryKey: ['recipes', 'own'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select('*, ingredients(*), instructions(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateRecipe() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (recipe: CreateRecipeInput) => {
      // ... insert logic
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });
}
```

### 5. Supabase Patterns

**Client Initialization:**
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const supabase = createClient<Database>(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
```

**Row-Level Security:**
- All data access is controlled via RLS policies in Supabase
- Never bypass RLS — the anon key is safe for client exposure
- Trust that RLS will filter data appropriately

**Realtime Subscriptions:**
```typescript
// Subscribe to grocery list changes for collaboration
useEffect(() => {
  const channel = supabase
    .channel(`grocery-list:${listId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'grocery_items',
        filter: `list_id=eq.${listId}`,
      },
      (payload) => {
        // Handle realtime updates
        queryClient.invalidateQueries({ queryKey: ['grocery-items', listId] });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [listId]);
```

**Storage Uploads:**
```typescript
// lib/storage.ts
export async function uploadRecipeImage(
  userId: string,
  recipeId: string,
  file: Blob
): Promise<string> {
  const filePath = `${userId}/${recipeId}/${Date.now()}.jpg`;
  
  const { error } = await supabase.storage
    .from('recipe-images')
    .upload(filePath, file, { contentType: 'image/jpeg' });
  
  if (error) throw error;
  
  const { data } = supabase.storage
    .from('recipe-images')
    .getPublicUrl(filePath);
  
  return data.publicUrl;
}
```

### 6. Custom Hooks

- Extract reusable logic into custom hooks
- Prefix all hook names with `use`
- Keep hooks focused on a single concern
- Colocate feature-specific hooks with their features

```typescript
// hooks/useAuth.ts
export function useAuth() {
  const { session, setSession, signOut: clearSession } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (!session) {
          queryClient.clear();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    clearSession();
  };

  return { session, signIn, signOut, isAuthenticated: !!session };
}
```

### 7. Styling & Theme System

**Theme Architecture:**
- Dark mode as default
- Support system preference detection
- Allow manual override with persistence
- Use React Context for theme management

**Color System:**
```typescript
// constants/theme.ts
export const colors = {
  dark: {
    background: '#000000',
    surface: '#1C1C1E',
    surfaceElevated: '#2C2C2E',
    text: '#FFFFFF',
    textSecondary: '#98989D',
    textMuted: '#636366',
    primary: '#0A84FF',
    success: '#30D158',
    warning: '#FFD60A',
    error: '#FF453A',
    border: '#38383A',
  },
  light: {
    background: '#FFFFFF',
    surface: '#F2F2F7',
    surfaceElevated: '#FFFFFF',
    text: '#000000',
    textSecondary: '#3C3C43',
    textMuted: '#8E8E93',
    primary: '#007AFF',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    border: '#C6C6C8',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
};
```

**Styling Rules:**
- Use `StyleSheet.create` for all styles
- Define styles at the bottom of component files
- Never use inline styles except for dynamic values
- Use semantic color names (`theme.colors.error`, not `red`)
- Always use theme values for spacing and colors

```typescript
// Good
const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: colors.dark.surface,
  },
});

// Bad: Inline styles, hardcoded values
<View style={{ padding: 16, backgroundColor: '#1C1C1E' }}>
```

### 8. Navigation (Expo Router)

- Use file-based routing in `app/` directory
- Group related routes with parentheses `(auth)/`, `(tabs)/`
- Use dynamic routes with brackets `[id].tsx`
- Define typed navigation with TypeScript

```typescript
// Typed navigation
import { useRouter, useLocalSearchParams } from 'expo-router';

function RecipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const handleEdit = () => {
    router.push(`/recipe/edit/${id}`);
  };
}
```

### 9. Error Handling

- Use try-catch for all async operations
- Provide user-friendly error messages
- Log errors appropriately (console in dev, monitoring service in prod)
- Handle network errors and offline scenarios

```typescript
// hooks/useRecipes.ts
export function useCreateRecipe() {
  return useMutation({
    mutationFn: createRecipe,
    onError: (error) => {
      // User-friendly toast/alert
      Alert.alert(
        'Error',
        'Failed to create recipe. Please try again.'
      );
      // Log for debugging
      console.error('Create recipe error:', error);
    },
  });
}
```

### 10. Performance Optimization

- Use `React.memo` for expensive components that render often with same props
- Use `useMemo` for expensive calculations
- Use `useCallback` for functions passed to child components
- Use `FlatList` or `FlashList` for long lists (never `.map()` large arrays)
- Lazy load screens with Expo Router's built-in code splitting

```typescript
// Good: Memoized callback
const handleRecipePress = useCallback((id: string) => {
  router.push(`/recipe/${id}`);
}, [router]);

// Good: Memoized expensive computation
const sortedRecipes = useMemo(() => {
  return recipes.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}, [recipes]);
```

### 11. Platform Awareness

- Test on web, iOS, and Android
- Use `Platform.select()` for platform-specific code
- Handle safe areas properly
- Web is primary but mobile should work seamlessly

```typescript
import { Platform } from 'react-native';

const styles = StyleSheet.create({
  container: {
    ...Platform.select({
      web: { maxWidth: 1200, marginHorizontal: 'auto' },
      default: { flex: 1 },
    }),
  },
});
```

### 12. Accessibility

- Use `accessibilityLabel` for all interactive elements
- Ensure sufficient color contrast (WCAG AA: 4.5:1)
- Support dynamic font sizes
- Test with screen readers

```typescript
<Pressable
  onPress={handlePress}
  accessibilityLabel={`View ${recipe.title} recipe`}
  accessibilityRole="button"
>
  <RecipeCard recipe={recipe} />
</Pressable>
```

### 13. Environment Variables

- Use `EXPO_PUBLIC_` prefix for client-exposed variables
- Never commit `.env` files
- Store sensitive keys only in Supabase Edge Functions

```bash
# .env.local
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 14. Git & Version Control

- Write clear commit messages using conventional commits
- Keep commits atomic and focused
- Never commit `node_modules`, `.env`, or build artifacts

```bash
# Good commit messages
feat: add recipe sharing to friends
fix: resolve ingredient aggregation for fractional quantities
refactor: extract grocery list hooks
```

---

## Code Quality Checklist

Before considering code complete:

- [ ] TypeScript types are properly defined (no `any`)
- [ ] Components are memoized if needed
- [ ] No `console.log` in production code
- [ ] Error handling is implemented
- [ ] Loading and error states are handled in UI
- [ ] Code follows established patterns
- [ ] Styles use theme values
- [ ] Works on web, iOS, and Android
- [ ] Accessibility labels are present

---

## Project-Specific Patterns

### Recipe Visibility Logic

Recipes have four visibility levels. The database handles this via RLS, but UI should reflect it:

```typescript
type RecipeVisibility = 'private' | 'friends' | 'followers' | 'public';

// UI helper
function getVisibilityLabel(visibility: RecipeVisibility): string {
  const labels = {
    private: 'Only me',
    friends: 'Friends only',
    followers: 'Followers',
    public: 'Everyone',
  };
  return labels[visibility];
}
```

### Ingredient Handling

Ingredients support fractional quantities. Store numeric value for calculations, display string for UI:

```typescript
interface Ingredient {
  id: string;
  name: string;
  quantity: number | null;      // Decimal for math: 0.333
  quantityDisplay: string;      // Human-readable: "1/3"
  unit: string | null;
}
```

### Grocery List Collaboration

Grocery lists sync in realtime. Always subscribe to changes when viewing a list:

```typescript
function useGroceryListRealtime(listId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel(`list:${listId}`)
      .on('postgres_changes', { /* config */ }, () => {
        queryClient.invalidateQueries({ queryKey: ['grocery-items', listId] });
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [listId]);
}
```

---

## When Making Changes

1. Understand the existing patterns in the codebase first
2. Follow the established architecture
3. Write self-documenting code with proper types
4. Consider performance implications
5. Test on web (primary) and mobile
6. Update this file if adding new patterns

---

*Remember: Code should be written for humans to read and maintain. Prioritize clarity, consistency, and maintainability over cleverness.*
