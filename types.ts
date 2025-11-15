
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
  features: number[]; // Array of feature IDs
  database: number[]; // Array of database table IDs
  type?: string;
}

export interface DatabaseTable {
  id: number;
  name: string;
  fields: string; // Simple string for now, e.g., "id, name, email"
  // --- NEW "DATA INJECTOR" FIELD ---
  dummyData?: any[]; 
}

export interface DesignSystem {
    id: 'design';
    name: 'Design System';
    type: 'design';
    theme?: string;
    // --- NEW "VIBE TUNER" FIELD ---
    tokens?: { [key: string]: string };
}

export type SelectableItem = Feature | Page | DatabaseTable | DesignSystem;

export interface Documentation {
  id: number;
  title: string;
  description: string;
  content: string; // Can be markdown/HTML string
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
  id: string; // FULL path-like id, e.g., 'flexos/specs/features/12345.json'
  content: string; // JSON stringified content
}

// This is the structured response we will get from the AI
export interface FlexiResponse {
  chatResponse: string; // The friendly, conversational reply
  fileOperations?: {
    action: 'write' | 'delete';
    file: VFile; // The file to be written (or deleted)
  }[];
}
