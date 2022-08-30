import React, {useEffect, useState} from 'react';
import {  
  Avatar,
  Box,
  Center,
  FormControl,
  Input,
  VStack,
  Fab,
  Icon,
  Button,
  KeyboardAvoidingView,
} from 'native-base';

import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  PermissionsAndroid,
} from  'react-native';

// Import Image Picker
import  {
  launchCamera,
  launchImageLibrary
} from 'react-native-image-picker';

import IonIcons from 'react-native-vector-icons/Ionicons';

import {useFormik} from 'formik';

import {doc, getDoc, serverTimestamp, updateDoc, deleteField } from 'firebase/firestore';
import {db, auth} from '../firebase/config';
import {Platform} from 'react-native';

export default function AccountScreen() {
  const [editMode, setEditMode] = useState(false);
  const [initialValues, setInitialValues] = useState({
    firstname: '',
    lastname: '',
    email: '',
  });
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

  const captureImage = async (type) => {
    let options = {
      mediaType: type,
      maxWidth: 300,
      maxHeight: 550,
      quality: 1,
      includeBase64: true,
      videoQuality: 'low',
      durationLimit: 30, //Video max duration in seconds
      saveToPhotos: true,
    };
    let isCameraPermitted = await requestCameraPermission();
    let isStoragePermitted = await requestExternalWritePermission();
    if (isCameraPermitted && isStoragePermitted) {
      launchCamera(options, (response) => {
        console.log('Response = ', response);

        if (response.didCancel) {
          alert('User cancelled camera picker');
          return;
        } else if (response.errorCode == 'camera_unavailable') {
          alert('Camera not available on device');
          return;
        } else if (response.errorCode == 'permission') {
          alert('Permission not satisfied');
          return;
        } else if (response.errorCode == 'others') {
          alert(response.errorMessage);
          return;
        }
        // console.log('base64 -> ', response.base64);
        // console.log('uri -> ', response.uri);
        // console.log('width -> ', response.width);
        // console.log('height -> ', response.height);
        // console.log('fileSize -> ', response.fileSize);
        // console.log('type -> ', response.type);
        // console.log('fileName -> ', response.fileName);
        setFilePath(response);
      });
    }
  };
  console.log(filePath);

  const chooseFile = (type) => {
    let options = {
      mediaType: type,
      maxWidth: 300,
      maxHeight: 550,
      includeBase64: true,
      quality: 1,
    };
    launchImageLibrary(options, (response) => {
      console.log('Response = ', response);

      if (response.didCancel) {
        alert('User cancelled camera picker');
        return;
      } else if (response.errorCode == 'camera_unavailable') {
        alert('Camera not available on device');
        return;
      } else if (response.errorCode == 'permission') {
        alert('Permission not satisfied');
        return;
      } else if (response.errorCode == 'others') {
        alert(response.errorMessage);
        return;
      }
      // console.log('base64 -> ', response.base64);
      // console.log('uri -> ', response.uri);
      // console.log('width -> ', response.width);
      // console.log('height -> ', response.height);
      // console.log('fileSize -> ', response.fileSize);
      // console.log('type -> ', response.type);
      // console.log('fileName -> ', response.fileName);
      setFilePath(response);
    });
  };

  return (
    <>
    <ScrollView>    
    <Box flex={1}>
      <Center h={'1/6'} bg="blue.500" mt={10}>
        <Avatar size="xl" mb={2}
        source={{
          // uri: 'https://icon-library.com/images/avatar-icon-images/avatar-icon-images-4.jpg',
          uri: 'data:image/jpeg;base64,' + filePath.assets[0].base64,
        }}
        resizeMode=''>
        </Avatar>
        <Text>{values.email}</Text>
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
          {editMode && (
            <Button colorScheme="red" onPress={handleSubmit} mt="4">
              Supprimer
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
          name="md-pencil-sharp" 
          as={IonIcons} />}
          onPress={() => setEditMode(true)}
        />
      )}
    </Box>
    <SafeAreaView style={{flex: 1}}>
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
    </SafeAreaView>
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
