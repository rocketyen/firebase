import {
  Box,
  Button,
  Center,
  FormControl,
  Heading,
  Input,
  Select,
  VStack,
  Text,
  ScrollView,
  HStack,
  Link,
} from 'native-base';
import React from 'react';
import {TouchableOpacity} from 'react-native';

// formik
import {useFormik} from 'formik';
import * as yup from 'yup';

// firebase imports
import {createUserWithEmailAndPassword} from 'firebase/auth';
import {collection, doc, setDoc, serverTimestamp} from 'firebase/firestore';

import {auth, db} from '../firebase/config';
import {useNavigation} from '@react-navigation/native';

// schema de validation

const validationSchema = yup.object({
  email: yup
    .string()
    .email('Merci une adresse mail valide')
    .required("L'email est requis"),
  password: yup
    .string()
    .min(6, 'mot de passe trop court')
    .required('Le mot de passe est requis'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Les mots de passe sont différents'),
  firstname: yup.string().required('Le prénom est requis'),
  lastname: yup.string().required('Le nom est requis'),
});

export default function RegistrationScreen() {
  const navigation = useNavigation();
  // Récupération des props useFormik
  const {values, handleChange, handleBlur, handleSubmit, errors, touched} =
    useFormik({
      initialValues: {
        email: '',
        password: '',
        confirmPassword: '',
        firstname: '',
        lastname: '',
        role: '',
      },
      onSubmit: values => signIn(values),
    });
  const signIn = values => {
    /**
     * @var string email
     * @var string password
     */
    const {email, password} = values;
    // Condition de connexion ok
    createUserWithEmailAndPassword(auth, email.trim(), password.trim())
      .then(userCredential => {
        const user = userCredential.user;
        const id = user.uid;
        // récupérer la collection
        const userCollRef = collection(db, 'users');
        // on récupère le doc qui à l'id de l'utilisateur. Il le crée s'il n'existe pas.
        const userDoc = doc(userCollRef, id);
        delete values.password;
        delete values.confirmPassword;

        console.log(values);
        // on modifit et persiste les données dans firestore
        setDoc(userDoc, {
          ...values,
          createdAt: serverTimestamp(),
        }).then(userCredential => {
          console.log('user created!');
        });
        console.log(user);
        // on appelle firestore pour persister une version de notre user avec plus d'info
      })
      .catch(error => {
        console.log(error.message);
      });
  };
  return (
    <Center flex="1">
      <ScrollView w="full">
        <Box w="95%" mx="auto" px="1">
          <Heading size="lg">Bienvenue !</Heading>
          <Text my={'1.5'} color="muted.500">
            Pour commencer, créer un votre compte
          </Text>
          <VStack space={2}>
            <FormControl>
              <FormControl.Label>Email</FormControl.Label>
              <Input
                value={values.email}
                onChangeText={handleChange('email')}
              />
            </FormControl>
            <FormControl>
              <FormControl.Label>Mot de passe</FormControl.Label>
              <Input
                value={values.password}
                onChangeText={handleChange('password')}
              />
            </FormControl>
            <FormControl>
              <FormControl.Label>
                Confirmation du mot de passe
              </FormControl.Label>
              <Input
                value={values.confirmPassword}
                onChangeText={handleChange('confirmPassword')}
              />
            </FormControl>
            <FormControl>
              <FormControl.Label>Prénom</FormControl.Label>
              <Input
                value={values.firstname}
                onChangeText={handleChange('firstname')}
              />
            </FormControl>
            <FormControl>
              <FormControl.Label>Nom</FormControl.Label>
              <Input
                value={values.lastname}
                onChangeText={handleChange('lastname')}
              />
            </FormControl>
            <FormControl>
              <FormControl.Label>Rôle</FormControl.Label>
              <Select onValueChange={handleChange('role')}>
                <Select.Item label="Je suis un donateur" value="donor" />
                <Select.Item label="Je suis un collecteur" value="collector" />
              </Select>
            </FormControl>
            <Button colorScheme='blue' onPress={handleSubmit}>
              S'inscrire
            </Button>
          </VStack>
          <HStack mt="2" space="1.5">
            <Text>Déjà inscrit ? </Text>
            <Link
              onPress={() => navigation.goBack()}
              _text={{
                color: 'blue.500',
                fontWeight: 'medium',
                fontSize: 'sm',
              }}>
              Se connecter
            </Link>
          </HStack>
          <Box mt="2" mb="5" flexDirection="row">
            <TouchableOpacity>
              <Text pl={'1.5'} color="primary.500"></Text>
            </TouchableOpacity>
          </Box>
        </Box>
      </ScrollView>
    </Center>
  );
}
