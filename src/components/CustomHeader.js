import React from 'react';
import {Box, Image} from 'native-base';

export default function CustomHeader() {
  return (
    <Box>
      <Image
        source={require('./../assets/ic_logo.png')}
        alt="logo"
        size="55"
        resizeMode="contain"
      />
    </Box>
  );
}
