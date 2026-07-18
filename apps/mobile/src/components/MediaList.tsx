import { Media } from '@choral/types/src/media/Media';
import { FlashList, FlashListProps } from '@shopify/flash-list';
import { ReactElement } from 'react';

interface MediaListProps extends Omit<FlashListProps<Media>, 'renderItem'> {
  data: Media[];
  Entry: React.FC<{ item: Media }>;
  horizontal?: boolean;
  separator?: () => ReactElement;
  footer?: () => ReactElement;
}

const MediaList = ({
  data,
  Entry,
  horizontal = false,
  footer,
  separator,
  ...props
}: MediaListProps) => {
  return (
    <FlashList
      key={horizontal ? 'horizontal' : 'vertical'} // Force a remount on horizontal change
      {...props}
      horizontal={horizontal}
      contentContainerStyle={{ padding: 4 }}
      keyExtractor={(item) => {
        return item.id;
      }}
      drawDistance={150}
      data={data}
      onEndReachedThreshold={0.5}
      ListFooterComponent={footer}
      renderItem={({ item }: { item: Media }) => <Entry item={item} />}
      ItemSeparatorComponent={separator}
    />
  );
};

export default MediaList;
