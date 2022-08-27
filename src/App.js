import {View, Text, StyleSheet} from 'react-native';
import React, { useState } from 'react';
import {NativeBaseProvider, Box} from 'native-base';
import {NavigationContainer} from '@react-navigation/native';
import RootNavigation from './navigations/RootNavigation';
import {AuthContext} from './contexts/AuthContext';

export default function App() {
  // on définit le state qui sera stocker dans le provider du context avec son setter
  const [authenticated, setAuthenticated] = useState(false);
  return (
    <NativeBaseProvider>
      <AuthContext.Provider value={{authenticated, setAuthenticated}}>
        <NavigationContainer>
          <RootNavigation />
        </NavigationContainer>
      </AuthContext.Provider>
    </NativeBaseProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
