// Department components
export { DepartmentCard } from './departments/DepartmentCard';

// Common components
export { 
  EmployeeStatus,
  ActiveStatus,
  InactiveStatus,
  OnLeaveStatus,
  TerminatedStatus,
  SuspendedStatus
} from './common/EmployeeStatus';

export { 
  RoleBadge,
  AdminBadge,
  HRManagerBadge,
  DepartmentManagerBadge,
  TeamLeadBadge,
  EmployeeBadge,
  ClientBadge,
  ContractorBadge,
  getRolePriority,
  compareRolesByPriority
} from './common/RoleBadge';

// Onboarding components (already exported from existing index)
export * from './onboarding';
