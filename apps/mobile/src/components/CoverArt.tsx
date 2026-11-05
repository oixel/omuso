import { Image, ImageProps, ImageStyle } from 'expo-image';
import { memo } from 'react';
import { StyleProp } from 'react-native';

export interface CoverArtProps {
  uri?: string;
  recyclingKey?: string;
  style?: StyleProp<ImageStyle>;
  transition?: number;
  placeholder?: ImageProps['placeholder'];
  priority?: ImageProps['priority'];
  onDisplay?: ImageProps['onDisplay'];
  onError?: ImageProps['onError'];
}

const DEFAULT_PLACEHOLDER = { blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' };

export const CoverArt: React.FC<CoverArtProps> = memo(
  ({
    uri,
    style,
    recyclingKey,
    transition,
    placeholder,
    priority,
    onDisplay,
    onError,
  }: CoverArtProps) => {
    return (
      <Image
        style={style}
        source={{ uri }}
        contentFit="cover"
        recyclingKey={recyclingKey}
        cachePolicy="memory-disk"
        placeholder={placeholder === undefined ? DEFAULT_PLACEHOLDER : placeholder}
        transition={transition}
        priority={priority}
        onDisplay={onDisplay}
        onError={onError}
      />
    );
  },
  (prev, next) =>
    prev.uri === next.uri &&
    prev.recyclingKey === next.recyclingKey &&
    prev.transition === next.transition &&
    prev.placeholder === next.placeholder &&
    prev.priority === next.priority
);
