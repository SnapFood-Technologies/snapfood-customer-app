import React, { memo } from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import FastImage from 'react-native-fast-image';
import Theme from "../../../theme";
import { isEmpty, getImageFullURL } from '../../../common/services/utility';
import { translate } from '../../../common/services/translate';

const SuggestedUserItem = ({ id, full_name, photo, invited, style, onViewProfile }) => {
    
    return (
        <View style={[Theme.styles.col_center, {justifyContent: 'flex-start', marginRight: 15, }]}> 
            <TouchableOpacity activeOpacity={0.9} style={[Theme.styles.col_center, styles.userItemView, style]} onPress={onViewProfile}>
                <FastImage
                    style={styles.userItemAvatar}
                    source={{ uri: getImageFullURL(photo) }}
                    resizeMode={FastImage.resizeMode.cover} />
                <View style={[Theme.styles.col_center,]}>
                    <Text style={styles.userItemName}>{full_name}</Text>
                    <TouchableOpacity onPress={onViewProfile}>
                        <Text style={styles.userItemBtnName}>{translate('chat.view_profile')}</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
            {
                invited == true &&
                <View style={[Theme.styles.col_center, styles.invited]}>
                    <Text style={styles.invitedTxt}>{translate('chat.already_invited')}</Text>
                </View>
            }
        </View>
    );
}

const styles = StyleSheet.create({
    userItemView: { width: 120, paddingVertical: 12, borderRadius: 12, backgroundColor: Theme.colors.gray8 },
    userItemAvatar: { width: 50, height: 50, borderRadius: 25, },
    userItemName: { marginTop: 8, fontSize: 15, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text },
    userItemBtnName: { marginTop: 10, fontSize: 15, fontFamily: Theme.fonts.semiBold, color: Theme.colors.cyan2 },
    invited: { marginVertical: 10, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8, backgroundColor: Theme.colors.red1 },
    invitedTxt: { fontSize: 14, lineHeight: 16, fontFamily: Theme.fonts.medium, color: Theme.colors.white }
});

function arePropsEqual(prevProps, nextProps) {
    if (prevProps.id != nextProps.id ||
        (prevProps.id == nextProps.id && prevProps.full_name != nextProps.full_name) ||
        (prevProps.id == nextProps.id && prevProps.photo != nextProps.photo)
    ) {
        
        return false;
    }
    return true;
}

export default React.memo(SuggestedUserItem, arePropsEqual); 
