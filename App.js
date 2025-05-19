import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import AvatarScreen from './src/screens/Screen2';


export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <AvatarScreen />
    </SafeAreaView>
  );
}
