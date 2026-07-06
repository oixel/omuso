//
// Defines what a component is and what their default values are
//

import { ComponentOptions } from './ComponentOptions';

export interface ComponentDefinition {
  id: keyof ComponentOptions; // Must be a defined component ID
  label: string; // Readable name for settings screen entry
  description: string; // Like name, shown in settings screen to explain component

  defaultEnabled: boolean;
  defaultOptions: ComponentOptions[keyof ComponentOptions];
}
