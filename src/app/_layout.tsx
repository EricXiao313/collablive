import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import NetworkNotice from '../components/network-notice';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />

      <View style={styles.container}>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#F5F7FB',
            },
            headerTintColor: '#17243B',
            headerShadowVisible: false,
            contentStyle: {
              backgroundColor: '#F5F7FB',
            },
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="trail"
            options={{
              title: 'Trail details',
              headerBackTitle: 'Home',
            }}
          />

          <Stack.Screen
            name="explore"
            options={{
              title: 'Explore',
            }}
          />
        </Stack>

        <NetworkNotice />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
});