import { Tabs } from 'expo-router';

const TabLayout = () => {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: 'blue' }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="artists" options={{ title: 'Artists' }} />
      <Tabs.Screen name="albums" options={{ title: 'Albums' }} />
      <Tabs.Screen name="songs" options={{ title: 'Songs' }} />
      <Tabs.Screen name="genres" options={{ title: 'Genres' }} />
      <Tabs.Screen name="search" options={{ title: 'Search' }} />
    </Tabs>
  );
};

export default TabLayout;
