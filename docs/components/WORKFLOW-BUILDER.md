# WorkflowBuilder - Documentation

## Composant WorkflowBuilder

Un composant React pour créer et éditer des workflows visuels en utilisant ReactFlow, avec une interface intuitive de drag & drop.

### Fonctionnalités

- ✅ Interface visuelle complète avec ReactFlow
- ✅ Panneau de contrôles intégré à gauche
- ✅ Types de nœuds prédéfinis (task, condition, delay, email, api, custom)
- ✅ Édition des propriétés des nœuds
- ✅ Connexions visuelles entre nœuds
- ✅ Mode lecture seule pour affichage
- ✅ Sauvegarde et callbacks personnalisés
- ✅ Interface responsive et moderne

### Architecture

Le WorkflowBuilder est composé de plusieurs sous-composants :

- **WorkflowBuilder** : Composant principal
- **WorkflowNode** : Nœuds personnalisés avec types et couleurs
- **WorkflowControls** : Panneau de contrôles pour édition
- **WorkflowEdge** : Connexions personnalisées (optionnel)

### Utilisation de base

```tsx
import { WorkflowBuilder } from '@/components/ui/workflow-builder/workflow-builder';

function MyWorkflowApp() {
  const initialNodes = [
    {
      id: '1',
      type: 'workflowNode',
      position: { x: 100, y: 100 },
      data: { 
        label: 'Démarrer', 
        type: 'task',
        config: { autoStart: true }
      },
    },
  ];

  const initialEdges = [];

  const handleSave = (nodes, edges) => {
    console.log('Workflow sauvegardé:', { nodes, edges });
    // Logique de sauvegarde
  };

  return (
    <WorkflowBuilder
      initialNodes={initialNodes}
      initialEdges={initialEdges}
      onSave={handleSave}
    />
  );
}
```

### Props du WorkflowBuilder

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `className` | `string` | - | Classes CSS pour le conteneur |
| `initialNodes` | `Node<WorkflowNodeData>[]` | `[]` | Nœuds initiaux du workflow |
| `initialEdges` | `Edge[]` | `[]` | Connexions initiales du workflow |
| `readOnly` | `boolean` | `false` | Mode lecture seule (cache les contrôles) |
| `onNodesChange` | `(nodes: Node[]) => void` | - | Callback lors du changement des nœuds |
| `onEdgesChange` | `(edges: Edge[]) => void` | - | Callback lors du changement des connexions |
| `onSave` | `(nodes: Node[], edges: Edge[]) => void` | - | Callback de sauvegarde |

### Types de nœuds supportés

#### WorkflowOperationType

```tsx
type WorkflowOperationType = 'task' | 'condition' | 'delay' | 'email' | 'api' | 'custom';
```

- **task** : Tâche générale (bleu)
- **condition** : Condition/branchement (ambre)
- **delay** : Délai/attente (violet)
- **email** : Envoi d'email (vert)
- **api** : Appel API (indigo)
- **custom** : Action personnalisée (rose)

#### WorkflowNodeData

```tsx
interface WorkflowNodeData {
  label: string;                    // Nom affiché du nœud
  type: WorkflowOperationType;      // Type de nœud
  config?: Record<string, any>;     // Configuration spécifique
  icon?: React.ReactNode;           // Icône personnalisée (optionnel)
}
```

### Exemples avancés

#### Workflow complet avec différents types de nœuds

```tsx
const complexWorkflow = [
  {
    id: 'start',
    type: 'workflowNode',
    position: { x: 50, y: 100 },
    data: { 
      label: 'Démarrage automatique', 
      type: 'task',
      config: { 
        trigger: 'timer',
        schedule: '0 9 * * 1' // Chaque lundi à 9h
      }
    },
  },
  {
    id: 'check',
    type: 'workflowNode',
    position: { x: 250, y: 100 },
    data: { 
      label: 'Vérifier les conditions', 
      type: 'condition',
      config: { 
        expression: 'user.status === "active" && user.credits > 0'
      }
    },
  },
  {
    id: 'delay',
    type: 'workflowNode',
    position: { x: 450, y: 50 },
    data: { 
      label: 'Attendre 5 minutes', 
      type: 'delay',
      config: { 
        duration: 300000, // 5 minutes en ms
        unit: 'minutes'
      }
    },
  },
  {
    id: 'email',
    type: 'workflowNode',
    position: { x: 650, y: 100 },
    data: { 
      label: 'Envoyer notification', 
      type: 'email',
      config: { 
        template: 'welcome',
        to: '{{user.email}}',
        subject: 'Bienvenue !'
      }
    },
  },
  {
    id: 'api',
    type: 'workflowNode',
    position: { x: 450, y: 200 },
    data: { 
      label: 'Appel API externe', 
      type: 'api',
      config: { 
        method: 'POST',
        url: 'https://api.external.com/webhook',
        headers: { 'Authorization': 'Bearer {{token}}' }
      }
    },
  },
];

const complexEdges = [
  { id: 'e1', source: 'start', target: 'check', animated: true },
  { id: 'e2', source: 'check', target: 'delay', animated: true, label: 'Oui' },
  { id: 'e3', source: 'check', target: 'api', animated: true, label: 'Non' },
  { id: 'e4', source: 'delay', target: 'email', animated: true },
];
```

#### Mode lecture seule pour affichage

```tsx
<WorkflowBuilder
  initialNodes={savedWorkflow.nodes}
  initialEdges={savedWorkflow.edges}
  readOnly={true}
  className="h-[400px]"
/>
```

#### Avec callbacks personnalisés

```tsx
<WorkflowBuilder
  initialNodes={nodes}
  initialEdges={edges}
  onNodesChange={(newNodes) => {
    console.log('Nœuds modifiés:', newNodes);
    setNodes(newNodes);
  }}
  onEdgesChange={(newEdges) => {
    console.log('Connexions modifiées:', newEdges);
    setEdges(newEdges);
  }}
  onSave={(nodes, edges) => {
    // Sauvegarde en base de données
    saveWorkflowToDatabase({ nodes, edges });
  }}
/>
```

### Personnalisation des nœuds

#### Configuration par type de nœud

Chaque type de nœud peut avoir sa propre configuration :

```tsx
// Nœud de tâche
{
  type: 'task',
  config: {
    assignee: 'user@example.com',
    priority: 'high',
    estimatedTime: '2h'
  }
}

// Nœud de condition
{
  type: 'condition',
  config: {
    expression: 'status === "approved"',
    trueLabel: 'Approuvé',
    falseLabel: 'Rejeté'
  }
}

// Nœud d'email
{
  type: 'email',
  config: {
    template: 'notification',
    recipients: ['admin@myspace.com'],
    attachments: ['report.pdf']
  }
}

// Nœud d'API
{
  type: 'api',
  config: {
    endpoint: '/api/process',
    method: 'POST',
    timeout: 30000,
    retries: 3
  }
}
```

### Panneau de contrôles

Le panneau de contrôles (WorkflowControls) offre :

- **Ajout de nœuds** : Boutons pour chaque type de nœud
- **Édition** : Formulaire pour modifier le nœud sélectionné
- **Suppression** : Suppression du nœud sélectionné
- **Sauvegarde** : Bouton de sauvegarde global

### Intégration avec des APIs

```tsx
function WorkflowManager() {
  const [workflow, setWorkflow] = useState({ nodes: [], edges: [] });

  const loadWorkflow = async (id: string) => {
    const response = await fetch(`/api/workflows/${id}`);
    const data = await response.json();
    setWorkflow(data);
  };

  const saveWorkflow = async (nodes: Node[], edges: Edge[]) => {
    const response = await fetch('/api/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodes, edges })
    });
    
    if (response.ok) {
      toast({ title: 'Succès', description: 'Workflow sauvegardé !' });
    }
  };

  return (
    <WorkflowBuilder
      initialNodes={workflow.nodes}
      initialEdges={workflow.edges}
      onSave={saveWorkflow}
    />
  );
}
```

### Styling et thèmes

Le WorkflowBuilder utilise les variables CSS du design system :

```css
.workflow-builder {
  /* Variables personnalisables */
  --node-border-radius: 8px;
  --node-shadow: 0 2px 4px rgba(0,0,0,0.1);
  --connection-color: #10b981;
  --connection-width: 2px;
}

/* Personnalisation des nœuds par type */
.workflow-node[data-type="task"] {
  --node-bg: rgb(239 246 255);
  --node-border: rgb(147 197 253);
  --node-text: rgb(29 78 216);
}
```

### Performance et optimisation

- Rendu optimisé avec ReactFlow
- Lazy loading des nœuds complexes
- Debouncing des événements de drag
- Mémomization des callbacks

### Accessibilité

- Navigation au clavier supportée
- Labels ARIA appropriés
- Contraste des couleurs respecté
- Annonces pour les lecteurs d'écran

### Cas d'usage typiques

1. **Workflows d'approbation** : Circuits de validation de documents
2. **Automatisation marketing** : Séquences d'emails et actions
3. **Processus métier** : Modélisation des workflows d'entreprise
4. **Pipelines de données** : Traitement et transformation de données
5. **Workflows DevOps** : CI/CD et déploiements automatisés

## Dépendances

- `reactflow` - Moteur de workflow visuel
- `@dnd-kit/core` - Drag & drop (hérité)
- `lucide-react` - Icônes
- Composants shadcn/ui : Button, Input, Label, Tabs, Popover, etc.

## Changelog

### v1.0.0 (Sprint 4)
- ✅ Implémentation complète avec ReactFlow
- ✅ Panneau de contrôles intégré
- ✅ Types de nœuds prédéfinis avec couleurs
- ✅ Mode lecture seule
- ✅ Système de sauvegarde
- ✅ Documentation complète

## Prochaines améliorations

- [ ] Types de nœuds personnalisés par l'utilisateur
- [ ] Templates de workflows prédéfinis
- [ ] Validation des workflows avant sauvegarde
- [ ] Historique et versioning des workflows
- [ ] Export/import en différents formats (JSON, YAML)
- [ ] Exécution des workflows en temps réel
- [ ] Intégration avec des systèmes externes
- [ ] Analytics et métriques des workflows
