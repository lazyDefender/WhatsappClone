import React, {useEffect, useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform,} from "react-native";
import styles from './styles';

import {
  API,
  Auth,
  graphqlOperation,
} from 'aws-amplify';

import {
  createMessage,
  updateChatRoom,
} from '../../src/graphql/mutations';

import {
  MaterialCommunityIcons,
  MaterialIcons,
  FontAwesome5,
  Entypo,
  Fontisto,
} from '@expo/vector-icons';
import { listChatRoomUsers } from '../../src/graphql/queries';

const InputBox = (props) => {

  const { chatRoomID } = props;

  const [message, setMessage] = useState('');
  const [myUserId, setMyUserId] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userInfo = await Auth.currentAuthenticatedUser();
      setMyUserId(userInfo.attributes.sub);
    }
    fetchUser();
  }, [])

  const onMicrophonePress = () => {
    console.warn('Microphone')
  }

  const updateChatRoomLastMessage = async (messageId: string) => {
    try {
      await API.graphql(
        graphqlOperation(
          updateChatRoom, {
            input: {
              id: chatRoomID,
              lastMessageID: messageId,
            }
          }
        )
      );
    } catch (e) {
      console.log(e);
    }
  }

  const onSendPress = async () => {
    try {
      console.log(chatRoomID)
      const newMessageData = await API.graphql(
        graphqlOperation(
          createMessage, {
            input: {
              content: message,
              userID: myUserId,
              chatRoomID
            }
          }
        )
      )

      await updateChatRoomLastMessage(newMessageData.data.createMessage.id)


      const {data: usersInRoomData} = await API.graphql(graphqlOperation(
        listChatRoomUsers, {
          filter: {
            chatRoomID: {
              eq: chatRoomID,
            },
            userID: {
              ne: myUserId,
            },
          },
        },
      ))
      
      const { items } = usersInRoomData.listChatRoomUsers
      
      const expoTokens = items.map(item => item.user.expoToken)
        const expoPushUri = 'https://exp.host/--/api/v2/push/send';
        const body = {
            "to": expoTokens,
            "title": 'new message',
            "body": message,
        }
        await fetch(expoPushUri, {
          method: 'POST',
          body: JSON.stringify(body),
          headers: {
            'Content-Type': 'application/json',
          },
        })
    } catch (e) {
      console.log(e);
    }

    setMessage('');
  }

  const onPress = () => {
    if (!message) {
      onMicrophonePress();
    } else {
      onSendPress();
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS == "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
      style={{width: '100%'}}
    >
      <View style={styles.container}>
      <View style={styles.mainContainer}>
        <FontAwesome5 name="laugh-beam" size={24} color="grey" />
        <TextInput
          placeholder={"Type a message"}
          style={styles.textInput}
          multiline
          value={message}
          onChangeText={setMessage}
        />
        <Entypo name="attachment" size={24} color="grey" style={styles.icon} />
        {!message && <Fontisto name="camera" size={24} color="grey" style={styles.icon} />}
      </View>
      <TouchableOpacity onPress={onPress}>
        <View style={styles.buttonContainer}>
          {!message
            ? <MaterialCommunityIcons name="microphone" size={28} color="white" />
            : <MaterialIcons name="send" size={28} color="white" />}
        </View>
      </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

export default InputBox;
