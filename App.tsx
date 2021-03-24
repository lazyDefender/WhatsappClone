import { StatusBar } from 'expo-status-bar';
import React, {useEffect} from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';

import {
  Auth,
  API,
  graphqlOperation,
} from 'aws-amplify';
import { getUser } from './src/graphql/queries';
import { createUser, updateUser } from './src/graphql/mutations';

import { withAuthenticator } from 'aws-amplify-react-native'
import Amplify from 'aws-amplify'
import config from './src/aws-exports';
import {
  AWS_BUCKET_NAME,
  AWS_REGION,
} from '@env';

Amplify.configure({
  ...config,
  Storage: {
    AWSS3: {
        bucket: AWS_BUCKET_NAME, //REQUIRED -  Amazon S3 bucket name
        region: AWS_REGION, //OPTIONAL -  Amazon service region
    }
}
})

const randomImages = [
  'https://hieumobile.com/wp-content/uploads/avatar-among-us-2.jpg',
  'https://hieumobile.com/wp-content/uploads/avatar-among-us-3.jpg',
  'https://hieumobile.com/wp-content/uploads/avatar-among-us-6.jpg',
  'https://hieumobile.com/wp-content/uploads/avatar-among-us-9.jpg',
]

function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  async function registerForPushNotificationsAsync() {
    let token;
    if (Constants.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log(token);
    } else {
      alert('Must use physical device for Push Notifications');
    }
  
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  
    return token;
  }

  // run this snippet only when App is first mounted
  useEffect( () => {
    const fetchUser = async () => {
      const userInfo = await Auth.currentAuthenticatedUser({ bypassCache: true });
      const expoToken = await registerForPushNotificationsAsync();

      // console.log(userInfo)

      if (userInfo) {
        // get user
        const userData = await API.graphql(
          graphqlOperation(
            getUser,
            { id: userInfo.attributes.sub }
            )
        )

        if (userData.data?.getUser) {
          // update token
          await API.graphql({ query: updateUser, variables: {input: {
            id: userInfo.attributes.sub,
            expoToken,
          }}});
        }

        else {
          // create user
          const newUser = {
            id: userInfo.attributes.sub,
            name: userInfo.username,
            expoToken,
            imageUri: null,
            status: 'Hey, I am using WhatsApp',
            phoneNumber: userInfo.attributes.phone_number,
          }
  
          console.log(newUser)
  
          await API.graphql(
            graphqlOperation(
              createUser,
              { input: newUser }
            )
          )
        }
        
      }
    }

    fetchUser();
  }, [])

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <SafeAreaProvider>
        <Navigation colorScheme={colorScheme} />
        <StatusBar />
      </SafeAreaProvider>
    );
  }
}

export default withAuthenticator(App)
