export type ProjectCategory = 
  | 'all'
  | 'identity'
  | 'film'
  | 'editorial'
  | 'motion';

export interface Project {
  id: string;
  title: string;
  client: string;
  year: string;
  category: ProjectCategory;
  categoryLabel: string;
  summary: string;
  image: string;
  featured?: boolean;
  aspectRatio?: 'landscape' | 'portrait' | 'square';
  role: string;
  tools: string[];
  deliverables: string[];
  challenge: string;
  solution: string;
  quote?: {
    text: string;
    author: string;
    role: string;
  };
  metrics?: string;
}

export interface Award {
  year: string;
  award: string;
  project: string;
  organization: string;
}

export interface Client {
  name: string;
  industry: string;
  location: string;
}
