import * as React from 'react';
import {Dimensions, FlatList, StyleSheet} from 'react-native';
import { API, graphqlOperation } from 'aws-amplify';
import { View } from '../components/Themed';
import ContactListItem from '../components/ContactListItem';

import { listUsers }  from '../src/graphql/queries';
import {useEffect, useState} from "react";
import { TextInput } from 'react-native-gesture-handler';

export default function SearchScreen() {

    const [query, setQuery] = useState('')
  const [users, setUsers] = useState([]);

  return (
    <View style={styles.container}>
        <TextInput
        placeholder='Пошук'
            value={query}
            onChangeText={async (text) => {
                    setQuery(text)
                    if(text.length > 0) {
                        const userData = await API.graphql({ 
                            query: listUsers, 
                            variables: { 
                                filter: {
                                    name: {
                                        contains: text,
                                    }
                               }
                        }});
                        const {items} =  userData.data.listUsers
                        setUsers(items)
                    }
                    else {
                        setUsers([])
                    }
                    
                }
            }
            style={{
                marginLeft: 20,
                width: Dimensions.get('screen').width * 0.8,
                borderWidth: 3,
                // border
            }}
            autoCapitalize='none'
        />
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
    // alignItems: 'center',
    // justifyContent: 'center',
  },
});
