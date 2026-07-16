import { Media } from '@choral/types/src/media/Media';
import { FlashList, FlashListProps } from '@shopify/flash-list';
import { ReactElement } from 'react';

interface MediaListProps extends Omit<FlashListProps<Media>, 'renderItem'> {
  data: Media[];
  Entry: React.FC<{ item: Media }>;
  horizontal?: boolean;
  footer?: () => ReactElement;
}

const MediaList = ({ data, Entry, horizontal = false, footer, ...props }: MediaListProps) => {
  return (
    <FlashList
      key={horizontal ? 'horizontal' : 'vertical'} // Force a remount on horizontal change
      {...props}
      horizontal={horizontal}
      // contentContainerClassName="py-2 gap-2"
      keyExtractor={(item) => {
        return item.id;
      }}
      drawDistance={150}
      data={data}
      onEndReachedThreshold={0.5}
      ListFooterComponent={footer}
      renderItem={({ item }: { item: Media }) => <Entry item={item} />}
    />
  );
};

export default MediaList;
