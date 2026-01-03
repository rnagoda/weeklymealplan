# Recipe App Technical Architecture

## Document Info
- **Version:** 1.0
- **Last Updated:** January 2026
- **Status:** MVP Architecture Specification

---

## 1. Executive Summary

This document outlines the technical architecture for a cross-platform recipe management application with social features. The app enables users to save recipes, plan flexible meals, generate shareable grocery lists, and share recipes with friends, followers, or publicly.

### Core Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | React Native + Expo (iOS, Android, Web) |
| Backend | Supabase (Auth, Database, Realtime, Storage, Edge Functions) |
| Database | PostgreSQL (via Supabase) |
| Push Notifications | Expo Push + Supabase Edge Functions |
| File Storage | Supabase Storage |

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   iOS App   │  │ Android App │  │   Web App   │              │
│  │   (Expo)    │  │   (Expo)    │  │ (Expo Web)  │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
│         └────────────────┼────────────────┘                      │
│                          │                                       │
│                ┌─────────▼─────────┐                            │
│                │  Expo Push Service │                            │
│                └─────────┬─────────┘                            │
└──────────────────────────┼──────────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────────┐
│                    Supabase Layer                                │
│                          │                                       │
│  ┌───────────────────────▼───────────────────────────────────┐  │
│  │                    Supabase Client                         │  │
│  │         (Auth, Realtime subscriptions, Storage)           │  │
│  └───────────────────────┬───────────────────────────────────┘  │
│                          │                                       │
│  ┌───────────┬───────────┼───────────┬───────────────────────┐  │
│  │           │           │           │                       │  │
│  ▼           ▼           ▼           ▼                       │  │
│ ┌────┐   ┌────────┐  ┌────────┐  ┌─────────┐  ┌───────────┐ │  │
│ │Auth│   │Database│  │Realtime│  │ Storage │  │Edge Funcs │ │  │
│ │    │   │(Postgres)│ │   WS   │  │ (S3)    │  │(Deno)     │ │  │
│ └────┘   └────────┘  └────────┘  └─────────┘  └───────────┘ │  │
│                                                               │  │
└───────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### Design Principles

1. **Offline-Ready Architecture**: While MVP is online-only, data layer abstractions will support future offline sync
2. **Row-Level Security**: All data access controlled via Supabase RLS policies
3. **Real-time First**: Grocery list collaboration uses Supabase Realtime subscriptions
4. **Edge Computing**: Push notifications and complex queries handled by Edge Functions

---

## 3. Authentication Architecture

### 3.1 Auth Providers
- Email/Password (primary)
- Google OAuth (secondary)

### 3.2 Auth Flow

```
┌──────────┐     ┌──────────────┐     ┌─────────────┐
│  Client  │────▶│ Supabase Auth │────▶│  PostgreSQL │
└──────────┘     └──────────────┘     └─────────────┘
     │                  │                     │
     │  1. signUp()     │                     │
     │─────────────────▶│                     │
     │                  │  2. Create user     │
     │                  │────────────────────▶│
     │                  │                     │
     │                  │  3. Trigger: create │
     │                  │     profile row     │
     │                  │◀────────────────────│
     │  4. Return JWT   │                     │
     │◀─────────────────│                     │
     │                  │                     │
     │  5. All subsequent requests include JWT│
     │─────────────────▶│                     │
     │                  │  6. RLS validates   │
     │                  │────────────────────▶│
```

### 3.3 Session Management
- JWT tokens stored in secure storage (Expo SecureStore on mobile, httpOnly cookies on web)
- Token refresh handled automatically by Supabase client
- Session persistence across app restarts

### 3.4 Anonymous Access
- Public recipes accessible without auth via RLS policies
- Auth required for: saving recipes, meal planning, social features
- Graceful upgrade path from anonymous to authenticated

---

## 4. Database Schema

### 4.1 Entity Relationship Diagram

```
                                    ┌──────────────────┐
                                    │      users       │
                                    │ (Supabase Auth)  │
                                    └────────┬─────────┘
                                             │
                          ┌──────────────────┼──────────────────┐
                          │                  │                  │
                          ▼                  ▼                  ▼
                   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
                   │  profiles   │    │   follows   │    │ friendships │
                   └──────┬──────┘    └─────────────┘    └─────────────┘
                          │
          ┌───────────────┼───────────────┬────────────────┐
          │               │               │                │
          ▼               ▼               ▼                ▼
   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────────┐
   │   recipes   │ │ meal_plan   │ │grocery_lists│ │notifications │
   └──────┬──────┘ │  _entries   │ └──────┬──────┘ └──────────────┘
          │        └─────────────┘        │
    ┌─────┴─────┐                   ┌─────┴─────┐
    │           │                   │           │
    ▼           ▼                   ▼           ▼
┌────────┐ ┌────────────┐   ┌───────────┐ ┌───────────────┐
│ingredients│ │instructions│ │grocery    │ │grocery_list   │
└────────┘ └────────────┘   │  _items   │ │ _collaborators│
                            └───────────┘ └───────────────┘
```

### 4.2 Complete Schema (PostgreSQL)

```sql
-- ============================================
-- EXTENSIONS
-- ============================================
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";  -- For fuzzy text search

-- ============================================
-- ENUMS
-- ============================================
create type recipe_visibility as enum ('private', 'friends', 'followers', 'public');
create type friendship_status as enum ('pending', 'accepted');
create type notification_type as enum (
  'friend_request',
  'friend_accepted',
  'recipe_shared',
  'list_shared',
  'new_follower'
);

-- ============================================
-- PROFILES (extends Supabase auth.users)
-- ============================================
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  display_name text not null,
  avatar_url text,
  bio text,
  expo_push_token text,  -- For push notifications
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  
  constraint username_format check (
    username ~* '^[a-z0-9_]{3,30}$'
  )
);

-- Index for username search
create index profiles_username_trgm_idx on profiles using gin (username gin_trgm_ops);
create index profiles_display_name_trgm_idx on profiles using gin (display_name gin_trgm_ops);

-- ============================================
-- FOLLOWS (one-way relationship)
-- ============================================
create table follows (
  id uuid default uuid_generate_v4() primary key,
  follower_id uuid references profiles(id) on delete cascade not null,
  followee_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  
  constraint no_self_follow check (follower_id != followee_id),
  constraint unique_follow unique (follower_id, followee_id)
);

create index follows_follower_idx on follows(follower_id);
create index follows_followee_idx on follows(followee_id);

-- ============================================
-- FRIENDSHIPS (mutual relationship)
-- ============================================
create table friendships (
  id uuid default uuid_generate_v4() primary key,
  requester_id uuid references profiles(id) on delete cascade not null,
  addressee_id uuid references profiles(id) on delete cascade not null,
  status friendship_status default 'pending' not null,
  created_at timestamptz default now() not null,
  accepted_at timestamptz,
  
  constraint no_self_friend check (requester_id != addressee_id),
  constraint unique_friendship unique (requester_id, addressee_id)
);

create index friendships_requester_idx on friendships(requester_id);
create index friendships_addressee_idx on friendships(addressee_id);
create index friendships_status_idx on friendships(status);

-- ============================================
-- RECIPES
-- ============================================
create table recipes (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text,
  servings integer default 4,
  prep_time_minutes integer,
  cook_time_minutes integer,
  image_url text,
  visibility recipe_visibility default 'private' not null,
  tags text[] default '{}',
  forked_from_id uuid references recipes(id) on delete set null,
  is_modified boolean default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  
  constraint positive_servings check (servings > 0),
  constraint positive_prep_time check (prep_time_minutes is null or prep_time_minutes >= 0),
  constraint positive_cook_time check (cook_time_minutes is null or cook_time_minutes >= 0)
);

create index recipes_owner_idx on recipes(owner_id);
create index recipes_visibility_idx on recipes(visibility);
create index recipes_tags_idx on recipes using gin(tags);
create index recipes_title_trgm_idx on recipes using gin (title gin_trgm_ops);
create index recipes_forked_from_idx on recipes(forked_from_id);

-- ============================================
-- INGREDIENTS
-- ============================================
create table ingredients (
  id uuid default uuid_generate_v4() primary key,
  recipe_id uuid references recipes(id) on delete cascade not null,
  name text not null,
  quantity decimal(10, 3),  -- Supports fractions like 0.333
  quantity_display text,     -- Original display format: "1/3", "2-3", etc.
  unit text,
  order_index integer not null,
  
  constraint positive_quantity check (quantity is null or quantity >= 0)
);

create index ingredients_recipe_idx on ingredients(recipe_id);

-- ============================================
-- INSTRUCTIONS
-- ============================================
create table instructions (
  id uuid default uuid_generate_v4() primary key,
  recipe_id uuid references recipes(id) on delete cascade not null,
  step_number integer not null,
  text text not null,
  
  constraint positive_step check (step_number > 0),
  constraint unique_step unique (recipe_id, step_number)
);

create index instructions_recipe_idx on instructions(recipe_id);

-- ============================================
-- SHARED RECIPES (direct shares between users)
-- ============================================
create table shared_recipes (
  id uuid default uuid_generate_v4() primary key,
  recipe_id uuid references recipes(id) on delete cascade not null,
  sender_id uuid references profiles(id) on delete cascade not null,
  recipient_id uuid references profiles(id) on delete cascade not null,
  note text,
  shared_at timestamptz default now() not null,
  saved_at timestamptz,  -- null until recipient saves to their collection
  
  constraint no_self_share check (sender_id != recipient_id)
);

create index shared_recipes_recipient_idx on shared_recipes(recipient_id);
create index shared_recipes_sender_idx on shared_recipes(sender_id);

-- ============================================
-- MEAL PLAN ENTRIES
-- ============================================
create table meal_plan_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  recipe_id uuid references recipes(id) on delete cascade not null,
  date date not null,
  label text,  -- Optional: "Breakfast", "Dinner", custom label
  order_index integer default 0 not null,
  created_at timestamptz default now() not null
);

create index meal_plan_user_date_idx on meal_plan_entries(user_id, date);
create index meal_plan_recipe_idx on meal_plan_entries(recipe_id);

-- ============================================
-- GROCERY LISTS
-- ============================================
create table grocery_lists (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index grocery_lists_owner_idx on grocery_lists(owner_id);

-- ============================================
-- GROCERY LIST COLLABORATORS
-- ============================================
create table grocery_list_collaborators (
  id uuid default uuid_generate_v4() primary key,
  list_id uuid references grocery_lists(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  added_at timestamptz default now() not null,
  
  constraint unique_collaborator unique (list_id, user_id)
);

create index grocery_list_collab_list_idx on grocery_list_collaborators(list_id);
create index grocery_list_collab_user_idx on grocery_list_collaborators(user_id);

-- ============================================
-- GROCERY ITEMS
-- ============================================
create table grocery_items (
  id uuid default uuid_generate_v4() primary key,
  list_id uuid references grocery_lists(id) on delete cascade not null,
  name text not null,
  quantity decimal(10, 3),
  quantity_display text,
  unit text,
  category text,  -- "Produce", "Dairy", "Meat", etc.
  checked boolean default false not null,
  checked_by uuid references profiles(id) on delete set null,
  added_by uuid references profiles(id) on delete set null,
  source_recipe_id uuid references recipes(id) on delete set null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index grocery_items_list_idx on grocery_items(list_id);
create index grocery_items_checked_idx on grocery_items(list_id, checked);

-- ============================================
-- NOTIFICATIONS
-- ============================================
create table notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  type notification_type not null,
  title text not null,
  body text,
  data jsonb default '{}',  -- Flexible payload for deep linking
  read boolean default false not null,
  created_at timestamptz default now() not null
);

create index notifications_user_idx on notifications(user_id, created_at desc);
create index notifications_unread_idx on notifications(user_id) where not read;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to check if users are friends
create or replace function are_friends(user1 uuid, user2 uuid)
returns boolean as $$
  select exists (
    select 1 from friendships
    where status = 'accepted'
    and (
      (requester_id = user1 and addressee_id = user2)
      or (requester_id = user2 and addressee_id = user1)
    )
  );
$$ language sql security definer stable;

-- Function to check if user1 follows user2
create or replace function is_following(follower uuid, followee uuid)
returns boolean as $$
  select exists (
    select 1 from follows
    where follower_id = follower and followee_id = followee
  );
$$ language sql security definer stable;

-- Function to check recipe visibility for a viewer
create or replace function can_view_recipe(recipe recipes, viewer_id uuid)
returns boolean as $$
begin
  -- Public recipes are visible to everyone
  if recipe.visibility = 'public' then
    return true;
  end if;
  
  -- All other visibility levels require authentication
  if viewer_id is null then
    return false;
  end if;
  
  -- Owner can always view their own recipes
  if recipe.owner_id = viewer_id then
    return true;
  end if;
  
  -- Followers visibility: viewer must follow owner
  if recipe.visibility = 'followers' then
    return is_following(viewer_id, recipe.owner_id) or are_friends(viewer_id, recipe.owner_id);
  end if;
  
  -- Friends visibility: viewer must be friends with owner
  if recipe.visibility = 'friends' then
    return are_friends(viewer_id, recipe.owner_id);
  end if;
  
  return false;
end;
$$ language plpgsql security definer stable;

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-create profile when user signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, username, display_name)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'username')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Auto-update updated_at timestamp
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on profiles
  for each row execute function update_updated_at();

create trigger recipes_updated_at before update on recipes
  for each row execute function update_updated_at();

create trigger grocery_lists_updated_at before update on grocery_lists
  for each row execute function update_updated_at();

create trigger grocery_items_updated_at before update on grocery_items
  for each row execute function update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

alter table profiles enable row level security;
alter table follows enable row level security;
alter table friendships enable row level security;
alter table recipes enable row level security;
alter table ingredients enable row level security;
alter table instructions enable row level security;
alter table shared_recipes enable row level security;
alter table meal_plan_entries enable row level security;
alter table grocery_lists enable row level security;
alter table grocery_list_collaborators enable row level security;
alter table grocery_items enable row level security;
alter table notifications enable row level security;

-- PROFILES policies
create policy "Public profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- FOLLOWS policies
create policy "Follows are viewable by everyone"
  on follows for select using (true);

create policy "Users can follow others"
  on follows for insert with check (auth.uid() = follower_id);

create policy "Users can unfollow"
  on follows for delete using (auth.uid() = follower_id);

-- FRIENDSHIPS policies
create policy "Users can view own friendships"
  on friendships for select using (
    auth.uid() = requester_id or auth.uid() = addressee_id
  );

create policy "Users can send friend requests"
  on friendships for insert with check (auth.uid() = requester_id);

create policy "Users can update friendships they're part of"
  on friendships for update using (
    auth.uid() = requester_id or auth.uid() = addressee_id
  );

create policy "Users can delete friendships they're part of"
  on friendships for delete using (
    auth.uid() = requester_id or auth.uid() = addressee_id
  );

-- RECIPES policies
create policy "Users can view recipes based on visibility"
  on recipes for select using (
    can_view_recipe(recipes, auth.uid())
  );

create policy "Users can create own recipes"
  on recipes for insert with check (auth.uid() = owner_id);

create policy "Users can update own recipes"
  on recipes for update using (auth.uid() = owner_id);

create policy "Users can delete own recipes"
  on recipes for delete using (auth.uid() = owner_id);

-- INGREDIENTS policies
create policy "Users can view ingredients of viewable recipes"
  on ingredients for select using (
    exists (
      select 1 from recipes
      where recipes.id = ingredients.recipe_id
      and can_view_recipe(recipes, auth.uid())
    )
  );

create policy "Users can manage ingredients of own recipes"
  on ingredients for all using (
    exists (
      select 1 from recipes
      where recipes.id = ingredients.recipe_id
      and recipes.owner_id = auth.uid()
    )
  );

-- INSTRUCTIONS policies (same pattern as ingredients)
create policy "Users can view instructions of viewable recipes"
  on instructions for select using (
    exists (
      select 1 from recipes
      where recipes.id = instructions.recipe_id
      and can_view_recipe(recipes, auth.uid())
    )
  );

create policy "Users can manage instructions of own recipes"
  on instructions for all using (
    exists (
      select 1 from recipes
      where recipes.id = instructions.recipe_id
      and recipes.owner_id = auth.uid()
    )
  );

-- SHARED_RECIPES policies
create policy "Users can view shared recipes they sent or received"
  on shared_recipes for select using (
    auth.uid() = sender_id or auth.uid() = recipient_id
  );

create policy "Users can share recipes they own"
  on shared_recipes for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from recipes where id = recipe_id and owner_id = auth.uid()
    )
  );

create policy "Recipients can update shared recipes (to mark as saved)"
  on shared_recipes for update using (auth.uid() = recipient_id);

-- MEAL_PLAN_ENTRIES policies
create policy "Users can view own meal plan"
  on meal_plan_entries for select using (auth.uid() = user_id);

create policy "Users can manage own meal plan"
  on meal_plan_entries for all using (auth.uid() = user_id);

-- GROCERY_LISTS policies
create policy "Users can view lists they own or collaborate on"
  on grocery_lists for select using (
    auth.uid() = owner_id
    or exists (
      select 1 from grocery_list_collaborators
      where list_id = grocery_lists.id and user_id = auth.uid()
    )
  );

create policy "Users can create own lists"
  on grocery_lists for insert with check (auth.uid() = owner_id);

create policy "Owners can update lists"
  on grocery_lists for update using (auth.uid() = owner_id);

create policy "Owners can delete lists"
  on grocery_lists for delete using (auth.uid() = owner_id);

-- GROCERY_LIST_COLLABORATORS policies
create policy "Users can view collaborators of accessible lists"
  on grocery_list_collaborators for select using (
    exists (
      select 1 from grocery_lists
      where id = list_id and (
        owner_id = auth.uid()
        or exists (
          select 1 from grocery_list_collaborators glc
          where glc.list_id = grocery_lists.id and glc.user_id = auth.uid()
        )
      )
    )
  );

create policy "List owners can manage collaborators"
  on grocery_list_collaborators for all using (
    exists (
      select 1 from grocery_lists
      where id = list_id and owner_id = auth.uid()
    )
  );

-- GROCERY_ITEMS policies
create policy "Users can view items in accessible lists"
  on grocery_items for select using (
    exists (
      select 1 from grocery_lists
      where id = list_id and (
        owner_id = auth.uid()
        or exists (
          select 1 from grocery_list_collaborators
          where list_id = grocery_lists.id and user_id = auth.uid()
        )
      )
    )
  );

create policy "Users can manage items in accessible lists"
  on grocery_items for all using (
    exists (
      select 1 from grocery_lists
      where id = list_id and (
        owner_id = auth.uid()
        or exists (
          select 1 from grocery_list_collaborators
          where list_id = grocery_lists.id and user_id = auth.uid()
        )
      )
    )
  );

-- NOTIFICATIONS policies
create policy "Users can view own notifications"
  on notifications for select using (auth.uid() = user_id);

create policy "Users can update own notifications"
  on notifications for update using (auth.uid() = user_id);
```

---

## 5. Supabase Storage Configuration

### 5.1 Buckets

```sql
-- Create storage bucket for recipe images
insert into storage.buckets (id, name, public)
values ('recipe-images', 'recipe-images', true);

-- Create storage bucket for avatars
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true);
```

### 5.2 Storage Policies

```sql
-- Recipe images: anyone can view, owners can upload/delete
create policy "Public recipe images"
  on storage.objects for select
  using (bucket_id = 'recipe-images');

create policy "Users can upload recipe images"
  on storage.objects for insert
  with check (
    bucket_id = 'recipe-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own recipe images"
  on storage.objects for delete
  using (
    bucket_id = 'recipe-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Avatar images: same pattern
create policy "Public avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
```

### 5.3 File Path Convention

```
recipe-images/
  └── {user_id}/
      └── {recipe_id}/
          └── {filename}.{ext}

avatars/
  └── {user_id}/
      └── avatar.{ext}
```

---

## 6. Push Notifications Architecture

### 6.1 Overview

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Database   │────▶│  Edge Function   │────▶│  Expo Push API  │
│   Trigger    │     │  (send-push)     │     │                 │
└──────────────┘     └──────────────────┘     └────────┬────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │  User's Device  │
                                              │  (iOS/Android)  │
                                              └─────────────────┘
```

### 6.2 Notification Triggers

| Event | Notification Type | Recipient |
|-------|-------------------|-----------|
| Friend request sent | `friend_request` | Addressee |
| Friend request accepted | `friend_accepted` | Requester |
| Recipe shared directly | `recipe_shared` | Recipient |
| Grocery list shared | `list_shared` | Collaborator |
| New follower | `new_follower` | Followee |

### 6.3 Edge Function: send-push

```typescript
// supabase/functions/send-push/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

interface PushPayload {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

serve(async (req) => {
  try {
    const payload: PushPayload = await req.json();
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get user's push token
    const { data: profile } = await supabase
      .from("profiles")
      .select("expo_push_token")
      .eq("id", payload.userId)
      .single();

    if (!profile?.expo_push_token) {
      return new Response(JSON.stringify({ success: false, reason: "No push token" }), {
        status: 200,
      });
    }

    // Send push via Expo
    const response = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: profile.expo_push_token,
        title: payload.title,
        body: payload.body,
        data: payload.data,
        sound: "default",
      }),
    });

    const result = await response.json();
    
    return new Response(JSON.stringify({ success: true, result }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
});
```

### 6.4 Database Trigger for Notifications

```sql
-- Function to call edge function when notification is created
create or replace function notify_push()
returns trigger as $$
declare
  payload json;
begin
  payload := json_build_object(
    'userId', new.user_id,
    'title', new.title,
    'body', coalesce(new.body, ''),
    'data', new.data
  );
  
  -- Call edge function asynchronously
  perform net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/send-push',
    headers := json_build_object(
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key'),
      'Content-Type', 'application/json'
    )::jsonb,
    body := payload::jsonb
  );
  
  return new;
end;
$$ language plpgsql security definer;

create trigger on_notification_created
  after insert on notifications
  for each row execute function notify_push();
```

### 6.5 Web Push (Future Enhancement)

For web browsers, implement Web Push API separately:
- Service Worker registration
- VAPID keys for authentication
- Separate edge function endpoint for web push

---

## 7. Real-time Synchronization

### 7.1 Realtime Channels

Supabase Realtime used for:
1. **Grocery List Collaboration** - Live updates when items are checked/added
2. **Notifications** - Instant notification delivery

### 7.2 Client Subscription Example

```typescript
// Subscribe to grocery list changes
const subscribeToGroceryList = (listId: string) => {
  return supabase
    .channel(`grocery-list:${listId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "grocery_items",
        filter: `list_id=eq.${listId}`,
      },
      (payload) => {
        // Handle item changes
        switch (payload.eventType) {
          case "INSERT":
            addItemToState(payload.new);
            break;
          case "UPDATE":
            updateItemInState(payload.new);
            break;
          case "DELETE":
            removeItemFromState(payload.old);
            break;
        }
      }
    )
    .subscribe();
};

// Subscribe to notifications
const subscribeToNotifications = (userId: string) => {
  return supabase
    .channel(`notifications:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        showInAppNotification(payload.new);
      }
    )
    .subscribe();
};
```

---

## 8. Frontend Architecture

### 8.1 Project Structure

```
recipe-app/
├── app/                          # Expo Router file-based routing
│   ├── (auth)/                   # Auth group (unauthenticated)
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/                   # Main tab navigator
│   │   ├── _layout.tsx
│   │   ├── index.tsx             # Home/Recipe collection
│   │   ├── discover.tsx          # Public recipe browsing
│   │   ├── meal-plan.tsx         # Weekly meal planning
│   │   ├── grocery.tsx           # Grocery lists
│   │   └── profile.tsx           # User profile
│   ├── recipe/
│   │   ├── [id].tsx              # Recipe detail
│   │   ├── create.tsx            # Create recipe
│   │   ├── edit/[id].tsx         # Edit recipe
│   │   └── cook/[id].tsx         # Cook mode
│   ├── user/
│   │   └── [username].tsx        # Public user profile
│   ├── list/
│   │   └── [id].tsx              # Grocery list detail
│   ├── _layout.tsx               # Root layout
│   └── index.tsx                 # Entry point / splash
│
├── components/
│   ├── ui/                       # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── ...
│   ├── recipe/
│   │   ├── RecipeCard.tsx
│   │   ├── RecipeForm.tsx
│   │   ├── IngredientList.tsx
│   │   ├── InstructionList.tsx
│   │   └── ServingScaler.tsx
│   ├── meal-plan/
│   │   ├── WeekView.tsx
│   │   ├── DayColumn.tsx
│   │   └── MealEntry.tsx
│   ├── grocery/
│   │   ├── GroceryListCard.tsx
│   │   ├── GroceryItem.tsx
│   │   └── CategoryGroup.tsx
│   └── social/
│       ├── UserCard.tsx
│       ├── FriendsList.tsx
│       ├── FollowersList.tsx
│       └── ShareModal.tsx
│
├── hooks/
│   ├── useAuth.ts
│   ├── useRecipes.ts
│   ├── useMealPlan.ts
│   ├── useGroceryLists.ts
│   ├── useFriends.ts
│   ├── useNotifications.ts
│   └── useRealtimeSubscription.ts
│
├── lib/
│   ├── supabase.ts               # Supabase client init
│   ├── auth.ts                   # Auth helpers
│   ├── storage.ts                # Image upload helpers
│   └── notifications.ts          # Push notification setup
│
├── stores/                       # State management (Zustand)
│   ├── authStore.ts
│   ├── recipeStore.ts
│   ├── mealPlanStore.ts
│   ├── groceryStore.ts
│   └── notificationStore.ts
│
├── types/
│   ├── database.ts               # Generated Supabase types
│   ├── recipe.ts
│   ├── user.ts
│   └── grocery.ts
│
├── utils/
│   ├── ingredient-parser.ts      # Parse ingredient strings
│   ├── ingredient-aggregator.ts  # Combine ingredients
│   ├── fraction-utils.ts         # Handle fractions
│   └── date-utils.ts
│
├── constants/
│   ├── categories.ts             # Grocery categories
│   ├── units.ts                  # Measurement units
│   └── theme.ts                  # Design tokens
│
├── app.json                      # Expo config
├── package.json
└── tsconfig.json
```

### 8.2 State Management

Using **Zustand** for client state with persistence:

```typescript
// stores/authStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Session, User } from "@supabase/supabase-js";

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      user: null,
      profile: null,
      isLoading: true,
      setSession: (session) =>
        set({ session, user: session?.user ?? null, isLoading: false }),
      setProfile: (profile) => set({ profile }),
      signOut: () => set({ session: null, user: null, profile: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ session: state.session }),
    }
  )
);
```

### 8.3 Data Fetching Pattern

Using **TanStack Query** (React Query) for server state:

```typescript
// hooks/useRecipes.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Recipe } from "@/types/recipe";

export function useRecipes() {
  return useQuery({
    queryKey: ["recipes", "own"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipes")
        .select(`
          *,
          ingredients (
            id, name, quantity, quantity_display, unit, order_index
          ),
          instructions (
            id, step_number, text
          )
        `)
        .eq("owner_id", (await supabase.auth.getUser()).data.user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Recipe[];
    },
  });
}

export function useRecipe(id: string) {
  return useQuery({
    queryKey: ["recipes", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipes")
        .select(`
          *,
          owner:profiles!owner_id (
            id, username, display_name, avatar_url
          ),
          forked_from:recipes!forked_from_id (
            id, title, owner:profiles!owner_id (username)
          ),
          ingredients (
            id, name, quantity, quantity_display, unit, order_index
          ),
          instructions (
            id, step_number, text
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Recipe;
    },
    enabled: !!id,
  });
}

export function useCreateRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recipe: CreateRecipeInput) => {
      // Insert recipe
      const { data: newRecipe, error: recipeError } = await supabase
        .from("recipes")
        .insert({
          title: recipe.title,
          description: recipe.description,
          servings: recipe.servings,
          prep_time_minutes: recipe.prepTime,
          cook_time_minutes: recipe.cookTime,
          visibility: recipe.visibility,
          tags: recipe.tags,
          image_url: recipe.imageUrl,
        })
        .select()
        .single();

      if (recipeError) throw recipeError;

      // Insert ingredients
      if (recipe.ingredients.length > 0) {
        const { error: ingredientsError } = await supabase
          .from("ingredients")
          .insert(
            recipe.ingredients.map((ing, idx) => ({
              recipe_id: newRecipe.id,
              name: ing.name,
              quantity: ing.quantity,
              quantity_display: ing.quantityDisplay,
              unit: ing.unit,
              order_index: idx,
            }))
          );
        if (ingredientsError) throw ingredientsError;
      }

      // Insert instructions
      if (recipe.instructions.length > 0) {
        const { error: instructionsError } = await supabase
          .from("instructions")
          .insert(
            recipe.instructions.map((inst, idx) => ({
              recipe_id: newRecipe.id,
              step_number: idx + 1,
              text: inst,
            }))
          );
        if (instructionsError) throw instructionsError;
      }

      return newRecipe;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
}
```

### 8.4 Offline Preparation

Data layer abstraction for future offline support:

```typescript
// lib/data-layer.ts
// This abstraction will allow swapping in offline-first storage later

export interface DataLayer {
  recipes: {
    list: () => Promise<Recipe[]>;
    get: (id: string) => Promise<Recipe>;
    create: (recipe: CreateRecipeInput) => Promise<Recipe>;
    update: (id: string, updates: UpdateRecipeInput) => Promise<Recipe>;
    delete: (id: string) => Promise<void>;
  };
  // ... other entities
}

// Current implementation: direct Supabase
export const dataLayer: DataLayer = {
  recipes: {
    list: () => supabaseRecipes.list(),
    get: (id) => supabaseRecipes.get(id),
    create: (recipe) => supabaseRecipes.create(recipe),
    update: (id, updates) => supabaseRecipes.update(id, updates),
    delete: (id) => supabaseRecipes.delete(id),
  },
};

// Future: swap in offline-first implementation
// export const dataLayer: DataLayer = offlineFirstDataLayer;
```

---

## 9. Key Implementation Details

### 9.1 Ingredient Aggregation

```typescript
// utils/ingredient-aggregator.ts
interface ParsedIngredient {
  name: string;
  quantity: number | null;
  unit: string | null;
}

interface AggregatedIngredient {
  name: string;
  quantities: { amount: number; unit: string }[];
  category: string;
}

export function aggregateIngredients(
  ingredients: ParsedIngredient[]
): AggregatedIngredient[] {
  const grouped = new Map<string, AggregatedIngredient>();

  for (const ing of ingredients) {
    const normalizedName = normalizeIngredientName(ing.name);
    const category = categorizeIngredient(normalizedName);

    if (!grouped.has(normalizedName)) {
      grouped.set(normalizedName, {
        name: ing.name,
        quantities: [],
        category,
      });
    }

    const existing = grouped.get(normalizedName)!;
    
    if (ing.quantity && ing.unit) {
      // Try to combine with existing quantity of same unit
      const sameUnit = existing.quantities.find(
        (q) => normalizeUnit(q.unit) === normalizeUnit(ing.unit!)
      );
      
      if (sameUnit) {
        sameUnit.amount += ing.quantity;
      } else {
        existing.quantities.push({ amount: ing.quantity, unit: ing.unit });
      }
    }
  }

  return Array.from(grouped.values()).sort((a, b) =>
    a.category.localeCompare(b.category)
  );
}

function normalizeIngredientName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    // Remove common descriptors that don't change the ingredient
    .replace(/\b(fresh|dried|chopped|diced|minced|sliced)\b/g, "")
    .trim();
}

function normalizeUnit(unit: string): string {
  const unitMap: Record<string, string> = {
    tbsp: "tablespoon",
    tbs: "tablespoon",
    tablespoon: "tablespoon",
    tablespoons: "tablespoon",
    tsp: "teaspoon",
    teaspoon: "teaspoon",
    teaspoons: "teaspoon",
    cup: "cup",
    cups: "cup",
    oz: "ounce",
    ounce: "ounce",
    ounces: "ounce",
    lb: "pound",
    lbs: "pound",
    pound: "pound",
    pounds: "pound",
    g: "gram",
    gram: "gram",
    grams: "gram",
    // ... more mappings
  };
  return unitMap[unit.toLowerCase()] || unit.toLowerCase();
}

function categorizeIngredient(name: string): string {
  const categories: Record<string, string[]> = {
    Produce: ["onion", "garlic", "tomato", "lettuce", "carrot", "pepper", "potato"],
    Dairy: ["milk", "cheese", "butter", "cream", "yogurt", "egg"],
    Meat: ["chicken", "beef", "pork", "fish", "salmon", "shrimp"],
    Pantry: ["flour", "sugar", "salt", "oil", "vinegar", "rice", "pasta"],
    Spices: ["cumin", "paprika", "oregano", "basil", "thyme", "cinnamon"],
    Bakery: ["bread", "tortilla", "bun", "roll"],
    Frozen: ["frozen"],
    Beverages: ["juice", "wine", "beer", "soda"],
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some((kw) => name.includes(kw))) {
      return category;
    }
  }
  return "Other";
}
```

### 9.2 Serving Scaler

```typescript
// utils/serving-scaler.ts
import Fraction from "fraction.js";

export function scaleIngredient(
  quantity: number | null,
  originalServings: number,
  targetServings: number
): number | null {
  if (quantity === null) return null;
  return (quantity / originalServings) * targetServings;
}

export function formatQuantity(quantity: number): string {
  // Convert decimal to fraction for display
  const fraction = new Fraction(quantity).simplify(0.01);
  
  const whole = Math.floor(fraction.valueOf());
  const remainder = fraction.sub(whole);
  
  if (remainder.valueOf() === 0) {
    return whole.toString();
  }
  
  if (whole === 0) {
    return remainder.toFraction();
  }
  
  return `${whole} ${remainder.toFraction()}`;
}

// Example: formatQuantity(1.5) => "1 1/2"
// Example: formatQuantity(0.333) => "1/3"
// Example: formatQuantity(2) => "2"
```

### 9.3 Push Notification Registration (Client)

```typescript
// lib/notifications.ts
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { supabase } from "./supabase";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log("Push notifications require a physical device");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Push notification permission not granted");
    return null;
  }

  // Get Expo push token
  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId: "your-expo-project-id", // From app.json
  });

  const token = tokenData.data;

  // Save token to user profile
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase
      .from("profiles")
      .update({ expo_push_token: token })
      .eq("id", user.id);
  }

  // Android-specific channel setup
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return token;
}

export function setupNotificationListeners(
  onNotification: (notification: Notifications.Notification) => void,
  onNotificationResponse: (response: Notifications.NotificationResponse) => void
) {
  const notificationListener = Notifications.addNotificationReceivedListener(
    onNotification
  );

  const responseListener = Notifications.addNotificationResponseReceivedListener(
    onNotificationResponse
  );

  return () => {
    Notifications.removeNotificationSubscription(notificationListener);
    Notifications.removeNotificationSubscription(responseListener);
  };
}
```

---

## 10. Deployment Considerations

### 10.1 Supabase Project Setup

1. Create Supabase project at supabase.com
2. Run schema SQL in SQL Editor
3. Configure Auth providers (Email, Google)
4. Set up Storage buckets
5. Deploy Edge Functions
6. Configure environment variables

### 10.2 Environment Variables

```bash
# .env.local (client)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase Edge Functions
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 10.3 Expo Configuration

```json
// app.json
{
  "expo": {
    "name": "Recipe App",
    "slug": "recipe-app",
    "version": "1.0.0",
    "platforms": ["ios", "android", "web"],
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff"
        }
      ]
    ],
    "ios": {
      "bundleIdentifier": "com.yourcompany.recipeapp",
      "supportsTablet": true
    },
    "android": {
      "package": "com.yourcompany.recipeapp",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "googleServicesFile": "./google-services.json"
    },
    "web": {
      "bundler": "metro",
      "favicon": "./assets/favicon.png"
    }
  }
}
```

---

## 11. Future Considerations (Post-MVP)

### 11.1 Offline Support

- Implement local SQLite database (expo-sqlite or WatermelonDB)
- Sync engine for conflict resolution
- Queue offline mutations for replay
- Background sync when connectivity restored

### 11.2 URL Recipe Import

- Parser service (Edge Function or external)
- Schema.org Recipe structured data extraction
- Fallback to HTML scraping
- Support for common recipe sites

### 11.3 Advanced Features

- AI meal suggestions (integrate Claude API)
- Nutritional data integration
- Voice commands in cook mode
- Barcode scanning for pantry
- Calendar integrations

---

## 12. Security Checklist

- [x] Row Level Security enabled on all tables
- [x] Service role key only used in Edge Functions
- [x] Anon key safe for client exposure
- [x] Storage policies restrict uploads to authenticated users
- [x] Input validation on all user inputs
- [x] Rate limiting via Supabase (built-in)
- [ ] CORS configuration for web
- [ ] API key rotation schedule
- [ ] Audit logging for sensitive operations

---

## Appendix A: API Quick Reference

### Auth
```typescript
supabase.auth.signUp({ email, password, options: { data: { username, display_name } } })
supabase.auth.signInWithPassword({ email, password })
supabase.auth.signInWithOAuth({ provider: 'google' })
supabase.auth.signOut()
supabase.auth.getUser()
supabase.auth.onAuthStateChange(callback)
```

### Recipes
```typescript
// List own recipes
supabase.from('recipes').select('*, ingredients(*), instructions(*)').eq('owner_id', userId)

// Get single recipe
supabase.from('recipes').select('*, owner:profiles(*), ingredients(*), instructions(*)').eq('id', recipeId).single()

// Public recipes
supabase.from('recipes').select('*, owner:profiles(*)').eq('visibility', 'public')

// Create recipe
supabase.from('recipes').insert({ ... }).select().single()

// Update recipe
supabase.from('recipes').update({ ... }).eq('id', recipeId)

// Delete recipe
supabase.from('recipes').delete().eq('id', recipeId)
```

### Social
```typescript
// Follow user
supabase.from('follows').insert({ follower_id: myId, followee_id: userId })

// Send friend request
supabase.from('friendships').insert({ requester_id: myId, addressee_id: userId })

// Accept friend request
supabase.from('friendships').update({ status: 'accepted', accepted_at: new Date() }).eq('id', requestId)

// Share recipe
supabase.from('shared_recipes').insert({ recipe_id, sender_id: myId, recipient_id, note })
```

### Grocery Lists
```typescript
// Create list
supabase.from('grocery_lists').insert({ name, owner_id: myId })

// Add collaborator
supabase.from('grocery_list_collaborators').insert({ list_id, user_id })

// Subscribe to realtime changes
supabase.channel(`list:${listId}`).on('postgres_changes', { ... }).subscribe()
```

---

*End of Architecture Document*
