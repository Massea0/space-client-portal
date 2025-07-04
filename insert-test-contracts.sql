-- Insertion de données de test pour les contrats et alertes
-- Mission 1: Contrats IA et alertes

-- 1. Insérer des contrats de test
INSERT INTO contracts (
  client_id,
  devis_id,
  contract_number,
  title,
  object,
  status,
  start_date,
  end_date,
  signature_date,
  amount,
  currency,
  payment_terms,
  content_preview,
  clauses_summary,
  compliance_score,
  ai_confidence_score,
  generated_by_ai,
  template_used,
  contract_type,
  risk_analysis,
  obligations_monitoring,
  auto_renewal
) VALUES
  (
    (SELECT id FROM companies LIMIT 1),
    (SELECT id FROM devis WHERE status = 'approved' LIMIT 1),
    'CTR-2024-001',
    'Contrat de développement web',
    'Développement d''une application web moderne avec interface d''administration',
    'signed',
    '2024-01-15'::date,
    '2024-12-15'::date,
    '2024-01-10'::date,
    45000,
    'EUR',
    '30 jours',
    'Contrat de prestation de services pour le développement d''une application web...',
    '{
      "total_clauses": 12,
      "key_terms": ["Développement web", "Maintenance", "Support technique"],
      "payment_schedule": "Mensuel - 30 jours",
      "liability_cap": "50 000 EUR",
      "termination_notice": "30 jours"
    }'::jsonb,
    95,
    92,
    true,
    'Template Développement Web IA',
    'service',
    '{
      "overall_score": 85,
      "risks": {
        "financial": 20,
        "legal": 15,
        "operational": 10,
        "compliance": 5
      },
      "recommendations": ["Réviser les clauses de paiement"],
      "flagged_clauses": []
    }'::jsonb,
    '{
      "client_obligations": [],
      "provider_obligations": [],
      "next_milestones": []
    }'::jsonb,
    true
  ),
  (
    (SELECT id FROM companies ORDER BY created_at DESC LIMIT 1 OFFSET 1),
    NULL,
    'CTR-2024-002',
    'Contrat de maintenance annuelle',
    'Maintenance et support technique pour infrastructure IT',
    'pending_client',
    '2024-02-01'::date,
    '2025-01-31'::date,
    NULL,
    12000,
    'EUR',
    'Trimestriel',
    'Contrat de maintenance annuelle pour infrastructure...',
    '{
      "total_clauses": 8,
      "key_terms": ["Maintenance", "Support 24/7", "SLA 99.9%"],
      "payment_schedule": "Trimestriel",
      "liability_cap": "25 000 EUR",
      "termination_notice": "15 jours"
    }'::jsonb,
    88,
    85,
    false,
    NULL,
    'maintenance',
    '{
      "overall_score": 75,
      "risks": {
        "financial": 25,
        "legal": 20,
        "operational": 15,
        "compliance": 10
      },
      "recommendations": ["Clarifier les SLA", "Ajuster les pénalités"],
      "flagged_clauses": ["clause_sla"]
    }'::jsonb,
    '{
      "client_obligations": [],
      "provider_obligations": [],
      "next_milestones": []
    }'::jsonb,
    false
  ),
  (
    (SELECT id FROM companies LIMIT 1),
    NULL,
    'CTR-2024-003',
    'Contrat de conseil stratégique',
    'Mission de conseil en transformation digitale',
    'draft',
    '2024-03-01'::date,
    '2024-08-31'::date,
    NULL,
    75000,
    'EUR',
    'À la livraison',
    'Mission de conseil stratégique pour la transformation digitale...',
    '{
      "total_clauses": 15,
      "key_terms": ["Conseil stratégique", "Transformation digitale", "Formation"],
      "payment_schedule": "Par phases",
      "liability_cap": "100 000 EUR",
      "termination_notice": "60 jours"
    }'::jsonb,
    82,
    78,
    true,
    'Template Conseil IA',
    'consulting',
    '{
      "overall_score": 70,
      "risks": {
        "financial": 30,
        "legal": 25,
        "operational": 20,
        "compliance": 15
      },
      "recommendations": ["Définir des livrables plus précis", "Ajuster la répartition des risques"],
      "flagged_clauses": ["clause_payment", "clause_liability"]
    }'::jsonb,
    '{
      "client_obligations": [],
      "provider_obligations": [],
      "next_milestones": []
    }'::jsonb,
    false
  );

-- 2. Insérer des alertes de test
INSERT INTO contract_alerts (
  contract_id,
  alert_type,
  severity,
  message,
  due_date,
  details,
  status
) VALUES
  (
    (SELECT id FROM contracts WHERE contract_number = 'CTR-2024-001'),
    'contract_expiring_soon',
    'medium',
    'Le contrat CTR-2024-001 expire dans 30 jours',
    '2024-12-15'::date,
    '{"days_remaining": 30}'::jsonb,
    'active'
  ),
  (
    (SELECT id FROM contracts WHERE contract_number = 'CTR-2024-002'),
    'manual_review_required',
    'low',
    'Révision manuelle requise pour le contrat en attente',
    NULL,
    '{"reason": "Clauses spécifiques à valider"}'::jsonb,
    'active'
  ),
  (
    (SELECT id FROM contracts WHERE contract_number = 'CTR-2024-003'),
    'low_compliance_score',
    'high',
    'Score de conformité faible détecté pour CTR-2024-003',
    NULL,
    '{"compliance_score": 82, "threshold": 90}'::jsonb,
    'active'
  );
