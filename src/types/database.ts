export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          level: number;
          xp: number;
          active_aquarium_id: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          level?: number;
          xp?: number;
          active_aquarium_id?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          level?: number;
          xp?: number;
          active_aquarium_id?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      fish_species: {
        Row: {
          id: string;
          name: string;
          scientific_name: string;
          origin_habitat: string;
          origin_type: string;
          rarity: string;
          description: string;
          unique_fact: string;
          buy_price: number;
          base_sell_price: number;
          growth_time_seconds: number;
          hunger_rate: number;
          preferred_water_quality: number;
          max_size_cm: number;
          body_shape: string;
          colors: Json;
        };
      };
      player_fish: {
        Row: {
          id: string;
          user_id: string;
          species_id: string;
          aquarium_id: string;
          nickname: string;
          hunger: number;
          health: number;
          age_seconds: number;
          stage: string;
          current_size_cm: number;
          in_aquarium: boolean;
          born_at: string;
          last_fed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          species_id: string;
          aquarium_id: string;
          nickname?: string;
          hunger?: number;
          health?: number;
          age_seconds?: number;
          stage?: string;
          current_size_cm?: number;
          in_aquarium?: boolean;
          born_at?: string;
          last_fed_at?: string;
        };
        Update: {
          aquarium_id?: string;
          nickname?: string;
          hunger?: number;
          health?: number;
          age_seconds?: number;
          stage?: string;
          current_size_cm?: number;
          in_aquarium?: boolean;
          last_fed_at?: string;
        };
      };
      player_wallet: {
        Row: {
          user_id: string;
          coins: number;
          total_earned: number;
          total_spent: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          coins?: number;
          total_earned?: number;
          total_spent?: number;
          updated_at?: string;
        };
        Update: {
          coins?: number;
          total_earned?: number;
          total_spent?: number;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          amount: number;
          balance_after: number;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          amount: number;
          balance_after: number;
          description: string;
          created_at?: string;
        };
      };
      aquariums: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          capacity: number;
          water_quality: number;
          filter_level: number;
          aerator_level: number;
          temperature: number;
          theme: string;
          decorations: Json;
          last_cleaned_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          capacity?: number;
          water_quality?: number;
          filter_level?: number;
          aerator_level?: number;
          temperature?: number;
          theme?: string;
          decorations?: Json;
          last_cleaned_at?: string;
          created_at?: string;
        };
        Update: {
          name?: string;
          capacity?: number;
          water_quality?: number;
          filter_level?: number;
          aerator_level?: number;
          temperature?: number;
          theme?: string;
          decorations?: Json;
          last_cleaned_at?: string;
        };
      };
      inventory: {
        Row: {
          id: string;
          user_id: string;
          item_id: string;
          category: string;
          name: string;
          quantity: number;
          description: string;
          icon: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          item_id: string;
          category: string;
          name: string;
          quantity?: number;
          description: string;
          icon: string;
          updated_at?: string;
        };
        Update: {
          quantity?: number;
          updated_at?: string;
        };
      };
      daily_missions: {
        Row: {
          id: string;
          user_id: string;
          mission_key: string;
          target_count: number;
          current_count: number;
          reward_coins: number;
          reward_xp: number;
          is_completed: boolean;
          is_claimed: boolean;
          mission_date: string;
        };
      };
      player_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_key: string;
          current_count: number;
          is_unlocked: boolean;
          is_claimed: boolean;
          unlocked_at: string | null;
        };
      };
    };
    Functions: {
      buy_fish_transaction: {
        Args: {
          p_species_id: string;
          p_aquarium_id: string;
          p_nickname?: string;
        };
        Returns: { success: boolean; new_fish_id?: string; new_balance?: number; error?: string };
      };
      sell_fish_transaction: {
        Args: {
          p_fish_id: string;
        };
        Returns: { success: boolean; reward_coins?: number; new_balance?: number; error?: string };
      };
      buy_shop_item_transaction: {
        Args: {
          p_item_id: string;
          p_quantity?: number;
        };
        Returns: { success: boolean; new_balance?: number; error?: string };
      };
      feed_aquarium_transaction: {
        Args: {
          p_aquarium_id: string;
          p_food_item_id?: string;
        };
        Returns: { success: boolean; error?: string };
      };
      clean_aquarium_transaction: {
        Args: {
          p_aquarium_id: string;
        };
        Returns: { success: boolean; new_quality?: number; cost?: number; new_balance?: number; error?: string };
      };
    };
  };
}
