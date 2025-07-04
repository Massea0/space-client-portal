/**
 * @deprecated Ce composant a été migré vers les composants de support.
 * Veuillez utiliser '@/components/support/TicketList' à la place.
 */

import TicketList from '@/components/support/TicketList';
export { TicketList };
export default TicketList;

// Affichage d'un message de dépréciation pour faciliter le débogage
console.warn('[Deprecation] Le composant depuis @/components/tickets/TicketList.tsx est obsolète. ' +
             'Utilisez @/components/support/TicketList à la place.');
