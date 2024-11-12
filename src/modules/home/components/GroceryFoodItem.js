import React, { useEffect, useState } from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import { connect } from 'react-redux';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Theme from '../../../theme';
import Config from '../../../config';
import { toggleProductFavourite } from '../../../store/actions/vendors';
import { translate } from '../../../common/services/translate';
import PriceLabel from '../../../common/components/vendors/PriceLabel';

const GroceryFoodItem = (props) => {
    const { data, isFav, cartCnt, onSelect, onFavChange, onAddCart, onRmvCart, style, title_lines, hideFav, diabled } = props

    const onPressFav = () => {
        props.toggleProductFavourite(data.id, isFav == 1 ? 0 : 1).then((res) => {
            data.isFav = isFav == 1 ? 0 : 1
            onFavChange(data)
        })
            .catch((error) => {
                
            })
    }

    const getImage = () => {
        if (data.image_path == null || data.image_path == '') {
            return props.vendorData.logo_thumbnail_path;
        }
        return data.image_path;
    }

    

    return <TouchableOpacity disabled={data.available != 1} onPress={() => onSelect(data)}
        style={[Theme.styles.col_center, styles.container, style]}>
        <View style={[Theme.styles.col_center, styles.imgView]}>
            <FastImage
                source={{ uri: Config.IMG_BASE_URL + getImage() + `?w=200&h=200` }}
                style={styles.img}
                resizeMode={FastImage.resizeMode.cover}
            />
            {
                hideFav != true && props.isLoggedIn && <TouchableOpacity onPress={onPressFav} style={[Theme.styles.col_center, styles.favView]}>
                    <AntDesign name="heart" size={12} color={data.isFav ? Theme.colors.cyan2 : Theme.colors.gray5} />
                </TouchableOpacity>
            }
            {
                ((hideFav != true) && (cartCnt) > 0) && <View style={[Theme.styles.col_center, styles.cartCntView]}>
                    <Text style={styles.cartCnt}>{cartCnt}</Text>
                </View>
            }
        </View>
        <View style={[{ width: '100%', }]}>
            <Text style={[styles.title, data.available != 1 && { textDecorationLine: 'line-through', }]} numberOfLines={title_lines ? title_lines : 2}>{data.title}</Text>
        </View>
        <View style={[Theme.styles.row_center, Theme.styles.w100, { marginTop: 6 }]}>
            <View style={[Theme.styles.row_center_start, { flex: 1, }]}>
                <PriceLabel
                    id='grocery-item'
                    price={data.price}
                    discount_price={data.discount_price}
                    priceStyle={{
                        fontSize: 18, color: Theme.colors.text, fontFamily: Theme.fonts.bold,
                        textDecorationLine: (data.available != 1 ? 'line-through' : 'none')
                    }}
                    discountStyle={{marginLeft: 4, fontSize: 16 }}
                />
            </View>
            {
                (cartCnt) > 0 &&
                <TouchableOpacity disabled={diabled == true} onPress={() => onRmvCart(data)} style={{ marginRight: 20 }}>
                    <AntDesign name="minuscircle" size={22} color={Theme.colors.gray7} />
                </TouchableOpacity>
            }
            {(data.available == 1) &&
                <TouchableOpacity disabled={diabled == true} onPress={() => onAddCart(data)}>
                    <AntDesign name="pluscircle" size={22} color={Theme.colors.text} />
                </TouchableOpacity>
            }
        </View>
        {data.available != 1 && <Text style={[styles.unavailable]} numberOfLines={1}>{translate('vendor_profile.unavailable_item_title')}</Text>}
    </TouchableOpacity>;
};

const styles = StyleSheet.create({
    container: {
        width: '100%', height: 180, alignItems: 'flex-start', borderRadius: 15, backgroundColor: '#FAFAFC', padding: 15, marginRight: 16,
    },
    imgView: { width: '100%', height: 104, marginBottom: 6, borderRadius: 12, backgroundColor: Theme.colors.white, },
    img: { width: '100%', height: '100%', borderRadius: 12, resizeMode: 'contain' },
    title: { fontSize: 17, color: Theme.colors.text, fontFamily: Theme.fonts.semiBold, },
    unavailable: { fontSize: 10, fontFamily: Theme.fonts.semiBold, color: '#F55A00', },
    unitTxt: { marginTop: 8, marginBottom: 8, fontSize: 13, color: Theme.colors.gray7, fontFamily: Theme.fonts.medium, },
    cartCnt: { fontSize: 11, lineHeight: 10, color: Theme.colors.red1, fontFamily: Theme.fonts.medium, },
    cartCntView: { position: 'absolute', top: 6, left: 6, width: 20, height: 20, backgroundColor: Theme.colors.white, borderWidth: 1, borderRadius: 10, borderColor: Theme.colors.gray6, },
    favView: { position: 'absolute', top: 6, right: 6, width: 20, height: 20, backgroundColor: Theme.colors.white, borderWidth: 1, borderRadius: 4, borderColor: Theme.colors.gray6, },
})


function arePropsEqual(prevProps, nextProps) {
    if ((prevProps.food_id == nextProps.food_id && prevProps.isFav != nextProps.isFav) ||
        prevProps.food_id != nextProps.food_id ||
        prevProps.diabled != nextProps.diabled ||
        (prevProps.food_id == nextProps.food_id && prevProps.cartCnt != nextProps.cartCnt)
    ) {

        
        return false;
    }
    return true;
}

const mapStateToProps = ({ app, shop }) => ({
    isLoggedIn: app.isLoggedIn,
    cartItems: shop.items,
    vendorData: shop.vendorData,
});
export default connect(mapStateToProps, { toggleProductFavourite })(React.memo(GroceryFoodItem, arePropsEqual));
