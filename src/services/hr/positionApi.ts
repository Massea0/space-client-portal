import { Position, PositionFormData, PositionLevel, PositionStatus, EmploymentType, EducationLevel, PositionFilters } from '../../types/hr/position';
import { PaginatedResponse } from '../../types/hr';

// Mock data for positions
const mockPositions: Position[] = [
  {
    id: 'pos-1',
    title: 'Développeur Full Stack Senior',
    description: 'Développement d\'applications web avec React/Node.js',
    department_id: 'dept-2',
    department: {
      id: 'dept-2',
      name: 'Développement'
    },
    level: PositionLevel.SENIOR,
    salary_min: 55000,
    salary_max: 75000,
    currency: 'EUR',
    employment_type: EmploymentType.FULL_TIME,
    remote_allowed: true,
    requirements: [
      '5+ années d\'expérience en développement web',
      'Maîtrise de React et Node.js',
      'Expérience avec TypeScript'
    ],
    responsibilities: [
      'Développer des fonctionnalités front-end et back-end',
      'Mentorer les développeurs junior',
      'Participer aux revues de code'
    ],
    skills_required: ['React', 'Node.js', 'TypeScript', 'SQL'],
    skills_preferred: ['Next.js', 'PostgreSQL', 'Docker'],
    experience_min_years: 5,
    education_level: EducationLevel.BACHELOR,
    status: PositionStatus.ACTIVE,
    positions_available: 2,
    positions_filled: 1,
    created_at: '2024-01-10T09:00:00Z',
    updated_at: '2024-01-25T14:30:00Z'
  },
  {
    id: 'pos-2',
    title: 'Chef de Projet Marketing',
    description: 'Gestion des campagnes marketing digital',
    department_id: 'dept-3',
    department: {
      id: 'dept-3',
      name: 'Marketing'
    },
    level: PositionLevel.MID_LEVEL,
    salary_min: 45000,
    salary_max: 60000,
    currency: 'EUR',
    employment_type: EmploymentType.FULL_TIME,
    remote_allowed: false,
    requirements: [
      '3+ années d\'expérience en marketing digital',
      'Maîtrise des outils analytics',
      'Expérience en gestion de campagnes'
    ],
    responsibilities: [
      'Planifier et exécuter des campagnes marketing',
      'Analyser les performances des campagnes',
      'Coordonner avec les équipes créatives'
    ],
    skills_required: ['Google Analytics', 'SEO/SEA', 'Social Media'],
    skills_preferred: ['HubSpot', 'Adobe Creative Suite', 'CRM'],
    experience_min_years: 3,
    education_level: EducationLevel.BACHELOR,
    status: PositionStatus.ACTIVE,
    positions_available: 1,
    positions_filled: 0,
    created_at: '2024-01-12T10:00:00Z',
    updated_at: '2024-01-20T16:15:00Z'
  },
  {
    id: 'pos-3',
    title: 'Responsable RH',
    description: 'Gestion des ressources humaines et recrutement',
    department_id: 'dept-1',
    department: {
      id: 'dept-1',
      name: 'Ressources Humaines'
    },
    level: PositionLevel.MANAGER,
    salary_min: 50000,
    salary_max: 70000,
    currency: 'EUR',
    employment_type: EmploymentType.FULL_TIME,
    remote_allowed: true,
    requirements: [
      '5+ années d\'expérience en RH',
      'Connaissance du droit du travail',
      'Expérience en recrutement'
    ],
    responsibilities: [
      'Gérer les processus RH',
      'Recruter de nouveaux talents',
      'Développer les politiques RH'
    ],
    skills_required: ['Recrutement', 'Droit du travail', 'SIRH'],
    skills_preferred: ['Formation', 'Coaching', 'Paie'],
    experience_min_years: 5,
    education_level: EducationLevel.MASTER,
    status: PositionStatus.FILLED,
    positions_available: 1,
    positions_filled: 1,
    created_at: '2024-01-08T09:00:00Z',
    updated_at: '2024-01-15T11:20:00Z'
  },
  {
    id: 'pos-4',
    title: 'Commercial Senior B2B',
    description: 'Développement commercial et prospection B2B',
    department_id: 'dept-4',
    department: {
      id: 'dept-4',
      name: 'Ventes'
    },
    level: PositionLevel.SENIOR,
    salary_min: 40000,
    salary_max: 80000, // Includes variable compensation
    currency: 'EUR',
    employment_type: EmploymentType.FULL_TIME,
    remote_allowed: true,
    requirements: [
      '4+ années d\'expérience en vente B2B',
      'Maîtrise des techniques de négociation',
      'Expérience CRM'
    ],
    responsibilities: [
      'Développer le portefeuille client',
      'Négocier les contrats',
      'Atteindre les objectifs de vente'
    ],
    skills_required: ['Négociation', 'CRM', 'Prospection'],
    skills_preferred: ['Salesforce', 'LinkedIn Sales Navigator', 'HubSpot'],
    experience_min_years: 4,
    education_level: EducationLevel.BACHELOR,
    status: PositionStatus.ACTIVE,
    positions_available: 3,
    positions_filled: 2,
    created_at: '2024-01-05T09:00:00Z',
    updated_at: '2024-01-22T13:45:00Z'
  },
  {
    id: 'pos-5',
    title: 'Comptable Senior',
    description: 'Gestion comptable et reporting financier',
    department_id: 'dept-5',
    department: {
      id: 'dept-5',
      name: 'Finance'
    },
    level: PositionLevel.SENIOR,
    salary_min: 48000,
    salary_max: 62000,
    currency: 'EUR',
    employment_type: EmploymentType.FULL_TIME,
    remote_allowed: false,
    requirements: [
      'Diplôme en comptabilité/finance',
      '4+ années d\'expérience',
      'Maîtrise des outils comptables'
    ],
    responsibilities: [
      'Tenir la comptabilité générale',
      'Préparer les reporting financiers',
      'Gérer les relations avec les auditeurs'
    ],
    skills_required: ['Comptabilité', 'Excel', 'ERP'],
    skills_preferred: ['SAP', 'Power BI', 'Fiscalité'],
    experience_min_years: 4,
    education_level: EducationLevel.BACHELOR,
    status: PositionStatus.ACTIVE,
    positions_available: 1,
    positions_filled: 1,
    created_at: '2024-01-15T09:00:00Z',
    updated_at: '2024-01-28T10:30:00Z'
  },
  {
    id: 'pos-6',
    title: 'Développeur Junior React',
    description: 'Développement front-end avec React',
    department_id: 'dept-2',
    department: {
      id: 'dept-2',
      name: 'Développement'
    },
    level: PositionLevel.JUNIOR,
    salary_min: 35000,
    salary_max: 45000,
    currency: 'EUR',
    employment_type: EmploymentType.FULL_TIME,
    remote_allowed: true,
    requirements: [
      '1-2 années d\'expérience en React',
      'Connaissance de JavaScript/TypeScript',
      'Base en HTML/CSS'
    ],
    responsibilities: [
      'Développer des interfaces utilisateur',
      'Intégrer des APIs REST',
      'Participer aux tests unitaires'
    ],
    skills_required: ['React', 'JavaScript', 'HTML/CSS'],
    skills_preferred: ['TypeScript', 'Jest', 'Git'],
    experience_min_years: 1,
    education_level: EducationLevel.BACHELOR,
    status: PositionStatus.ACTIVE,
    positions_available: 2,
    positions_filled: 0,
    created_at: '2024-01-20T09:00:00Z',
    updated_at: '2024-01-25T15:20:00Z'
  },
  {
    id: 'pos-7',
    title: 'Stage Marketing Digital',
    description: 'Stage de 6 mois en marketing digital',
    department_id: 'dept-3',
    department: {
      id: 'dept-3',
      name: 'Marketing'
    },
    level: PositionLevel.INTERN,
    salary_min: 600,
    salary_max: 800,
    currency: 'EUR',
    employment_type: EmploymentType.INTERN,
    remote_allowed: true,
    requirements: [
      'Étudiant en marketing/communication',
      'Connaissance des réseaux sociaux',
      'Motivation et créativité'
    ],
    responsibilities: [
      'Assister dans la création de contenu',
      'Analyser les métriques social media',
      'Participer aux brainstormings'
    ],
    skills_required: ['Réseaux sociaux', 'Créativité', 'Analyse'],
    skills_preferred: ['Canva', 'Google Analytics', 'Photoshop'],
    experience_min_years: 0,
    education_level: EducationLevel.HIGH_SCHOOL,
    status: PositionStatus.DRAFT,
    positions_available: 1,
    positions_filled: 0,
    created_at: '2024-01-25T09:00:00Z',
    updated_at: '2024-01-25T09:00:00Z'
  }
];

class PositionApiService {
  private positions: Position[] = [...mockPositions];

  async getPositions(filters?: PositionFilters): Promise<PaginatedResponse<Position>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    let filteredPositions = [...this.positions];

    if (filters) {
      if (filters.department_id) {
        filteredPositions = filteredPositions.filter(pos => pos.department_id === filters.department_id);
      }

      if (filters.level) {
        filteredPositions = filteredPositions.filter(pos => pos.level === filters.level);
      }

      if (filters.employment_type) {
        filteredPositions = filteredPositions.filter(pos => pos.employment_type === filters.employment_type);
      }

      if (filters.status) {
        filteredPositions = filteredPositions.filter(pos => pos.status === filters.status);
      }

      if (filters.remote_allowed !== undefined) {
        filteredPositions = filteredPositions.filter(pos => pos.remote_allowed === filters.remote_allowed);
      }

      if (filters.salary_min) {
        filteredPositions = filteredPositions.filter(pos => 
          pos.salary_min && pos.salary_min >= filters.salary_min!
        );
      }

      if (filters.salary_max) {
        filteredPositions = filteredPositions.filter(pos => 
          pos.salary_max && pos.salary_max <= filters.salary_max!
        );
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredPositions = filteredPositions.filter(pos =>
          pos.title.toLowerCase().includes(searchLower) ||
          pos.description?.toLowerCase().includes(searchLower) ||
          pos.skills_required.some(skill => skill.toLowerCase().includes(searchLower)) ||
          pos.skills_preferred.some(skill => skill.toLowerCase().includes(searchLower))
        );
      }
    }

    return {
      data: filteredPositions,
      pagination: {
        page: 1,
        limit: 50,
        total: filteredPositions.length,
        total_pages: 1
      }
    };
  }

  async getPositionById(id: string): Promise<Position | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const position = this.positions.find(pos => pos.id === id);
    return position || null;
  }

  async createPosition(data: PositionFormData): Promise<Position> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const newPosition: Position = {
      id: `pos-${Date.now()}`,
      ...data,
      positions_filled: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Add department info (mock)
    const departmentNames: Record<string, string> = {
      'dept-1': 'Ressources Humaines',
      'dept-2': 'Développement',
      'dept-3': 'Marketing',
      'dept-4': 'Ventes',
      'dept-5': 'Finance',
      'dept-6': 'Support Client'
    };

    newPosition.department = {
      id: data.department_id,
      name: departmentNames[data.department_id] || 'Département'
    };

    this.positions.push(newPosition);
    return newPosition;
  }

  async updatePosition(id: string, data: Partial<PositionFormData>): Promise<Position> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));

    const index = this.positions.findIndex(pos => pos.id === id);
    if (index === -1) {
      throw new Error(`Position with id ${id} not found`);
    }

    const updatedPosition = {
      ...this.positions[index],
      ...data,
      updated_at: new Date().toISOString()
    };

    // Update department info if department_id changed
    if (data.department_id && data.department_id !== this.positions[index].department_id) {
      const departmentNames: Record<string, string> = {
        'dept-1': 'Ressources Humaines',
        'dept-2': 'Développement',
        'dept-3': 'Marketing',
        'dept-4': 'Ventes',
        'dept-5': 'Finance',
        'dept-6': 'Support Client'
      };

      updatedPosition.department = {
        id: data.department_id,
        name: departmentNames[data.department_id] || 'Département'
      };
    }

    this.positions[index] = updatedPosition;
    return updatedPosition;
  }

  async deletePosition(id: string): Promise<boolean> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const index = this.positions.findIndex(pos => pos.id === id);
    if (index === -1) {
      throw new Error(`Position with id ${id} not found`);
    }

    // In a real app, this would be a soft delete
    this.positions.splice(index, 1);
    return true;
  }

  async getPositionsByDepartment(departmentId: string): Promise<Position[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    return this.positions.filter(pos => pos.department_id === departmentId);
  }

  async getActivePositions(): Promise<Position[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    return this.positions.filter(pos => pos.status === PositionStatus.ACTIVE);
  }

  async getPositionsWithOpenings(): Promise<Position[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    return this.positions.filter(pos => 
      pos.status === PositionStatus.ACTIVE && 
      pos.positions_filled < pos.positions_available
    );
  }
}

// Export singleton instance
export const positionApi = new PositionApiService();
