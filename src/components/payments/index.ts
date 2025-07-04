// src/components/payments/index.ts
// Exporte tous les composants liés aux paiements pour faciliter leur importation

// Composants principaux
export { default as DexchangePaymentModal } from './DexchangePaymentModal'; // Déprécié
export { default as AnimatedPaymentModal } from './AnimatedPaymentModal'; // Déprécié
export { default as WavePaymentModal } from './WavePaymentModal'; // Version actuelle recommandée

// Sous-composants
export { default as AnimatedPaymentButton } from './AnimatedPaymentButton';
export { default as AnimatedPaymentCard } from './AnimatedPaymentCard';
export { default as CountdownTimer } from './CountdownTimer';
export { default as PaymentInstructions } from './PaymentInstructions';
export { default as PaymentStatusBadge } from './PaymentStatusBadge';
export { default as PaymentSuccess } from './PaymentSuccess';
