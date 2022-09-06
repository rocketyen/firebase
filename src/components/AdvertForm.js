import React, {useState, useRef, useEffect} from 'react';
import {
  Box, 
  Button, 
  FormControl,
  Heading, 
  Input, 
  VStack, 
  useToast,} from 'native-base';

import {DateTimePickerAndroid} from '@react-native-community/datetimepicker';

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

// Custom service d'appel API création de notification PUSH
import {sendPushNotification} from '../services/notificationServices';

import * as yup from 'yup';
import {useFormik} from 'formik';



// firebase
import {
  collection,
  setDoc,
  addDoc,
  doc,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';


const validationSchema = yup.object({
  title: yup.string().required('Le titre est requis'),
  description: yup.string(),
  available: yup
    .date()
    .typeError("La valeur renseigné n'est pas une date valide")
    .required('La date de disponibilité du don est requis'),
  expiration: yup
    .date()
    .typeError("La valeur renseigné n'est pas une date valide")
    .required("La date d'expiration est requise"),
});

export default function AdvertForm() {
  const [showAvailableDatePicker, setShowAvailableDatePicker] = useState(false);
  const [showExpirationDatePicker, setShowExpirationDatePicker] =
    useState(false);
  
  const toast = useToast();

  const availableInputRef = useRef(null);
  const expirationInputRef = useRef(null);
  
  const {
    values,
    setFieldValue,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
    touched,
    resetForm,
  } = useFormik({
    initialValues: {
      title: '',
      description: '',
      available: null,
      expiration: null,
    },
    onSubmit: values => createAds(values),
    validationSchema,
  });

  const availableDateChange = (event, selectedDate) => {
    const nextDate = selectedDate;
    console.log(nextDate);
    setShowAvailableDatePicker(false);
    setFieldValue('available', nextDate);
    availableInputRef.current.blur();
  };

  const expirationDateChange = (event, selectedDate) => {
    const nextDate = selectedDate;
    setShowExpirationDatePicker(false);
    setFieldValue('expiration', nextDate);
    expirationInputRef.current.blur();
  };

  const getRegistrationIds = async () => {
    const collectors = [];

    const querySnap = await firestore()
      .collection('users')
      .where('role', '==', 'collector')
      .limit(500)
      .get();

    querySnap.forEach(doc => {
      collectors.push(doc.data());
    });

    const registration_ids = collectors
      .filter(collector => collector.fcmToken)
      .map(item => item.fcmToken);
    console.log(registration_ids, 'ids');
    return registration_ids;
  };

  const createAds = values => {
    firestore()
      .collection('adverts')
      .add({
        ...values,
        available: firestore.Timestamp.fromDate(values.available),
        expiration: firestore.Timestamp.fromDate(values.expiration),
        createdAt: firestore.FieldValue.serverTimestamp(),
        user_id: auth().currentUser.uid,
      })
      .then(async newAdvert => {
        toast.show({
          description: 'Annonce ajoutée avec succès !',
        });
        resetForm();

        const registration_ids = await getRegistrationIds();

        sendPushNotification(registration_ids, values.title)
          .then(() => {
            console.log('Notification créée !');
          })
          .catch(error => {
            console.log('Erreur', error.message);
          });
      });
  };

  useEffect(() => {
    getRegistrationIds();
  }, []);

  const updateAds = (values, id) => {
    // on récupère le document à modifier
    const advertsDocRef = doc(db, 'adverts', id);
    // on le modifier avec la méthode setDoc (possibilité d'utiliser un autre méthode)
    // le merge est import sinon, les colonnes non présente dans values seront écrasées de la nouvelle version du document.
    // j'ai ajouté la colonne updatedAt pour avoir une date de dernière modification
    setDoc(
      advertsDocRef,
      {
        ...values,
        updatedAt: serverTimestamp(),
      },
      {
        merge: true,
      },
    ).then(() => {
      console.log('annonce modifiée avec succès');
    });
  };

  return (
    <Box p={5}>
      <Heading>Nouvelle annonce</Heading>
      <VStack space={2}>
        <FormControl isInvalid={touched.title && errors?.title}>
          <FormControl.Label>Titre</FormControl.Label>
          <Input value={values.title} onChangeText={handleChange('title')} />
          <FormControl.ErrorMessage>{errors?.title}</FormControl.ErrorMessage>
        </FormControl>
        <FormControl isInvalid={touched.description && errors?.description}>
          <FormControl.Label>Description</FormControl.Label>
          <Input
            value={values.description}
            onChangeText={handleChange('description')}
          />
          <FormControl.ErrorMessage>
            {errors?.description}
          </FormControl.ErrorMessage>
        </FormControl>
        <FormControl isInvalid={touched.available && errors?.available}>
          <FormControl.Label>Disponibilité</FormControl.Label>
          <Input
            onFocus={() => setShowAvailableDatePicker(true)}
            showSoftInputOnFocus={false}
            ref={availableInputRef}
            value={values.available?.toISOString()}
            onChangeText={handleChange('available')}
          />
          <FormControl.ErrorMessage>
            {errors?.available}
          </FormControl.ErrorMessage>
        </FormControl>
        {showAvailableDatePicker &&
          DateTimePickerAndroid.open({
            mode: 'date',
            value: new Date(),
            onChange: availableDateChange,
          })}
        <FormControl isInvalid={touched.expiration && errors?.expiration}>
          <FormControl.Label>DLC/DLUO</FormControl.Label>
          <Input
            onFocus={() => {
              //   Keyboard.dismiss();
              setShowExpirationDatePicker(true);
            }}
            showSoftInputOnFocus={false}
            ref={expirationInputRef}
            value={values.expiration?.toISOString()}
            onChangeText={handleChange('expiration')}
          />
          <FormControl.ErrorMessage>
            {errors?.expiration}
          </FormControl.ErrorMessage>
        </FormControl>
        {showExpirationDatePicker &&
          DateTimePickerAndroid.open({
            mode: 'date',
            value: new Date(),
            onChange: expirationDateChange,
          })}
        <Button onPress={handleSubmit} mt={'4'} colorScheme={'blue'}>
          Enregistrer
        </Button>
      </VStack>
    </Box>
  );
}
