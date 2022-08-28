import {StyleSheet, useColorScheme} from 'react-native';
import React, {useState} from 'react';
import {NativeBaseProvider, extendTheme} from 'native-base';
import {
  NavigationContainer,
  DarkTheme,
  DefaultTheme,
} from '@react-navigation/native';
import RootNavigation from './navigations/RootNavigation';
import {AuthContext} from './contexts/AuthContext';

// config du thème
const config = {
  useSystemColorMode: true,
};

const customTheme = extendTheme({
  config,
  components: {
    Input: {
      defaultProps: {
        _focus: {
          borderColor: 'amber.500',
        },
      },
    },
  },
});

export default function App() {
  // on définit le state qui sera stocker dans le provider du context avec son setter
  const [authenticated, setAuthenticated] = useState(false);
  const schema = useColorScheme();
  return (
    <NativeBaseProvider theme={customTheme}>
      <AuthContext.Provider value={{authenticated, setAuthenticated}}>
        <NavigationContainer
          theme={schema === 'dark' ? DarkTheme : DefaultTheme}>
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
