import React, {useContext} from 'react';
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

import {useNavigation} from '@react-navigation/native';
import {auth} from '../firebase/config';
import {signInWithEmailAndPassword} from '@firebase/auth';

import {AuthContext} from './../contexts/AuthContext';
import {useFormik} from 'formik';

import { Alert, TouchableOpacity, View } from 'react-native';

import TouchID from 'react-native-touch-id';

const optionalConfigObject = {
  title: "Authentification requise", // Android
  color: "blue", // Android,
  fallbackLabel: "Show Passcode" // iOS (if empty, then label is hidden)
}


export default function LoginScreen() {
  const navigation = useNavigation();

  const authenContext = useContext(AuthContext);
  const {setAuthenticated} = authenContext;

  const {values, handleChange, handleBlur, handleSubmit, errors, touched} =
    useFormik({
      initialValues: {
        email: 'rocketyen@gmail.com',
        password: '123456',
      },
      onSubmit: values => login(values),
    });

  const login = values => {
    const {email, password} = values;
    // Condition de connexion ok
    signInWithEmailAndPassword(auth, email, password).then(userCredential => {
      console.log(userCredential);
      setAuthenticated(true);
    });
  };

  touchIdAuth = () => {
    TouchID.isSupported()
      .then(biometryType => {
        // Success code
        if (biometryType === 'FaceID') {
          console.log('FaceID is supported.');
        } else {
          console.log('TouchID is supported.');
          TouchID.authenticate("", optionalConfigObject)
            .then(success => {
              Alert.alert('Authentification réussie');
            })
            .catch(error => {
              Alert.alert('Authentification échoué');
            });
        }
      })
      .catch(error => {
        // Failure code
        console.log(error);
      });
  }


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
              <Button title="Authentification" onPress={this.touchIdAuth.bind(this)}/>
            </TouchableOpacity>
          </View>          
        </VStack>
      </Box>
    </Center>
  );
}
