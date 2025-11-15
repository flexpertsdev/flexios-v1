
export type Status = 'complete' | 'in-progress' | 'pending';
export type Priority = 'High' | 'Medium' | 'Low';
export type Complexity = 'High' | 'Medium' | 'Low';
export type Mode = 'files' | 'library';
export type RightPanelTab = 'spec' | 'preview';
export type SelectedItemType = 'feature' | 'page' | 'database' | 'design';
export type SelectedLibraryItemType = 'changelog' | 'vision' | 'doc' | 'roadmap' | 'architecture';

export interface Feature {
  id: number;
  name: string;
  status: Status;
  priority: Priority;
  complexity: Complexity;
  description: string;
  requirements: string[];
  dependencies: string[];
}

export interface Page {
  id: number;
  name: string;
  features: number[];
  database: number[];
  type?: string;
}

export interface DatabaseTable {
  id: number;
  name: string;
  fields: string;
}

export interface DesignSystem {
    id: 'design';
    name: 'Design System';
    type: 'design';
}

export type SelectableItem = Feature | Page | DatabaseTable | DesignSystem;

export interface Documentation {
  id: number;
  title: string;
  description: string;
  content: string;
}

export interface Change {
  id: number;
  type: 'feature' | 'update' | 'database' | 'vision' | 'bugfix';
  title: string;
  description: string;
  details?: string[];
}

export interface ChangelogEntry {
  date: string;
  time: string;
  changes: Change[];
}

export interface RoadmapPhase {
  id: number;
  name: string;
  timeline: string;
  status: 'Completed' | 'In Progress' | 'Planned';
  progress: number;
  items: string[];
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// For Dexie virtual filesystem
export interface VFile {
  id: string; // path-like id, e.g., 'features/1'
  content: string; // JSON stringified content
}

// New type for structured AI responses
export interface FlexiResponse {
  chatResponse: string;
  fileOperations?: {
    action: 'write' | 'delete';
    file: VFile;
  }[];
}
