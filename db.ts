
import Dexie, { type Table } from 'dexie';
import type { VFile } from './types';

export class AppDB extends Dexie {
  files!: Table<VFile>; 

  constructor() {
    super('FlexOSDB');
    // FIX: Cast 'this' to Dexie to resolve a TypeScript typing issue where the 'version' method was not found on the subclass.
    this.version(1).stores({
      files: 'id', // Primary key
    });
  }
}

export const db = new AppDB();
