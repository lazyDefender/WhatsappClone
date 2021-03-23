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
    Image,
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
import S3 from 'aws-s3';
import AWS from 'aws-sdk';

import { messagesByChatRoom } from '../src/graphql/queries';
import { onCreateMessage } from '../src/graphql/subscriptions';
// import { AWS_ACCESS_KEY_ID, AWS_SECRET_KEY } from '@env';


import ChatMessage from "../components/ChatMessage";
import BG from '../assets/images/BG.png';
import InputBox from "../components/InputBox";
import { getUser } from './queries';
import { updateUser } from '../src/graphql/mutations';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import {
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_KEY,
    AWS_BUCKET,
    AWS_REGION,
} from '../env'

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

const ProfileScreen = () => {
    const [username, setUsername] = useState('')
    const [id, setId] = useState(null)
    const [imageSource, setImageSource] = useState('')
    const [imageKey, setImageKey] = useState('')
    const [status, setStatus] = useState('')
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
            const { id, name, imageUri, status } =  userData.data.getUser
            // 

            setUsername(name)
            setId(id)
            setImageSource(imageUri)
            setStatus(status)
        }
        getCurrentUser()
    }, [])
  return (
    <ScrollView style={styles.container}>
        <View style={{...styles.userInfoSection, alignItems: 'flex-start'}}>
            {imageSource ? <Image
                style={{
                    height: 100,
                    width: 100,
                    borderRadius: 50,
                }}
                source={{
                uri: imageSource,
                }}
            /> : <View style={{
                        height: 100,
                        width: 100,
                        borderRadius: 50,
                        backgroundColor: "#345",
                        transform: [{
                            translateY: -50,
                        }]
                    }}>
                </View>}
            
            <Button
                title='Змінити фото'
                onPress={async () => {
                    const {uri, name} = await DocumentPicker.getDocumentAsync({
                        type: 'image/*',
                    })
                    const config = {
                        keyPrefix: "uploads/",
                        bucket: AWS_BUCKET,
                        region: AWS_REGION,
                        accessKey: AWS_ACCESS_KEY_ID,
                        secretKey: AWS_SECRET_KEY,
                        successActionStatus: 201
                    }
                    const response = await RNS3.put({
                        uri,
                        name,
                        type: 'image/'+name.split('.')[1]
                    }, config)
                    console.log(response.body.postResponse)
                    await API.graphql({ query: updateUser, variables: {input: {
                        id,
                        imageUri: response.body.postResponse.location,
                    }}});
                    setImageKey(response.body.postResponse.key)
                    setImageSource(response.body.postResponse.location)

                }}
            />
            <Button
                title='Видалити фото'
                onPress={async () => {
                    await API.graphql({ query: updateUser, variables: {input: {
                        id,
                        imageUri: null,
                    }}});
                    
 
/* If the file that you want to delete it's in your bucket's root folder, don't provide any dirName in the config object */
 
//In this case the file that we want to delete is in the folder 'photos' that we referred in the config object as the dirName
 
                    const config = {
                        bucketName: AWS_BUCKET,
                        dirName: 'uploads',
                        region: AWS_REGION,
                        accessKeyId: AWS_ACCESS_KEY_ID,
                        secretAccessKey: AWS_SECRET_KEY,
                    }
                    const S3Client = new S3(config);
 
                    try {
                        var bucketInstance = new AWS.S3({
                            region: AWS_REGION,
                            accessKeyId: AWS_ACCESS_KEY_ID,
                            secretAccessKey: AWS_SECRET_KEY,
                        });
                        var params = {
                            Bucket: AWS_BUCKET,
                            Key: imageKey,
                        };
                        bucketInstance.deleteObject(params, function (err, data) {
                            if (data) {
                                console.log("File deleted successfully");
                            }
                            else {
                                console.log("Check if you have sufficient permissions : "+err);
                            }
                        });
                        setImageSource('')
                    }
                    catch(e){
                        console.log('errr',e)
                    }
                    
                }}
            />
            
            <Text>Ім'я: {username}</Text>
            <TextInput
                value={status}
                onChangeText={text => setStatus(text)}
            />
            <Button
                title='Зберегти зміни'
                onPress={async () => {
                    await API.graphql({ query: updateUser, variables: {input: {
                        id,
                        status,
                    }}});
                }}
            />
            <Button
                title='Видалити профіль'
                onPress={async () => {
                    const user = await Auth.currentAuthenticatedUser()
                    await user.deleteUser()
                }}
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
