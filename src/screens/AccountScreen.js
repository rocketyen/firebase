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
  KeyboardAvoidingView,
} from 'native-base';

import IonIcons from 'react-native-vector-icons/Ionicons';

import {useFormik} from 'formik';

import {doc, getDoc, serverTimestamp, updateDoc} from 'firebase/firestore';
import {db, auth} from '../firebase/config';
import {Platform} from 'react-native';

export default function AccountScreen() {
  const [editMode, setEditMode] = useState(false);
  const [initialValues, setInitialValues] = useState({
    firstname: '',
    lastname: '',
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

  return (
    <Box flex={1}>
      <Center h={'2/6'} bg="amber.500">
        <Avatar size="xl" mb={2}>
          AC
        </Avatar>
        <Text>johndoe@gmail</Text>
      </Center>
      <VStack p={5} space={2}>
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
            <Button colorScheme="amber" onPress={handleSubmit} mt="4">
              Enregister
            </Button>
          )}
        </FormControl>
      </VStack>
      {!editMode && (
        <Fab
          renderInPortal={false}
          shadow="2"
          size={'sm'}
          colorScheme="amber"
          icon={<Icon color={'white'} name="md-pencil-sharp" as={IonIcons} />}
          onPress={() => setEditMode(true)}
        />
      )}
    </Box>
  );
}
