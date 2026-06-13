package expo.modules.nativeaudioplayer

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