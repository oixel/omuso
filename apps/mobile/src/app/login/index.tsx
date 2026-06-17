import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Button, Text, TextInput, TextInputProps, View } from 'react-native';
import { validateServer, validateLogin } from '@choral/domain';
import { initializeNativeAudioPlayer } from '../../util/initializeNativeAudioPlayer';

const StyledInput = (props: TextInputProps) => (
  <TextInput
    className="bg-white w-2/3 mb-4 color-black placeholder:color-gray-600"
    autoCapitalize="none"
    autoCorrect={false}
    {...props}
  />
);

const Login = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [server, setServer] = useState<string>('');
  const [apiKey, setAPIKey] = useState<string>();
  const [username, setUsername] = useState<string>();
  const [password, setPassword] = useState<string>();

  const [serverType, setServerType] = useState<'apiKey' | 'password'>();
  const [error, setError] = useState<string>();

  async function checkServer() {
    if (!server.length) return;

    setLoading(true);
    setError(undefined);

    const { success, usesAPIKey } = await validateServer(server);

    if (success) {
      if (usesAPIKey) setServerType('apiKey');
      else setServerType('password');
    } else setError('Error connecting to server.\nPlease check URL and try again.');

    setLoading(false);
  }

  async function checkLogin() {
    if (!apiKey && (!username || !password)) return;

    setLoading(true);
    setError(undefined);

    const success = await validateLogin({ server, apiKey, username, password });
    if (success) {
      await initializeNativeAudioPlayer();
      router.replace('/home');
    } else
      setError(
        `Failed to log in.\n Please ${serverType === 'apiKey' ? 'API key' : 'username / password'} and try again.`
      );

    setLoading(false);
  }

  return (
    <View className="flex-1 items-center justify-center bg-blue-400">
      <View className="flex-1 items-center justify-center w-full">
        <Text className="font-extrabold color-white text-5xl mb-4">choral</Text>
        <StyledInput
          placeholder="Enter Server URL"
          value={server}
          onChangeText={(e) => {
            setServer(e);
            if (serverType) {
              setServerType(undefined);
              setError(undefined); // Wipe any pre-existing credentials error
            }
          }}
          textContentType="URL"
        />
        {serverType === 'apiKey' && (
          <StyledInput
            placeholder="Enter API Key"
            value={apiKey}
            onChangeText={setAPIKey}
            secureTextEntry={true}
          />
        )}
        {serverType === 'password' && (
          <>
            <StyledInput
              placeholder="Enter Username"
              value={username}
              onChangeText={setUsername}
              textContentType="username"
              autoComplete="username"
            />
            <StyledInput
              placeholder="Enter Password"
              value={password}
              onChangeText={setPassword}
              textContentType="password"
              autoComplete="password"
              secureTextEntry={true}
            />
          </>
        )}
        <Button
          disabled={loading}
          title={!serverType ? 'Set Server' : 'Log In'}
          onPress={() => {
            if (!serverType) checkServer();
            else checkLogin();
          }}
        />
        {error && (
          <View className="w-3/4 bg-red-500  my-4 p-3 rounded-md border-2 border-red-800">
            <Text className="color-red-100 font-bold text-center">{error}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default Login;
