import React, {useEffect, useState} from 'react';
import {
  Avatar,
  Box,
  Center,
  FormControl,
  Input,
  VStack,
  Text,
  Fab,
  Icon,
  Button,
  Pressable,
  Actionsheet,
  useDisclose,
  ScrollView,  
} from 'native-base';

import { StyleSheet, PermissionsAndroid } from 'react-native'

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {useFormik} from 'formik';

/******************************************************************
 * FIREBASE
 *****************************************************************/
// Firebase config
// import {db, auth, storage} from '../firebase/config';
// firebase firestore
// import {doc, getDoc, serverTimestamp, updateDoc} from 'firebase/firestore';
import firestore from '@react-native-firebase/firestore';
// firebase auth
import auth from '@react-native-firebase/auth';
// firebase storage
import storage from '@react-native-firebase/storage';
// import {ref, uploadBytes, getDownloadURL} from 'firebase/storage';
// firebase auth
// import {updateProfile} from 'firebase/auth';

/******************************************************************
 * FIREBASE
 *****************************************************************/

// camera

import {launchCamera, launchImageLibrary} from 'react-native-image-picker';


export default function AccountScreen() {
  const [editMode, setEditMode] = useState(false);
  const [initialValues, setInitialValues] = useState({
    firstname: '',
    lastname: '',
    email: '',
  });

  const {isOpen, onOpen, onClose} = useDisclose();


  const {values, handleChange, handleSubmit} = useFormik({
    initialValues,
    onSubmit: values => {
    handleUpdate(values);
    setEditMode(false);
    },
    enableReinitialize: true,
  });


  useEffect(() => {
    const id = auth().currentUser.uid;
    firestore()
      .collection('users')
      .doc(id)
      .get()
      .then(docSnap => {
        const data = docSnap.data();
        setInitialValues({
          firstname: data['firstname'],
          lastname: data['lastname'],
        });
      });
  }, []);

  const handleUpdate = values => {
    const id = auth().currentUser.uid;
    firestore()
      .collection('users')
      .doc(id)
      .update({
        ...values,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      })
      .then(updatedUser => {
        console.log('====================================');
        console.log('user updated !');
        console.log('====================================');
      })
      .catch(e => {
        console.log('====================================');
        console.log(e.massage);
        console.log('====================================');
      });
  };

  const [filePath, setFilePath] = useState({});

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs camera permission',
          },
        );
        // If CAMERA Permission is granted
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else return true;
  };

  const requestExternalWritePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'External Storage Write Permission',
            message: 'App needs write permission',
          },
        );
        // If WRITE_EXTERNAL_STORAGE Permission is granted
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        alert('Write permission err', err);
      }
      return false;
    } else return true;
  };

  const takePhoto = async () => {
    let options = {
      mediaType: 'photo',
      maxWidth: 500,
      maxHeight: 500,
      includeBase64: true,
      saveToPhotos: true,
    };
    const response = await launchCamera(options);

    const {didCancel, errorCode, errorMessage, assets} = response;

    if (didCancel) {
      console.log('====================================');
      console.log("prise de photo annulé par l'utilisateur");
      console.log('====================================');
    } else if (errorCode) {
      console.log('====================================');
      console.log(errorMessage);
      console.log('====================================');
    } else {
      const img = assets[0];
      uploadAvatar(img);
    }
  };

  const getPhotoFromStorage = async () => {
    const response = await launchImageLibrary(options);
    let options = {
      mediaType: 'photo',
      maxWidth: 500,
      maxHeight: 500,
      includeBase64: true,
      saveToPhotos: true,
    };

    const {didCancel, errorCode, errorMessage, assets} = response;

    if (didCancel) {
      console.log('====================================');
      console.log("prise de photo annulé par l'utilisateur");
      console.log('====================================');
    } else if (errorCode) {
      console.log('====================================');
      console.log(errorMessage);
      console.log('====================================');
    } else {
      const img = assets[0];
      uploadAvatar(img);
    }
  };

  const uploadAvatar = async img => {
    // on crée une référence pour l'image que le souhaite update avec son nom de stockage
    // const avatarRef = ref(storage, `avatar-${auth.currentUser.uid}.jpg`);
    const avatarRef = storage().ref(`avatar-${auth().currentUser.uid}.jpg`);
    avatarRef.putFile(img.uri).then(() => {
      console.log('====================================');
      console.log('image uploaded to the bucket');
      console.log('====================================');

      avatarRef.getDownloadURL().then(url => {
        handleUpdate({image: url});
        auth().currentUser.updateProfile({
          photoURL: url,
        });
      });
    });
  };

  return (
    <>
    <ScrollView>    
    <Box flex={1}>
      <Center h={'2/6'} bg="blue.500">
        <Avatar size="xl" mb={2} source={{uri: auth().currentUser.photoURL}}>          
          <Avatar.Badge
            size="8"
            justifyContent="center"
            backgroundColor="blue.500"
            shadow="2">
            <Pressable onPress={onOpen}>
              <Center>
                <Icon name="edit" as={MaterialIcons} size="sm" color="white" />
              </Center>
            </Pressable>
          </Avatar.Badge>
        </Avatar>
        <Text>{auth().currentUser.email}</Text>
      </Center>
      <VStack p={5} space={2}>
      <FormControl>
          <FormControl.Label>Email</FormControl.Label>
          <Input
            value={values.email}
            onChangeText={handleChange('email')}
            isDisabled={!editMode}
          />
        </FormControl>
        <FormControl>
          <FormControl.Label>Prénom</FormControl.Label>
          <Input
            value={values.firstname}
            onChangeText={handleChange('firstname')}
            isDisabled={!editMode}
          />
        </FormControl>
        <FormControl>
          <FormControl.Label>Nom</FormControl.Label>
          <Input
            isDisabled={!editMode}
            value={values.lastname}
            onChangeText={handleChange('lastname')}
          />      
          {editMode && (
            <Button colorScheme="blue" onPress={handleSubmit} mt="4">
              Enregister les modifications
            </Button>
          )}
        </FormControl>
      </VStack>
      {!editMode && (
        <Fab
          renderInPortal={false}
          shadow="2"
          size={'sm'}
          colorScheme="blue"
          icon={<Icon color={'white'} 
          name="edit" 
          as={MaterialIcons} />}
          onPress={() => setEditMode(true)}
        />
      )}
      <Actionsheet isOpen={isOpen} onClose={onClose}>
        <Actionsheet.Content>
          <Actionsheet.Item onPress={takePhoto}>Camera</Actionsheet.Item>
          <Actionsheet.Item onPress={getPhotoFromStorage}>
            Galerie photo
          </Actionsheet.Item>
        </Actionsheet.Content>
      </Actionsheet>
    </Box>
    </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'black',
    alignItems: 'center',
    fontFamily: ''
  },
  titleText: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 20,
    color: '#5D5DFF',
  },
  textStyle: {
    padding: 10,
    color: 'white',
    textAlign: 'center',
  },
  buttonStyle: {
    alignItems: 'center',
    backgroundColor: '#3569DF',
    padding: 5,
    marginVertical: 10,
    width: 250,
    borderRadius: 10,
  },
  // imageStyle: {
  //   width: 200,
  //   height: 200,
  //   margin: 5,
  // },
});
