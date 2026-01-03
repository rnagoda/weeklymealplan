import type { Database } from './database';

// Base types from database
export type Recipe = Database['public']['Tables']['recipes']['Row'];
export type Ingredient = Database['public']['Tables']['ingredients']['Row'];
export type Instruction = Database['public']['Tables']['instructions']['Row'];

// Recipe with related data
export interface RecipeWithDetails extends Recipe {
  ingredients: Ingredient[];
  instructions: Instruction[];
  author?: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  };
}

// Input types for creating/updating
export interface IngredientInput {
  id?: string;
  name: string;
  quantity: number | null;
  quantity_display: string | null;
  unit: string | null;
  notes: string | null;
  order_index: number;
}

export interface InstructionInput {
  id?: string;
  step_number: number;
  content: string;
  duration_minutes: number | null;
}

export interface RecipeInput {
  title: string;
  description: string | null;
  servings: number;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  source_url: string | null;
  image_url: string | null;
  visibility: 'private' | 'friends' | 'followers' | 'public';
  category: string | null;
  cuisine: string | null;
  ingredients: IngredientInput[];
  instructions: InstructionInput[];
}

// Visibility options for UI
export const VISIBILITY_OPTIONS = [
  { value: 'private', label: 'Only me', icon: 'lock-closed' },
  { value: 'friends', label: 'Friends only', icon: 'people' },
  { value: 'followers', label: 'Followers', icon: 'person-add' },
  { value: 'public', label: 'Everyone', icon: 'globe' },
] as const;

// Category options
export const CATEGORY_OPTIONS = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Appetizer',
  'Dessert',
  'Snack',
  'Beverage',
  'Side Dish',
  'Soup',
  'Salad',
  'Sauce',
  'Other',
] as const;

// Cuisine options
export const CUISINE_OPTIONS = [
  'American',
  'Chinese',
  'French',
  'Indian',
  'Italian',
  'Japanese',
  'Korean',
  'Mediterranean',
  'Mexican',
  'Thai',
  'Vietnamese',
  'Other',
] as const;
