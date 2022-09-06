import React, {useContext, useEffect, useState} from 'react';
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

// import {signOut} from 'firebase/auth';
import auth from '@react-native-firebase/auth';

const Drawer = createDrawerNavigator();

const DrawerContent = props => {
  const [checked, setChecked] = useState(false);
  const authContext = useContext(AuthContext);
  const {setAuthenticated} = authContext;

  const handleLogout = () => {
    auth()
      .signOut()
      .then(userCredential => {
        setAuthenticated(false);
        console.log('====================================');
        console.log('déconnexion réussie');
        console.log('====================================');
      });
  };

  const getData = async () => {
    try {
      const value = await AsyncStorage.getItem('@userAuth');
      if (value !== null) {
        setChecked(true);
      }
    } catch (e) {
      // error reading value
      console.log('====================================');
      console.log(e.message);
      console.log('====================================');
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const handleSwichChange = async () => {
    try {
      if (!checked) {
        console.log('allumé');
        await AsyncStorage.setItem('@userAuth', 'true');
        setChecked(true);
      } else {
        console.log('eteint');
        await AsyncStorage.removeItem('@userAuth');
        setChecked(false);
      }
    } catch (e) {
      // error reading value
      console.log('====================================');
      console.log(e.message);
      console.log('====================================');
    }
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
              uri: auth().currentUser.photoURL,
            }}
          >
            AC
          </Avatar>
          <Text>{auth().currentUser.email}</Text>
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
