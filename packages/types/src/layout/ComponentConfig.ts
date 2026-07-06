import { ComponentOptions } from './ComponentOptions';

//
// What can be customized by a user via their config JSON
//

export interface ComponentConfig {
  id: keyof ComponentOptions;
  enabled: boolean;
  order: number; // Position on screen in relation to other enabled componets
  options?: ComponentOptions[keyof ComponentOptions]; // Settings specific to component
}
