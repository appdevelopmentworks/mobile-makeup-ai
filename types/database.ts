// Database Types (Supabase)
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          subscription_status: 'free' | 'premium' | 'cancelled'
          subscription_end_date: string | null
          monthly_usage_count: number
          usage_reset_date: string
          metadata: Json
          personal_color_type: 'spring' | 'summer' | 'autumn' | 'winter' | null
          face_shape: 'oval' | 'round' | 'square' | 'heart' | 'oblong' | null
          skin_type: 'dry' | 'oily' | 'combination' | 'normal' | 'sensitive' | null
          created_at: string
          updated_at: string
          last_login_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          subscription_status?: 'free' | 'premium' | 'cancelled'
          subscription_end_date?: string | null
          monthly_usage_count?: number
          usage_reset_date?: string
          metadata?: Json
          personal_color_type?: 'spring' | 'summer' | 'autumn' | 'winter' | null
          face_shape?: 'oval' | 'round' | 'square' | 'heart' | 'oblong' | null
          skin_type?: 'dry' | 'oily' | 'combination' | 'normal' | 'sensitive' | null
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          subscription_status?: 'free' | 'premium' | 'cancelled'
          subscription_end_date?: string | null
          monthly_usage_count?: number
          usage_reset_date?: string
          metadata?: Json
          personal_color_type?: 'spring' | 'summer' | 'autumn' | 'winter' | null
          face_shape?: 'oval' | 'round' | 'square' | 'heart' | 'oblong' | null
          skin_type?: 'dry' | 'oily' | 'combination' | 'normal' | 'sensitive' | null
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
        }
      }
      analysis_history: {
        Row: {
          id: string
          user_id: string
          original_image_data: string | null
          image_storage_url: string | null
          face_analysis: Json
          skin_analysis: Json
          current_makeup_analysis: Json
          selected_trend_region: string
          analysis_type: 'standard' | 'quick' | 'detailed' | 'professional'
          occasion: 'daily' | 'business' | 'party' | 'date' | 'wedding' | 'photo_shoot' | null
          ai_model_version: string | null
          ai_prompt_used: Json | null
          processing_time_ms: number | null
          status: 'pending' | 'processing' | 'completed' | 'failed'
          error_message: string | null
          created_at: string
          completed_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          original_image_data?: string | null
          image_storage_url?: string | null
          face_analysis?: Json
          skin_analysis?: Json
          current_makeup_analysis?: Json
          selected_trend_region?: string
          analysis_type?: 'standard' | 'quick' | 'detailed' | 'professional'
          occasion?: 'daily' | 'business' | 'party' | 'date' | 'wedding' | 'photo_shoot' | null
          ai_model_version?: string | null
          ai_prompt_used?: Json | null
          processing_time_ms?: number | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          error_message?: string | null
          created_at?: string
          completed_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          original_image_data?: string | null
          image_storage_url?: string | null
          face_analysis?: Json
          skin_analysis?: Json
          current_makeup_analysis?: Json
          selected_trend_region?: string
          analysis_type?: 'standard' | 'quick' | 'detailed' | 'professional'
          occasion?: 'daily' | 'business' | 'party' | 'date' | 'wedding' | 'photo_shoot' | null
          ai_model_version?: string | null
          ai_prompt_used?: Json | null
          processing_time_ms?: number | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          error_message?: string | null
          created_at?: string
          completed_at?: string | null
          deleted_at?: string | null
        }
      }
      makeup_suggestions: {
        Row: {
          id: string
          analysis_id: string
          base_makeup: Json
          eye_makeup: Json
          lip_makeup: Json
          cheek_makeup: Json
          instructions: string[] | null
          tips: string[] | null
          warnings: string[] | null
          recommended_products: string[] | null
          confidence_score: number | null
          suitability_score: number | null
          user_rating: number | null
          user_feedback: string | null
          created_at: string
        }
        Insert: {
          id?: string
          analysis_id: string
          base_makeup?: Json
          eye_makeup?: Json
          lip_makeup?: Json
          cheek_makeup?: Json
          instructions?: string[] | null
          tips?: string[] | null
          warnings?: string[] | null
          recommended_products?: string[] | null
          confidence_score?: number | null
          suitability_score?: number | null
          user_rating?: number | null
          user_feedback?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          analysis_id?: string
          base_makeup?: Json
          eye_makeup?: Json
          lip_makeup?: Json
          cheek_makeup?: Json
          instructions?: string[] | null
          tips?: string[] | null
          warnings?: string[] | null
          recommended_products?: string[] | null
          confidence_score?: number | null
          suitability_score?: number | null
          user_rating?: number | null
          user_feedback?: string | null
          created_at?: string
        }
      }
      generated_images: {
        Row: {
          id: string
          analysis_id: string
          generated_image_data: string | null
          thumbnail_data: string | null
          storage_url: string | null
          generation_model: string
          generation_params: Json
          prompt_template: string | null
          seed_value: number | null
          generation_time_ms: number | null
          model_version: string | null
          view_count: number
          is_favorite: boolean
          created_at: string
          expires_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          analysis_id: string
          generated_image_data?: string | null
          thumbnail_data?: string | null
          storage_url?: string | null
          generation_model: string
          generation_params?: Json
          prompt_template?: string | null
          seed_value?: number | null
          generation_time_ms?: number | null
          model_version?: string | null
          view_count?: number
          is_favorite?: boolean
          created_at?: string
          expires_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          analysis_id?: string
          generated_image_data?: string | null
          thumbnail_data?: string | null
          storage_url?: string | null
          generation_model?: string
          generation_params?: Json
          prompt_template?: string | null
          seed_value?: number | null
          generation_time_ms?: number | null
          model_version?: string | null
          view_count?: number
          is_favorite?: boolean
          created_at?: string
          expires_at?: string
          deleted_at?: string | null
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          makeup_preferences: Json
          color_preferences: Json
          avoided_ingredients: string[] | null
          skin_concerns: string[] | null
          preferred_brands: string[] | null
          budget_range: Json | null
          notification_settings: Json
          language: string
          timezone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          makeup_preferences?: Json
          color_preferences?: Json
          avoided_ingredients?: string[] | null
          skin_concerns?: string[] | null
          preferred_brands?: string[] | null
          budget_range?: Json | null
          notification_settings?: Json
          language?: string
          timezone?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          makeup_preferences?: Json
          color_preferences?: Json
          avoided_ingredients?: string[] | null
          skin_concerns?: string[] | null
          preferred_brands?: string[] | null
          budget_range?: Json | null
          notification_settings?: Json
          language?: string
          timezone?: string
          created_at?: string
          updated_at?: string
        }
      }
      payment_history: {
        Row: {
          id: string
          user_id: string
          stripe_payment_intent_id: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          amount: number
          currency: string
          payment_method: string | null
          status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled' | 'refunded'
          plan_type: 'premium_monthly' | 'premium_yearly' | 'one_time' | null
          billing_period_start: string | null
          billing_period_end: string | null
          metadata: Json
          failure_reason: string | null
          refund_amount: number | null
          refunded_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_payment_intent_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          amount: number
          currency?: string
          payment_method?: string | null
          status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled' | 'refunded'
          plan_type?: 'premium_monthly' | 'premium_yearly' | 'one_time' | null
          billing_period_start?: string | null
          billing_period_end?: string | null
          metadata?: Json
          failure_reason?: string | null
          refund_amount?: number | null
          refunded_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_payment_intent_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          amount?: number
          currency?: string
          payment_method?: string | null
          status?: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled' | 'refunded'
          plan_type?: 'premium_monthly' | 'premium_yearly' | 'one_time' | null
          billing_period_start?: string | null
          billing_period_end?: string | null
          metadata?: Json
          failure_reason?: string | null
          refund_amount?: number | null
          refunded_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      trends: {
        Row: {
          id: string
          region: 'global' | 'japan' | 'korea' | 'china' | 'usa' | 'europe'
          month: string
          season: 'spring' | 'summer' | 'autumn' | 'winter' | null
          trend_data: Json
          popularity_score: number | null
          data_sources: string[] | null
          featured_looks: Json
          celebrity_references: string[] | null
          is_published: boolean
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          region: 'global' | 'japan' | 'korea' | 'china' | 'usa' | 'europe'
          month: string
          season?: 'spring' | 'summer' | 'autumn' | 'winter' | null
          trend_data?: Json
          popularity_score?: number | null
          data_sources?: string[] | null
          featured_looks?: Json
          celebrity_references?: string[] | null
          is_published?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          region?: 'global' | 'japan' | 'korea' | 'china' | 'usa' | 'europe'
          month?: string
          season?: 'spring' | 'summer' | 'autumn' | 'winter' | null
          trend_data?: Json
          popularity_score?: number | null
          data_sources?: string[] | null
          featured_looks?: Json
          celebrity_references?: string[] | null
          is_published?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      user_dashboard: {
        Row: {
          id: string
          email: string
          full_name: string | null
          subscription_status: string
          subscription_end_date: string | null
          monthly_usage_count: number
          usage_reset_date: string
          total_analyses: number
          total_generated_images: number
          last_analysis_date: string | null
        }
      }
    }
    Functions: {
      increment_usage_count: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      reset_monthly_usage: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      subscription_status: 'free' | 'premium' | 'cancelled'
      analysis_type: 'standard' | 'quick' | 'detailed' | 'professional'
      analysis_status: 'pending' | 'processing' | 'completed' | 'failed'
      payment_status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled' | 'refunded'
      face_shape: 'oval' | 'round' | 'square' | 'heart' | 'oblong'
      skin_type: 'dry' | 'oily' | 'combination' | 'normal' | 'sensitive'
      personal_color: 'spring' | 'summer' | 'autumn' | 'winter'
      trend_region: 'global' | 'japan' | 'korea' | 'china' | 'usa' | 'europe'
    }
  }
}