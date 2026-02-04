// Types pour l'IDE intégré

export type IDELanguage = 'python' | 'javascript';

export interface CodeSnippet {
  id: string;
  title: string;
  description?: string;
  language: IDELanguage;
  code: string;
  category: string;
  level: 'Débutant' | 'Intermédiaire' | 'Avancé';
  author?: string;
  created_at?: string;
}

export interface CodeExecutionResult {
  output: string;
  error: string;
  executionTime: number;
}
