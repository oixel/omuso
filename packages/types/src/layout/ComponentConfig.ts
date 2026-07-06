import { ComponentOptions } from './ComponentOptions';

//
// What can be customized by a user via their config JSON
//

export interface ComponentConfig {
  id: keyof ComponentOptions;

  position: {
    // Grid coordinate of component's top left
    x: number;
    y: number;
  };

  // Cell size counts of scalable components
  width: number;
  height: number;

  options?: ComponentOptions[keyof ComponentOptions]; // Additional settings specific to component
}
