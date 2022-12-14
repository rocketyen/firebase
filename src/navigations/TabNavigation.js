import React from 'react';
// react-navigation stack
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
// react-native-vector-icons
import Ionicons from 'react-native-vector-icons/Ionicons';
// Mes écrans
import CreateAdvertScreen from '../screens/CreateAdvertScreen';
import HomeScreen from '../screens/HomeScreen';
import {useTheme} from 'native-base';
import DrawerNavigation from './DrawerNavigation';

const Tab = createBottomTabNavigator();

export default function TabNavigation() {
  const theme = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'md-home' : 'md-home-outline';
          } else if (route.name === 'AddAds') {
            iconName = focused ? 'md-add-circle' : 'md-add-circle-outline';
          } else if (route.name === 'Account') {
            iconName = focused ? 'md-person' : 'md-person-outline';
          }

          // You can return any component that you like here!
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.blue[500],
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          paddingTop: 2,
        },
        tabBarLabelStyle: {
          paddingBottom: 2,
        },
      })}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{title: 'Accueil'}}
      />
      <Tab.Screen
        name="AddAds"
        component={CreateAdvertScreen}
        options={{title: 'Publier'}}
      />
      <Tab.Screen
        name="Account"
        component={DrawerNavigation}
        options={{title: 'Mon compte'}}
      />
    </Tab.Navigator>
  );
}
