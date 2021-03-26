import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableWithoutFeedback
} from "react-native";
import { User } from "../../types";
import styles from "./style";
import { useNavigation } from '@react-navigation/native';

import {
  API,
  graphqlOperation,
  Auth,
} from "aws-amplify";
import {
  createChatRoom,
  createChatRoomUser
} from '../../src/graphql/mutations';
// import {
//   getUser
// } from '../../src/graphql/queries';

export type ContactListItemProps = {
  user: User;
}

const ContactListItem = (props: ContactListItemProps) => {
  const { user } = props;

  const navigation = useNavigation();

  const onClick = async () => {
    try {
      // console.log('user', user)
      
      const getUser = `
      query GetUser($id: ID!) {
        getUser(id: $id) {
          id
          name
          imageUri
          status
          chatRoomUser {
            items {
              id
              userID
              chatRoom {
                id
                chatRoomUsers {
                  items {
                    userID
                  }
                }
              }
              createdAt
              updatedAt
            }
            nextToken
          }
          expoToken
          phoneNumber
          createdAt
          updatedAt
        }
      }
    `
      
      const userInfo = await Auth.currentAuthenticatedUser();

      const userData = await API.graphql(
        graphqlOperation(
          getUser, {
            id: userInfo.attributes.sub,
          }
        )
      )

      // console.log(user);

      const myRooms = userData.data.getUser.chatRoomUser.items;
      // .chatRoomUser.items;

      let roomId;
      let chatRoomWithSelectedUserExists = false;
      for(let room of myRooms) {
        roomId = room.chatRoom.id;
        const usersInRoom = room.chatRoom.chatRoomUsers.items.map(item => item.userID);
        // console.log(usersInRoom);
        if(usersInRoom.length === 2 && usersInRoom.includes(user.id)) {
          chatRoomWithSelectedUserExists = true;
          break;
        } 
      }

      console.log(chatRoomWithSelectedUserExists);
 
      if(!chatRoomWithSelectedUserExists) {
        //1. Create a new Chat Room
        const newChatRoomData = await API.graphql(
          graphqlOperation(
            createChatRoom, {
              input: {
                lastMessageID: null
              }
            }
          )
        )
  
        if (!newChatRoomData.data) {
          console.log(" Failed to create a chat room");
          return;
        }
  
        const newChatRoom = newChatRoomData.data.createChatRoom;
        roomId = newChatRoom.id;

        // 2. Add `user` to the Chat Room
        await API.graphql(
          graphqlOperation(
            createChatRoomUser, {
              input: {
                userID: user.id,
                chatRoomID: newChatRoom.id,
              }
            }
          )
        )
  
        //  3. Add authenticated user to the Chat Room
        await API.graphql(
          graphqlOperation(
            createChatRoomUser, {
              input: {
                userID: userInfo.attributes.sub,
                chatRoomID: roomId,
              }
            }
          )
        )
      }
      
      console.log(roomId);

      navigation.navigate('ChatRoom', {
        id: roomId,
        name: "Hardcoded name",
      })

    } catch (e) {
      console.log(e);
    }
  }

  return (
    <TouchableWithoutFeedback onPress={onClick}>
      <View style={styles.container}>
        <View style={styles.lefContainer}>
          <Image source={{ uri: user.imageUri }} style={styles.avatar}/>

          <View style={styles.midContainer}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
              <Text style={styles.username}>{user.name}</Text>
              <Text>{user.phoneNumber}</Text>
            </View>
            
            <Text numberOfLines={2} style={styles.status}>{user.status}</Text>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  )
};

export default ContactListItem;
