import React, { useEffect, memo } from 'react';
import { Keyboard, StyleSheet, Image, Text, View } from 'react-native';
import { height, width } from 'react-native-dimension';
import Feather from 'react-native-vector-icons/Feather';
import { translate } from '../../../common/services/translate';
import Theme from '../../../theme';
import Header1 from '../../../common/components/Header1';
import { RoundIconBtn } from '../../../common/components';


const HelpPage = memo(({ title, titleStyle = {}, navigation, children, bodystyle }) => {
    return (
        <View style={[Theme.styles.col_center, styles.container]}>
            <Image style={styles.bg_img} source={require('../../../common/assets/images/help_bg.png')} />
            <Header1
                style={{ marginTop: 20, marginBottom: 0, paddingHorizontal: 20 }}
                onLeft={() => { navigation.goBack() }}
                title={title ?? translate('help.title')}
                titleStyle={{ color: '#fff', ...titleStyle }}
                left={<RoundIconBtn style={{ ...styles.headerBtn, }} icon={<Feather name='chevron-left' size={22} color={Theme.colors.text} />} onPress={() => {
                    navigation.goBack()
                }} />}
            />
            <View style={[Theme.styles.col_center, styles.bottomView, bodystyle]}>
                {children}
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    container: { flex: 1, width: '100%', },
    bg_img: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', resizeMode: 'cover' },
    bottomView: {
        width: width(100), flex: 1, alignItems: 'center', elevation: 4, borderTopLeftRadius: 30, borderTopRightRadius: 30, backgroundColor: Theme.colors.white,
    },
    headerBtn: { width: 33, height: 33, borderRadius: 8, backgroundColor: Theme.colors.white, },
});

export default HelpPage;
