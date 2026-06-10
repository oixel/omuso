import '../../global.css'

import { useEffect } from 'react'
import TrackPlayer, { PlayerCommand } from '@rntp/player'
import { Stack } from 'expo-router'

export default function RootLayout() {
  useEffect(() => {
    try {
      TrackPlayer.setupPlayer({
        contentType: 'music',
        android: {
          wakeMode: 'network',
          taskRemovedBehavior: 'stop',
          notification: {
            channelId: 'com.choral.audio',
            channelName: 'Choral Music Playback',
            smallIcon: 'ic_stat_music_note',
          },
        },
      })
    } catch (err) {
      if (err instanceof Error && !err.message.includes('already set up'))
        console.error('setupPlayer failed:', err)
    }

    TrackPlayer.setCommands({
      capabilities: [
        PlayerCommand.PlayPause,
        PlayerCommand.Previous,
        PlayerCommand.Next,
        PlayerCommand.Seek,
      ],
    })
  }, [])

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  )
}
