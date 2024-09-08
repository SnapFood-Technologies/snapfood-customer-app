import React, { useEffect, memo } from 'react';
import { Keyboard, StyleSheet, Image, Text, View } from 'react-native';
import { height, width } from 'react-native-dimension';
import Theme from '../../theme'
 

const Authpage = memo(({ onKeyboardDidShow, onKeyboardDidHide, children }) => {
    
    useEffect(()=>{
        Keyboard.addListener('keyboardDidShow', onKeyboardDidShow);
		Keyboard.addListener('keyboardDidHide', onKeyboardDidHide);
		 
		return () => {
			Keyboard.removeListener('keyboardDidShow', onKeyboardDidShow);
			Keyboard.removeListener('keyboardDidHide', onKeyboardDidHide);
		};
    }, [])
  
    const _renderBottomView = () => {
        return (
            <View style={[ styles.bottomView]}>
                 {children}
            </View>
        );
    };
    return (
        <View style={[Theme.styles.col_center, styles.container]}>
            <Image style={styles.bg_img} source={require('../../common/assets/images/auth/login_bg.png')}   />
            <View style={{flex: 1}}/>
            {_renderBottomView()} 
        </View> 
    );
});

const styles = StyleSheet.create({ 
    container: { flex: 1, width:'100%',  },
    bg_img : {position: 'absolute', top: 0, left: 0},
    bottomView: {
        width: width(100), height: '80%', alignItems:'center', elevation: 4, borderTopLeftRadius: 30, borderTopRightRadius: 30, backgroundColor: Theme.colors.white,
    },
});

export default Authpage;
