package expo.modules.nativeaudioplayer

import androidx.media3.common.MediaItem
import androidx.media3.common.MediaMetadata
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

class Song: Record {
    @Field val uri: String = ""
    @Field val title: String? = null
    @Field val artist: String? = null
    @Field val album: String? = null
}

class QueuedSong: Record {
    @Field val queueId: String = ""
    @Field val song: Song = Song()
}

fun QueuedSong.toMediaItem(): MediaItem {
    return MediaItem.Builder()
        .setMediaId(queueId)
        .setUri(song.uri)
        .setMediaMetadata(
            MediaMetadata.Builder()
                .setTitle(song.title)
                .setArtist(song.artist)
                .setAlbumTitle(song.album)
                .build()
        )
        .build()
}