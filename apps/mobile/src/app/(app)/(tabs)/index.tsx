import { Redirect } from 'expo-router';

export default function TabsIndex() {
  // Instantly redirect to home page on load
  return <Redirect href="/home" />;
}
