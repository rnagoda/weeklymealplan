# Product Requirements Document: Recipe App

**Version:** 1.0  
**Last Updated:** January 2026  
**Status:** MVP Definition

---

## 1. Product Overview

### 1.1 Vision Statement

A cross-platform app where you can save recipes, plan flexible meals, generate shareable grocery lists, and share recipes with friends, followers, or the world—your group's private cookbook that grows with your community.

### 1.2 Problem Statement

Home cooks today face fragmented tools:
- Recipes scattered across bookmarks, screenshots, notes apps, and social media saves
- Meal planning done in separate calendar apps or spreadsheets
- Grocery lists managed in yet another app, often duplicating effort
- No easy way to share recipes with friends and family while maintaining a personal collection

This fragmentation leads to wasted time, forgotten ingredients, and recipes that never get cooked.

### 1.3 Solution

A unified platform that connects the full cooking workflow: **Collect → Plan → Shop → Cook → Share**. By integrating these steps and adding social features, users build a living cookbook that's personal yet shareable.

### 1.4 Key Differentiators

1. **Flexible meal planning** — No rigid breakfast/lunch/dinner slots; works for any eating pattern (OMAD, intermittent fasting, traditional, etc.)
2. **Tiered sharing model** — Private recipes, friend-only recipes, follower-visible recipes, and fully public recipes
3. **Collaborative grocery lists** — Share lists with household members; changes sync in real-time
4. **Recipe forking with attribution** — Save and modify others' recipes while preserving credit to the original

---

## 2. Target Users

### 2.1 Primary Personas

**The Organized Home Cook**
- Cooks 4-6 times per week
- Plans meals in advance to save time and money
- Wants all recipes in one searchable place
- Values efficiency: meal plan → grocery list in one tap

**The Social Foodie**
- Loves discovering and sharing recipes with friends
- Frequently texts recipe links to family members
- Wants a better way to share than screenshots or links
- Enjoys seeing what friends are cooking

**The Flexible Eater**
- Follows non-traditional eating patterns (IF, OMAD, low-carb, etc.)
- Frustrated by apps that assume 3 meals/day structure
- Needs flexibility in how meals are planned and labeled

### 2.2 Secondary Personas

**The Household Manager**
- Coordinates meals and shopping for family
- Needs shared grocery lists that sync instantly
- Multiple household members contributing to meal decisions

**The Recipe Collector**
- Saves recipes from everywhere but rarely finds them again
- Has bookmarks, screenshots, and saved posts scattered across platforms
- Wants a single home for their collection

### 2.3 Out of Scope Users (MVP)

- Professional chefs or commercial kitchen operators
- Food bloggers seeking monetization (creator economy features are post-MVP)
- Users requiring advanced nutritional tracking or macro counting

---

## 3. MVP Feature Set

### 3.1 User Accounts & Authentication

**Description:** Users can create accounts to save their data and access social features. Anonymous users can browse public recipes.

#### User Stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| U-1 | New user | Sign up with email and password | I can create an account and save my recipes |
| U-2 | New user | Sign up with Google | I can create an account quickly without another password |
| U-3 | Returning user | Sign in to my account | I can access my saved recipes and meal plans |
| U-4 | User | Reset my password via email | I can regain access if I forget my password |
| U-5 | User | Edit my profile (display name, username, avatar, bio) | Others can identify me when I share recipes |
| U-6 | Anonymous visitor | Browse public recipes without signing up | I can evaluate the app before committing |

#### Acceptance Criteria

- [ ] Email/password signup with validation (valid email format, password min 8 chars)
- [ ] Google OAuth signup/signin works on web, iOS, and Android
- [ ] Username is unique, lowercase, 3-30 characters, alphanumeric + underscore only
- [ ] Username cannot be changed after account creation (permanent)
- [ ] Password reset sends email with secure reset link
- [ ] Profile changes (display name, avatar, bio) save and reflect immediately
- [ ] Avatar uploads accept JPG/PNG, max 5MB, stored in Supabase Storage
- [ ] Anonymous users can view public recipes but see signin prompts when attempting protected actions

---

### 3.2 Social: Friends & Followers

**Description:** Users can build their network through mutual friendships (two-way, requires acceptance) and followings (one-way, no approval needed).

#### User Stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| S-1 | User | Follow another user | I can see their follower-visible and public recipes |
| S-2 | User | Unfollow a user | I no longer see their recipes in my feed |
| S-3 | User | Send a friend request | I can establish a mutual connection for closer sharing |
| S-4 | User | Accept or decline friend requests | I control who has friend-level access to my recipes |
| S-5 | User | Remove a friend | I can end a mutual friendship |
| S-6 | User | View my followers list | I know who is following me |
| S-7 | User | View my following list | I can manage who I follow |
| S-8 | User | View my friends list | I can see my mutual connections |
| S-9 | User | View pending friend requests (sent and received) | I can manage outstanding requests |

#### Acceptance Criteria

- [ ] Following is instant (no approval required)
- [ ] Friend requests require acceptance from the other party
- [ ] Accepting a friend request creates mutual friendship
- [ ] Removing a friend removes the relationship for both parties
- [ ] User search finds users by username or display name (partial match)
- [ ] Profile shows follower count, following count, and friend count
- [ ] Cannot follow or friend yourself

---

### 3.3 Recipe Management

**Description:** Users can create, edit, organize, and manage their personal recipe collection.

#### User Stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| R-1 | User | Create a new recipe with title, description, ingredients, and instructions | I can save my recipes digitally |
| R-2 | User | Add a photo to my recipe | My recipe is visually identifiable |
| R-3 | User | Set prep time, cook time, and servings | I know how long a recipe takes and how much it makes |
| R-4 | User | Add tags to my recipe | I can organize and filter my collection |
| R-5 | User | Set recipe visibility (private/friends/followers/public) | I control who can see each recipe |
| R-6 | User | Edit any of my recipes | I can correct mistakes or improve recipes over time |
| R-7 | User | Delete my recipes | I can remove recipes I no longer want |
| R-8 | User | Search my recipe collection by title or tag | I can quickly find what I'm looking for |
| R-9 | User | Filter recipes by tag | I can browse recipes by category |
| R-10 | User | View a recipe with scaled ingredient quantities | I can adjust serving sizes without manual math |

#### Acceptance Criteria

- [ ] Recipe title is required; all other fields optional
- [ ] Ingredients capture: name (required), quantity (optional), unit (optional)
- [ ] Ingredient quantities support decimals and display as fractions where appropriate (e.g., 0.5 → "1/2")
- [ ] Instructions are ordered steps; users can add, remove, and reorder
- [ ] Serving scaler adjusts all ingredient quantities proportionally
- [ ] Tags are free-form text; displayed as chips/pills
- [ ] Recipe photo uploads accept JPG/PNG, max 10MB
- [ ] If no photo uploaded, user can select from 6-8 default placeholder images (food-themed illustrations)
- [ ] Recipes without a photo or selected placeholder display a generic default image
- [ ] Visibility defaults to "private"
- [ ] Search matches partial title text (case-insensitive)
- [ ] Deleting a recipe prompts for confirmation

---

### 3.4 Recipe Sharing & Discovery

**Description:** Users can share recipes directly with friends, discover recipes from people they follow, and browse public recipes. Saved recipes maintain attribution to the original.

#### User Stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| D-1 | User | Browse public recipes | I can discover new recipes from the community |
| D-2 | User | View recipes from people I follow | I see content from creators I'm interested in |
| D-3 | User | View friend-only recipes from my friends | I can access recipes shared within my trusted circle |
| D-4 | User | Share a recipe directly with specific friends | I can send a recipe to someone even if it's not public |
| D-5 | User | Receive recipes shared directly with me | Friends can send me recipes privately |
| D-6 | User | Save someone else's recipe to my collection | I can keep recipes I like and plan meals with them |
| D-7 | User | See attribution when viewing a saved/forked recipe | I know where the recipe came from |
| D-8 | User | Edit my copy of a saved recipe | I can customize recipes to my taste |
| D-9 | User | See that my copy has been modified | I know the recipe differs from the original |
| D-10 | User | Access the original recipe from my modified copy | I can reference or compare to the source |

#### Acceptance Criteria

- [ ] Public recipes visible to all users (including anonymous)
- [ ] Follower-visible recipes shown to users who follow the owner + friends
- [ ] Friend-visible recipes shown only to mutual friends of the owner
- [ ] Private recipes visible only to the owner
- [ ] Direct sharing creates a notification for the recipient
- [ ] Direct shares include optional note from sender
- [ ] "Shared with me" section shows all directly received recipes
- [ ] Saving a recipe creates a copy owned by the user
- [ ] Saved recipes display "Forked from @username's [Recipe Name]" with link
- [ ] Editing a forked recipe sets `is_modified` flag
- [ ] Modified recipes display "Modified" badge
- [ ] If original recipe is deleted, attribution shows "Original no longer available"

---

### 3.5 Meal Planning

**Description:** Users can plan meals on a weekly calendar with complete flexibility—no enforced meal slots, supporting any eating pattern.

#### User Stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| M-1 | User | View a weekly meal plan calendar | I can see my planned meals at a glance |
| M-2 | User | Add a recipe to any day | I can plan what I'll cook |
| M-3 | User | Add multiple recipes to the same day | I can plan multiple meals or courses |
| M-4 | User | Optionally label a planned meal (e.g., "Breakfast", "Dinner", custom) | I can organize meals within a day |
| M-5 | User | Reorder meals within a day | I can arrange them in the order I'll eat them |
| M-6 | User | Remove a planned meal | I can change my plans |
| M-7 | User | Navigate between weeks | I can plan ahead or review past weeks |
| M-8 | User | Clear all meals for a day or week | I can start fresh quickly |
| M-9 | User | Tap a planned meal to view the full recipe | I can see what I'm cooking |

#### Acceptance Criteria

- [ ] Week view shows 7 days starting from user's configured first day of week (default: Sunday)
- [ ] First day of week configurable in user settings
- [ ] Each day displays as a column (web) or expandable section (mobile)
- [ ] Days can have 0 to unlimited meal entries
- [ ] Adding a meal opens recipe picker (search/browse own collection)
- [ ] Meal labels are optional, free-form text
- [ ] Meals within a day can be reordered via drag-and-drop (web) or move buttons (mobile)
- [ ] Week navigation via arrow buttons or swipe
- [ ] "Clear Day" and "Clear Week" buttons with confirmation
- [ ] Tapping a planned meal navigates to recipe detail

---

### 3.6 Grocery Lists

**Description:** Users can create multiple named grocery lists, generate them from meal plans, and share them with friends for real-time collaborative shopping.

#### User Stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| G-1 | User | Create a new named grocery list | I can organize shopping by store or purpose |
| G-2 | User | Generate a grocery list from my meal plan | I don't have to manually add every ingredient |
| G-3 | User | Choose which days/meals to include when generating | I can generate a list for just part of the week |
| G-4 | User | See aggregated ingredients (combined quantities) | Duplicate ingredients are merged intelligently |
| G-5 | User | Manually add items to a list | I can add non-recipe items (paper towels, etc.) |
| G-6 | User | Edit item quantities or remove items | I can adjust the list before shopping |
| G-7 | User | Check off items while shopping | I can track my progress in the store |
| G-8 | User | See items grouped by category | I can shop efficiently by store section |
| G-9 | User | Share a grocery list with friends | My household can shop collaboratively |
| G-10 | User | See real-time updates when a collaborator checks off items | We stay in sync while shopping |
| G-11 | Collaborator | Add items to a shared list | I can contribute to the shopping list |
| G-12 | List owner | Remove collaborators from my list | I can control who has access |
| G-13 | User | View all my grocery lists | I can access current and past lists |
| G-14 | User | Delete a grocery list | I can remove lists I no longer need |

#### Acceptance Criteria

- [ ] Lists have required name, display creation date
- [ ] "Generate from Meal Plan" shows day/meal checkboxes, defaults to current week
- [ ] Ingredient aggregation combines same ingredient + same unit (e.g., "2 cups flour" + "1 cup flour" = "3 cups flour")
- [ ] Different units for same ingredient shown as separate line items
- [ ] Manual items have name (required), quantity (optional), unit (optional)
- [ ] Items categorized automatically by ingredient type (Produce, Dairy, Meat, Pantry, etc.)
- [ ] Checked items visually distinguished (strikethrough) and move to bottom
- [ ] Sharing opens friend picker; selected friends become collaborators
- [ ] Collaborator changes sync within 2 seconds via Supabase Realtime
- [ ] Owner can remove collaborators; removed users lose access immediately
- [ ] List deletion prompts confirmation

---

### 3.7 Cook Mode

**Description:** A focused interface for cooking from a recipe with large text, step-by-step navigation, and timer functionality.

#### User Stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| C-1 | User | Enter cook mode from a recipe | I can focus on cooking without distractions |
| C-2 | User | See one instruction step at a time in large text | I can read it easily from a distance |
| C-3 | User | Navigate between steps (next/previous) | I can move through the recipe at my pace |
| C-4 | User | See my progress (step X of Y) | I know how far along I am |
| C-5 | User | View the scaled ingredients list while cooking | I can reference quantities without leaving cook mode |
| C-6 | User | Set a timer | I can track cooking times |
| C-7 | User | Receive an alert when the timer finishes | I know when time is up even if I'm not looking |
| C-8 | User | Exit cook mode | I can return to the normal recipe view |

#### Acceptance Criteria

- [ ] Cook mode is full-screen or modal overlay
- [ ] Instruction text is minimum 24px font
- [ ] Step counter shows current/total (e.g., "Step 3 of 8")
- [ ] Previous/Next buttons are large tap targets (min 48px)
- [ ] Swipe gestures also navigate steps (optional enhancement)
- [ ] Ingredients accessible via toggle or slide-out panel
- [ ] Timer input accepts minutes; countdown displays mm:ss
- [ ] Timer continues if user navigates steps
- [ ] Timer completion triggers audio alert and visual notification
- [ ] "Exit" or "Done" button returns to recipe detail

---

### 3.8 Notifications

**Description:** Users receive in-app and push notifications for social interactions and shared content.

#### Notification Types

| Event | Notification |
|-------|--------------|
| Friend request received | "@username wants to be your friend" |
| Friend request accepted | "@username accepted your friend request" |
| Recipe shared with you | "@username shared a recipe with you: [Recipe Name]" |
| Grocery list shared with you | "@username shared a grocery list with you: [List Name]" |
| New follower | "@username started following you" |

#### User Stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| N-1 | User | See in-app notifications | I know about new social activity |
| N-2 | User | Receive push notifications on my device | I'm notified even when not in the app |
| N-3 | User | Tap a notification to go to the relevant content | I can quickly act on the notification |
| N-4 | User | Mark notifications as read | I can track what I've seen |

#### Acceptance Criteria

- [ ] Notification bell icon shows unread count badge
- [ ] Notification list shows newest first
- [ ] Tapping notification navigates to relevant screen (friend request, recipe, list)
- [ ] Push notifications work on iOS and Android via Expo Push
- [ ] Push notifications respect device permissions
- [ ] Web push is out of scope for MVP (in-app only on web)

---

## 4. Information Architecture

### 4.1 Navigation Structure

```
App
├── (Public - No Auth)
│   ├── Landing / Public Recipe Browse
│   ├── Login
│   ├── Sign Up
│   └── Forgot Password
│
└── (Authenticated - Tab Navigation)
    ├── Recipes (default tab)
    │   ├── My Recipes list
    │   ├── Create Recipe
    │   ├── Recipe Detail
    │   │   └── Cook Mode
    │   └── Edit Recipe
    │
    ├── Discover
    │   ├── Public recipes feed
    │   ├── Following feed
    │   └── User Profile (other users)
    │
    ├── Meal Plan
    │   └── Weekly calendar view
    │
    ├── Grocery
    │   ├── Lists overview
    │   └── List Detail (with shopping mode)
    │
    └── Profile (current user)
        ├── Profile settings
        ├── Friends list
        ├── Followers/Following
        ├── Shared with me
        └── Notifications
```

### 4.2 Screen Inventory

| Screen | Path | Auth Required | Description |
|--------|------|---------------|-------------|
| Landing | `/` | No | Public recipes + signin prompt |
| Login | `/login` | No | Email/password and Google signin |
| Sign Up | `/signup` | No | Account creation |
| Forgot Password | `/forgot-password` | No | Password reset request |
| My Recipes | `/recipes` | Yes | User's recipe collection |
| Create Recipe | `/recipe/create` | Yes | Recipe creation form |
| Recipe Detail | `/recipe/[id]` | Varies* | View single recipe |
| Edit Recipe | `/recipe/edit/[id]` | Yes (owner) | Edit recipe form |
| Cook Mode | `/recipe/cook/[id]` | Varies* | Step-by-step cooking view |
| Discover | `/discover` | No** | Browse public/following recipes |
| User Profile | `/user/[username]` | No** | View another user's public profile |
| Meal Plan | `/meal-plan` | Yes | Weekly planning calendar |
| Grocery Lists | `/grocery` | Yes | All lists overview |
| Grocery List Detail | `/grocery/[id]` | Yes (owner/collaborator) | Single list with items |
| My Profile | `/profile` | Yes | Current user's profile & settings |
| Friends | `/profile/friends` | Yes | Friends list management |
| Notifications | `/profile/notifications` | Yes | Notification center |
| Shared With Me | `/profile/shared` | Yes | Recipes shared directly with user |

*Recipe visibility determines auth requirements  
**Anonymous can browse; signin required to follow, save, or interact

---

## 5. Explicitly Out of Scope (MVP)

The following features have been discussed but are **not** included in MVP:

| Feature | Reason | Potential Phase |
|---------|--------|-----------------|
| URL recipe import | Technical complexity (parsing varied sites) | Phase 2 |
| Video/TikTok recipe import | Requires AI/ML processing | Phase 3+ |
| OCR for cookbook photos | Specialized AI service needed | Phase 3+ |
| AI meal suggestions | Requires recommendation engine | Phase 2 |
| Nutritional information | Requires food database integration | Phase 2 |
| Price tracking for groceries | Manual entry burden; limited value | Phase 3+ |
| Pantry inventory management | Adds complexity to grocery flow | Phase 2 |
| Creator monetization (paid recipes, memberships) | Requires payments infrastructure | Phase 3+ |
| Public recipe comments | Moderation complexity | Phase 2 |
| Smartwatch app | Platform overhead | Phase 3+ |
| Offline mode | Sync complexity; web-first MVP | Phase 2 |
| Multi-language support | Localization effort | Phase 2 |
| Native mobile apps (App Store/Play Store) | Web via Expo sufficient for MVP | Phase 2 |

---

## 6. Success Metrics

### 6.1 Primary KPIs

| Metric | Definition | MVP Target |
|--------|------------|------------|
| **Registered Users** | Total accounts created | 500 in first 3 months |
| **Weekly Active Users (WAU)** | Users with ≥1 session in past 7 days | 40% of registered users |
| **Recipes Created** | Total recipes created by users | 5 recipes/active user average |
| **Meal Plans Created** | Users who planned ≥1 meal | 50% of WAU |
| **Grocery Lists Generated** | Lists generated from meal plans | 30% of users with meal plans |

### 6.2 Secondary KPIs

| Metric | Definition | Purpose |
|--------|------------|---------|
| **Social Connections** | Avg friends + following per user | Measure network effects |
| **Recipe Shares** | Recipes shared (direct + via visibility) | Measure virality |
| **Forked Recipes** | Recipes saved from other users | Measure content discovery |
| **Collaborative Lists** | Lists with ≥2 collaborators | Measure household adoption |
| **Cook Mode Sessions** | Times cook mode was started | Measure utility beyond planning |

### 6.3 Qualitative Feedback

- User interviews (5-10 users post-launch)
- In-app feedback mechanism
- App store reviews (when native apps launch)

---

## 7. Technical Constraints & Requirements

### 7.1 Platform Requirements

- **Primary:** Web (responsive, works on desktop and mobile browsers)
- **Secondary:** iOS and Android via Expo (PWA-quality experience initially; native apps Phase 2)
- **Browsers:** Chrome, Safari, Firefox, Edge (latest 2 versions)

### 7.2 Performance Requirements

| Metric | Target |
|--------|--------|
| Initial page load | < 3 seconds on 3G |
| Time to interactive | < 5 seconds |
| Recipe list render (50 items) | < 500ms |
| Grocery list sync latency | < 2 seconds |
| Image upload (5MB) | < 10 seconds |

### 7.3 Security & Privacy

- All data transmitted over HTTPS
- Passwords hashed (handled by Supabase Auth)
- Row-Level Security on all database tables
- GDPR-ready: Users can export and delete their data
- Minimal data collection; no third-party analytics in MVP

### 7.4 Accessibility

- WCAG 2.1 AA compliance target
- Semantic HTML structure
- Keyboard navigation support
- Screen reader compatibility
- Color contrast ratios ≥ 4.5:1

---

## 8. Design Decisions

| Question | Decision |
|----------|----------|
| First day of week | User-configurable in settings; **default to Sunday** |
| Recipe images | **Optional**; provide ~6-8 default placeholder images user can select if they don't upload their own |
| Username changes | **Not allowed in MVP**; username is permanent after signup (simplifies attribution and URLs) |

### Remaining Open Questions

| Question | Context | Decision Needed By |
|----------|---------|-------------------|
| Notification preferences? | Let users disable certain notification types? | Before notifications implementation |
| Data export format? | JSON? Recipe-specific format (e.g., Recipe Schema)? | Before launch (GDPR) |

---

## 9. Appendix

### 9.1 Glossary

| Term | Definition |
|------|------------|
| **Fork** | Saving another user's recipe to your own collection (creates a copy) |
| **Visibility** | Privacy level of a recipe: private, friends, followers, or public |
| **Collaborator** | A friend who has been granted access to view and edit a grocery list |
| **Direct Share** | Sending a recipe to specific friends (bypasses normal visibility) |
| **Meal Entry** | A single recipe placed on a specific day in the meal plan |

### 9.2 Reference Documents

- [Technical Architecture](./recipe-app-architecture.md)
- [Development Guidelines (CLAUDE.md)](./CLAUDE.md)

---

*End of PRD*
