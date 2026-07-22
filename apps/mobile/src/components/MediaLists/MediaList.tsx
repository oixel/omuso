import { Media } from '@choral/types/src/media/Media';
import { FlashList, FlashListProps } from '@shopify/flash-list';

interface MediaListProps extends Omit<FlashListProps<Media>, 'renderItem'> {
  Entry: React.FC<{ item: Media; horizontal: boolean }>;
  horizontal?: boolean;
  separator?: React.ComponentType;
  footer?: React.ComponentType;
}

const MediaList = ({ Entry, horizontal = false, footer, separator, ...props }: MediaListProps) => {
  return (
    <FlashList
      key={horizontal ? 'horizontal' : 'vertical'} // Force a remount on horizontal change
      horizontal={horizontal}
      contentContainerStyle={{ padding: 4 }}
      keyExtractor={(item) => {
        return item.id;
      }}
      drawDistance={150}
      onEndReachedThreshold={0.5}
      ListFooterComponent={footer}
      renderItem={({ item }) => <Entry item={item} horizontal={horizontal} />}
      ItemSeparatorComponent={separator}
      {...props}
    />
  );
};

export default MediaList;
