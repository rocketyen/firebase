import React, {useState, useRef} from 'react';
import {Box, Button, FormControl, Heading, Input, VStack} from 'native-base';

import * as yup from 'yup';
import {useFormik} from 'formik';

import {DateTimePickerAndroid} from '@react-native-community/datetimepicker';

// firebase
import {
  collection,
  setDoc,
  addDoc,
  doc,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import {db, auth} from '../firebase/config';

const validationSchema = yup.object({
  title: yup.string().required('Le titre est requis'),
  description: yup.string(),
  available: yup
    .date("La valeur renseigné n'est pas une date valide")
    .required('La date de disponibilité du don est requis'),
  expiration: yup
    .date("La valeur renseigné n'est pas une date valide")
    .required("La date d'expiration est requise"),
});

export default function AdvertForm() {
  const [showAvailableDatePicker, setShowAvailableDatePicker] = useState(false);
  const [showExpirationDatePicker, setShowExpirationDatePicker] =
    useState(false);

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
  } = useFormik({
    initialValues: {
      title: '',
      description: '',
      available: null,
      expiration: null,
    },
    onSubmit: values => createAds(values),
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

  const createAds = values => {
    const advertsRef = collection(db, 'adverts');
    addDoc(advertsRef, {
      ...values,
      available: Timestamp.fromDate(values.available),
      expiration: Timestamp.fromDate(values.expiration),
      createdAt: serverTimestamp(),
      user_id: auth.currentUser.uid,
    }).then(newAdvert => {
      console.log('nouveau', newAdvert.id);
    });
  };

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
        <FormControl>
          <FormControl.Label>Titre</FormControl.Label>
          <Input value={values.title} onChangeText={handleChange('title')} />
        </FormControl>
        <FormControl>
          <FormControl.Label>Description</FormControl.Label>
          <Input
            value={values.description}
            onChangeText={handleChange('description')}
          />
        </FormControl>
        <FormControl>
          <FormControl.Label>Disponibilité</FormControl.Label>
          <Input
            onFocus={() => setShowAvailableDatePicker(true)}
            showSoftInputOnFocus={false}
            ref={availableInputRef}
            value={values.available?.toISOString()}
            onChangeText={handleChange('available')}
          />
        </FormControl>
        {showAvailableDatePicker &&
          DateTimePickerAndroid.open({
            mode: 'date',
            value: new Date(),
            onChange: availableDateChange,
          })}
        <FormControl>
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
        </FormControl>
        {showExpirationDatePicker &&
          DateTimePickerAndroid.open({
            mode: 'date',
            value: new Date(),
            onChange: expirationDateChange,
          })}
        <Button onPress={handleSubmit} mt={'4'} colorScheme={'amber'}>
          Enregistrer
        </Button>
      </VStack>
    </Box>
  );
}
