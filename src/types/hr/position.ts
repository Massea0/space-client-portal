export interface Position {
  id: string;
  title: string;
  description?: string;
  department_id: string;
  department?: {
    id: string;
    name: string;
  };
  level: PositionLevel;
  salary_min?: number;
  salary_max?: number;
  currency: string;
  employment_type: EmploymentType;
  remote_allowed: boolean;
  requirements: string[];
  responsibilities: string[];
  skills_required: string[];
  skills_preferred: string[];
  experience_min_years?: number;
  education_level?: EducationLevel;
  status: PositionStatus;
  positions_available: number;
  positions_filled: number;
  created_at: string;
  updated_at: string;
}

export interface PositionFormData {
  title: string;
  description?: string;
  department_id: string;
  level: PositionLevel;
  salary_min?: number;
  salary_max?: number;
  currency: string;
  employment_type: EmploymentType;
  remote_allowed: boolean;
  requirements: string[];
  responsibilities: string[];
  skills_required: string[];
  skills_preferred: string[];
  experience_min_years?: number;
  education_level?: EducationLevel;
  status: PositionStatus;
  positions_available: number;
}

export interface PositionRequirements {
  education_level?: EducationLevel;
  experience_min_years?: number;
  skills_required: string[];
  skills_preferred: string[];
  certifications?: string[];
  languages?: string[];
}

export enum PositionLevel {
  INTERN = 'intern',
  JUNIOR = 'junior',
  MID_LEVEL = 'mid_level',
  SENIOR = 'senior',
  LEAD = 'lead',
  MANAGER = 'manager',
  DIRECTOR = 'director',
  VP = 'vp',
  C_LEVEL = 'c_level'
}

export enum PositionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
  FILLED = 'filled',
  ON_HOLD = 'on_hold'
}

export enum EducationLevel {
  HIGH_SCHOOL = 'high_school',
  ASSOCIATE = 'associate',
  BACHELOR = 'bachelor',
  MASTER = 'master',
  DOCTORATE = 'doctorate',
  PROFESSIONAL = 'professional'
}

export enum EmploymentType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  TEMPORARY = 'temporary',
  INTERN = 'intern',
  FREELANCE = 'freelance'
}

export interface PositionFilters {
  department_id?: string;
  level?: PositionLevel;
  employment_type?: EmploymentType;
  status?: PositionStatus;
  remote_allowed?: boolean;
  salary_min?: number;
  salary_max?: number;
  search?: string;
}
