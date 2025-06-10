-- =====================================================
-- ARCHITECTURE CORRIGÉE - BONNES PRATIQUES
-- =====================================================

-- =====================================================
-- 1. PROFILS UTILISATEUR SIMPLIFIÉS
-- =====================================================
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id),
    crm_id VARCHAR(100) UNIQUE,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}',
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT user_profiles_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- =====================================================
-- 2. TABLES SÉPARÉES PAR TYPE (Meilleure performance)
-- =====================================================

-- Vues pour les POSTS
CREATE TABLE post_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    residence_id UUID NOT NULL REFERENCES residences(id),
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_id UUID NOT NULL DEFAULT uuid_generate_v4(),
    ip_address INET, -- Pour détecter les bots
    user_agent TEXT, -- Pour analytics device
    
    UNIQUE(post_id, user_id, session_id)
);

-- Vues pour les EVENTS
CREATE TABLE event_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    residence_id UUID NOT NULL REFERENCES residences(id),
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_id UUID NOT NULL DEFAULT uuid_generate_v4(),
    
    UNIQUE(event_id, user_id, session_id)
);

-- Similaire pour polls, daily_messages, alerts...

-- =====================================================
-- 3. SYSTÈME DE RÉACTIONS OPTIMISÉ
-- =====================================================
CREATE TABLE post_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    residence_id UUID NOT NULL REFERENCES residences(id),
    reaction_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE, -- Soft delete pour historique
    
    CONSTRAINT post_reactions_type_valid CHECK (
        reaction_type IN ('like', 'love', 'laugh', 'sad', 'angry', 'wow', 'care')
    ),
    
    -- Un utilisateur actif par publication
    UNIQUE(post_id, user_id) WHERE deleted_at IS NULL
);

-- Index partiel pour performance
CREATE INDEX idx_post_reactions_active ON post_reactions (post_id, reaction_type) 
WHERE deleted_at IS NULL;

-- =====================================================
-- 4. PARTICIPATION ÉVÉNEMENTS NORMALISÉE
-- =====================================================
CREATE TABLE event_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    residence_id UUID NOT NULL REFERENCES residences(id),
    participation_status VARCHAR(50) DEFAULT 'registered',
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    reminder_sent_at TIMESTAMP WITH TIME ZONE,
    checked_in_at TIMESTAMP WITH TIME ZONE, -- Pour le jour J
    
    CONSTRAINT event_participants_status_valid CHECK (
        participation_status IN ('registered', 'confirmed', 'cancelled', 'waiting_list', 'attended', 'no_show')
    ),
    
    UNIQUE(event_id, user_id)
);

-- =====================================================
-- 5. CACHE ANALYTICS (Materialized Views + Triggers)
-- =====================================================

-- Table de cache pour les statistiques
CREATE TABLE publication_stats_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    publication_type VARCHAR(50) NOT NULL,
    publication_id BIGINT NOT NULL,
    residence_id UUID NOT NULL REFERENCES residences(id),
    total_views INTEGER DEFAULT 0,
    unique_viewers INTEGER DEFAULT 0,
    total_reactions INTEGER DEFAULT 0,
    reactions_breakdown JSONB DEFAULT '{}',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(publication_type, publication_id, residence_id)
);

-- Fonction pour mettre à jour le cache
CREATE OR REPLACE FUNCTION update_publication_stats_cache(
    p_publication_type VARCHAR(50),
    p_publication_id BIGINT,
    p_residence_id UUID
)
RETURNS VOID AS $$
DECLARE
    view_count INTEGER;
    unique_count INTEGER;
    reaction_count INTEGER;
    reactions_json JSONB;
BEGIN
    -- Calculer les statistiques selon le type
    CASE p_publication_type
        WHEN 'post' THEN
            SELECT 
                COUNT(*),
                COUNT(DISTINCT user_id)
            INTO view_count, unique_count
            FROM post_views 
            WHERE post_id = p_publication_id AND residence_id = p_residence_id;
            
            SELECT 
                COUNT(*),
                COALESCE(jsonb_object_agg(reaction_type, reaction_count), '{}')
            INTO reaction_count, reactions_json
            FROM (
                SELECT reaction_type, COUNT(*) as reaction_count
                FROM post_reactions 
                WHERE post_id = p_publication_id 
                  AND residence_id = p_residence_id 
                  AND deleted_at IS NULL
                GROUP BY reaction_type
            ) r;
        
        -- Ajouter d'autres types selon besoin...
    END CASE;
    
    -- Upsert dans le cache
    INSERT INTO publication_stats_cache (
        publication_type, publication_id, residence_id,
        total_views, unique_viewers, total_reactions, reactions_breakdown
    ) VALUES (
        p_publication_type, p_publication_id, p_residence_id,
        view_count, unique_count, reaction_count, reactions_json
    )
    ON CONFLICT (publication_type, publication_id, residence_id)
    DO UPDATE SET
        total_views = EXCLUDED.total_views,
        unique_viewers = EXCLUDED.unique_viewers,
        total_reactions = EXCLUDED.total_reactions,
        reactions_breakdown = EXCLUDED.reactions_breakdown,
        last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

-- Triggers pour mise à jour automatique du cache
CREATE OR REPLACE FUNCTION trigger_update_stats_cache()
RETURNS TRIGGER AS $$
BEGIN
    -- Détecter le type et l'ID selon la table
    IF TG_TABLE_NAME = 'post_views' THEN
        PERFORM update_publication_stats_cache('post', NEW.post_id, NEW.residence_id);
    ELSIF TG_TABLE_NAME = 'post_reactions' THEN
        PERFORM update_publication_stats_cache('post', NEW.post_id, NEW.residence_id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER post_views_stats_trigger 
    AFTER INSERT ON post_views 
    FOR EACH ROW EXECUTE FUNCTION trigger_update_stats_cache();

CREATE TRIGGER post_reactions_stats_trigger 
    AFTER INSERT OR UPDATE OR DELETE ON post_reactions 
    FOR EACH ROW EXECUTE FUNCTION trigger_update_stats_cache();

-- =====================================================
-- 6. GESTION INTELLIGENTE DES VOTES
-- =====================================================
CREATE TABLE poll_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    poll_id BIGINT NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    residence_id UUID NOT NULL REFERENCES residences(id),
    selected_answers TEXT[] NOT NULL,
    voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- Pour modification vote
    ip_address INET, -- Anti-fraude
    
    UNIQUE(poll_id, user_id)
);

-- Trigger pour mettre à jour les résultats du sondage
CREATE OR REPLACE FUNCTION update_poll_results()
RETURNS TRIGGER AS $$
DECLARE
    poll_record RECORD;
    results_json JSONB;
BEGIN
    -- Récupérer les infos du sondage
    SELECT * INTO poll_record FROM polls WHERE id = COALESCE(NEW.poll_id, OLD.poll_id);
    
    -- Calculer les nouveaux résultats
    WITH vote_counts AS (
        SELECT 
            unnest(selected_answers) as answer,
            COUNT(*) as vote_count
        FROM poll_votes 
        WHERE poll_id = poll_record.id
        GROUP BY unnest(selected_answers)
    ),
    total_votes AS (
        SELECT COUNT(DISTINCT user_id) as total FROM poll_votes WHERE poll_id = poll_record.id
    ),
    results AS (
        SELECT jsonb_build_object(
            'totalVotes', tv.total,
            'results', jsonb_agg(
                jsonb_build_object(
                    'answer', vc.answer,
                    'votes', vc.vote_count,
                    'percentage', ROUND((vc.vote_count::numeric / NULLIF(tv.total, 0) * 100), 1)
                )
            )
        ) as results_data
        FROM vote_counts vc
        CROSS JOIN total_votes tv
    )
    SELECT results_data INTO results_json FROM results;
    
    -- Mettre à jour le sondage
    UPDATE polls SET voting_results = results_json WHERE id = poll_record.id;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER poll_votes_results_trigger
    AFTER INSERT OR UPDATE OR DELETE ON poll_votes
    FOR EACH ROW EXECUTE FUNCTION update_poll_results();

-- =====================================================
-- 7. STRATÉGIE D'ARCHIVAGE AUTOMATIQUE
-- =====================================================

-- Table d'archive pour les anciennes vues (> 6 mois)
CREATE TABLE post_views_archive (
    LIKE post_views INCLUDING ALL
);

-- Fonction d'archivage automatique
CREATE OR REPLACE FUNCTION archive_old_views()
RETURNS INTEGER AS $$
DECLARE
    archived_count INTEGER;
BEGIN
    -- Déplacer les vues > 6 mois vers l'archive
    WITH moved_views AS (
        DELETE FROM post_views 
        WHERE viewed_at < NOW() - INTERVAL '6 months'
        RETURNING *
    )
    INSERT INTO post_views_archive SELECT * FROM moved_views;
    
    GET DIAGNOSTICS archived_count = ROW_COUNT;
    
    -- Log de l'opération
    INSERT INTO system_logs (operation, details, created_at) 
    VALUES ('archive_views', jsonb_build_object('archived_count', archived_count), NOW());
    
    RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- Planifier l'archivage (via pg_cron si disponible)
-- SELECT cron.schedule('archive-old-views', '0 2 * * 0', 'SELECT archive_old_views();');

-- =====================================================
-- 8. VUES OPTIMISÉES POUR L'APPLICATION
-- =====================================================

-- Vue pour les posts avec leurs statistiques (depuis le cache)
CREATE VIEW posts_with_stats AS
SELECT 
    p.*,
    COALESCE(psc.total_views, 0) as total_views,
    COALESCE(psc.unique_viewers, 0) as unique_viewers,
    COALESCE(psc.total_reactions, 0) as total_reactions,
    COALESCE(psc.reactions_breakdown, '{}') as reactions_breakdown
FROM posts p
LEFT JOIN publication_stats_cache psc ON (
    psc.publication_type = 'post' AND 
    psc.publication_id = p.id
);

-- Vue pour les événements avec participants
CREATE VIEW events_with_participants AS
SELECT 
    e.*,
    COUNT(ep.id) FILTER (WHERE ep.participation_status IN ('registered', 'confirmed')) as confirmed_participants,
    COUNT(ep.id) FILTER (WHERE ep.participation_status = 'waiting_list') as waiting_list_count,
    CASE 
        WHEN e.has_participant_limit THEN 
            GREATEST(0, e.max_participants - COUNT(ep.id) FILTER (WHERE ep.participation_status IN ('registered', 'confirmed')))
        ELSE NULL
    END as available_spots,
    CASE 
        WHEN e.has_participant_limit THEN 
            COUNT(ep.id) FILTER (WHERE ep.participation_status IN ('registered', 'confirmed')) >= e.max_participants
        ELSE FALSE
    END as is_full
FROM events e
LEFT JOIN event_participants ep ON e.id = ep.event_id
GROUP BY e.id;

-- =====================================================
-- 9. FONCTIONS API OPTIMISÉES
-- =====================================================

-- Fonction pour obtenir le feed d'une résidence (optimisée)
CREATE OR REPLACE FUNCTION get_residence_feed(
    p_residence_id UUID,
    p_user_id UUID,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
    id BIGINT,
    type TEXT,
    title TEXT,
    content TEXT,
    author_name TEXT,
    publication_date TIMESTAMP WITH TIME ZONE,
    total_views INTEGER,
    total_reactions INTEGER,
    user_has_reacted BOOLEAN,
    user_reaction_type TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH feed_items AS (
        -- Posts
        SELECT 
            p.id,
            'post'::TEXT as type,
            p.title,
            p.message as content,
            CONCAT(up.first_name, ' ', up.last_name) as author_name,
            p.publication_date,
            COALESCE(psc.total_views, 0) as total_views,
            COALESCE(psc.total_reactions, 0) as total_reactions,
            EXISTS(SELECT 1 FROM post_reactions pr WHERE pr.post_id = p.id AND pr.user_id = p_user_id AND pr.deleted_at IS NULL) as user_has_reacted,
            (SELECT reaction_type FROM post_reactions pr WHERE pr.post_id = p.id AND pr.user_id = p_user_id AND pr.deleted_at IS NULL) as user_reaction_type
        FROM posts p
        LEFT JOIN user_profiles up ON p.created_by = up.user_id
        LEFT JOIN publication_stats_cache psc ON (psc.publication_type = 'post' AND psc.publication_id = p.id AND psc.residence_id = p_residence_id)
        WHERE p_residence_id = ANY(p.target_residences)
          AND p.status = 'Publié'
          AND p.publication_date <= NOW()
        
        UNION ALL
        
        -- Events
        SELECT 
            e.id,
            'event'::TEXT as type,
            e.title,
            e.description as content,
            CONCAT(up.first_name, ' ', up.last_name) as author_name,
            e.publication_date,
            0 as total_views, -- À implémenter si nécessaire
            0 as total_reactions,
            FALSE as user_has_reacted,
            NULL as user_reaction_type
        FROM events e
        LEFT JOIN user_profiles up ON e.created_by = up.user_id
        WHERE p_residence_id = ANY(e.target_residences)
          AND e.status = 'Publié'
          AND e.publication_date <= NOW()
    )
    SELECT * FROM feed_items
    ORDER BY publication_date DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour enregistrer une interaction (vue/réaction) de manière sécurisée
CREATE OR REPLACE FUNCTION record_user_interaction(
    p_user_id UUID,
    p_interaction_type TEXT, -- 'view', 'reaction', 'participation'
    p_target_type TEXT, -- 'post', 'event', 'poll'
    p_target_id BIGINT,
    p_residence_id UUID,
    p_data JSONB DEFAULT '{}'
)
RETURNS BOOLEAN AS $$
DECLARE
    session_uuid UUID;
    reaction_type TEXT;
BEGIN
    -- Vérifier que l'utilisateur a accès à cette résidence
    IF NOT EXISTS (
        SELECT 1 FROM users_residences 
        WHERE user_id = p_user_id AND residence_id = p_residence_id
    ) THEN
        RAISE EXCEPTION 'User not authorized for this residence';
    END IF;
    
    CASE p_interaction_type
        WHEN 'view' THEN
            session_uuid := COALESCE((p_data->>'session_id')::UUID, uuid_generate_v4());
            
            IF p_target_type = 'post' THEN
                INSERT INTO post_views (post_id, user_id, residence_id, session_id)
                VALUES (p_target_id, p_user_id, p_residence_id, session_uuid)
                ON CONFLICT (post_id, user_id, session_id) DO NOTHING;
            END IF;
            
        WHEN 'reaction' THEN
            reaction_type := p_data->>'reaction_type';
            
            IF p_target_type = 'post' THEN
                INSERT INTO post_reactions (post_id, user_id, residence_id, reaction_type)
                VALUES (p_target_id, p_user_id, p_residence_id, reaction_type)
                ON CONFLICT (post_id, user_id) WHERE deleted_at IS NULL
                DO UPDATE SET 
                    reaction_type = EXCLUDED.reaction_type,
                    created_at = NOW(),
                    deleted_at = NULL;
            END IF;
            
        WHEN 'participation' THEN
            IF p_target_type = 'event' THEN
                -- Vérifier la capacité avant inscription
                IF EXISTS (
                    SELECT 1 FROM events_with_participants ewp 
                    WHERE ewp.id = p_target_id AND ewp.is_full = TRUE
                ) THEN
                    -- Ajouter en liste d'attente
                    INSERT INTO event_participants (event_id, user_id, residence_id, participation_status)
                    VALUES (p_target_id, p_user_id, p_residence_id, 'waiting_list')
                    ON CONFLICT (event_id, user_id) DO NOTHING;
                ELSE
                    -- Inscription normale
                    INSERT INTO event_participants (event_id, user_id, residence_id, participation_status)
                    VALUES (p_target_id, p_user_id, p_residence_id, 'registered')
                    ON CONFLICT (event_id, user_id) DO NOTHING;
                END IF;
            END IF;
    END CASE;
    
    RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
    -- Log l'erreur
    INSERT INTO system_logs (operation, details, error_message, created_at)
    VALUES ('record_interaction', p_data, SQLERRM, NOW());
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 10. TABLE DE LOGS SYSTÈME
-- =====================================================
CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operation VARCHAR(100) NOT NULL,
    details JSONB DEFAULT '{}',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_system_logs_operation ON system_logs (operation);
CREATE INDEX idx_system_logs_created_at ON system_logs (created_at);

-- =====================================================
-- 11. POLITIQUES RLS OPTIMISÉES
-- =====================================================

-- RLS pour les nouvelles tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE publication_stats_cache ENABLE ROW LEVEL SECURITY;

-- Policies optimisées avec index
CREATE POLICY "Users can view stats for their residences" ON publication_stats_cache
    FOR SELECT USING (
        residence_id = ANY(user_authorized_residences(auth.uid()))
    );

CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR ALL USING (user_id = auth.uid());

-- =====================================================
-- 12. MONITORING ET ALERTES
-- =====================================================

-- Vue pour surveiller les performances
CREATE VIEW performance_monitoring AS
SELECT 
    'post_views' as table_name,
    COUNT(*) as total_rows,
    COUNT(*) FILTER (WHERE viewed_at > NOW() - INTERVAL '24 hours') as last_24h,
    MAX(viewed_at) as last_activity
FROM post_views
UNION ALL
SELECT 
    'post_reactions' as table_name,
    COUNT(*) as total_rows,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as last_24h,
    MAX(created_at) as last_activity
FROM post_reactions WHERE deleted_at IS NULL;

-- =====================================================
-- FIN DE L'ARCHITECTURE CORRIGÉE
-- =====================================================