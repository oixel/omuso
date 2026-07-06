//
// Defines what a component is and what their default values are
//

import { ComponentOptions } from './ComponentOptions';

export interface ComponentDefinition {
  id: keyof ComponentOptions; // Must be a defined component ID
  label: string; // Readable name for settings screen entry
  description: string; // Like name, shown in settings screen to explain component

  // Grid cell count for minimum dimensions of scalable components
  minWidth: number;
  minHeight: number;

  scaleRatio: 'square' | 'dynamic'; // Dynamic scale ratio allows for rectangular components

  defaultOptions: ComponentOptions[keyof ComponentOptions];
}
