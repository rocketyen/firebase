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
import IonIcons from 'react-native-vector-icons/Ionicons';

import {useFormik} from 'formik';

// Import Image Picker
import  {
  launchCamera,
  launchImageLibrary
} from 'react-native-image-picker';


import {doc, getDoc, serverTimestamp, updateDoc, deleteField } from 'firebase/firestore';

import {db, auth, storage} from '../firebase/config';

import {Platform} from 'react-native';
// firebase storage
import {ref, uploadBytes, getDownloadURL} from 'firebase/storage';
// firebase auth
import {updateProfile} from 'firebase/auth';


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
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    getDoc(userDocRef).then(docSnap => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setInitialValues({
          firstname: data['firstname'],
          lastname: data['lastname'],
          email: data['email']
        });
      }
    });
  }, []);

  const handleUpdate = values => {
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    updateDoc(userDocRef, {
      ...values,
      updatedAt: serverTimestamp(),
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

  // const userRef = doc(db, 'users', auth.currentUser.uid);

  //   // Remove the 'user' field from the document
  //   await updateDoc({userRef: deleteField()
  //   });

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

  // const captureImage = async (type) => {
  //   let options = {
  //     mediaType: type,
  //     maxWidth: 300,
  //     maxHeight: 550,
  //     quality: 1,
  //     includeBase64: true,
  //     videoQuality: 'low',
  //     durationLimit: 30, //Video max duration in seconds
  //     saveToPhotos: true,
  //   };
  //   let isCameraPermitted = await requestCameraPermission();
  //   let isStoragePermitted = await requestExternalWritePermission();
  //   if (isCameraPermitted && isStoragePermitted) {
  //     launchCamera(options, (response) => {
  //       console.log('Response = ', response);

  //       if (response.didCancel) {
  //         alert('User cancelled camera picker');
  //         return;
  //       } else if (response.errorCode == 'camera_unavailable') {
  //         alert('Camera not available on device');
  //         return;
  //       } else if (response.errorCode == 'permission') {
  //         alert('Permission not satisfied');
  //         return;
  //       } else if (response.errorCode == 'others') {
  //         alert(response.errorMessage);
  //         return;
  //       }
  //       console.log('base64 -> ', response.base64);
  //       console.log('uri -> ', response.uri);
  //       console.log('width -> ', response.width);
  //       console.log('height -> ', response.height);
  //       console.log('fileSize -> ', response.fileSize);
  //       console.log('type -> ', response.type);
  //       console.log('fileName -> ', response.fileName);
  //       setFilePath(response);
  //     });
  //   }
  // };

  const takePhoto = async () => {
    let options = {
      mediaType: 'photo',
      maxWidth: 500,
      maxHeight: 500,
      includeBase64: true,
      saveToPhotos: true,
    };

    let isCameraPermitted = await requestCameraPermission();
    let isStoragePermitted = await requestExternalWritePermission();

    if (isCameraPermitted && isStoragePermitted){

    
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
  }
  };

  // const chooseFile = (type) => {
  //   let options = {
  //     mediaType: type,
  //     maxWidth: 300,
  //     maxHeight: 550,
  //     includeBase64: true,
  //     quality: 1,
  //   };
  //   launchImageLibrary(options, (response) => {
  //     console.log('Response = ', response);

  //     if (response.didCancel) {
  //       alert('User cancelled camera picker');
  //       return;
  //     } else if (response.errorCode == 'camera_unavailable') {
  //       alert('Camera not available on device');
  //       return;
  //     } else if (response.errorCode == 'permission') {
  //       alert('Permission not satisfied');
  //       return;
  //     } else if (response.errorCode == 'others') {
  //       alert(response.errorMessage);
  //       return;
  //     }
  //     console.log('base64 -> ', response.base64);
  //     console.log('uri -> ', response.uri);
  //     console.log('width -> ', response.width);
  //     console.log('height -> ', response.height);
  //     console.log('fileSize -> ', response.fileSize);
  //     console.log('type -> ', response.type);
  //     console.log('fileName -> ', response.fileName);
  //     setFilePath(response);
  //   });
  // };

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
    const avatarRef = ref(storage, `avatar-${auth.currentUser.uid}.jpg`);
    // On va récupérer dépuis son emplacement via le protocol http
    const request = await fetch(img.uri);
    // On extrait le résultat de l'appel sous forme de blob
    const response = await request.blob();
    // on upload l'image récupérer dans le cloud sous forme de blob
    uploadBytes(avatarRef, response, {contentType: 'image/jpg'}).then(
      snapshot => {
        // on récupère lien de l'image
        getDownloadURL(snapshot.ref).then(downloadUrl => {
          // on met à jour le profil avec le lien de l'image

          // 1 . On met à jour l'utilisateur courant dans firestore
          handleUpdate({image: downloadUrl});
          // On met également l'avatar de l'utilisateur dans auth
          updateProfile(auth.currentUser, {photoURL: downloadUrl});
          // on ferme la bottonSheet
          // onClose();
        });
      },
    );
  };

  return (
    <>
    <ScrollView>    
    <Box flex={1}>
      {/* <Center h={'1/6'} bg="blue.500" mt={10}>
        <Avatar size="xl" mb={2}
        source={{
          // uri: 'https://icon-library.com/images/avatar-icon-images/avatar-icon-images-4.jpg',
          uri: 'data:image/jpeg;base64,' + filePath.assets[0].base64,
        }}
        resizeMode=''>
        </Avatar>
        <Text>{values.email}</Text>
      </Center> */}
      <Center h={'2/6'} bg="blue.500">
        <Avatar size="xl" mb={2} source={{uri: auth.currentUser.photoURL}}>          
          <Avatar.Badge
            size="8"
            justifyContent="center"
            backgroundColor="amber.500"
            shadow="2">
            <Pressable onPress={onOpen}>
              <Center>
                <Icon name="edit" as={MaterialIcons} size="sm" color="white" />
              </Center>
            </Pressable>
          </Avatar.Badge>
        </Avatar>
        <Text>{auth.currentUser.email}</Text>
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
          {/* {editMode && (
            <Button colorScheme="red" onPress={handleSubmit} mt="4">
              Supprimer
            </Button>
          )} */}
        </FormControl>
      </VStack>
      {!editMode && (
        <Fab
          renderInPortal={false}
          shadow="2"
          size={'sm'}
          colorScheme="amber"
          icon={<Icon color={'white'} 
          name="md-pencil-sharp" 
          as={IonIcons} />}
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
    {/* <SafeAreaView style={{flex: 1}}>
      <View style={styles.container}>
        <Image
          source={{
            uri: 'data:image/jpeg;base64,' + filePath.assets,
          }}          
          style={styles.imageStyle}
          resizeMethod='resize'
        />
        <Image
          source={{uri: filePath.uri}}
          style={styles.imageStyle}
        />
        <Text style={styles.textStyle}>{filePath.uri}</Text>
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.buttonStyle}
          onPress={() => captureImage('photo')}>
          <Text style={styles.textStyle}>
            Prendre une photo de profil
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.buttonStyle}
          onPress={() => chooseFile('photo')}>
          <Text style={styles.textStyle}>Choisir une image</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView> */}
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
