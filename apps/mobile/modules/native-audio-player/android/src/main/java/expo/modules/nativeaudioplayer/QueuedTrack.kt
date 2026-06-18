package expo.modules.nativeaudioplayer

import androidx.core.net.toUri
import androidx.media3.common.MediaItem
import androidx.media3.common.MediaMetadata
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

class Track: Record {
    @Field val uri: String = ""
    @Field val title: String? = null
    @Field val artist: String? = null
    @Field val album: String? = null
}

class QueuedTrack: Record {
    @Field val queueId: String = ""
    @Field val track: Track = Track()
}

fun QueuedTrack.toMediaItem(): MediaItem {
    return MediaItem.Builder()
        .setMediaId(queueId)
        .setUri(track.uri)
        .setMediaMetadata(
            MediaMetadata.Builder()
                .setTitle(track.title)
                .setArtist(track.artist)
                .setAlbumTitle(track.album)
                .build()
        )
        .build()
}