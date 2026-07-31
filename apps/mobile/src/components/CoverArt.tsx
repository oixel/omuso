import { Image, ImageStyle } from 'expo-image';
import { memo } from 'react';
import { StyleProp } from 'react-native';

export interface CoverArtProps {
  uri?: string;
  recyclingKey?: string;
  style?: StyleProp<ImageStyle>;
  onPress?: () => void;
}

export const CoverArt: React.FC<CoverArtProps> = memo(
  ({ uri, style, recyclingKey, onPress }: CoverArtProps) => {
    return (
      <Image
        style={style}
        source={{ uri: uri }}
        contentFit="cover"
        recyclingKey={recyclingKey}
        cachePolicy="memory-disk"
        placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
        onTouchEndCapture={onPress}
      />
    );
  },
  (prev: CoverArtProps, next: CoverArtProps) => prev.uri === next.uri
);
