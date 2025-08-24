-- ==========================================
-- MakeupAI Database Schema
-- Version: 1.0.0
-- Date: 2024-12-22
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. profiles テーブル（ユーザープロファイル）
-- ==========================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    subscription_status TEXT NOT NULL DEFAULT 'free' 
        CHECK (subscription_status IN ('free', 'premium', 'cancelled')),
    subscription_end_date TIMESTAMP WITH TIME ZONE,
    monthly_usage_count INTEGER NOT NULL DEFAULT 0,
    usage_reset_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    personal_color_type TEXT CHECK (personal_color_type IN 
        ('spring', 'summer', 'autumn', 'winter', NULL)),
    face_shape TEXT CHECK (face_shape IN 
        ('oval', 'round', 'square', 'heart', 'oblong', NULL)),
    skin_type TEXT CHECK (skin_type IN 
        ('dry', 'oily', 'combination', 'normal', 'sensitive', NULL)),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_usage_reset_date ON profiles(usage_reset_date);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- ==========================================
-- 2. analysis_history テーブル（分析履歴）
-- ==========================================
CREATE TABLE IF NOT EXISTS analysis_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    original_image_data TEXT,
    image_storage_url TEXT,
    face_analysis JSONB NOT NULL DEFAULT '{}'::jsonb,
    skin_analysis JSONB DEFAULT '{}'::jsonb,
    current_makeup_analysis JSONB DEFAULT '{}'::jsonb,
    selected_trend_region TEXT DEFAULT 'japan',
    analysis_type TEXT NOT NULL DEFAULT 'standard' 
        CHECK (analysis_type IN ('standard', 'quick', 'detailed', 'professional')),
    occasion TEXT CHECK (occasion IN 
        ('daily', 'business', 'party', 'date', 'wedding', 'photo_shoot', NULL)),
    ai_model_version TEXT,
    ai_prompt_used JSONB,
    processing_time_ms INTEGER,
    status TEXT NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_analysis_history_user_created ON analysis_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analysis_history_status ON analysis_history(status);
CREATE INDEX IF NOT EXISTS idx_analysis_history_deleted_at ON analysis_history(deleted_at);

-- ==========================================
-- 3. makeup_suggestions テーブル（メイク提案）
-- ==========================================
CREATE TABLE IF NOT EXISTS makeup_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID NOT NULL REFERENCES analysis_history(id) ON DELETE CASCADE,
    base_makeup JSONB NOT NULL DEFAULT '{}'::jsonb,
    eye_makeup JSONB NOT NULL DEFAULT '{}'::jsonb,
    lip_makeup JSONB NOT NULL DEFAULT '{}'::jsonb,
    cheek_makeup JSONB NOT NULL DEFAULT '{}'::jsonb,
    instructions TEXT[],
    tips TEXT[],
    warnings TEXT[],
    recommended_products UUID[],
    confidence_score FLOAT CHECK (confidence_score >= 0 AND confidence_score <= 1),
    suitability_score FLOAT CHECK (suitability_score >= 0 AND suitability_score <= 1),
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    user_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_makeup_suggestions_analysis ON makeup_suggestions(analysis_id);
CREATE INDEX IF NOT EXISTS idx_makeup_suggestions_rating ON makeup_suggestions(user_rating);

-- ==========================================
-- 4. generated_images テーブル（生成画像）
-- ==========================================
CREATE TABLE IF NOT EXISTS generated_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID NOT NULL REFERENCES analysis_history(id) ON DELETE CASCADE,
    generated_image_data TEXT,
    thumbnail_data TEXT,
    storage_url TEXT,
    generation_model TEXT NOT NULL,
    generation_params JSONB DEFAULT '{}'::jsonb,
    prompt_template TEXT,
    seed_value INTEGER,
    generation_time_ms INTEGER,
    model_version TEXT,
    view_count INTEGER DEFAULT 0,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_generated_images_analysis ON generated_images(analysis_id);
CREATE INDEX IF NOT EXISTS idx_generated_images_expires ON generated_images(expires_at);
CREATE INDEX IF NOT EXISTS idx_generated_images_favorite ON generated_images(is_favorite) WHERE is_favorite = true;

-- ==========================================
-- 5. user_preferences テーブル（ユーザー設定）
-- ==========================================
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    makeup_preferences JSONB DEFAULT '{}'::jsonb,
    color_preferences JSONB DEFAULT '{}'::jsonb,
    avoided_ingredients TEXT[],
    skin_concerns TEXT[],
    preferred_brands TEXT[],
    budget_range JSONB,
    notification_settings JSONB DEFAULT '{
        "email": true,
        "push": true,
        "trends": true,
        "promotions": false
    }'::jsonb,
    language TEXT DEFAULT 'ja',
    timezone TEXT DEFAULT 'Asia/Tokyo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_preferences_user ON user_preferences(user_id);

-- ==========================================
-- 6. payment_history テーブル（支払い履歴）
-- ==========================================
CREATE TABLE IF NOT EXISTS payment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    stripe_payment_intent_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    amount INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'jpy',
    payment_method TEXT,
    status TEXT NOT NULL CHECK (status IN 
        ('pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded')),
    plan_type TEXT CHECK (plan_type IN ('premium_monthly', 'premium_yearly', 'one_time')),
    billing_period_start TIMESTAMP WITH TIME ZONE,
    billing_period_end TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb,
    failure_reason TEXT,
    refund_amount INTEGER,
    refunded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_payment_history_user ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON payment_history(status);
CREATE INDEX IF NOT EXISTS idx_payment_history_stripe_ids ON payment_history(stripe_payment_intent_id, stripe_subscription_id);

-- ==========================================
-- 7. trends テーブル（トレンド情報）
-- ==========================================
CREATE TABLE IF NOT EXISTS trends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region TEXT NOT NULL CHECK (region IN 
        ('global', 'japan', 'korea', 'china', 'usa', 'europe')),
    month DATE NOT NULL,
    season TEXT CHECK (season IN ('spring', 'summer', 'autumn', 'winter')),
    trend_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    popularity_score INTEGER CHECK (popularity_score >= 0 AND popularity_score <= 100),
    data_sources TEXT[],
    featured_looks JSONB DEFAULT '[]'::jsonb,
    celebrity_references TEXT[],
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(region, month)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_trends_region_month ON trends(region, month DESC);
CREATE INDEX IF NOT EXISTS idx_trends_published ON trends(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_trends_popularity ON trends(popularity_score DESC);

-- ==========================================
-- Row Level Security (RLS) ポリシー
-- ==========================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE makeup_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- profiles テーブルのポリシー
CREATE POLICY "Users can view own profile" 
    ON profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON profiles FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
    ON profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- analysis_history テーブルのポリシー
CREATE POLICY "Users can view own analysis" 
    ON analysis_history FOR SELECT 
    USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can create own analysis" 
    ON analysis_history FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analysis" 
    ON analysis_history FOR UPDATE 
    USING (auth.uid() = user_id);

-- makeup_suggestions テーブルのポリシー
CREATE POLICY "Users can view own suggestions" 
    ON makeup_suggestions FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM analysis_history 
            WHERE analysis_history.id = makeup_suggestions.analysis_id 
            AND analysis_history.user_id = auth.uid()
        )
    );

-- generated_images テーブルのポリシー
CREATE POLICY "Users can view own generated images" 
    ON generated_images FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM analysis_history 
            WHERE analysis_history.id = generated_images.analysis_id 
            AND analysis_history.user_id = auth.uid()
            AND generated_images.deleted_at IS NULL
        )
    );

-- user_preferences テーブルのポリシー
CREATE POLICY "Users can manage own preferences" 
    ON user_preferences FOR ALL 
    USING (auth.uid() = user_id);

-- payment_history テーブルのポリシー
CREATE POLICY "Users can view own payments" 
    ON payment_history FOR SELECT 
    USING (auth.uid() = user_id);

-- ==========================================
-- 関数とトリガー
-- ==========================================

-- 更新日時自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 各テーブルにトリガーを設定
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_history_updated_at 
    BEFORE UPDATE ON payment_history 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trends_updated_at 
    BEFORE UPDATE ON trends 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 月次使用回数リセット関数
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
    UPDATE profiles
    SET 
        monthly_usage_count = 0,
        usage_reset_date = NOW()
    WHERE 
        subscription_status = 'free'
        AND usage_reset_date < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- 使用回数インクリメント関数
CREATE OR REPLACE FUNCTION increment_usage_count(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_profile profiles%ROWTYPE;
    v_can_use BOOLEAN := FALSE;
BEGIN
    SELECT * INTO v_profile FROM profiles WHERE id = p_user_id;
    
    IF v_profile.subscription_status = 'premium' THEN
        v_can_use := TRUE;
    ELSIF v_profile.subscription_status = 'free' THEN
        IF v_profile.usage_reset_date < NOW() - INTERVAL '30 days' THEN
            UPDATE profiles 
            SET monthly_usage_count = 1, usage_reset_date = NOW() 
            WHERE id = p_user_id;
            v_can_use := TRUE;
        ELSIF v_profile.monthly_usage_count < 3 THEN
            UPDATE profiles 
            SET monthly_usage_count = monthly_usage_count + 1 
            WHERE id = p_user_id;
            v_can_use := TRUE;
        ELSE
            v_can_use := FALSE;
        END IF;
    END IF;
    
    RETURN v_can_use;
END;
$$ LANGUAGE plpgsql;