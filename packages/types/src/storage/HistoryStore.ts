import { Media } from '../media';

export interface HistoryStore {
  history: Media[];
  addToHistory: (media: Media) => void;
  clearHistory: () => void;
}
