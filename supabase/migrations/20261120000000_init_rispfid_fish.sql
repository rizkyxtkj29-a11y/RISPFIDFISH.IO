-- ============================================================================
-- RISPFID FISH - Database Migration & RLS Schema
-- PostgreSQL for Supabase
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL UNIQUE,
    level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
    xp INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),
    active_aquarium_id UUID,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. FISH SPECIES (Reference Table)
CREATE TABLE IF NOT EXISTS public.fish_species (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    scientific_name TEXT NOT NULL,
    origin_habitat TEXT NOT NULL,
    origin_type TEXT NOT NULL CHECK (origin_type IN ('endemik', 'asli')),
    rarity TEXT NOT NULL CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
    description TEXT NOT NULL,
    unique_fact TEXT NOT NULL,
    buy_price INTEGER NOT NULL CHECK (buy_price > 0),
    base_sell_price INTEGER NOT NULL CHECK (base_sell_price > 0),
    growth_time_seconds INTEGER NOT NULL DEFAULT 300,
    hunger_rate NUMERIC(5,2) NOT NULL DEFAULT 10.0,
    preferred_water_quality INTEGER NOT NULL DEFAULT 70,
    max_size_cm NUMERIC(5,2) NOT NULL,
    body_shape TEXT NOT NULL DEFAULT 'elongated',
    colors JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- 3. AQUARIUMS TABLE
CREATE TABLE IF NOT EXISTS public.aquariums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Akuarium Utama Nusantara',
    capacity INTEGER NOT NULL DEFAULT 5 CHECK (capacity >= 1),
    water_quality INTEGER NOT NULL DEFAULT 100 CHECK (water_quality BETWEEN 0 AND 100),
    filter_level INTEGER NOT NULL DEFAULT 1 CHECK (filter_level BETWEEN 1 AND 5),
    aerator_level INTEGER NOT NULL DEFAULT 1 CHECK (aerator_level BETWEEN 1 AND 5),
    temperature NUMERIC(4,1) NOT NULL DEFAULT 26.5,
    theme TEXT NOT NULL DEFAULT 'river_sand',
    decorations JSONB NOT NULL DEFAULT '[]'::jsonb,
    last_cleaned_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Add foreign key constraint to profiles.active_aquarium_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_profile_active_aquarium'
    ) THEN
        ALTER TABLE public.profiles
        ADD CONSTRAINT fk_profile_active_aquarium
        FOREIGN KEY (active_aquarium_id) REFERENCES public.aquariums(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 4. PLAYER FISH TABLE
CREATE TABLE IF NOT EXISTS public.player_fish (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    species_id TEXT NOT NULL REFERENCES public.fish_species(id),
    aquarium_id UUID NOT NULL REFERENCES public.aquariums(id) ON DELETE CASCADE,
    nickname TEXT NOT NULL,
    hunger NUMERIC(5,2) NOT NULL DEFAULT 100.0 CHECK (hunger BETWEEN 0 AND 100),
    health NUMERIC(5,2) NOT NULL DEFAULT 100.0 CHECK (health BETWEEN 0 AND 100),
    age_seconds INTEGER NOT NULL DEFAULT 0 CHECK (age_seconds >= 0),
    stage TEXT NOT NULL DEFAULT 'small' CHECK (stage IN ('small', 'medium', 'adult')),
    current_size_cm NUMERIC(5,2) NOT NULL DEFAULT 2.0,
    in_aquarium BOOLEAN NOT NULL DEFAULT true,
    born_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    last_fed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. PLAYER WALLET TABLE
CREATE TABLE IF NOT EXISTS public.player_wallet (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    coins BIGINT NOT NULL DEFAULT 500 CHECK (coins >= 0),
    total_earned BIGINT NOT NULL DEFAULT 500 CHECK (total_earned >= 0),
    total_spent BIGINT NOT NULL DEFAULT 0 CHECK (total_spent >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. TRANSACTIONS LEDGER TABLE (Immutable Audit Trail)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('buy_fish', 'sell_fish', 'buy_item', 'clean_aquarium', 'mission_reward', 'achievement_reward', 'daily_bonus')),
    amount BIGINT NOT NULL,
    balance_after BIGINT NOT NULL CHECK (balance_after >= 0),
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. INVENTORY TABLE
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('food', 'decoration', 'filter', 'aquarium')),
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 0),
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_user_item UNIQUE (user_id, item_id)
);

-- 8. DAILY MISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.daily_missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    mission_key TEXT NOT NULL,
    target_count INTEGER NOT NULL DEFAULT 1,
    current_count INTEGER NOT NULL DEFAULT 0,
    reward_coins INTEGER NOT NULL DEFAULT 50,
    reward_xp INTEGER NOT NULL DEFAULT 30,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    is_claimed BOOLEAN NOT NULL DEFAULT false,
    mission_date DATE NOT NULL DEFAULT CURRENT_DATE,
    CONSTRAINT uq_user_mission_date UNIQUE (user_id, mission_key, mission_date)
);

-- 9. PLAYER ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.player_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    achievement_key TEXT NOT NULL,
    current_count INTEGER NOT NULL DEFAULT 0,
    is_unlocked BOOLEAN NOT NULL DEFAULT false,
    is_claimed BOOLEAN NOT NULL DEFAULT false,
    unlocked_at TIMESTAMPTZ,
    CONSTRAINT uq_user_achievement UNIQUE (user_id, achievement_key)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_aquariums_user_id ON public.aquariums(user_id);
CREATE INDEX IF NOT EXISTS idx_player_fish_user_id ON public.player_fish(user_id);
CREATE INDEX IF NOT EXISTS idx_player_fish_aquarium_id ON public.player_fish(aquarium_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id_created ON public.transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON public.inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_missions_user_date ON public.daily_missions(user_id, mission_date);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fish_species ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aquariums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_fish ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_achievements ENABLE ROW LEVEL SECURITY;

-- Fish Species: Public Read Only
CREATE POLICY "Fish species readable by everyone"
    ON public.fish_species FOR SELECT
    USING (true);

-- Profiles
CREATE POLICY "Users can view any profile"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Aquariums
CREATE POLICY "Users can manage own aquariums"
    ON public.aquariums FOR ALL
    USING (auth.uid() = user_id);

-- Player Fish
CREATE POLICY "Users can manage own fish"
    ON public.player_fish FOR ALL
    USING (auth.uid() = user_id);

-- Player Wallet: Read only by owner (Modifications strictly through RPC)
CREATE POLICY "Users can view own wallet"
    ON public.player_wallet FOR SELECT
    USING (auth.uid() = user_id);

-- Transactions: Read only by owner (Inserts strictly through RPC)
CREATE POLICY "Users can view own transactions"
    ON public.transactions FOR SELECT
    USING (auth.uid() = user_id);

-- Inventory
CREATE POLICY "Users can manage own inventory"
    ON public.inventory FOR ALL
    USING (auth.uid() = user_id);

-- Daily Missions
CREATE POLICY "Users can manage own daily missions"
    ON public.daily_missions FOR ALL
    USING (auth.uid() = user_id);

-- Achievements
CREATE POLICY "Users can manage own achievements"
    ON public.player_achievements FOR ALL
    USING (auth.uid() = user_id);

-- ============================================================================
-- SECURE SERVER-SIDE TRANSACTION STORED PROCEDURES (RPC)
-- ============================================================================

-- Function: Buy Fish Transaction
CREATE OR REPLACE FUNCTION public.buy_fish_transaction(
    p_species_id TEXT,
    p_aquarium_id UUID,
    p_nickname TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_price INTEGER;
    v_species_name TEXT;
    v_current_coins BIGINT;
    v_new_balance BIGINT;
    v_cap INTEGER;
    v_current_count INTEGER;
    v_new_fish_id UUID;
    v_actual_nickname TEXT;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Tidak terautentikasi');
    END IF;

    -- Lock wallet row to prevent race condition / double spending
    SELECT coins INTO v_current_coins
    FROM public.player_wallet
    WHERE user_id = v_user_id
    FOR UPDATE;

    IF v_current_coins IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Dompet pemain tidak ditemukan');
    END IF;

    -- Check species price
    SELECT buy_price, name INTO v_price, v_species_name
    FROM public.fish_species
    WHERE id = p_species_id;

    IF v_price IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Spesies ikan tidak valid');
    END IF;

    IF v_current_coins < v_price THEN
        RETURN jsonb_build_object('success', false, 'error', 'Koin tidak mencukupi untuk membeli ' || v_species_name);
    END IF;

    -- Validate Aquarium ownership and capacity
    SELECT capacity INTO v_cap
    FROM public.aquariums
    WHERE id = p_aquarium_id AND user_id = v_user_id;

    IF v_cap IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Akuarium tidak ditemukan');
    END IF;

    SELECT COUNT(*) INTO v_current_count
    FROM public.player_fish
    WHERE aquarium_id = p_aquarium_id AND in_aquarium = true;

    IF v_current_count >= v_cap THEN
        RETURN jsonb_build_object('success', false, 'error', 'Kapasitas akuarium sudah penuh (' || v_current_count || '/' || v_cap || ')');
    END IF;

    -- Deduct coins
    v_new_balance := v_current_coins - v_price;
    UPDATE public.player_wallet
    SET coins = v_new_balance,
        total_spent = total_spent + v_price,
        updated_at = timezone('utc'::text, now())
    WHERE user_id = v_user_id;

    -- Create Fish
    v_actual_nickname := COALESCE(NULLIF(TRIM(p_nickname), ''), v_species_name);
    INSERT INTO public.player_fish (
        user_id, species_id, aquarium_id, nickname, hunger, health, age_seconds, stage, current_size_cm, in_aquarium
    ) VALUES (
        v_user_id, p_species_id, p_aquarium_id, v_actual_nickname, 100, 100, 0, 'small', 2.0, true
    ) RETURNING id INTO v_new_fish_id;

    -- Log transaction ledger
    INSERT INTO public.transactions (
        user_id, type, amount, balance_after, description
    ) VALUES (
        v_user_id, 'buy_fish', -v_price, v_new_balance, 'Membeli bibit ikan ' || v_species_name
    );

    RETURN jsonb_build_object(
        'success', true,
        'new_fish_id', v_new_fish_id,
        'new_balance', v_new_balance,
        'fish_name', v_actual_nickname
    );
END;
$$;

-- Function: Sell Fish Transaction
CREATE OR REPLACE FUNCTION public.sell_fish_transaction(
    p_fish_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_stage TEXT;
    v_species_id TEXT;
    v_base_sell_price INTEGER;
    v_species_name TEXT;
    v_health NUMERIC;
    v_multiplier NUMERIC := 1.0;
    v_payout INTEGER;
    v_current_coins BIGINT;
    v_new_balance BIGINT;
    v_fish_nickname TEXT;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Tidak terautentikasi');
    END IF;

    -- Validate fish ownership & fetch state
    SELECT pf.species_id, pf.stage, pf.health, pf.nickname, sp.base_sell_price, sp.name
    INTO v_species_id, v_stage, v_health, v_fish_nickname, v_base_sell_price, v_species_name
    FROM public.player_fish pf
    JOIN public.fish_species sp ON pf.species_id = sp.id
    WHERE pf.id = p_fish_id AND pf.user_id = v_user_id;

    IF v_species_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Ikan tidak ditemukan atau bukan milik Anda');
    END IF;

    -- Multiplier based on growth stage
    IF v_stage = 'adult' THEN
        v_multiplier := 2.2;
    ELSIF v_stage = 'medium' THEN
        v_multiplier := 1.4;
    ELSE
        v_multiplier := 0.8;
    END IF;

    -- Health penalty if sick
    IF v_health < 50 THEN
        v_multiplier := v_multiplier * (v_health / 100.0);
    END IF;

    v_payout := ROUND(v_base_sell_price * v_multiplier);

    -- Lock and update wallet
    SELECT coins INTO v_current_coins
    FROM public.player_wallet
    WHERE user_id = v_user_id
    FOR UPDATE;

    v_new_balance := v_current_coins + v_payout;
    UPDATE public.player_wallet
    SET coins = v_new_balance,
        total_earned = total_earned + v_payout,
        updated_at = timezone('utc'::text, now())
    WHERE user_id = v_user_id;

    -- Remove fish
    DELETE FROM public.player_fish
    WHERE id = p_fish_id AND user_id = v_user_id;

    -- Log transaction
    INSERT INTO public.transactions (
        user_id, type, amount, balance_after, description
    ) VALUES (
        v_user_id, 'sell_fish', v_payout, v_new_balance, 'Menjual ' || v_fish_nickname || ' (' || v_stage || ')'
    );

    RETURN jsonb_build_object(
        'success', true,
        'reward_coins', v_payout,
        'new_balance', v_new_balance
    );
END;
$$;

-- Function: Clean Aquarium Transaction
CREATE OR REPLACE FUNCTION public.clean_aquarium_transaction(
    p_aquarium_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_clean_cost INTEGER := 25;
    v_current_coins BIGINT;
    v_new_balance BIGINT;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Tidak terautentikasi');
    END IF;

    SELECT coins INTO v_current_coins
    FROM public.player_wallet
    WHERE user_id = v_user_id
    FOR UPDATE;

    IF v_current_coins < v_clean_cost THEN
        RETURN jsonb_build_object('success', false, 'error', 'Koin tidak mencukupi untuk biaya kuras air');
    END IF;

    v_new_balance := v_current_coins - v_clean_cost;
    UPDATE public.player_wallet
    SET coins = v_new_balance,
        total_spent = total_spent + v_clean_cost,
        updated_at = timezone('utc'::text, now())
    WHERE user_id = v_user_id;

    UPDATE public.aquariums
    SET water_quality = 100,
        last_cleaned_at = timezone('utc'::text, now())
    WHERE id = p_aquarium_id AND user_id = v_user_id;

    INSERT INTO public.transactions (
        user_id, type, amount, balance_after, description
    ) VALUES (
        v_user_id, 'clean_aquarium', -v_clean_cost, v_new_balance, 'Kuras & pembersihan akuarium'
    );

    RETURN jsonb_build_object(
        'success', true,
        'new_balance', v_new_balance,
        'new_quality', 100
    );
END;
$$;

-- Initial User Profile Trigger (Automatic initialization upon Auth signup)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_aquarium_id UUID;
    v_username TEXT;
BEGIN
    v_username := COALESCE(new.raw_user_meta_data->>'username', 'Aquaris_' || substring(new.id::text, 1, 6));

    -- 1. Create Profile
    INSERT INTO public.profiles (id, username, level, xp)
    VALUES (new.id, v_username, 1, 0);

    -- 2. Create Starter Wallet (500 starter coins)
    INSERT INTO public.player_wallet (user_id, coins, total_earned, total_spent)
    VALUES (new.id, 500, 500, 0);

    -- 3. Create Default Free Aquarium
    INSERT INTO public.aquariums (user_id, name, capacity, water_quality)
    VALUES (new.id, 'Akuarium Tawar Nusantara', 5, 100)
    RETURNING id INTO v_aquarium_id;

    UPDATE public.profiles
    SET active_aquarium_id = v_aquarium_id
    WHERE id = new.id;

    -- 4. Give Starter Fish (Ikan Sumatra)
    INSERT INTO public.player_fish (
        user_id, species_id, aquarium_id, nickname, hunger, health, stage, current_size_cm
    ) VALUES (
        new.id, 'tiger_barb', v_aquarium_id, 'Si Belang Sumatra', 90, 100, 'small', 2.5
    );

    -- 5. Starter Food in Inventory
    INSERT INTO public.inventory (user_id, item_id, category, name, quantity, description, icon)
    VALUES (new.id, 'food_basic_pellet', 'food', 'Pelet Nutrisi Dasar', 15, 'Makanan harian bergizi seimbang untuk segala jenis ikan air tawar.', 'cookie');

    -- 6. Initial Welcome Transaction Log
    INSERT INTO public.transactions (user_id, type, amount, balance_after, description)
    VALUES (new.id, 'daily_bonus', 500, 500, 'Bonus selamat datang Akuaris Pemula RISPFID FISH');

    RETURN NEW;
END;
$$;

-- Trigger execution
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
