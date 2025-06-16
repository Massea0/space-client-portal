
import { Devis, Invoice, Ticket, Company } from '@/types';

export const MOCK_COMPANIES: Company[] = [
  {
    id: '1',
    name: 'Entreprise ABC',
    email: 'contact@entrepriseabc.sn',
    phone: '+221 77 123 45 67',
    address: 'Dakar, Sénégal',
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Tech Solutions',
    email: 'info@techsolutions.sn',
    phone: '+221 77 234 56 78',
    address: 'Thiès, Sénégal',
    createdAt: new Date('2024-02-20')
  }
];

export const MOCK_DEVIS: Devis[] = [
  {
    id: '1',
    number: 'DEV-2024-001',
    companyId: '1',
    companyName: 'Entreprise ABC',
    object: 'Développement site web e-commerce',
    amount: 2500000,
    status: 'pending',
    createdAt: new Date('2024-06-01'),
    validUntil: new Date('2024-07-01'),
    items: [
      {
        id: '1',
        description: 'Développement frontend React',
        quantity: 1,
        unitPrice: 1500000,
        total: 1500000
      },
      {
        id: '2',
        description: 'Intégration backend Node.js',
        quantity: 1,
        unitPrice: 1000000,
        total: 1000000
      }
    ]
  },
  {
    id: '2',
    number: 'DEV-2024-002',
    companyId: '1',
    companyName: 'Entreprise ABC',
    object: 'Application mobile Android/iOS',
    amount: 3500000,
    status: 'approved',
    createdAt: new Date('2024-05-15'),
    validUntil: new Date('2024-06-15'),
    items: [
      {
        id: '3',
        description: 'Développement application mobile',
        quantity: 1,
        unitPrice: 3500000,
        total: 3500000
      }
    ]
  }
];

export const MOCK_INVOICES: Invoice[] = [
  {
    id: '1',
    number: 'FACT-2024-001',
    companyId: '1',
    companyName: 'Entreprise ABC',
    amount: 3500000,
    status: 'paid',
    createdAt: new Date('2024-05-20'),
    dueDate: new Date('2024-06-20'),
    paidAt: new Date('2024-06-18'),
    items: [
      {
        id: '1',
        description: 'Développement application mobile',
        quantity: 1,
        unitPrice: 3500000,
        total: 3500000
      }
    ]
  },
  {
    id: '2',
    number: 'FACT-2024-002',
    companyId: '1',
    companyName: 'Entreprise ABC',
    amount: 750000,
    status: 'pending',
    createdAt: new Date('2024-06-10'),
    dueDate: new Date('2024-07-10'),
    items: [
      {
        id: '2',
        description: 'Maintenance site web - Juin 2024',
        quantity: 1,
        unitPrice: 750000,
        total: 750000
      }
    ]
  }
];

export const MOCK_TICKETS: Ticket[] = [
  {
    id: '1',
    number: 'TICK-2024-001',
    companyId: '1',
    companyName: 'Entreprise ABC',
    subject: 'Problème de connexion au dashboard',
    description: 'Impossible de se connecter au tableau de bord depuis ce matin',
    status: 'in_progress',
    priority: 'high',
    createdAt: new Date('2024-06-14'),
    updatedAt: new Date('2024-06-14'),
    assignedTo: 'Support Team',
    messages: [
      {
        id: '1',
        ticketId: '1',
        authorId: '1',
        authorName: 'Jean Dupont',
        authorRole: 'client',
        content: 'Impossible de se connecter au tableau de bord depuis ce matin. J\'obtiens une erreur 500.',
        createdAt: new Date('2024-06-14T09:00:00'),
        attachments: []
      },
      {
        id: '2',
        ticketId: '1',
        authorId: '2',
        authorName: 'Support Arcadis',
        authorRole: 'admin',
        content: 'Bonjour, nous avons identifié le problème. Il s\'agit d\'une maintenance serveur. Nous travaillons dessus.',
        createdAt: new Date('2024-06-14T10:30:00'),
        attachments: []
      }
    ],
    attachments: []
  },
  {
    id: '2',
    number: 'TICK-2024-002',
    companyId: '1',
    companyName: 'Entreprise ABC',
    subject: 'Demande de formation utilisateurs',
    description: 'Nous souhaitons organiser une formation pour nos utilisateurs',
    status: 'open',
    priority: 'medium',
    createdAt: new Date('2024-06-13'),
    updatedAt: new Date('2024-06-13'),
    messages: [
      {
        id: '3',
        ticketId: '2',
        authorId: '1',
        authorName: 'Jean Dupont',
        authorRole: 'client',
        content: 'Nous souhaitons organiser une formation pour nos utilisateurs sur la nouvelle interface. Quelles sont les disponibilités ?',
        createdAt: new Date('2024-06-13T14:00:00'),
        attachments: []
      }
    ],
    attachments: []
  }
];
