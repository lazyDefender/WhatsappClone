import React, {useEffect, useState} from 'react';
import {
    FlatList, 
    Text, 
    ImageBackground, 
    KeyboardAvoidingView,
    View,
    ScrollView,
    Dimensions,
    StyleSheet,
    TextInput,
    Button,
} from 'react-native';

import { useRoute } from '@react-navigation/native';
import {
  API,
  graphqlOperation,
  Auth,
} from 'aws-amplify';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

import {RNS3} from 'react-native-aws3';

import { messagesByChatRoom } from '../src/graphql/queries';
import { onCreateMessage } from '../src/graphql/subscriptions';


import ChatMessage from "../components/ChatMessage";
import BG from '../assets/images/BG.png';
import InputBox from "../components/InputBox";
import { getUser } from './queries';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

const ProfileScreen = () => {
    const [username, setUsername] = useState('')
    useEffect(() => {
        const getCurrentUser = async () => {
            const userInfo = await Auth.currentAuthenticatedUser();

            const userData = await API.graphql(
                graphqlOperation(
                    getUser, {
                    id: userInfo.attributes.sub,
                    }
                )
            )
            const { id, name, imageUri } =  userData.data.getUser
            // 

            setUsername(name)

        }
        getCurrentUser()
    })
  return (
    <ScrollView style={styles.container}>
        <View style={{...styles.userInfoSection, alignItems: 'flex-start'}}>
            
            <View style={{
                    height: 100,
                    width: 100,
                    borderRadius: 50,
                    backgroundColor: "#345",
                    transform: [{
                        translateY: -50,
                    }]
                }}>
            </View>
            <Button
                title='Змінити фото'
                onPress={async () => {
                    const {uri, name} = await DocumentPicker.getDocumentAsync({
                        type: 'image/*',
                    })
                    console.log(uri)
                    const config = {
                        keyPrefix: "uploads/",
                        bucket: "chat-app-bucket214505-dev",
                        region: "us-east-1",
                        accessKey: "AKIAUYAYZGLJL4WI3CM7",
                        secretKey: "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",
                        successActionStatus: 201
                    }
                    RNS3.put({
                        uri,
                        name,
                        type: 'image/'+name.split('.')[1]
                    }, config)
                }}
            />
            <Button
                title='Видалити фото'
                onPress={() => {}}
            />
            
            <Text>Ім'я</Text>
            <TextInput
                style={styles.input}
                value={username}
                numberOfLines={1}
                placeholder={'username'}
                placeholderTextColor='#666'
                onChangeText={(text) => setUsername(text)}
            />
            <Button
                title="Вийти"
                onPress={async () => {
                    await Auth.signOut()
                }}
            />
        </View>
                 
    </ScrollView>
  );
}

export default ProfileScreen;

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'absolute',
        width: '100%',
        height: 50,
        paddingHorizontal: 20,
    },
    daysInRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    container: {
        backgroundColor: '#fff',
    },
    mainContent: {
        marginTop: 50,
    },
    fireImage: {
        height: 30,
        width: 30,
    },
    userImage: {
        height: 30,
        width: 30,
    },
    topContainer: {
        height: windowHeight / 5,
        width: '100%',
        paddingHorizontal: 20,
        backgroundColor: '#000947',
        borderBottomRightRadius: 60,
    },
    completedText: {
        marginTop: windowHeight / 5 * 0.65,
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 16,
    },
    bottomContainer: {
        backgroundColor: '#000947',
        height: 50,
    },
    bottomContent: {
        width: '100%',
        height: '100%',
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 60,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    firstUnit: {
        marginTop: 60,
    },




    // header: {
    //     flexDirection: 'row',
    //     alignItems: 'center',
    //     justifyContent: 'space-between',
    //     position: 'absolute',
    //     width: '100%',
    //     height: 50,
    //     paddingHorizontal: 20,
    // },
    // container: {
    //     backgroundColor: '#fff',
    // },
    // mainContent: {
    //     marginTop: 50,
    // },
    icon: {
        height: 30,
        width: 30,
    },
    smallIcon: {
        height: 15,
        width: 15,
    },
    // userImage: {
    //     height: 80,
    //     width: 80,
    // },
    // topContainer: {
    //     height: windowHeight / 4,
    //     width: '100%',
    //     paddingHorizontal: 20,
    //     backgroundColor: '#000947',
    //     borderBottomRightRadius: 60,
    // },
    // completedText: {
    //     marginTop: windowHeight / 4 * 0.65,
    //     color: '#ffffff',
    //     fontWeight: '600',
    //     fontSize: 16,
    // },
    // bottomContainer: {
    //     backgroundColor: '#000947',
        
    // },
    // bottomContent: {
    //     width: '100%',
    //     height: '100%',
    //     backgroundColor: '#ffffff',
    //     borderTopLeftRadius: 60,
    //     paddingHorizontal: 20,
    // },
    // firstUnit: {
    //     marginTop: 60,
    // },
    
    profileContent: {
        justifyContent: 'space-between',
        height: windowHeight - 50,
    },

    userInfoSection: {
        paddingHorizontal: 20,
        marginTop: 50,
        alignItems: 'center',
      },
      title: {
        fontSize: 24,
        fontWeight: 'bold',
      },
      caption: {
        fontSize: 14,
        lineHeight: 14,
        fontWeight: '500',
      },
      row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
      },
      infoBoxWrapper: {
        borderBottomColor: '#dddddd',
        borderBottomWidth: 1,
        borderTopColor: '#dddddd',
        borderTopWidth: 1,
        flexDirection: 'row',
        height: 100,
      },
      infoBox: {
        width: '50%',
        alignItems: 'center',
        justifyContent: 'center',
      },
      menuWrapper: {
        paddingHorizontal: 20,
      },
      menuItem: {
        width: windowWidth - 40,
        flexDirection: 'row',
        paddingVertical: 15,
        borderColor: '#456456',
        borderWidth: 3,
        // borderRadius: 
        marginLeft: 20,
      },
      deleteAccount: {
        marginBottom: 10,
      },
      menuItemText: {
        textAlign: 'center',
        color: '#777777',
        fontWeight: '600',
        fontSize: 16,
        lineHeight: 26,
        width: '100%',
      },
      inputContainer: {
        marginTop: 5,
        marginBottom: 10,
        width: '100%',
        height: windowHeight / 12,
        borderColor: '#ccc',
        borderRadius: 10,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    iconStyle: {
        padding: 10,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRightColor: '#ccc',
        borderRightWidth: 1,
        width: 50,
    },
    input: {
        padding: 10,
        flex: 1,
        fontSize: 16,
        fontFamily: 'Lato-Regular',
        color: '#333',
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputField: {
        padding: 10,
        marginTop: 5,
        marginBottom: 10,
        width: windowWidth / 1.5,
        height: windowHeight / 15,
        fontSize: 16,
        borderRadius: 10,
        borderWidth: 1,
    },
});
