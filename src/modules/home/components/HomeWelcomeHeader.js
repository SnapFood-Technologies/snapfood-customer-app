import React, { useEffect, useMemo } from 'react';
import { TouchableOpacity, Text, StatusBar, Platform, View, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import { getImageFullURL, isEmpty, ucFirst } from '../../../common/services/utility';
import Theme from '../../../theme';
import { AppText, AppBadge, RoundIconBtn } from '../../../common/components';
import { useSelector } from 'react-redux';
import Config from '../../../config';

const HomeWelcomeHeader = ({ onGoProfile }) => {
    const user = useSelector(state => state.app.user || {});
    const systemSettings = useSelector(state => state.app.systemSettings || {});
    const language = useSelector(state => state.app.language || 'sq');

    const title = useMemo(() => {
        let defaultMsg = '';
        if (language == 'sq') {
            defaultMsg = systemSettings.welcome_home_header_title_sq || '';
        }
        else if (language == 'en') {
            defaultMsg = systemSettings.welcome_home_header_title_en || '';
        }
        else if (language == 'it') {
            defaultMsg = systemSettings.welcome_home_header_title_it || '';
        }

        let firstName = '';
        if (user.full_name != null && user.full_name.trim() != '') {
            let tmpWords = user.full_name.trim().split(' ');
            if (tmpWords.length > 0) {
                firstName = '' + ucFirst(tmpWords[0]);
            }
        }
        defaultMsg = defaultMsg.replace('{user}', firstName);

        return defaultMsg;
    }, [user, systemSettings, language])

    return <View style={[Theme.styles.row_center, styles.header]}>
        <AppText style={styles.title} numberOfLines={2}>{title}</AppText>
        <TouchableOpacity style={[Theme.styles.col_center, styles.profileBtn]}
            onPress={() => onGoProfile()}
        >
            <FastImage
                source={{ uri: getImageFullURL(user.photo) }}
                style={{
                    borderRadius: 30,
                    width: 52,
                    height: 52,
                    resizeMode: 'contain',
                }}
            />
        </TouchableOpacity>
    </View>
};

const styles = StyleSheet.create({
    header: { height: 52, width: '100%', paddingHorizontal: 20, marginTop: Config.isAndroid ? 43 : 49, },
    profileBtn: { marginLeft: 10,  },
    title: { flex: 1, textAlign: 'left', fontSize: 19, lineHeight: Config.isAndroid ? 21 : 25, color: '#000', fontFamily: Theme.fonts.semiBold, }
})

function arePropsEqual(prevProps, nextProps) {
    return true;
}

export default React.memo(HomeWelcomeHeader, arePropsEqual);
