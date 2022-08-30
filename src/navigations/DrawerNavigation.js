import React, {useContext} from 'react';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import AccountScreen from '../screens/AccountScreen';
import UserDashboard from '../screens/UserDashboard';

import {
  Box,
  Divider,
  HStack,
  Icon,
  Text,
  VStack,
  Pressable,
  Avatar,
} from 'native-base';

import IonIcons from 'react-native-vector-icons/Ionicons';
import {AuthContext} from '../contexts/AuthContext';

import {signOut} from 'firebase/auth';
import {auth} from '../firebase/config';

const Drawer = createDrawerNavigator();

const DrawerContent = props => {
  const authContext = useContext(AuthContext);
  const {setAuthenticated} = authContext;

  const handleLogout = () => {
    signOut(auth).then(userCredential => {
      setAuthenticated(false);
      console.log('====================================');
      console.log('déconnexion réussie');
      console.log('====================================');
    });
  };
  return (
    <DrawerContentScrollView
      contentContainerStyle={{
        flex: 1,
      }}>
      <VStack space="6" p={5} flex={1}>
        <Box>
          <Avatar
            bg={'blue.500'}
            size="lg"
            mb={3}
            source={{
              uri: 'https://icon-library.com/images/avatar-icon-images/avatar-icon-images-4.jpg',
            }}>
          </Avatar>
          <Text>{auth.currentUser.email}</Text>
        </Box>
        <VStack divider={<Divider />} space="4" flexGrow={1}>
          <VStack space={4}>
            <Pressable onPress={() => props.navigation.navigate('Dashboard')}>
              <HStack space={3} alignItems="center">
                <Icon as={IonIcons} name="md-grid-outline" />
                <Text>Dashboard</Text>
              </HStack>
            </Pressable>
            <Pressable onPress={() => props.navigation.navigate('Profile')}>
              <HStack space={3} alignItems="center">
                <Icon as={IonIcons} name="md-person-outline" />
                <Text>Profil</Text>
              </HStack>
            </Pressable>
          </VStack>
        </VStack>
        <HStack alignItems={'center'} space={3}>
          <Icon as={IonIcons} name="md-log-out-outline" color={'blue.500'} />
          <Pressable onPress={handleLogout}>
            <Text>Déconnexion</Text>
          </Pressable>
        </HStack>
      </VStack>
    </DrawerContentScrollView>
  );
};

export default function DrawerNavigation() {
  return (
    <Box safeArea flex={1}>
      <Drawer.Navigator drawerContent={DrawerContent}>
        <Drawer.Screen
          name="Dashboard"
          component={UserDashboard}
          options={{title: 'Espace personnel'}}
        />
        <Drawer.Screen
          name="Profile"
          component={AccountScreen}
          options={{title: '', headerShown: true, headerTransparent: true}}
        />
      </Drawer.Navigator>
    </Box>
  );
}
