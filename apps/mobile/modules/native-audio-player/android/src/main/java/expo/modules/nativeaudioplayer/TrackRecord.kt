package expo.modules.nativeaudioplayer

import androidx.core.net.toUri
import androidx.media3.common.MediaItem
import androidx.media3.common.MediaMetadata
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

class TrackRecord : Record {
    @Field val id: String = "";
    @Field val uri: String = "";
    @Field val title: String = "";
    @Field val artist: String = "";
    @Field val album: String = "";
    @Field val coverArtUri: String? = null;
}

fun TrackRecord.toMediaItem(): MediaItem {
    return MediaItem.Builder()
        .setMediaId(id)
        .setUri(uri)
        .setMediaMetadata(
            MediaMetadata.Builder()
                .setTitle(title)
                .setArtist(artist)
                .setAlbumTitle(album)
                .setArtworkUri(coverArtUri?.toUri())
                .build()
        )
        .build()
}