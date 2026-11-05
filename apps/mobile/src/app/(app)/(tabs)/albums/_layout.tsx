import { Stack } from 'expo-router';

export default function AlbumsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Albums' }} />
      <Stack.Screen name="artist/[artistId]" options={{ title: 'Artist', animation: 'none' }} />
      <Stack.Screen name="album/[albumId]" options={{ title: 'Album', animation: 'none' }} />
      <Stack.Screen name="genre/[genreId]" options={{ title: 'Genre', animation: 'none' }} />
    </Stack>
  );
}
