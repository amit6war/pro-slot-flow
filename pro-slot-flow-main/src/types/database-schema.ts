// Generated schema types from Supabase
// Generated on: 2025-09-03T06:40:26.269Z

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string | null;
          name: string | null;
          description: string | null;
          icon: string | null;
          is_active: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          name?: string | null;
          description?: string | null;
          icon?: string | null;
          is_active?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          name?: string | null;
          description?: string | null;
          icon?: string | null;
          is_active?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      subcategories: {
        Row: {
          id: string | null;
          category_id: string | null;
          name: string | null;
          description: string | null;
          min_price: string | null;
          max_price: string | null;
          is_active: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          category_id?: string | null;
          name?: string | null;
          description?: string | null;
          min_price?: string | null;
          max_price?: string | null;
          is_active?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          category_id?: string | null;
          name?: string | null;
          description?: string | null;
          min_price?: string | null;
          max_price?: string | null;
          is_active?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      locations: {
        Row: {
          id: string | null;
          name: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          postal_code: string | null;
          country: string | null;
          latitude: string | null;
          longitude: string | null;
          is_active: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          name?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          postal_code?: string | null;
          country?: string | null;
          latitude?: string | null;
          longitude?: string | null;
          is_active?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          name?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          postal_code?: string | null;
          country?: string | null;
          latitude?: string | null;
          longitude?: string | null;
          is_active?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      user_profiles: {
        Row: {
        };
        Insert: {
        };
        Update: {
        };
      };
      provider_services: {
        Row: {
        };
        Insert: {
        };
        Update: {
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}