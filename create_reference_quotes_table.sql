-- Script SQL pour créer la table des modèles de référence de devis
-- À exécuter dans l'UI web de Supabase

-- Table pour les catégories de services/secteurs
CREATE TABLE IF NOT EXISTS public.quote_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les modèles de référence de devis
CREATE TABLE IF NOT EXISTS public.reference_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.quote_categories(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    
    -- Prix de référence par fourchettes
    price_min DECIMAL(12,2) NOT NULL,
    price_max DECIMAL(12,2) NOT NULL,
    price_optimal DECIMAL(12,2) NOT NULL, -- Prix optimal recommandé
    
    -- Marge de variation autorisée (en pourcentage)
    variation_min DECIMAL(5,2) DEFAULT -15.0, -- -15% max
    variation_max DECIMAL(5,2) DEFAULT 10.0,  -- +10% max
    
    -- Métadonnées
    target_sector VARCHAR(100),
    complexity_level VARCHAR(20) CHECK (complexity_level IN ('simple', 'medium', 'complex')),
    duration_days INTEGER,
    
    -- Conditions recommandées
    recommended_terms JSONB,
    
    -- Statut et métadonnées
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_reference_quotes_category ON public.reference_quotes(category_id);
CREATE INDEX IF NOT EXISTS idx_reference_quotes_active ON public.reference_quotes(is_active);
CREATE INDEX IF NOT EXISTS idx_reference_quotes_sector ON public.reference_quotes(target_sector);
CREATE INDEX IF NOT EXISTS idx_reference_quotes_price_range ON public.reference_quotes(price_min, price_max);

-- Table pour tracker l'utilisation des modèles
CREATE TABLE IF NOT EXISTS public.quote_model_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID, -- Référence vers le devis qui utilise le modèle
    reference_quote_id UUID REFERENCES public.reference_quotes(id) ON DELETE CASCADE,
    original_amount DECIMAL(12,2),
    suggested_amount DECIMAL(12,2),
    applied_amount DECIMAL(12,2),
    conversion_result VARCHAR(20), -- 'pending', 'accepted', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) pour sécuriser l'accès
ALTER TABLE public.quote_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reference_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_model_usage ENABLE ROW LEVEL SECURITY;

-- Politique pour les catégories (lecture publique, écriture admin seulement)
CREATE POLICY "Anyone can view quote categories" ON public.quote_categories
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify quote categories" ON public.quote_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Politique pour les modèles de référence
CREATE POLICY "Anyone can view active reference quotes" ON public.reference_quotes
    FOR SELECT USING (is_active = true);

CREATE POLICY "Only admins can modify reference quotes" ON public.reference_quotes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Politique pour l'usage des modèles
CREATE POLICY "Users can view their quote model usage" ON public.quote_model_usage
    FOR SELECT USING (true); -- Sera affiné selon vos besoins

CREATE POLICY "Service can insert model usage" ON public.quote_model_usage
    FOR INSERT WITH CHECK (true);

-- Fonction pour mettre à jour le timestamp updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_quote_categories_updated_at 
    BEFORE UPDATE ON public.quote_categories 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reference_quotes_updated_at 
    BEFORE UPDATE ON public.reference_quotes 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insertion de données de test/exemple
INSERT INTO public.quote_categories (name, description) VALUES
('Développement Web', 'Sites web, applications web, e-commerce'),
('Design Graphique', 'Logo, identité visuelle, supports print'),
('Conseil/Formation', 'Consulting, audit, formation professionnelle'),
('Maintenance IT', 'Support technique, maintenance système'),
('Marketing Digital', 'SEO, publicité en ligne, réseaux sociaux')
ON CONFLICT (name) DO NOTHING;

-- Exemples de modèles de référence
INSERT INTO public.reference_quotes (
    category_id, 
    title, 
    description, 
    price_min, 
    price_max, 
    price_optimal,
    variation_min,
    variation_max,
    target_sector, 
    complexity_level,
    duration_days,
    recommended_terms
) VALUES
(
    (SELECT id FROM public.quote_categories WHERE name = 'Développement Web' LIMIT 1),
    'Site Web Vitrine (5-10 pages)',
    'Création d''un site web vitrine responsive avec CMS, contact, galerie',
    800000, 1500000, 1200000,
    -12.0, 8.0,
    'services', 'medium', 30,
    '{"paiement": "30% à la commande, 70% à la livraison", "garantie": "6 mois de maintenance incluse", "delai": "30 jours ouvrés"}'::jsonb
),
(
    (SELECT id FROM public.quote_categories WHERE name = 'Design Graphique' LIMIT 1),
    'Pack Identité Visuelle Complète',
    'Logo + carte de visite + en-tête + charte graphique',
    300000, 800000, 500000,
    -10.0, 15.0,
    'commerce', 'simple', 14,
    '{"paiement": "50% à la commande, 50% à la validation", "revisions": "3 révisions incluses", "formats": "Tous formats vectoriels fournis"}'::jsonb
),
(
    (SELECT id FROM public.quote_categories WHERE name = 'Conseil/Formation' LIMIT 1),
    'Formation en Digital Marketing',
    'Formation complète en marketing digital sur 3 jours',
    450000, 900000, 650000,
    -8.0, 12.0,
    'education', 'complex', 21,
    '{"paiement": "40% à l''inscription, 60% avant formation", "certificat": "Certificat de formation inclus", "support": "Support pédagogique fourni"}'::jsonb
);

-- Vérification des données insérées
SELECT 
    c.name as category,
    r.title,
    r.price_optimal,
    r.variation_min,
    r.variation_max
FROM public.reference_quotes r
JOIN public.quote_categories c ON r.category_id = c.id
ORDER BY c.name, r.price_optimal;

-- Message de confirmation
SELECT 'Tables de modèles de référence créées avec succès !' as status;
