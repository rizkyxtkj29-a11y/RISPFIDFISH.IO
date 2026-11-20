-- ==============================================================================
-- RISPFID FISH - FIX & SEED SCRIPT UNTUK SUPABASE
-- Salin dan jalankan (Run) di SQL Editor Supabase Anda untuk mengaktifkan:
-- 1. Izin tabel publik & autentikasi
-- 2. Data master 14 spesies ikan air tawar Nusantara
-- 3. Trigger otomatis pendaftaran akun baru (Starter pack 500 koin + Ikan Sumatra)
-- ==============================================================================

-- 1. BERIKAN IZIN AKSES SCHEMA KE ROLE ANON & AUTHENTICATED
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated;

-- 2. SEED DATA 14 SPESIES IKAN ASLI & ENDEMIK INDONESIA
INSERT INTO public.fish_species (
    id, name, scientific_name, origin_habitat, origin_type, rarity, description, unique_fact,
    buy_price, base_sell_price, growth_time_seconds, hunger_rate, preferred_water_quality, max_size_cm, body_shape, colors
) VALUES
('tiger_barb', 'Ikan Sumatra', 'Puntigrus tetrazona', 'Sungai & rawa gambut tenang Sumatra dan Kalimantan', 'asli', 'common',
 'Ikan lincah bergaris hitam vertikal empat bar dengan sirip oranye kemerahan menyala.',
 'Pernah menjadi maskot ikan hias air tawar terpopuler Indonesia di kancah internasional sejak 1930-an.',
 40, 25, 120, 18, 70, 7.0, 'oval', '{"primary":"#E85D04","secondary":"#1A1A1A","fins":"#D00000"}'::jsonb),

('woworae_ricefish', 'Medaka Oryzias Woworae', 'Oryzias woworae', 'Mata air jernih dan anak sungai karst Pulau Muna, Sulawesi Tenggara', 'endemik', 'common',
 'Permata mini Sulawesi berkerlap biru elektrik dengan sirip ekor merah menyala.',
 'Ditemukan oleh peneliti Indonesia Daisy Wowor pada tahun 2010 dan langsung memikat akuaris global.',
 65, 45, 140, 16, 75, 3.5, 'slender', '{"primary":"#00B4D8","secondary":"#0077B6","fins":"#E63946"}'::jsonb),

('rasbora_hengeli', 'Rasbora Hengeli', 'Trigonostigma hengeli', 'Sungai berarus lambat dengan guguran daun hutan gambut Sumatra & Kalimantan Barat', 'asli', 'common',
 'Ikan mungil berpola lambang centang oranye neon menyala bak nyala korek api di air.',
 'Sering disalahartikan sebagai Harlequin Rasbora, namun memiliki warna oranye yang jauh lebih berpendar.',
 55, 38, 130, 15, 72, 3.0, 'slender', '{"primary":"#F77F00","secondary":"#2B2D42","fins":"#FCBF49"}'::jsonb),

('betta_hendra', 'Cupang Alam Betta Hendra', 'Betta hendra', 'Rawa gambut Palangkaraya, Kalimantan Tengah', 'endemik', 'uncommon',
 'Cupang alam legendaris bertubuh hijau zamrud metalik dengan sirip bergaris ganda biru toska.',
 'Salah satu cupang liar paling spektakuler di dunia yang terancam punah di habitat aslinya.',
 180, 120, 200, 20, 80, 4.5, 'elongated', '{"primary":"#06D6A0","secondary":"#118AB2","fins":"#073B4C"}'::jsonb),

('betta_rubra', 'Cupang Alam Betta Rubra', 'Betta rubra', 'Hutan gambut pesisir barat Aceh, Sumatra Utara', 'endemik', 'uncommon',
 'Permata rubi dari Serambi Mekkah dengan corak loreng merah bata dan bintik biru safir.',
 'Pernah dianggap punah selama lebih dari 100 tahun sebelum ditemukan kembali pada tahun 2007.',
 220, 150, 220, 19, 78, 5.0, 'elongated', '{"primary":"#D90429","secondary":"#2B2D42","fins":"#EF233C"}'::jsonb),

('beseng_beseng', 'Celebes Rainbowfish (Beseng-beseng)', 'Marosatherina ladigesi', 'Sungai karst Bantimurung, Maros, Sulawesi Selatan', 'endemik', 'uncommon',
 'Ikan anggun berbadan kuning kaca tembus pandang dengan sirip hitam-putih menjuntai bak layar perahu.',
 'Ikan endemik karst Maros yang menjadi ikon keanekaragaman hayati Sulawesi Selatan.',
 190, 130, 210, 17, 80, 7.5, 'slender', '{"primary":"#FFEE32","secondary":"#DCD6F7","fins":"#202020"}'::jsonb),

('puffer_palembang', 'Buntal Palembang (Buntal Target)', 'Pao palembangensis', 'Sungai Musi dan Batanghari, Sumatra Bagian Selatan', 'asli', 'rare',
 'Ikan buntal air tawar bermotif macan tutul dengan perut bermotif cincin target hitam-putih.',
 'Ikan buntal air tawar murni yang sangat cerdas, mampu mengenali pemiliknya saat waktu makan.',
 450, 320, 320, 22, 75, 18.0, 'globular', '{"primary":"#8D99AE","secondary":"#2B2D42","fins":"#EDF2F4"}'::jsonb),

('clown_loach', 'Ikan Botia Badut Nusantara', 'Chromobotia macracanthus', 'Sungai Kapuas (Kalbar) dan Sungai Batanghari (Jambi/Sumbar)', 'endemik', 'rare',
 'Primadona dasar sungai berbadan jingga terang dengan tiga garis belang hitam tebal dan sirip merah.',
 'Memiliki duri pertahanan tersembunyi di bawah matanya yang bisa ditegakkan saat merasa terancam.',
 480, 340, 340, 15, 78, 25.0, 'deep', '{"primary":"#FB8500","secondary":"#023047","fins":"#D62828"}'::jsonb),

('glossolepis_incisus', 'Red Rainbow Irian (Ikan Pelangi Sentani)', 'Glossolepis incisus', 'Danau Sentani, Jayapura, Papua', 'endemik', 'rare',
 'Pejantan dewasa bermetamorfosis menjadi merah delima menyala dengan punuk tinggi bak ikan purba.',
 'Hanya hidup di Danau Sentani Papua dan tidak ditemukan secara alami di tempat lain di dunia.',
 550, 390, 360, 16, 80, 15.0, 'deep', '{"primary":"#B7094C","secondary":"#5C0029","fins":"#C72C41"}'::jsonb),

('channa_pleuro', 'Channa Pleurophthalma (Toman Bunga)', 'Channa pleurophthalma', 'Sungai hitam gambut Kalimantan Tengah dan Sumatra Selatan', 'asli', 'epic',
 'Predator anggun bertubuh biru kehijauan metalik dengan 3-5 lingkaran cincin mata emas di sisi tubuhnya.',
 'Bukan sekadar snakehead biasa, ikan ini sangat aktif berenang di kolom tengah air secara berkelompok.',
 1200, 850, 480, 16, 80, 40.0, 'elongated', '{"primary":"#0077B6","secondary":"#023E8A","fins":"#F77F00"}'::jsonb),

('datnioides_microlepis', 'Tigerfish Indonesia (Elang Air Tawar)', 'Datnioides microlepis', 'Sungai Musi, Batanghari, Kapuas, dan Barito', 'asli', 'epic',
 'Ikan predator bertubuh tinggi gagah bermotif loreng harimau emas dengan sirip berduri kokoh.',
 'Ikan peninggalan purba yang menjadi buruan utama kolektor monster fish internasional bernilai tinggi.',
 1600, 1150, 520, 14, 82, 45.0, 'deep', '{"primary":"#FFB703","secondary":"#000814","fins":"#FB8500"}'::jsonb),

('arwana_papua', 'Arwana Papua (Jardini)', 'Scleropages jardinii', 'Sungai Digul, Merauke, dan rawa perairan selatan Papua', 'asli', 'legendary',
 'Ikan purba predator bertubuh naga dengan sisik bercorak bulan sabit merah muda berkilau.',
 'Garis keturunan ikan purba Osteoglossidae yang sudah mengarungi perairan tawar bumi sejak era Zaman Kapur.',
 3800, 2800, 650, 12, 82, 60.0, 'elongated', '{"primary":"#8A817C","secondary":"#463F3A","fins":"#7D4F50"}'::jsonb),

('rainbow_kurumoi', 'Rainbow Kurumoi', 'Melanotaenia parva / kurumoi', 'Danau Kurumoi terisolasi, Semenanjung Kepala Burung, Papua Barat Daya', 'endemik', 'legendary',
 'Permata pelangi misterius yang luar biasa langka dengan gradasi ungu metalik dan magenta elektrik.',
 'Hanya menghuni satu danau kecil terisolasi di Papua Barat, salah satu spesies paling dilindungi di Nusantara.',
 4800, 3600, 700, 10, 85, 8.0, 'oval', '{"primary":"#7209B7","secondary":"#F72585","fins":"#B5179E"}'::jsonb),

('arwana_super_red', 'Arwana Super Red Kalimantan', 'Scleropages formosus', 'Danau Sentarum dan hulu Sungai Kapuas, Kalimantan Barat', 'endemik', 'legendary',
 'Raja air tawar Nusantara bermahkota merah darah cemerlang, sisik berbingkai emas mengkilat, dan mata gagah bak naga.',
 'Dikenal dunia sebagai "Dragon Fish" simbol kemakmuran, keberanian, dan pusaka fauna air tawar Indonesia.',
 6500, 5000, 800, 14, 88, 70.0, 'elongated', '{"primary":"#9D0208","secondary":"#370617","fins":"#D00000"}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    scientific_name = EXCLUDED.scientific_name,
    origin_habitat = EXCLUDED.origin_habitat,
    buy_price = EXCLUDED.buy_price,
    base_sell_price = EXCLUDED.base_sell_price,
    growth_time_seconds = EXCLUDED.growth_time_seconds,
    max_size_cm = EXCLUDED.max_size_cm;

-- 3. PERBAIKAN TRIGGER AUTO USER SIGNUP (BULLETPROOF DENGAN FALLBACK)
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
    VALUES (new.id, v_username, 1, 0)
    ON CONFLICT (id) DO NOTHING;

    -- 2. Create Starter Wallet (500 starter coins)
    INSERT INTO public.player_wallet (user_id, coins, total_earned, total_spent)
    VALUES (new.id, 500, 500, 0)
    ON CONFLICT (user_id) DO NOTHING;

    -- 3. Create Default Free Aquarium
    INSERT INTO public.aquariums (user_id, name, capacity, water_quality)
    VALUES (new.id, 'Akuarium Tawar Nusantara', 5, 100)
    RETURNING id INTO v_aquarium_id;

    IF v_aquarium_id IS NOT NULL THEN
        UPDATE public.profiles
        SET active_aquarium_id = v_aquarium_id
        WHERE id = new.id;

        -- 4. Give Starter Fish (Ikan Sumatra)
        INSERT INTO public.player_fish (
            user_id, species_id, aquarium_id, nickname, hunger, health, stage, current_size_cm
        ) VALUES (
            new.id, 'tiger_barb', v_aquarium_id, 'Si Belang Sumatra', 90, 100, 'small', 2.5
        );
    END IF;

    -- 5. Starter Food in Inventory
    INSERT INTO public.inventory (user_id, item_id, category, name, quantity, description, icon)
    VALUES (new.id, 'food_basic_pellet', 'food', 'Pelet Nutrisi Dasar', 15, 'Makanan harian bergizi seimbang untuk segala jenis ikan air tawar.', 'cookie')
    ON CONFLICT (user_id, item_id) DO NOTHING;

    -- 6. Initial Welcome Transaction Log
    INSERT INTO public.transactions (user_id, type, amount, balance_after, description)
    VALUES (new.id, 'daily_bonus', 500, 500, 'Bonus selamat datang Akuaris Pemula RISPFID FISH');

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Fallback aman jika terjadi anomali saat signup agar user tetap bisa terdaftar
    RETURN NEW;
END;
$$;

-- Pasang Trigger ke auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
