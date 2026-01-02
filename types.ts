export interface AIAnalysis {
  tags: string[];
  isTodo: boolean;
  isResource: boolean; // Book, Movie, Article to read/watch
  resourceType?: 'read' | 'watch' | 'listen' | 'code' | null;
  summary?: string;
}

export interface Note {
  id: string;
  content: string;
  timestamp: number;
  aiAnalysis?: AIAnalysis;
  isProcessing?: boolean;
}

export enum FilterType {
  ALL = 'ALL',
  TODO = 'TODO',
  RESOURCE = 'RESOURCE'
}