// src/components/modules/dashboard/index.ts
// Exporte tous les composants liés au tableau de bord pour faciliter leur importation

export { default as RecentActivity } from './RecentActivity';
export { default as StatsCard } from './StatsCard';
export { default as InteractiveStatsCard } from './InteractiveStatsCard';
export { default as InteractiveActivityCard } from './InteractiveActivityCard';
export { InteractiveDashboardGrid } from './InteractiveDashboardGrid';

// Export des nouveaux composants modulaires et IA
export { AIInsightsWidget } from './AIInsightsWidget';
export { AIInsightsCard } from './AIInsightsCard';
export { ModularDashboard } from './ModularDashboard';
export { DashboardWidgetContainer } from './DashboardWidgetContainer';

// Export des types
export type { ActivityItem } from './InteractiveActivityCard';
export type { DashboardWidget, WidgetSize, WidgetPosition } from './DashboardWidgetContainer';
