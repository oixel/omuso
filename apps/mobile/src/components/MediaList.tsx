import { Media } from '@choral/types/src/media/Media';
import { FlashList } from '@shopify/flash-list';
import { ReactElement } from 'react';

interface MediaListProps {
  data: Media[];
  Entry: React.FC<{ item: Media }>;
  footer: () => ReactElement;
  handleEndReached?: () => void;
}

const MediaList = ({ data, Entry, footer, handleEndReached }: MediaListProps) => {
  return (
    <FlashList
      contentContainerClassName="py-2"
      keyExtractor={(item) => {
        return item.id;
      }}
      drawDistance={150}
      data={data}
      ListFooterComponent={footer}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      renderItem={({ item }: { item: Media }) => <Entry item={item} />}
    />
  );
};

export default MediaList;
