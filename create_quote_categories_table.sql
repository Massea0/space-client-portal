-- Création de la table quote_categories pour les catégories de devis de référence
-- Date: 30 juin 2025

CREATE TABLE IF NOT EXISTS quote_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertion des catégories par défaut
INSERT INTO quote_categories (name, description) VALUES
  ('Services', 'Prestations de services générales'),
  ('Maintenance', 'Contrats de maintenance et support'),
  ('Consulting', 'Missions de conseil et expertise'),
  ('Development', 'Développement logiciel et applications'),
  ('Infrastructure', 'Infrastructure et hébergement'),
  ('Formation', 'Sessions de formation et accompagnement')
ON CONFLICT (name) DO NOTHING;

-- Mise à jour de la table reference_quotes pour ajouter la référence vers les catégories
ALTER TABLE reference_quotes 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES quote_categories(id);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_quote_categories_updated_at 
  BEFORE UPDATE ON quote_categories 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) pour les catégories
ALTER TABLE quote_categories ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre à tous les utilisateurs authentifiés de lire les catégories
CREATE POLICY "Tous les utilisateurs peuvent lire les catégories" ON quote_categories
  FOR SELECT TO authenticated USING (true);

-- Politique pour permettre aux admins de gérer les catégories
CREATE POLICY "Les admins peuvent gérer les catégories" ON quote_categories
  FOR ALL TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
