package expo.modules.nativeaudioplayer

import androidx.media3.common.MediaItem
import androidx.media3.common.MediaMetadata
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

class QueuedSong: Record {
    @Field val queueId: String = ""
    @Field val uri: String = ""
    @Field val title: String? = null
    @Field val artist: String? = null
    @Field val album: String? = null
}

fun QueuedSong.toMediaItem(): MediaItem {
    return MediaItem.Builder()
        .setMediaId(queueId)
        .setUri(uri)
        .setMediaMetadata(
            MediaMetadata.Builder()
                .setTitle(title)
                .setArtist(artist)
                .setAlbumTitle(album)
                .build()
        )
        .build()
}