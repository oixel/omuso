import { Stack } from 'expo-router';

export default function SearchLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Search' }} />
      <Stack.Screen name="artist/[artistId]" options={{ title: 'Artist' }} />
      <Stack.Screen name="album/[albumId]" options={{ title: 'Album' }} />
      <Stack.Screen name="genre/[genreId]" options={{ title: 'Genre' }} />
    </Stack>
  );
}
