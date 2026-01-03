# Implementation Plan: Recipe App MVP

**Version:** 1.0  
**Last Updated:** January 2026  
**Estimated Total Duration:** 8-10 weeks (solo developer)

---

## Overview

This plan breaks the MVP into 9 phases, ordered to minimize rework and ensure each phase builds on stable foundations. Each phase includes:

- **Goals:** What we're trying to accomplish
- **Tasks:** Specific work items with subtasks
- **Dependencies:** What must be complete before starting
- **Effort:** Estimated days (assuming focused solo dev work)
- **Definition of Done:** Criteria for phase completion

### Phase Summary

| Phase | Name | Effort | Dependencies |
|-------|------|--------|--------------|
| 0 | Project Setup | 2-3 days | None |
| 1 | Authentication | 3-4 days | Phase 0 |
| 2 | Core Recipe CRUD | 5-6 days | Phase 1 |
| 3 | Social (Friends & Followers) | 4-5 days | Phase 1 |
| 4 | Recipe Sharing & Discovery | 4-5 days | Phases 2, 3 |
| 5 | Meal Planning | 4-5 days | Phase 2 |
| 6 | Grocery Lists | 5-6 days | Phase 5 |
| 7 | Cook Mode | 2-3 days | Phase 2 |
| 8 | Notifications | 3-4 days | Phases 3, 4, 6 |
| 9 | Polish & Launch | 4-5 days | All phases |

**Total: 36-46 days (~8-10 weeks)**

---

## Phase 0: Project Setup

**Goal:** Establish the development environment, project structure, and backend infrastructure.

**Effort:** 2-3 days

**Dependencies:** None

### Tasks

#### 0.1 Supabase Project Setup
- [ ] Create Supabase project
- [ ] Run database schema SQL (from architecture doc), which includes:
  - All tables (profiles, user_settings, follows, friendships, recipes, etc.)
  - Indexes and constraints
  - RLS policies
  - Triggers (user creation, updated_at, notification creation)
  - Helper functions (are_friends, is_following, can_view_recipe, should_notify)
- [ ] Verify tables, indexes, and RLS policies created
- [ ] Configure auth providers (Email, Google OAuth)
- [ ] Create storage buckets (recipe-images, avatars)
- [ ] Set up storage policies
- [ ] Note project URL and anon key

#### 0.2 Expo Project Initialization
- [ ] Create Expo project with TypeScript template
  ```bash
  npx create-expo-app@latest recipe-app --template tabs
  ```
- [ ] Configure Expo Router (should be pre-configured in tabs template)
- [ ] Set up folder structure per CLAUDE.md guidelines
- [ ] Configure TypeScript strict mode in tsconfig.json

#### 0.3 Core Dependencies
- [ ] Install and configure Supabase client
  ```bash
  npx expo install @supabase/supabase-js @react-native-async-storage/async-storage
  ```
- [ ] Install state management
  ```bash
  npm install zustand @tanstack/react-query
  ```
- [ ] Install additional Expo packages
  ```bash
  npx expo install expo-image-picker expo-secure-store expo-notifications
  ```
- [ ] Create lib/supabase.ts with client initialization

#### 0.4 Environment Configuration
- [ ] Create .env.local with Supabase credentials
- [ ] Add .env* to .gitignore
- [ ] Create app.config.ts for Expo configuration
- [ ] Test that environment variables load correctly

#### 0.5 Theme & Base Components
- [ ] Create constants/theme.ts with color system
- [ ] Create ThemeProvider with dark mode default
- [ ] Build base UI components (Button, Input, Card, Modal)
- [ ] Verify theme works on web and mobile

#### 0.6 Development Tooling
- [ ] Set up ESLint + Prettier
- [ ] Configure Git repository
- [ ] Add CLAUDE.md, PRD, and Architecture docs to repo
- [ ] Create README with setup instructions

### Definition of Done
- [ ] `npx expo start` runs without errors
- [ ] App displays on web, iOS simulator, and Android emulator
- [ ] Supabase client connects successfully (test with simple query)
- [ ] Theme provider works; dark mode displays correctly
- [ ] Base UI components render properly
- [ ] Project committed to Git with clean history

---

## Phase 1: Authentication

**Goal:** Users can create accounts, sign in, and manage their profile.

**Effort:** 3-4 days

**Dependencies:** Phase 0 complete

### Tasks

#### 1.1 Auth Store & Hooks
- [ ] Create stores/authStore.ts (Zustand)
  - Session state
  - User profile state
  - Loading states
- [ ] Create hooks/useAuth.ts
  - Session listener (onAuthStateChange)
  - signIn, signUp, signOut functions
  - Password reset function
- [ ] Create hooks/useProfile.ts
  - Fetch current user profile
  - Update profile mutation

#### 1.2 Auth Screens
- [ ] Create app/(auth)/_layout.tsx (auth group layout)
- [ ] Create app/(auth)/login.tsx
  - Email/password form
  - Google OAuth button
  - Link to signup
  - Link to forgot password
  - Form validation
- [ ] Create app/(auth)/signup.tsx
  - Email, password, username, display name fields
  - Username availability check (debounced)
  - Form validation
  - Google OAuth button
- [ ] Create app/(auth)/forgot-password.tsx
  - Email input
  - Submit → success message

#### 1.3 Auth Flow & Navigation
- [ ] Create app/_layout.tsx (root layout)
  - Auth state listener
  - Redirect unauthenticated users to login (for protected routes)
  - Redirect authenticated users away from auth screens
- [ ] Create app/(tabs)/_layout.tsx (main tab navigator)
- [ ] Implement protected route logic

#### 1.4 Google OAuth
- [ ] Configure Google OAuth in Supabase dashboard
- [ ] Add Google OAuth credentials to app config
- [ ] Implement OAuth flow with expo-auth-session
- [ ] Handle OAuth callback and session creation
- [ ] Test on web and mobile

#### 1.5 Profile Management
- [ ] Create app/(tabs)/profile.tsx (basic version)
  - Display current user info
  - Sign out button
- [ ] Create profile edit screen or modal
  - Edit display name
  - Edit bio
  - Upload avatar (expo-image-picker → Supabase Storage)
- [ ] Create lib/storage.ts with avatar upload helper

#### 1.6 User Settings
- [ ] Create hooks/useSettings.ts
  - useSettings() - fetch current user settings
  - useUpdateSettings() - mutation
- [ ] Create components/profile/SettingsModal.tsx
  - First day of week selector (Sunday through Saturday)
  - Notification preferences (on/off per type):
    - Friend requests
    - Friend request accepted
    - Recipe shared
    - List shared
    - New follower
  - Push notifications master toggle
- [ ] User settings table already created via schema (auto-created on signup)
- [ ] Persist settings and reflect in UI

### Definition of Done
- [ ] New users can sign up with email/password
- [ ] New users can sign up with Google
- [ ] Existing users can sign in with either method
- [ ] Password reset email sends and works
- [ ] Username uniqueness enforced
- [ ] Users can edit display name, bio, avatar
- [ ] Users can configure first day of week in settings modal
- [ ] Users can toggle notification preferences per type
- [ ] Sign out clears session and redirects to login
- [ ] Protected routes redirect to login when unauthenticated
- [ ] Auth persists across app restarts

---

## Phase 2: Core Recipe CRUD

**Goal:** Users can create, view, edit, delete, and organize their recipes.

**Effort:** 5-6 days

**Dependencies:** Phase 1 complete

### Tasks

#### 2.1 Recipe Data Layer
- [ ] Generate Supabase types
  ```bash
  npx supabase gen types typescript --project-id <id> > src/types/database.ts
  ```
- [ ] Create types/recipe.ts with app-specific types
- [ ] Create hooks/useRecipes.ts
  - useRecipes() - list user's recipes
  - useRecipe(id) - single recipe with ingredients/instructions
  - useCreateRecipe() - mutation
  - useUpdateRecipe() - mutation
  - useDeleteRecipe() - mutation

#### 2.2 Recipe List Screen
- [ ] Create app/(tabs)/index.tsx (Recipes tab - home)
  - FlatList of user's recipes
  - RecipeCard component with image, title, tags, time
  - Empty state for new users
  - Pull-to-refresh
- [ ] Implement search bar
  - Filter recipes by title (client-side for MVP)
- [ ] Implement tag filter
  - Show unique tags as filter chips
  - Filter recipes by selected tag
- [ ] Add FAB or header button to create recipe

#### 2.3 Recipe Detail Screen
- [ ] Create app/recipe/[id].tsx
  - Recipe header (image, title, description)
  - Metadata (prep time, cook time, servings)
  - Serving scaler component
  - Ingredients list (scaled)
  - Instructions list
  - Edit button (if owner)
  - Delete button (if owner)
- [ ] Create components/recipe/ServingScaler.tsx
  - +/- buttons to adjust servings
  - Recalculate ingredient quantities
- [ ] Create utils/fraction-utils.ts
  - Decimal to fraction conversion
  - formatQuantity() function

#### 2.4 Recipe Create/Edit Form
- [ ] Create app/recipe/create.tsx
- [ ] Create app/recipe/edit/[id].tsx (reuse form component)
- [ ] Create components/recipe/RecipeForm.tsx
  - Title input (required)
  - Description textarea
  - Servings number input
  - Prep time / Cook time inputs
  - Tags input (comma-separated or chip input)
  - Visibility selector (private/friends/followers/public)
  - Image picker (upload or select placeholder)
  - Save button

#### 2.5 Ingredients Editor
- [ ] Create components/recipe/IngredientsEditor.tsx
  - List of ingredient rows
  - Each row: quantity, unit (dropdown), name
  - Add ingredient button
  - Remove ingredient button (swipe or X)
  - Reorder ingredients (drag or arrows)
- [ ] Create constants/units.ts with common units
- [ ] Create utils/ingredient-parser.ts (for future bulk paste)

#### 2.6 Instructions Editor
- [ ] Create components/recipe/InstructionsEditor.tsx
  - List of numbered steps
  - Each step: textarea for instruction text
  - Add step button
  - Remove step button
  - Reorder steps (drag or arrows)
  - Auto-renumber on reorder

#### 2.7 Recipe Images
- [ ] Create placeholder image assets (6-8 food illustrations)
- [ ] Create components/recipe/ImagePicker.tsx
  - "Upload Photo" button
  - Grid of placeholder options
  - Selected state indicator
- [ ] Create lib/storage.ts uploadRecipeImage helper
- [ ] Handle image display (uploaded URL or placeholder reference)

#### 2.8 Delete Confirmation
- [ ] Create confirmation modal/alert for recipe deletion
- [ ] Implement delete mutation with navigation back to list

### Definition of Done
- [ ] Users can create recipes with all fields
- [ ] Users can upload images or select placeholders
- [ ] Recipes display in list with search and filter
- [ ] Recipe detail shows all information correctly
- [ ] Serving scaler adjusts ingredients properly
- [ ] Fractions display correctly (1/2, 1/3, etc.)
- [ ] Users can edit their recipes
- [ ] Users can delete their recipes (with confirmation)
- [ ] Empty states display appropriately
- [ ] All data persists to Supabase

---

## Phase 3: Social (Friends & Followers)

**Goal:** Users can follow others and establish mutual friendships.

**Effort:** 4-5 days

**Dependencies:** Phase 1 complete

### Tasks

#### 3.1 Social Data Layer
- [ ] Create hooks/useFollows.ts
  - useFollowing() - people I follow
  - useFollowers() - people following me
  - useFollow() - mutation
  - useUnfollow() - mutation
- [ ] Create hooks/useFriendships.ts
  - useFriends() - accepted friendships
  - usePendingRequests() - incoming requests
  - useSentRequests() - outgoing requests
  - useSendFriendRequest() - mutation
  - useAcceptFriendRequest() - mutation
  - useDeclineFriendRequest() - mutation
  - useRemoveFriend() - mutation

#### 3.2 User Search
- [ ] Create components/social/UserSearch.tsx
  - Search input (debounced)
  - Results list with UserCard components
  - Search by username or display name
- [ ] Create Supabase RPC or query for user search
- [ ] Handle empty results state

#### 3.3 User Card Component
- [ ] Create components/social/UserCard.tsx
  - Avatar, display name, username
  - Follow/Following button
  - Add Friend / Pending / Friends button
  - Tap to navigate to profile

#### 3.4 User Profile Screen (Other Users)
- [ ] Create app/user/[username].tsx
  - Profile header (avatar, name, bio)
  - Stats (followers, following, recipes)
  - Follow/Unfollow button
  - Add Friend / Remove Friend button
  - List of their visible recipes (based on relationship)

#### 3.5 Friends Management Modal
- [ ] Create components/profile/FriendsModal.tsx
  - Tab or segment: Friends / Requests / Find
  - Friends list with remove option
  - Incoming requests with accept/decline
  - Sent requests with cancel option
  - Search/find users section
- [ ] Trigger modal from profile screen

#### 3.6 Following/Followers Modal
- [ ] Create components/profile/FollowersModal.tsx
  - Tab or segment: Followers / Following
  - Followers tab: list of users following me, follow back button
  - Following tab: list of users I follow, unfollow button
- [ ] Trigger modal from profile screen

#### 3.7 Relationship Helpers
- [ ] Create utils/relationships.ts
  - getRelationship(userId) - returns 'self' | 'friend' | 'following' | 'follower' | 'none'
  - Used for UI button states and recipe visibility

### Definition of Done
- [ ] Users can search for other users
- [ ] Users can follow/unfollow anyone
- [ ] Users can send friend requests
- [ ] Users can accept/decline friend requests
- [ ] Users can remove friends
- [ ] Friend requests require mutual acceptance
- [ ] User profiles show correct relationship state
- [ ] Following/followers/friends counts display correctly
- [ ] Cannot follow or friend yourself

---

## Phase 4: Recipe Sharing & Discovery

**Goal:** Users can discover recipes, share with friends, and fork recipes to their collection.

**Effort:** 4-5 days

**Dependencies:** Phases 2 and 3 complete

### Tasks

#### 4.1 Recipe Visibility Logic
- [ ] Verify RLS policies enforce visibility correctly
- [ ] Test each visibility level:
  - Private: only owner sees
  - Friends: mutual friends see
  - Followers: followers + friends see
  - Public: everyone sees

#### 4.2 Discover Screen
- [ ] Create app/(tabs)/discover.tsx
  - Segment/tabs: Public / Following
  - Public feed: all public recipes (paginated)
  - Following feed: recipes from people I follow (followers + public visibility)
- [ ] Create hooks/useDiscoverRecipes.ts
  - usePublicRecipes() - paginated
  - useFollowingRecipes() - paginated
- [ ] Implement infinite scroll or "Load more" button

#### 4.3 Direct Recipe Sharing
- [ ] Create components/recipe/ShareModal.tsx
  - List of friends (checkboxes)
  - Optional note input
  - Share button
- [ ] Create hooks/useShareRecipe.ts
  - useShareRecipe() - mutation
- [ ] Add share button to recipe detail screen

#### 4.4 Shared With Me Modal
- [ ] Create components/profile/SharedWithMeModal.tsx
  - List of recipes shared directly with user
  - Shows sender, note, date
  - Tap to view recipe (closes modal, navigates to recipe)
- [ ] Create hooks/useSharedRecipes.ts
  - useSharedWithMe() - recipes others shared with me
- [ ] Trigger modal from profile screen

#### 4.5 Recipe Forking
- [ ] Add "Save to My Recipes" button on other users' recipes
- [ ] Create hooks/useForkRecipe.ts
  - useForkRecipe() - creates copy with forked_from_id
- [ ] Update shared_recipes table when forked (set saved_at)

#### 4.6 Fork Attribution
- [ ] Display "Forked from @username's Recipe Name" on forked recipes
- [ ] Link to original recipe (if still exists)
- [ ] Handle deleted originals: "Original no longer available"
- [ ] Display "Modified" badge if is_modified = true
- [ ] Set is_modified = true when user edits a forked recipe

#### 4.7 Anonymous Browse
- [ ] Ensure public recipes load without authentication
- [ ] Show sign-in prompts when anonymous users try to:
  - Save/fork a recipe
  - Follow a user
  - Access non-public content

### Definition of Done
- [ ] Public recipes visible to everyone (including anonymous)
- [ ] Following feed shows recipes from followed users
- [ ] Friend-only recipes visible only to friends
- [ ] Users can share recipes directly with friends
- [ ] Shared recipes appear in recipient's "Shared with me"
- [ ] Users can fork recipes to their collection
- [ ] Forked recipes show attribution
- [ ] Modified forked recipes show badge
- [ ] Anonymous users can browse public recipes

---

## Phase 5: Meal Planning

**Goal:** Users can plan meals on a flexible weekly calendar.

**Effort:** 4-5 days

**Dependencies:** Phase 2 complete

### Tasks

#### 5.1 Meal Plan Data Layer
- [ ] Create hooks/useMealPlan.ts
  - useMealPlan(weekStart) - entries for a week
  - useAddMealEntry() - mutation
  - useUpdateMealEntry() - mutation (label, order)
  - useRemoveMealEntry() - mutation
  - useClearDay() - mutation
  - useClearWeek() - mutation

#### 5.2 Week View Screen
- [ ] Create app/(tabs)/meal-plan.tsx
  - Week navigation (prev/next arrows)
  - Display current week range (e.g., "Jan 5 - Jan 11")
  - 7-day view respecting user's first day of week setting
- [ ] Create components/meal-plan/WeekView.tsx
  - Web: horizontal columns for each day
  - Mobile: vertical list or accordion per day

#### 5.3 Day Column Component
- [ ] Create components/meal-plan/DayColumn.tsx
  - Day header (day name, date)
  - List of meal entries
  - "Add Meal" button
  - Empty state
  - Clear day button

#### 5.4 Meal Entry Component
- [ ] Create components/meal-plan/MealEntry.tsx
  - Recipe thumbnail + title
  - Optional label (editable)
  - Tap to view recipe
  - Remove button
  - Drag handle (for reorder)

#### 5.5 Recipe Picker
- [ ] Create components/meal-plan/RecipePicker.tsx (modal)
  - Search bar
  - List of user's recipes (including forked)
  - Tap to select and add to day
- [ ] Handle empty recipe collection state

#### 5.6 Meal Labels
- [ ] Allow editing meal label inline or via modal
- [ ] Suggestions: "Breakfast", "Lunch", "Dinner", "Snack"
- [ ] Allow custom labels

#### 5.7 Reordering
- [ ] Implement drag-to-reorder within a day (web)
- [ ] Implement move up/down buttons (mobile fallback)
- [ ] Update order_index on reorder

#### 5.8 Clear Actions
- [ ] "Clear Day" button with confirmation
- [ ] "Clear Week" button with confirmation
- [ ] Both trigger appropriate mutations

#### 5.9 Week Navigation
- [ ] Calculate week boundaries based on user's first day setting
- [ ] Navigate to previous/next week
- [ ] URL or state reflects current week for shareability/refresh

### Definition of Done
- [ ] Week view displays 7 days starting from user's preferred day
- [ ] Users can add recipes to any day
- [ ] Multiple meals can be added per day
- [ ] Meals can be labeled (optional)
- [ ] Meals can be reordered within a day
- [ ] Meals can be removed
- [ ] Users can navigate between weeks
- [ ] Clear day/week works with confirmation
- [ ] Tapping a meal opens recipe detail
- [ ] Empty states display appropriately

---

## Phase 6: Grocery Lists

**Goal:** Users can create, manage, and share collaborative grocery lists.

**Effort:** 5-6 days

**Dependencies:** Phase 5 complete

### Tasks

#### 6.1 Grocery List Data Layer
- [ ] Create hooks/useGroceryLists.ts
  - useGroceryLists() - user's lists + collaborated lists
  - useGroceryList(id) - single list with items
  - useCreateGroceryList() - mutation
  - useDeleteGroceryList() - mutation
- [ ] Create hooks/useGroceryItems.ts
  - useAddGroceryItem() - mutation
  - useUpdateGroceryItem() - mutation (quantity, checked)
  - useRemoveGroceryItem() - mutation

#### 6.2 Grocery Lists Overview
- [ ] Create app/(tabs)/grocery.tsx
  - List of user's grocery lists
  - List of lists shared with user (collaborative)
  - "New List" button
  - Empty state
- [ ] Create components/grocery/GroceryListCard.tsx
  - List name, item count, checked count
  - Collaborator avatars (if shared)
  - Last updated date

#### 6.3 Create List Flow
- [ ] Create list creation modal/screen
  - Name input
  - Option: "Generate from Meal Plan" checkbox
- [ ] If generating from meal plan:
  - Show day/meal checkboxes
  - Default to current week, all days selected
  - Generate button

#### 6.4 Ingredient Aggregation
- [ ] Create utils/ingredient-aggregator.ts
  - Combine same ingredient + same unit
  - Categorize ingredients (Produce, Dairy, Meat, etc.)
  - Sort by category
- [ ] Create constants/categories.ts with category definitions
- [ ] Test aggregation with various ingredient combinations

#### 6.5 Grocery List Detail Screen
- [ ] Create app/grocery/[id].tsx
  - List header (name, share button)
  - Items grouped by category
  - Each item: checkbox, name, quantity
  - Add item button
  - Collaborators display

#### 6.6 Grocery Item Component
- [ ] Create components/grocery/GroceryItem.tsx
  - Checkbox (tap to toggle)
  - Item name and quantity/unit
  - Strikethrough when checked
  - Swipe to delete (or delete button)
- [ ] Create components/grocery/CategoryGroup.tsx
  - Category header
  - Collapsible item list

#### 6.7 Manual Item Addition
- [ ] Create add item modal/inline form
  - Name (required)
  - Quantity (optional)
  - Unit (optional)
  - Category (auto-detect or select)

#### 6.8 List Sharing
- [ ] Create components/grocery/ShareListModal.tsx
  - Friends list (checkboxes)
  - Current collaborators shown
  - Add/remove collaborators
- [ ] Create hooks/useGroceryListCollaborators.ts
  - useAddCollaborator() - mutation
  - useRemoveCollaborator() - mutation

#### 6.9 Real-time Collaboration
- [ ] Create hooks/useGroceryListRealtime.ts
  - Subscribe to grocery_items changes for list
  - Invalidate query on changes
- [ ] Implement in list detail screen
- [ ] Test with multiple users checking items

#### 6.10 Shopping Mode
- [ ] Checked items move to bottom of category
- [ ] "Clear Completed" button
- [ ] Progress indicator (X of Y items)

### Definition of Done
- [ ] Users can create named grocery lists
- [ ] Lists can be generated from meal plan
- [ ] Ingredients aggregate correctly (same ingredient + unit combined)
- [ ] Items display grouped by category
- [ ] Users can check off items
- [ ] Users can add manual items
- [ ] Users can edit quantities or remove items
- [ ] Users can share lists with friends
- [ ] Collaborator changes sync in real-time (<2 sec)
- [ ] List owners can remove collaborators
- [ ] Users can delete lists (with confirmation)

---

## Phase 7: Cook Mode

**Goal:** Focused cooking interface with step-by-step instructions and timer.

**Effort:** 2-3 days

**Dependencies:** Phase 2 complete

### Tasks

#### 7.1 Cook Mode Screen
- [ ] Create app/recipe/cook/[id].tsx
  - Full-screen or modal presentation
  - Clean, distraction-free UI
  - Large text optimized for distance reading

#### 7.2 Step Navigation
- [ ] Display one instruction step at a time
- [ ] Step counter: "Step 3 of 8"
- [ ] Previous / Next buttons (large tap targets)
- [ ] Optional: swipe to navigate
- [ ] Keyboard shortcuts for web (arrow keys)

#### 7.3 Ingredients Panel
- [ ] Slide-out or toggle panel for ingredients
- [ ] Show scaled ingredients (use same scaler from recipe detail)
- [ ] Keep visible while navigating steps (optional)

#### 7.4 Timer Functionality
- [ ] Timer button in cook mode UI
- [ ] Set timer modal: minutes input
- [ ] Countdown display (mm:ss)
- [ ] Timer continues across step navigation
- [ ] Audio alert when timer completes
- [ ] Visual notification/modal when complete
- [ ] Support for web audio (Audio API) and mobile (expo-av if needed)

#### 7.5 Exit Flow
- [ ] "Done" or "Exit" button
- [ ] Confirm exit if in middle of recipe?
- [ ] Return to recipe detail

### Definition of Done
- [ ] Cook mode shows one step at a time
- [ ] Text is large and readable from distance
- [ ] Users can navigate between steps
- [ ] Step counter shows progress
- [ ] Ingredients accessible during cooking
- [ ] Timer can be set and counts down
- [ ] Timer alert plays audio and shows visual notification
- [ ] Users can exit cook mode cleanly

---

## Phase 8: Notifications

**Goal:** Users receive in-app and push notifications for social activity.

**Effort:** 3-4 days

**Dependencies:** Phases 3, 4, and 6 complete

### Tasks

#### 8.1 Notification Data Layer
- [ ] Create hooks/useNotifications.ts
  - useNotifications() - paginated list
  - useUnreadCount() - for badge
  - useMarkAsRead() - mutation
  - useMarkAllAsRead() - mutation

#### 8.2 Database Triggers
- [ ] Notification triggers already defined in schema (via architecture doc):
  - on_friend_request_created → creates notification for addressee
  - on_friend_request_accepted → creates notification for requester
  - on_recipe_shared → creates notification for recipient
  - on_list_collaborator_added → creates notification for collaborator
  - on_new_follower → creates notification for followee
- [ ] Triggers respect user notification preferences (should_notify function)
- [ ] Verify triggers work correctly with test data

#### 8.3 Notifications Modal
- [ ] Create components/profile/NotificationsModal.tsx
  - List of notifications (newest first)
  - Unread indicator per notification
  - Tap to navigate to relevant content (closes modal first)
  - Mark all as read button
- [ ] Create components/notifications/NotificationItem.tsx
  - Icon based on type
  - Title and body text
  - Timestamp
  - Unread dot
- [ ] Trigger modal from profile screen (notification bell icon)

#### 8.4 Notification Badge
- [ ] Add badge to notification bell icon
- [ ] Display unread count
- [ ] Subscribe to realtime for new notifications

#### 8.5 Push Notifications Setup
- [ ] Configure Expo Push Notifications
- [ ] Request permissions on app start (or first relevant action)
- [ ] Store expo_push_token in user profile
- [ ] Create tokens/permissions UI in settings

#### 8.6 Push Notification Edge Function
- [ ] Create supabase/functions/send-push/index.ts
- [ ] Implement Expo Push API call
- [ ] Deploy edge function
- [ ] Create database trigger to call edge function on notification insert

#### 8.7 Deep Linking
- [ ] Configure deep link handling in Expo
- [ ] Notification tap → navigate to relevant screen
  - friend_request → open friends modal
  - friend_accepted → navigate to user profile
  - recipe_shared → open shared with me modal or navigate to recipe
  - list_shared → navigate to grocery list
  - new_follower → navigate to user profile

### Definition of Done
- [ ] Notifications created for all trigger events (respecting user preferences)
- [ ] Notifications display in notifications modal with correct content
- [ ] Unread badge shows accurate count on notification bell
- [ ] Tapping notification navigates to relevant content
- [ ] Users can mark notifications as read
- [ ] Push notifications received on iOS and Android
- [ ] Push notification tap opens correct screen/modal
- [ ] Users can manage push permission and per-type preferences in settings modal

---

## Phase 9: Polish & Launch

**Goal:** Final testing, bug fixes, performance optimization, and deployment.

**Effort:** 4-5 days

### Tasks

#### 9.1 Cross-Platform Testing
- [ ] Test all flows on web (Chrome, Safari, Firefox)
- [ ] Test all flows on iOS (simulator + real device)
- [ ] Test all flows on Android (emulator + real device)
- [ ] Document and fix platform-specific bugs

#### 9.2 Responsive Design
- [ ] Verify web layouts work on mobile viewport
- [ ] Verify web layouts work on desktop viewport
- [ ] Adjust breakpoints as needed
- [ ] Test on tablet viewport

#### 9.3 Performance Optimization
- [ ] Profile app with React DevTools
- [ ] Add React.memo where beneficial
- [ ] Optimize images (compression, sizing)
- [ ] Verify list virtualization (FlatList)
- [ ] Check bundle size

#### 9.4 Error Handling Polish
- [ ] Verify all error states have user-friendly messages
- [ ] Add retry buttons where appropriate
- [ ] Test offline behavior (graceful degradation)
- [ ] Add error boundary at app root

#### 9.5 Loading States
- [ ] Verify all loading states show skeletons or spinners
- [ ] Add pull-to-refresh where appropriate
- [ ] Ensure no flash of empty content

#### 9.6 Accessibility Audit
- [ ] Add missing accessibility labels
- [ ] Test with screen reader (VoiceOver, TalkBack)
- [ ] Verify color contrast
- [ ] Test keyboard navigation (web)

#### 9.7 Empty States & Onboarding
- [ ] Verify all empty states have helpful messages
- [ ] Add CTAs to empty states ("Create your first recipe")
- [ ] Consider first-run experience or tips

#### 9.8 Analytics & Monitoring (Optional)
- [ ] Set up basic error monitoring (Sentry or similar)
- [ ] Add minimal analytics if desired

#### 9.9 Deployment - Web
- [ ] Configure production environment variables
- [ ] Build for web: `npx expo export --platform web`
- [ ] Deploy to hosting (Vercel, Netlify, etc.)
- [ ] Configure custom domain (if applicable)
- [ ] Test production deployment

#### 9.10 Deployment - Mobile (Expo Go / Dev Builds)
- [ ] For MVP: users can access via Expo Go
- [ ] Create development builds if needed
- [ ] Document how users can access the app

#### 9.11 Documentation
- [ ] Update README with final setup instructions
- [ ] Document environment variables
- [ ] Create user guide or help content (optional)

### Definition of Done
- [ ] All features work on web, iOS, and Android
- [ ] No critical bugs
- [ ] Performance is acceptable (<3s load)
- [ ] Error and loading states are polished
- [ ] Accessibility meets basic standards
- [ ] Web version deployed and accessible
- [ ] Documentation is complete

---

## Milestone Checkpoints

| Milestone | Phases Complete | Deliverable |
|-----------|-----------------|-------------|
| **M1: Foundation** | 0, 1 | Users can sign up, sign in, edit profile |
| **M2: Core Product** | 2 | Users can create and manage recipes |
| **M3: Social** | 3, 4 | Users can connect and share recipes |
| **M4: Planning** | 5, 6 | Users can plan meals and generate grocery lists |
| **M5: Complete MVP** | 7, 8, 9 | Full feature set, polished and deployed |

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Supabase RLS complexity | Medium | High | Test policies early; have fallback to simpler visibility |
| Real-time sync issues | Medium | Medium | Implement optimistic updates; fallback to polling |
| Push notification setup | Medium | Low | Web can launch without push; mobile can use in-app only |
| Cross-platform bugs | High | Medium | Test frequently on all platforms; prioritize web |
| Scope creep | High | High | Strict adherence to PRD; defer enhancements to Phase 2 |

---

## Parallel Work Opportunities

Some phases can overlap if desired:

- **Phase 3 (Social)** can start after Phase 1, parallel to Phase 2
- **Phase 7 (Cook Mode)** can be done anytime after Phase 2
- **Phase 8 (Notifications)** requires 3, 4, 6 but can start once 3 is done (partial implementation)

Suggested parallel tracks for faster delivery:

```
Week 1-2:  Phase 0 → Phase 1
Week 2-3:  Phase 2 + Phase 3 (parallel)
Week 4:    Phase 4 (needs 2 & 3)
Week 5:    Phase 5
Week 6:    Phase 6 + Phase 7 (parallel)
Week 7:    Phase 8
Week 8-9:  Phase 9
```

---

## Next Steps

1. **Review this plan** - Any adjustments to scope, ordering, or estimates?
2. **Set up development environment** - Begin Phase 0
3. **Establish cadence** - Daily progress? Weekly check-ins?
4. **Create project board** - Convert tasks to issues/cards if using a tracker

---

*Ready to start building!*
