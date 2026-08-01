import { Media } from '@omuso/types';
import { FlashList, FlashListProps } from '@shopify/flash-list';
import { useCallback } from 'react';

interface MediaListProps extends Omit<FlashListProps<Media>, 'renderItem'> {
  Entry: React.FC<{ item: Media; horizontal: boolean }>;
  horizontal?: boolean;
  separator?: React.ComponentType;
  footer?: React.ComponentType;
}

export function MediaList({
  Entry,
  horizontal = false,
  footer,
  separator,
  ...props
}: MediaListProps) {
  // Only re-render if the entry itself has changed
  const renderItem = useCallback(
    ({ item }: { item: Media }) => <Entry item={item} horizontal={horizontal} />,
    [Entry, horizontal]
  );

  return (
    <FlashList
      key={horizontal ? 'horizontal' : 'vertical'} // Force a remount on horizontal change
      horizontal={horizontal}
      contentContainerStyle={{ padding: 4 }}
      keyExtractor={(item) => {
        return item.id;
      }}
      drawDistance={1000}
      onEndReachedThreshold={1.5}
      ListFooterComponent={footer}
      renderItem={renderItem}
      ItemSeparatorComponent={separator}
      {...props}
    />
  );
}
