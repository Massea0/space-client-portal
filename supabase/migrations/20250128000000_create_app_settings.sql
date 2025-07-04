-- Création de la table app_settings pour les configurations globales
CREATE TABLE "public"."app_settings" (
    "id" uuid not null default uuid_generate_v4(),
    "key" text not null,
    "value" text not null,
    "category" text not null default 'general',
    "description" text,
    "data_type" text not null default 'text',
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);

-- Contraintes et index
ALTER TABLE "public"."app_settings" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX app_settings_key_key ON public.app_settings USING btree (key);
CREATE UNIQUE INDEX app_settings_pkey ON public.app_settings USING btree (id);
CREATE INDEX idx_app_settings_category ON public.app_settings USING btree (category);
CREATE INDEX idx_app_settings_key ON public.app_settings USING btree (key);

-- Contraintes
ALTER TABLE "public"."app_settings" ADD CONSTRAINT "app_settings_pkey" PRIMARY KEY using index "app_settings_pkey";
ALTER TABLE "public"."app_settings" ADD CONSTRAINT "app_settings_key_key" UNIQUE using index "app_settings_key_key";

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON app_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Politiques de sécurité (seuls les admins peuvent modifier)
CREATE POLICY "Admin users can view all settings" ON "public"."app_settings"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
    AND users.is_active = true
  )
);

CREATE POLICY "Admin users can update settings" ON "public"."app_settings"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
    AND users.is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
    AND users.is_active = true
  )
);

-- Insertion des paramètres par défaut
INSERT INTO "public"."app_settings" ("key", "value", "category", "description", "data_type") VALUES 
  ('currency_symbol', 'FCFA', 'localization', 'Symbole de la devise utilisée', 'text'),
  ('currency_code', 'XOF', 'localization', 'Code ISO de la devise (ex: XOF, EUR, USD)', 'text'),
  ('currency_position', 'after', 'localization', 'Position du symbole (before/after)', 'select'),
  ('currency_decimal_places', '0', 'localization', 'Nombre de décimales à afficher', 'number'),
  ('currency_thousand_separator', ' ', 'localization', 'Séparateur de milliers', 'text'),
  ('currency_decimal_separator', ',', 'localization', 'Séparateur décimal', 'text'),
  ('locale', 'fr-FR', 'localization', 'Locale utilisée pour les formats', 'text'),
  ('business_context', 'general', 'ai', 'Contexte métier pour l''IA (general, btp, saas, ecommerce)', 'select'),
  ('business_description', 'Entreprise de services généraux', 'ai', 'Description du secteur d''activité', 'textarea'),
  ('ai_project_context', 'Vous êtes un assistant IA spécialisé dans la gestion de projets pour une entreprise de services. Générez des plans de projets détaillés et pertinents.', 'ai', 'Contexte IA pour la planification de projets', 'textarea'),
  ('company_name', 'Arcadis Technologies', 'company', 'Nom de l''entreprise', 'text'),
  ('company_address', 'Dakar, Sénégal', 'company', 'Adresse de l''entreprise', 'text'),
  ('company_ninea', '012203098', 'company', 'Numéro NINEA', 'text'),
  ('company_rc', 'SN.DKR.2025.B.22973', 'company', 'Registre du Commerce', 'text');
