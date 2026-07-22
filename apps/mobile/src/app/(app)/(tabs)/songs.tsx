import { View, Text, StyleSheet } from 'react-native';

const Songs = () => {
  return (
    <View style={styles.container}>
      <Text>Tab [Home|Songs]</Text>
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

export default Songs;
