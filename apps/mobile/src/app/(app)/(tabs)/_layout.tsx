import { Tabs } from 'expo-router';
import { House, Users, SquareLibrary, Music, Disc3, Search } from 'lucide-react-native';

const TabLayout = () => {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#2563eb' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <House color={color} />,
        }}
      />
      <Tabs.Screen
        name="artists"
        options={{
          title: 'Artists',
          tabBarIcon: ({ color }) => <Users color={color} />,
        }}
      />
      <Tabs.Screen
        name="albums"
        options={{
          title: 'Albums',
          tabBarIcon: ({ color }) => <SquareLibrary color={color} />,
        }}
      />
      <Tabs.Screen
        name="songs"
        options={{
          title: 'Songs',
          tabBarIcon: ({ color }) => <Music color={color} />,
        }}
      />
      <Tabs.Screen
        name="genres"
        options={{
          title: 'Genres',
          tabBarIcon: ({ color }) => <Disc3 color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <Search color={color} />,
        }}
      />
    </Tabs>
  );
};

export default TabLayout;
