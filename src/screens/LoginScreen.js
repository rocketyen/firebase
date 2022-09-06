import React, {useContext, useEffect, useState} from 'react';
import {
  Box,
  Button,
  Center,
  FormControl,
  Heading,
  HStack,
  Input,
  Link,
  VStack,
  Text
} from 'native-base';

import {LogBox} from 'react-native';
// faire disparaitre les warnings
LogBox.ignoreLogs([
  "AsyncStorage has been extracted from react-native core and will be removed in a future release. It can now be installed and imported from '@react-native-async-storage/async-storage' instead of 'react-native'. See https://github.com/react-native-async-storage/async-storage",
]);

import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import auth from '@react-native-firebase/auth';
import {AuthContext} from './../contexts/AuthContext';

/*******************************************************
 *  Traitement de formulaire                           \
 ******************************************************/

// Librairie de traitement de formulaire
import {useFormik} from 'formik';
// librairie de validation de données

import * as yup from 'yup';

// TouchID
import TouchID from 'react-native-touch-id';

// Keychain
import * as Keychain from 'react-native-keychain';

import { Alert, TouchableOpacity, View } from 'react-native';



const optionalConfigObject = {
  title: "Authentification requise", // Android
  color: "blue", // Android,
  fallbackLabel: "Show Passcode" // iOS (if empty, then label is hidden)
}


export default function LoginScreen() {
  const navigation = useNavigation();

  const authenContext = useContext(AuthContext);
  const {setAuthenticated} = authenContext;

  // vérif accord pour le touch id
  const [isTouchID, setIsTouchID] = useState(false);

  const {
    values, 
    handleChange, 
    handleBlur, 
    handleSubmit, 
    errors, 
    touched} =
    useFormik({
      initialValues: {
        email: 'rocketyen@gmail.com',
        password: '123456',
      },
      onSubmit: values => login(values),
    });

    const getData = async () => {
      try {
        const value = await AsyncStorage.getItem('@userAuth');
        if (value !== null) {
          setIsTouchID(true);
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
  
    useEffect(() => {
      AuthWithTouchId();
    }, [isTouchID]);

    const login = values => {
      const {email, password} = values;
      // Condition de connexion ok
      auth()
        .signInWithEmailAndPassword(email, password)
        .then(userCredential => {
          console.log('vous êtes connecté !');
          // on stocke les information de l'utilisateur dans le storage
          storeUserCredential(email, password);
          setAuthenticated(true);
        })
        .catch(error => {
          console.log('====================================');
          console.log(error.message);
          console.log('====================================');
        });
    };

  /**
   * Authentifcation par l'empreinte digitale
   */
  const AuthWithTouchId = () => {
    if (isTouchID) {
      const options = {
        title: 'Confirmez votre identité',
        sensorDescription:
          'Utilisez votre empreinte pour confirmer votre identité',
        sensorErrorDescription: 'empreinte non reconnue',
      };
      // On vérifie que le touch id est configurée sur l'appareil de l'utilisateur
      if (touchID.isSupported) {
        // On vérifie si l'utilsateur à déjà donnée son accord pour être authentifier par mot de passe
        touchID
          .authenticate('Authentification par empreinte digital', options)
          .then(success => {
            signInUserWithStoredData();
            console.log('Authenticated Successfully');
          })
          .catch(error => {
            console.log('Authentication Failed');
          });
      }
    }
  };

  const signInUserWithStoredData = async () => {
    try {
      console.log('toto');
      const credentials = await Keychain.getGenericPassword();
      if (credentials) {
        login({email: credentials.username, password: credentials.password});
      }
    } catch (err) {
      console.log('====================================');
      console.log(err.message);
      console.log('====================================');
    }
  };

  const storeUserCredential = async (email, password) => {
    try {
      const credentials = await Keychain.getGenericPassword();
      console.log(credentials);
      if (!credentials) {
        console.log('add new cred');
        await Keychain.setGenericPassword(email, password);
      }
    } catch (err) {
      console.log('====================================');
      console.log(err.message);
      console.log('====================================');
    }
  };


  // console.log(values);
  return (
    <Center flex={'1'} bgColor="warmGray.5">
      <Box w={'90%'}>
        <Heading mb="1.5" fontWeight={'semibold'}>
          Connexion
        </Heading>
        <VStack space={'2'}>
          <FormControl>
            <FormControl.Label>Email</FormControl.Label>
            <Input value={values.email} onChangeText={handleChange('email')} />
          </FormControl>
          <FormControl>
            <FormControl.Label>Mot de passe</FormControl.Label>
            <Input
              value={values.password}
              onChangeText={handleChange('password')}
            />
          </FormControl>
          <Button onPress={handleSubmit} colorScheme={'blue'}>
            Se connecter
          </Button>
          <HStack justifyContent={'center'} mt="3">
            <Text>Pas encore membre ? </Text>
            <Link
              onPress={() => navigation.navigate('Registration')}
              _text={{
                color: 'blue.500',
                fontWeight: 'medium',
                fontSize: 'sm',
              }}>
              Créer un compte
            </Link>
          </HStack>
          <View style={{justifyContent:'center',flex:1,alignSelf:'center'}}>
            <TouchableOpacity style={{flexWrap:'wrap'}}>
              <Button title="Authentification" onPress={AuthWithTouchId}/>
            </TouchableOpacity>
          </View>          
        </VStack>
      </Box>
    </Center>
  );
}
