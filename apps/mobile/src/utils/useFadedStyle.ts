import { useAnimatedStyle, withTiming } from 'react-native-reanimated';

export function useFadedStyle(prop: 'backgroundColor' | 'color', value: string, duration = 400) {
  return useAnimatedStyle(() => ({ [prop]: withTiming(value, { duration }) }), [value, duration]);
}
