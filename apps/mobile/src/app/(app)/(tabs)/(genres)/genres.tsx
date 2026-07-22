import { View, Text, StyleSheet } from 'react-native';

const Genres = () => {
  return (
    <View style={styles.container}>
      <Text>Tab [Home|Artists]</Text>
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
