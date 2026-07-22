import { View, StyleSheet } from 'react-native';

import GenreMediaList from '@components/MediaLists/GenreMediaList';

const Genres = () => {
  return (
    <View style={styles.container}>
      <GenreMediaList />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Genres;
