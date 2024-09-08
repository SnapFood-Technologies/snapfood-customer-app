import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, StatusBar, TouchableOpacity, Image, } from 'react-native';
import FastImage from 'react-native-fast-image';
import moment from 'moment';
import { connect } from 'react-redux'
import { getFriends } from '../../../store/actions/app';
import { setPaymentInfoCart, } from '../../../store/actions/shop';
import { translate } from '../../../common/services/translate';
import Theme from '../../../theme';
import RadioBtn from '../../../common/components/buttons/radiobtn';
import Header1 from '../../../common/components/Header1';
import RouteNames from '../../../routes/names';
import NoFriends from '../../chat/components/NoFriends';
import { getImageFullURL } from '../../../common/services/utility';
import { findZodiacSign } from '../../../common/components/ZodiacSign';

const CartSplitScreen = (props) => {
    const [loading, setLoading] = useState(null)
    const [all_friends, setFriends] = useState([])

    useEffect(() => {
        props.setPaymentInfoCart({
            ...props.payment_info,
            splits: []
        })
        setLoading(true);
        props.getFriends('accepted').then(data => {
            setFriends(data)
            setLoading(false);
        })
            .catch(err => {
                setLoading(false);
                console.log('getFriends', err)
            })
    }, [])


    const _renderListItem = (item, type, index) => {
        const onPress = () => {
            let tmp = props.splits.slice(0, props.splits.length)
            let foundUser = props.splits.findIndex(i => i.id == item.id)
            if (foundUser >= 0) {
                tmp.splice(foundUser, 1)
            }
            else {
                tmp.push(item)
            }
            props.setPaymentInfoCart({
                ...props.payment_info,
                splits: tmp
            })
        }
        return (
            <TouchableOpacity key={index} onPress={onPress} style={[Theme.styles.flex_between, styles.listItem,]}>
                <View style={Theme.styles.row_center}>
                    <FastImage
                        style={styles.avatar}
                        source={{ uri: getImageFullURL(item.photo) }}
                        resizeMode={FastImage.resizeMode.cover}
                    />
                    <Text style={styles.name}>{item.username || item.full_name}</Text>
                    {item.birthdate != null && findZodiacSign(moment(item.birthdate).toDate())}
                </View>
                <View style={Theme.styles.row_center}>
                    <RadioBtn onPress={onPress} checked={props.splits.findIndex(i => i.id == item.id) >= 0} />
                </View>
            </TouchableOpacity>
        )
    }

    const getSelectedCnt = () => {
        let found = props.splits.filter(i => i.id != props.user.id)
        return found.length;
    }

    const goSplitOrder = () => {

        let tmp = props.splits.slice(0, props.splits.length)
        let found = tmp.findIndex(i => i.id == props.user.id)
        if (found < 0) {
            tmp = [props.user].concat(tmp)
        }

        props.setPaymentInfoCart({
            ...props.payment_info,
            splits: tmp
        })
        props.navigation.navigate(RouteNames.SplitOrderScreen)
    }

    return (
        <View style={styles.container}>
            <Header1
                onLeft={() => { props.navigation.goBack() }}
                style={{ paddingHorizontal: 20 }}
                title={translate('cart.split_with')}
            />
            <View style={styles.formView} >
                <FlatList
                    style={styles.listContainer}
                    data={all_friends}
                    numColumns={1}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({ item }) => _renderListItem(item, 'radio')}
                    ItemSeparatorComponent={() => <View style={styles.spaceCol} />}
                    ListFooterComponent={() => <View style={{ height: 80 }}></View>}
                    ListEmptyComponent={() => loading == false && <NoFriends title={translate('social.no_snapfooders_from_split_bill')} desc={translate('social.no_snapfooders_desc_from_split_bill')} />}
                    onEndReachedThreshold={0.3}
                />
            </View>
            {
                getSelectedCnt() > 0 && <View style={[Theme.styles.col_center, styles.bottomBtnView]}>
                    <TouchableOpacity onPress={goSplitOrder} style={[Theme.styles.row_center, styles.bottomBtn]}>
                        <Text style={[styles.bottomBtnTxt1]}>{getSelectedCnt()} {getSelectedCnt() == 1 ? translate('cart.selected_one') : translate('cart.selected_many')}</Text>
                        <Text style={[styles.bottomBtnTxt2]}>{translate('proceed')}</Text>
                    </TouchableOpacity>
                </View>
            }
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1, flexDirection: 'column', alignItems: 'center', paddingVertical: 20, backgroundColor: Theme.colors.white,
    },
    header: {
        width: '100%', height: 70, elevation: 6, paddingBottom: 8, marginBottom: 24, alignItems: 'flex-end', flexDirection: 'row',
    },
    formView: {
        flex: 1, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', width: '100%',
    },
    clearBtn: { fontSize: 14, fontFamily: Theme.fonts.semiBold, color: Theme.colors.cyan2 },
    listItem: { height: 54, width: '100%', borderRadius: 15, paddingLeft: 16, paddingRight: 16, backgroundColor: '#FAFAFC' },
    avatar: {
		width: 30,
		height: 30,
		borderRadius: 15,
		marginRight: 10,
		backgroundColor: '#FAFAFC'
	},
	name: {
		fontSize: 17,
		color: Theme.colors.text,
		marginRight: 4,
		fontFamily: Theme.fonts.semiBold,
	},
    bottomBtnView: { height: 55, width: '100%', paddingHorizontal: 20, position: 'absolute', bottom: 40, backgroundColor: 'transparent', },
    bottomBtn: { justifyContent: 'space-between', backgroundColor: Theme.colors.btnPrimary, height: 50, width: '100%', paddingHorizontal: 20, borderRadius: 12, },
    bottomBtnTxt1: { fontSize: 16, fontFamily: Theme.fonts.medium, color: Theme.colors.white },
    bottomBtnTxt2: { fontSize: 18, fontFamily: Theme.fonts.semiBold, color: Theme.colors.white },
    spaceCol: {
        height: 10
    },
    listContainer: {
        flex: 1,
        width: '100%',
        paddingHorizontal: 20
    },
});


const mapStateToProps = ({ app, shop }) => ({
    user: app.user,
    payment_info: shop.payment_info,
    splits: shop.payment_info.splits || [],
});

export default connect(mapStateToProps, {
    setPaymentInfoCart, getFriends,
})(CartSplitScreen);
