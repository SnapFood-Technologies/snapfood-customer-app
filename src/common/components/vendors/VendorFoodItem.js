import React, { useState, useEffect } from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import { connect } from 'react-redux';
import moment from 'moment';
import Swipeout from 'react-native-swipeout';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { translate } from '../../../common/services/translate';
import Theme from '../../../theme';
import Config from '../../../config';
import { toggleProductFavourite } from '../../../store/actions/vendors';
import { updateCartItems, removeProductFromCart } from '../../../store/actions/shop';
import { isEmpty } from '../../services/utility';
import DiscountLabel from './DiscountLabel';
import PriceLabel from './PriceLabel';
import { mixpanel } from '../../../AppRoot';

const VendorFoodItem = (props) => {
    const { data, isFav, cartCnt, type, onSelect, onFavChange, style, diabled, cartEnabled, } = props

    const onPressFav = () => {
		mixpanel.track(isFav ? 'Remove Products From Favorite' : 'Add Products To Favorite');
        props.toggleProductFavourite(data.id, isFav === 1 ? 0 : 1).then((res) => {
            data.isFav = isFav === 1 ? 0 : 1
            onFavChange(data)
        })
            .catch((error) => {
                
            })
    }

    const onRemoveFromCart = async () => {
        try {
            await props.removeProductFromCart(data, true);
        } catch (error) {
            
        }
    }

    const getDateLimit = () => {
        let left_days = moment(data.end_time, "YYYY-MM-DD  hh:mm:ss").diff(moment(new Date()), 'days');
        return `${left_days} days left`;
    }

    // 
    const getImagePath = () => {
        if (data.use_full_image == 1 && !isEmpty(data.new_image_path)) {
            return `${Config.IMG_BASE_URL}${data.new_image_path}`
        }
        return Config.IMG_BASE_URL + (type == 'offer' ? (data.product ? data.product.image_thumbnail_path : '') : data.image_thumbnail_path) + `?w=200&h=200`
    }

    const hasOveflow = () => {
        if (data.title && data.title.length > 15 && (data.available != 1 || data.discount_price && data.discount_price > 0)) {
            return true;
        }
        if (data.title && data.title.length > 10 && data.description && data.description.length > 24 && data.available != 1 && data.discount_price && data.discount_price > 0) {
            return true;
        }
        if (data.title && data.title.length > 36 && data.description && data.description.length > 24) {
            return true;
        }
        return false;
    }

    if (data.price == 690) {
        
    }
    
    return <Swipeout
        autoClose={true}
        disabled={cartEnabled != true || cartCnt == 0}
        backgroundColor={Theme.colors.white}
        style={{ width: '100%', marginBottom: 12, }}
        right={[
            {
                text: translate('address_list.delete'),
                backgroundColor: '#f44336',
                underlayColor: 'rgba(0, 0, 0, 0.6)',
                onPress: () => {
                    onRemoveFromCart()
                },
            },
        ]}
    >
        <TouchableOpacity disabled={data.available != 1 || diabled == true} onPress={() => onSelect(data)}
            style={[
                Theme.styles.row_center, styles.container,
                { backgroundColor: data.available == 1 ? '#FAFAFC' : '#EFEFF3' },
                cartEnabled == true && cartCnt > 0 && styles.cartBorder,
                style
            ]}>
            <View style={[Theme.styles.col_center, { flex: 1 }]}>
                <View style={[Theme.styles.row_center_start, { width: '100%', marginBottom: 4, }]}>
                    <View style={[Theme.styles.row_center_start, { flex: 1, flexWrap: 'wrap', marginRight: 10 }]}>
                        {cartEnabled == true && cartCnt > 0 &&
                            <Text style={[styles.cartCnt, { marginRight: 5 }]} numberOfLines={1}>
                                {cartCnt} x
                            </Text>
                        }
                        <Text style={[styles.title, hasOveflow() && { fontSize: 17, lineHeight: 19 }, data.available != 1 && { textDecorationLine: 'line-through', }]} numberOfLines={hasOveflow() ? 2 : 3} ellipsizeMode={'tail'}>
                            {data.title}
                        </Text>
                        {
                            !hasOveflow() && <DiscountLabel price={data.price} discount_price={data.discount_price}  />
                        }

                        {data.available != 1 && <View style={{ width: '100%' }}>
                            <Text style={[styles.unavailable, hasOveflow() && { fontSize: 15 },]} numberOfLines={2}>{translate('vendor_profile.unavailable_item_title')}</Text></View>}
                    </View>
                </View>
                <View style={[Theme.styles.row_center, Theme.styles.w100]}>
                    <View style={[Theme.styles.col_center_start, { flex: 1, alignItems: 'flex-start' }]}>
                    <PriceLabel price={data.price} discount_price={data.discount_price} />
                        {
                            !isEmpty(data.description) &&
                            <Text style={[styles.descTxt, hasOveflow() && { fontSize: 16, marginTop: 3, marginBottom: 3 },]}
                                numberOfLines={hasOveflow() ? 1 : 3}>{data.description}</Text>
                        }

                    </View>
                </View>
            </View>
            <View style={[Theme.styles.col_center_start, styles.imgView]}>
                <FastImage
                    source={{ uri: getImagePath() }}
                    style={styles.img}
                    resizeMode={FastImage.resizeMode.cover}
                />
                {
                    props.isLoggedIn &&
                    <TouchableOpacity disabled={data.available != 1} style={styles.favBtn} onPress={onPressFav}>
                        <AntDesign name="heart" size={20} color={isFav ? Theme.colors.cyan2 : Theme.colors.gray5} />
                    </TouchableOpacity>
                }
            </View>
        </TouchableOpacity>
    </Swipeout>;
};

const styles = StyleSheet.create({
    container: { width: '100%', height: 132, alignItems: 'flex-start', borderRadius: 15, padding: 12, marginRight: 16, },
    imgView: { marginLeft: 12 },
    img: { width: 108, height: 108, borderRadius: 12, resizeMode: 'cover' },
    title: { marginRight: 12, fontSize: 18, lineHeight: 21, color: Theme.colors.text, fontFamily: Theme.fonts.semiBold, },
    descTxt: { marginTop: 4, marginBottom: 4, fontSize: 17, color: Theme.colors.gray7, fontFamily: Theme.fonts.medium, },
    priceTxt: { fontSize: 18, color: Theme.colors.text, fontFamily: Theme.fonts.bold, },
    date_limit: { fontSize: 16, fontFamily: Theme.fonts.semiBold, color: '#F55A00', marginBottom: 3 },
    unavailable: { fontSize: 16, fontFamily: Theme.fonts.semiBold, color: '#F55A00', },
    cartCnt: { fontSize: 18, lineHeight: 20, color: Theme.colors.cyan2, fontFamily: Theme.fonts.semiBold, },
    cartBorder: { borderTopLeftRadius: 4, borderBottomLeftRadius: 4, borderLeftWidth: 5, borderLeftColor: Theme.colors.cyan2, },
    favBtn: { position: 'absolute', top: 8, right: 8, }
})

function arePropsEqual(prevProps, nextProps) {
    if ((prevProps.food_id == nextProps.food_id && prevProps.isFav != nextProps.isFav) ||
        prevProps.food_id != nextProps.food_id ||
        prevProps.type != nextProps.type ||
        prevProps.diabled != nextProps.diabled ||
        (prevProps.food_id == nextProps.food_id && prevProps.cartCnt != nextProps.cartCnt) ||
        (prevProps.food_id == nextProps.food_id && prevProps.diabled != nextProps.diabled)
    ) {
        
        return false;
    }
    return true;
}

const mapStateToProps = ({ app, shop }) => ({
    isLoggedIn: app.isLoggedIn,
    cartItems: shop.items,
});
export default connect(mapStateToProps, { toggleProductFavourite, updateCartItems, removeProductFromCart })(React.memo(VendorFoodItem, arePropsEqual));
