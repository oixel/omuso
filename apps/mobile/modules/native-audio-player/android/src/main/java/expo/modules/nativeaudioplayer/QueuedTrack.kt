package expo.modules.nativeaudioplayer

import androidx.core.net.toUri
import androidx.media3.common.MediaItem
import androidx.media3.common.MediaMetadata
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

class Track: Record {
    @Field val uri: String = ""
    @Field val title: String = ""
    @Field val artist: String = ""
    @Field val album: String = ""
    @Field val coverArtUri: String? = null
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
                .setArtworkUri(track.coverArtUri?.toUri())
                .build()
        )
        .build()
}