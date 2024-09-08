import React from 'react';
import styles from '../screens/styles';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Dimensions, ImageBackground, View} from 'react-native';
import AuthHeader from './AuthHeader';
import Config from '../../../config';

const {width, height} = Dimensions.get('screen');
const imageWidth = width * 0.8;
const imageHeight = width * 0.8;

const AuthContainer = (props) => {

    return <View style={{flex: 1, width, height}}>
        <ImageBackground
            source={require('../../../common/assets/images/auth/auth_background.png')}
            style={{flex: 1, width, height, marginTop: -10}}
            imageStyle={{width: imageWidth, height: imageHeight}}
            resizeMode={'contain'}
        >
            <AuthHeader onPress={props.onBackPress}/>
            <KeyboardAwareScrollView
                style={styles.container}
                contentContainerStyle={Config.isAndroid ? {} : {flex: 1, justifyContent: 'center'}}
                extraScrollHeight={65}
                enableOnAndroid={true}
                keyboardShouldPersistTaps='handled'
            >
                {props.children}
            </KeyboardAwareScrollView>
        </ImageBackground>
    </View>;

};

export default AuthContainer;
