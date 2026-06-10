import '../../global.css'

import TrackPlayer, { PlayerCommand } from '@rntp/player'
import { useEffect } from 'react'
import { Stack } from 'expo-router'

export default function RootLayout() {
  useEffect(() => {
    TrackPlayer.setupPlayer({
      contentType: 'music',
    })

    TrackPlayer.setCommands({
      capabilities: [PlayerCommand.PlayPause, PlayerCommand.Previous, PlayerCommand.Next],
    })

    TrackPlayer.setMediaItems([
      {
        mediaId: 'track-1',
        url: 'https://example.com/audio.mp3',
        title: 'My Track',
        artist: 'Artist Name',
        artworkUrl: 'https://example.com/artwork.jpg',
      },
    ])

    TrackPlayer.play()
  }, [])

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  )
}
