// src/lib/utils.ts
// Assurez-vous que tous vos imports nécessaires sont ici
// Par exemple, si vous avez des fonctions de date, elles devraient être là.

/**
 * Formate une date au format JJ/MM/AAAA.
 * @param date La date à formater.
 * @returns La date formatée en chaîne de caractères.
 */
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

/**
 * Formate une date et une heure au format JJ/MM/AAAA HH:MM.
 * @param date La date et l'heure à formater.
 * @returns La date et l'heure formatées en chaîne de caractères.
 */
export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false, // Utilise le format 24 heures
  }).format(date);
};

/**
 * Formate un montant en devise FCFA.
 * Utilise le formatage numérique français (espace pour les milliers, virgule pour les décimales)
 * et ajoute explicitement " FCFA".
 * @param amount Le montant numérique à formater.
 * @returns Le montant formaté en chaîne de caractères avec " FCFA".
 */
export const formatCurrency = (amount: number): string => {
  // Utilise 'fr-FR' locale pour le formatage numérique (ex: 1 234,56)
  const formatter = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `${formatter.format(amount)} FCFA`;
};

/**
 * Formate une date au format YYYY-MM-DD, idéal pour les champs input de type "date".
 * @param date La date à formater.
 * @returns La date formatée en chaîne de caractères (ex: "2023-01-15").
 */
export const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Mois est basé sur 0
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Fonction utilitaire pour concaténer des classes CSS de manière conditionnelle.
 * @param inputs Les classes à concaténer.
 * @returns La chaîne de classes CSS.
 */
export function cn(...inputs: (string | boolean | undefined | null)[]): string {
  return inputs.filter(Boolean).join(' ');
}