// src/lib/utils.ts
// Assurez-vous que tous vos imports nécessaires sont ici
// Par exemple, si vous avez des fonctions de date, elles devraient être là.

/**
 * Formate une date au format JJ/MM/AAAA.
 * @param date La date à formater.
 * @returns La date formatée en chaîne de caractères.
 */
export const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return '-';
  
  let dateObj: Date;
  if (typeof date === 'string') {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }
  
  // Vérifier si la date est valide
  if (isNaN(dateObj.getTime())) {
    return '-';
  }
  
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(dateObj);
};

/**
 * Formate une date et une heure au format JJ/MM/AAAA HH:MM.
 * @param date La date et l'heure à formater.
 * @returns La date et l'heure formatées en chaîne de caractères.
 */
export const formatDateTime = (date: Date | string | null | undefined): string => {
  if (!date) return '-';
  
  let dateObj: Date;
  if (typeof date === 'string') {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }
  
  // Vérifier si la date est valide
  if (isNaN(dateObj.getTime())) {
    return '-';
  }
  
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false, // Utilise le format 24 heures
  }).format(dateObj);
};

/**
 * Formate un montant en devise FCFA (ancienne fonction pour rétrocompatibilité).
 * Utilise le formatage numérique français (espace pour les milliers, virgule pour les décimales)
 * et ajoute explicitement " FCFA".
 * @param amount Le montant numérique à formater.
 * @returns Le montant formaté en chaîne de caractères avec " FCFA".
 * @deprecated Utilisez useSettings().formatCurrency() pour le formatage basé sur les paramètres
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
 * Formate un montant selon les paramètres de devise configurés.
 * Cette fonction est utilisée quand le contexte des paramètres n'est pas disponible.
 * @param amount Le montant numérique à formater.
 * @param currencySettings Les paramètres de devise à utiliser.
 * @param includeCurrencySymbol Inclure le symbole de devise.
 * @returns Le montant formaté.
 */
export const formatCurrencyWithSettings = (
  amount: number, 
  currencySettings: {
    symbol: string;
    position: 'before' | 'after';
    decimalPlaces: number;
    thousandSeparator: string;
    decimalSeparator: string;
    locale: string;
  },
  includeCurrencySymbol: boolean = true
): string => {
  try {
    const formatter = new Intl.NumberFormat(currencySettings.locale, {
      minimumFractionDigits: currencySettings.decimalPlaces,
      maximumFractionDigits: currencySettings.decimalPlaces,
      useGrouping: true,
    });

    let formatted = formatter.format(amount);

    // Remplacer les séparateurs si nécessaire
    if (currencySettings.thousandSeparator !== ' ') {
      formatted = formatted.replace(/\s/g, currencySettings.thousandSeparator);
    }
    if (currencySettings.decimalSeparator !== ',') {
      formatted = formatted.replace(/,/g, currencySettings.decimalSeparator);
    }

    // Ajouter le symbole de devise selon la position configurée
    if (includeCurrencySymbol) {
      return currencySettings.position === 'before' 
        ? `${currencySettings.symbol} ${formatted}`
        : `${formatted} ${currencySettings.symbol}`;
    }

    return formatted;
  } catch (error) {
    console.error('Erreur lors du formatage de la devise:', error);
    // Fallback au formatage par défaut
    return `${amount} ${currencySettings.symbol}`;
  }
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

/**
 * Formate un numéro de téléphone pour améliorer la lisibilité.
 * Par exemple, transforme "771234567" en "77 123 45 67"
 * @param phone Le numéro de téléphone à formater
 * @returns Le numéro formaté avec des espaces
 */
export const formatPhoneNumber = (phone: string): string => {
  // Nettoyer le numéro pour ne garder que les chiffres
  const cleaned = phone.replace(/[^0-9]/g, '');
  
  // Formater selon la longueur
  if (cleaned.length === 9) {
    // Format standard pour les numéros sénégalais: 77 123 45 67
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7, 9)}`;
  } else if (cleaned.length === 10) {
    // Format pour les numéros à 10 chiffres: 01 23 45 67 89
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`;
  }
  
  // Si le format ne correspond pas, retourner tel quel avec des espaces tous les 2 chiffres
  let formatted = '';
  for (let i = 0; i < cleaned.length; i += 2) {
    formatted += cleaned.slice(i, Math.min(i + 2, cleaned.length)) + ' ';
  }
  return formatted.trim();
};

/**
 * Formate uniquement l'heure au format HH:MM.
 * @param date La date contenant l'heure à formater.
 * @returns L'heure formatée en chaîne de caractères.
 */
export const formatTime = (date: Date): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
};

/**
 * Formate une date au format long: 'Jour DD Mois AAAA'.
 * @param date La date à formater.
 * @returns La date formatée en chaîne de caractères.
 */
export const formatDateLong = (date: Date): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};