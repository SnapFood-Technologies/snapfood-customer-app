import React, { useState, useEffect } from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import { connect } from 'react-redux';
import Theme from '../../../theme';
import Config from '../../../config';
import { isEmpty } from '../../../common/services/utility';


const FoodMsgItem = (props) => {
    const { msg_id, data, onSelect, style } = props

    console.log('data.image_thumbnail_path ', data.image_thumbnail_path)
    return <View
        style={[Theme.styles.col_center, styles.container, style]}>

        <View style={[Theme.styles.col_center_start, { width: '100%', marginBottom: 4, }]}>
            <Text style={[styles.title]} numberOfLines={1}>
                {data.title}
            </Text>
            <View style={[Theme.styles.flex_between, ]}>
                <View style={[Theme.styles.flex_1]}>
                    <Text style={[styles.priceTxt]}>
                        {(data.price != null && parseInt(data.price) >= 0) ? parseInt(data.price) : 0} L</Text>
                    <Text style={[styles.descTxt]} numberOfLines={2}>{data.description}</Text>
                </View>
                {
                    !isEmpty(data.image_thumbnail_path) &&
                    <View style={[Theme.styles.col_center_start, styles.imgView]}>
                        <FastImage
                            source={{ uri: Config.IMG_BASE_URL + data.image_thumbnail_path + `?w=200&h=200` }}
                            style={styles.img}
                            resizeMode={FastImage.resizeMode.cover}
                        />
                    </View>
                }
            </View>
        </View>
    </View>;
};

const styles = StyleSheet.create({
    container: { width: '100%', alignItems: 'flex-start', marginRight: 16, },
    imgView: { marginLeft: 12 },
    img: { width: 78, height: 78, borderRadius: 12, resizeMode: 'cover' },
    title: { width: '100%', marginBottom: 8, fontSize: 17, lineHeight: 19, color: Theme.colors.text, fontFamily: Theme.fonts.semiBold, },
    descTxt: { marginTop: 6, marginBottom: 6, fontSize: 15, color: Theme.colors.gray7, fontFamily: Theme.fonts.medium, },
    priceTxt: { fontSize: 18, color: Theme.colors.text, fontFamily: Theme.fonts.bold, },
})

function arePropsEqual(prevProps, nextProps) {
    return prevProps.msg_id == nextProps.msg_id;
}

export default React.memo(FoodMsgItem, arePropsEqual);
