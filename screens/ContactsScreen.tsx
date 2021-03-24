import * as React from 'react';
import * as Contacts from 'expo-contacts';
import {FlatList, StyleSheet} from 'react-native';
import { API, graphqlOperation } from 'aws-amplify';
import { View } from '../components/Themed';
import ContactListItem from '../components/ContactListItem';

import { listUsers }  from '../src/graphql/queries';
import {useEffect, useState} from "react";

export default function ContactsScreen() {

  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
        const { status } = await Contacts.requestPermissionsAsync();
        if (status === 'granted') {
          const { data } = await Contacts.getContactsAsync({
            fields: [Contacts.Fields.PhoneNumbers],
          });
  
          const numbers = new Set(data
            .map(contact => contact.phoneNumbers?.shift()?.number)
            .map(number => number?.split(' ').join(''))
          );
          const regex = /^[+]\d+$/
          const filteredNumbers = [...numbers].filter(n => regex.test(n))
          const orFilter = filteredNumbers
            .map(number => ({
              phoneNumber: {
                eq: number,
              }
            }))

          const existingUsersResponse = await API.graphql({ 
            query: listUsers, 
            variables: {
              filter: {
                or: orFilter,
              },
            }
          });

          

          setUsers(existingUsersResponse.data.listUsers.items);
        }
    }
    fetchUsers();
  }, [])

  return (
    <View style={styles.container}>
      <FlatList
        style={{width: '100%'}}
        data={users}
        renderItem={({ item }) => <ContactListItem user={item} />}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
