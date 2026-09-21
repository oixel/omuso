import { Media } from '@omuso/types';
import { QueryClient } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { Pressable, Text } from 'react-native';

interface MediaNameLinkProps {
  queryClient?: QueryClient;
  queryKey?: string;
  pathname: string;
  media: Media | undefined;
  label: string;
  pressableClassName?: string;
  textClassName?: string;
}

export function MediaNameLink({
  queryClient,
  queryKey,
  pathname,
  media,
  label,
  pressableClassName,
  textClassName,
}: MediaNameLinkProps) {
  return (
    <Link
      href={{
        pathname: pathname + '/[key]',
        params: { key: media?.id ?? '' },
      }}
      withAnchor
      asChild
    >
      <Pressable
        className={pressableClassName}
        onPress={(e) => {
          if (!media) {
            e.preventDefault();
            return;
          }

          // Seed query with media's metadata
          if (queryClient && queryKey) queryClient.setQueryData([queryKey, media.id], media);
        }}
      >
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          className={textClassName ?? 'text-lg text-blue-200 font-medium'}
        >
          {label}
        </Text>
      </Pressable>
    </Link>
  );
}
