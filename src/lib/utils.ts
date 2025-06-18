
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatDateTime = (date: Date): string => {
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatCurrency = (amount: number): string => {
  return `${amount.toLocaleString('fr-FR')} FCFA`;
};

// ... (vos autres fonctions utilitaires existantes)

export const formatDateForInput = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  const d = new Date(date);
  // Vérifier si la date est valide
  if (isNaN(d.getTime())) {
    console.error("Invalid date provided to formatDateForInput:", date);
    return ''; // Retourne une chaîne vide pour une date invalide
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};