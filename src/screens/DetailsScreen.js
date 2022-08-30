// import { View, Text } from 'react-native'
// import React from 'react'

// export default function DetailsScreen() {
//   return (
//     <View>
//       <Text>DetailsScreen</Text>
//     </View>
//   )
// }

// import React, {useEffect, useState} from 'react';
// import {
//   Avatar,
//   Box,
//   Center,
//   FormControl,
//   Input,
//   VStack,
//   Text,
//   Fab,
//   Icon,
//   Button,
//   KeyboardAvoidingView,
// } from 'native-base';

// import IonIcons from 'react-native-vector-icons/Ionicons';

// import {useFormik} from 'formik';

// import {doc, getDoc, serverTimestamp, updateDoc} from 'firebase/firestore';
// import {db, auth} from '../firebase/config';
// import {Platform} from 'react-native';

// export default function AccountScreen() {
//   const [editMode, setEditMode] = useState(false);
//   const [initialValues, setInitialValues] = useState({
//     title: '',
//     description: '',
//     available: null,
//     expiration: null,
//   });
//   const {values, handleChange, handleSubmit} = useFormik({
//     initialValues,
//     onSubmit: values => {
//       handleUpdate(values);
//       setEditMode(false);
//     },
//     enableReinitialize: true,
//   });

//   useEffect(() => {
//     const advertsDocRef = doc(db, 'adverts', auth.currentAdverts.uid);
//     getDoc(advertsDocRef).then(docSnap => {
//       if (docSnap.exists()) {
//         const data = docSnap.data();
//         setInitialValues({
//           title: data['title'],
//           description: data['description'],
//           available: data['available'],
//           expiration: data['expiration'],
//         });
//       }
//     });
//   }, []);

//   const handleUpdate = values => {
//     const advertsDocRef = doc(db, 'advertss', auth.currentAdvert.uid);
//     updateDoc(advertsDocRef, {
//       ...values,
//       updatedAt: serverTimestamp(),
//     })
//       .then(updatedAdverts => {
//         console.log('====================================');
//         console.log('Adverts updated !');
//         console.log('====================================');
//       })
//       .catch(e => {
//         console.log('====================================');
//         console.log(e.massage);
//         console.log('====================================');
//       });
//   };

//   return (
//     <Box flex={1}>
//       <Center h={'2/6'} bg="blue.500">
//         <Avatar size="xl" mb={2}
//         source={{
//           uri: 'https://icon-library.com/images/avatar-icon-images/avatar-icon-images-4.jpg',
//         }}>
//         {/* {values.firstname} */}
//         </Avatar>
//         <Text>{values.email}</Text>
//       </Center>
//       <VStack p={5} space={2}>
//       <FormControl>
//           <FormControl.Label>Email</FormControl.Label>
//           <Input
//             value={values.email}
//             onChangeText={handleChange('email')}
//             isDisabled={!editMode}
//           />
//         </FormControl>
//         <FormControl>
//           <FormControl.Label>Titre</FormControl.Label>
//           <Input
//             value={values.title}
//             onChangeText={handleChange('title')}
//             isDisabled={!editMode}
//           />
//         </FormControl>
//         <FormControl>
//           <FormControl.Label>Nom</FormControl.Label>
//           <Input
//             isDisabled={!editMode}
//             value={values.lastname}
//             onChangeText={handleChange('lastname')}
//           />
//           {editMode && (
//             <Button colorScheme="blue" onPress={handleSubmit} mt="4">
//               Enregister
//             </Button>
//           )}
//         </FormControl>
//       </VStack>
//       {!editMode && (
//         <Fab
//           renderInPortal={false}
//           shadow="2"
//           size={'sm'}
//           colorScheme="blue"
//           icon={<Icon color={'white'} name="md-pencil-sharp" as={IonIcons} />}
//           onPress={() => setEditMode(true)}
//         />
//       )}
//     </Box>
//   );
// }

import {View, Text, Pressable} from 'react-native';
import React, {useEffect, useState} from 'react';
import {collection, getDocs, query, where} from 'firebase/firestore';

import {db, auth} from '../firebase/config';
import {Box, Divider, FlatList, Heading, VStack} from 'native-base';

import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import 'dayjs/locale/fr';

dayjs.extend(localizedFormat);
dayjs.locale('fr');

export default function UserDashboard() {
  const [adverts, setAdverts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user_id = auth.currentUser.uid;
    const advertColRef = collection(db, 'adverts');

    const q = query(advertColRef, where('user_id', '==', user_id));

    getDocs(q)
      .then(querySnapshot => {
        const advertsArray = [];
        querySnapshot.forEach(doc => {
          advertsArray.push({
            ...doc.data(),
            id: doc.id,
          });
        });
        setAdverts(advertsArray);
      })
      .catch(e => {
        console.log(e.massage);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  const renderItem = ({item}) => (
    <Pressable>
      <Divider />
      <VStack p={3} space="2">
        <Heading size="sm">{item.title}</Heading>
        <Heading size="sm">{item.description}</Heading>
        <Box _text={{ color: 'muted.500' }}>{dayjs(item.createdAt?.toDate()).format('LLLL')}</Box>
      </VStack>
    </Pressable>
  );
  console.log(adverts, 'gjfkhgkhj')
  return (
    <Box flex={1} p={2}>
      <Heading size="md">Mes annonces</Heading>
      <FlatList
        data={adverts}
        key={item => item.id}
        ItemSeparatorComponent={ () => <Divider />}
        renderItem={renderItem}
      />
    </Box>
  );
}