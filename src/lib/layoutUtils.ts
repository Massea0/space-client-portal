// src/lib/layoutUtils.ts

/**
 * Fonction permettant de répartir les éléments d'un tableau en colonnes de façon 
 * à ce que les éléments d'une colonne ne soient pas affectés par l'expansion 
 * des éléments dans d'autres colonnes
 * 
 * @param items Le tableau d'éléments à répartir
 * @param totalColumns Le nombre de colonnes souhaité
 * @returns Un tableau de tableaux, chacun représentant une colonne
 */
export function distributeItemsInColumns<T>(items: T[], totalColumns: number): T[][] {
  // Si pas d'éléments ou une seule colonne, tout retourner dans une seule colonne
  if (!items.length || totalColumns <= 1) {
    return [items];
  }

  // Initialiser un tableau de colonnes vides
  const columns: T[][] = Array.from({ length: totalColumns }, () => []);
  
  // Répartir les éléments dans les colonnes
  items.forEach((item, index) => {
    const columnIndex = index % totalColumns;
    columns[columnIndex].push(item);
  });
  
  return columns;
}

/**
 * Détermine le nombre de colonnes en fonction de la largeur d'écran
 * 
 * @returns Le nombre de colonnes approprié pour la largeur d'écran actuelle
 */
export function getResponsiveColumnCount(): number {
  // Utiliser des valeurs correspondant aux breakpoints de Tailwind
  if (typeof window !== 'undefined') {
    if (window.innerWidth >= 1280) return 3; // xl
    if (window.innerWidth >= 768) return 2; // md
  }
  return 1; // Par défaut, une colonne pour les petits écrans
}
