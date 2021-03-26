import * as React from 'react';
import {Dimensions, FlatList, StyleSheet} from 'react-native';
import { API, graphqlOperation, Auth } from 'aws-amplify';
import { View } from '../components/Themed';
import ContactListItem from '../components/ContactListItem';

import { listUsers, getUser }  from '../src/graphql/queries';
import {useEffect, useState} from "react";
import { TextInput } from 'react-native-gesture-handler';

export default function SearchScreen() {

    const [query, setQuery] = useState('')
  const [users, setUsers] = useState([]);
  const [myId, setMyId] = useState(null);

  useEffect(() => {
    (async () => {
      const userInfo = await Auth.currentAuthenticatedUser();

      const userData = await API.graphql(
        graphqlOperation(
          getUser, {
            id: userInfo.attributes.sub,
          }
        )
      )
      const { id } =  userData.data.getUser;
      setMyId(id);
    })();
  }, []);

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
                                    },
                                    and: {
                                      id: {
                                        ne: myId,
                                      }
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
