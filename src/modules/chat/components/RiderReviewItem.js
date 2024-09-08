import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import FastImage from 'react-native-fast-image';
import StarRating from 'react-native-star-rating';
import Theme from "../../../theme";
import { isEmpty, getImageFullURL } from '../../../common/services/utility';
import { translate } from '../../../common/services/translate';

const RiderReviewItem = ({ id, data }) => {
    return (
        <View style={[Theme.styles.col_center, styles.container]}>
            <View style={[Theme.styles.row_center,]}>
                <FastImage
                    source={{ uri: getImageFullURL(data.customer?.photo) }}
                    style={styles.avatarImg}
                    resizeMode={FastImage.resizeMode.cover}
                />
                <View>
                    <Text style={styles.name}>{data.customer?.username || data.customer?.full_name}</Text>
                    <StarRating
                        disabled={true}
                        maxStars={5}
                        rating={data.rating || 0}
                        starSize={16}
                        fullStarColor={Theme.colors.cyan2}
                        emptyStar={'star'}
                        emptyStarColor={Theme.colors.gray7}
                        starStyle={{ marginRight: 4 }}
                    />
                </View>
            </View>
            <Text style={styles.tagTxt}>{data.rating_category == 'undefined' ? '' : data.rating_category}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 14, marginRight: 12, height: 92, minWidth: 165, borderRadius: 12, backgroundColor: Theme.colors.gray9 },
    avatarImg: { height: 30, width: 30, borderRadius: 7, marginRight: 8 },
    name: { fontSize: 14, fontFamily: Theme.fonts.bold, color: Theme.colors.text },
    tagTxt: { marginTop: 10, fontSize: 18, fontFamily: Theme.fonts.bold, color: Theme.colors.text },
    dot: { marginHorizontal: 5, width: 6, height: 6, borderRadius: 3, backgroundColor: Theme.colors.gray7 }
});

function arePropsEqual(prevProps, nextProps) {
    return prevProps.id == nextProps.id;
}

export default React.memo(RiderReviewItem, arePropsEqual); 
