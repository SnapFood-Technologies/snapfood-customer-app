import React from 'react';
import { StyleSheet, TouchableOpacity, StatusBar, KeyboardAvoidingView, View, Text, FlatList, Image, SafeAreaView } from 'react-native';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import moment from 'moment';
import FastImage from 'react-native-fast-image';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AntDesign from 'react-native-vector-icons/AntDesign'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { height, width } from 'react-native-dimension';
import Theme from "../../../theme";
import RouteNames from '../../../routes/names';
import { AppText } from '../../../common/components';
import { translate } from '../../../common/services/translate';
import { getImageFullURL } from '../../../common/services/utility';

const TransferDetailsScreen = (props) => {
    const data = props.route?.params?.data;

    const renderHeader = () => {
        return (
            <View style={[Theme.styles.row_center, styles.header]}>
                <TouchableOpacity
                    onPress={() => {
                        props.navigation.goBack();
                    }}
                >
                    <AntDesign name='close' color={Theme.colors.text} size={20} />
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[Theme.styles.col_center, styles.screen]}>
            <TouchableOpacity
                style={[Theme.styles.col_center, styles.overlay]}
                activeOpacity={1}
                onPress={() => {
                    props.navigation.goBack()
                }}
            />
            <View style={[Theme.styles.col_center, styles.container]}>
                {renderHeader()}
                <KeyboardAwareScrollView style={[{ flex: 1, width: '100%', paddingHorizontal: 20 }]} keyboardShouldPersistTaps='handled'>
                    <View style={[Theme.styles.row_center, { width: '100%' }]}>
                        <View style={{ flex: 1 }}>
                            <AppText style={styles.amount}>{data.amount > 0 ? '+' : ''}{data.amount} L</AppText>
                            <View style={{ marginTop: 4 }} />
                            <AppText style={styles.subtitle}>
                                {data?.category == 'transfer_deposit' ?
                                    translate('transfer_details.transfer_to') : translate('transfer_details.transfer_from')} {data.user_data?.full_name}
                            </AppText>
                            <View style={{ marginTop: 4 }} />
                            <AppText style={styles.subtitle}>{moment(data?.created_at, "YYYY-MM-DD hh:mm:ss").format("YYYY-MM-DD | hh:mm A")}</AppText>
                        </View>
                        <View style={[Theme.styles.col_center, styles.photoView]}>
                            <FastImage
                                source={{ uri: getImageFullURL(data.user_data?.photo) }}
                                style={styles.avatarImg}
                                resizeMode={FastImage.resizeMode.cover}
                            />
                            <View style={[Theme.styles.col_center, styles.imgArrow]}>
                                <MaterialIcons name={data?.category == 'transfer_deposit' ? 'arrow-forward' : 'arrow-back'} size={18} color={'#fff'} />
                            </View>
                        </View>
                    </View>
                    <View style={[Theme.styles.col_center, styles.infoBlock]}>
                        <View style={[Theme.styles.flex_between]}>
                            <AppText style={styles.label}>{translate('transfer_details.status')}</AppText>
                            <AppText style={styles.info}>{data?.category == 'transfer_deposit' ? translate('transfer_details.sent') : translate('transfer_details.received')}</AppText>
                        </View>
                        <View style={{ marginTop: 8 }} />
                        <View style={[Theme.styles.flex_between]}>
                            <AppText style={styles.label}>{data?.category == 'transfer_deposit' ? translate('transfer_details.receiver') : translate('transfer_details.sender')}</AppText>
                            <AppText style={styles.info}>{data.user_data?.full_name}</AppText>
                        </View>
                    </View>
                    <View style={[Theme.styles.col_center, styles.infoBlock]}>
                        <AppText style={[styles.label, { width: '100%', }]}>{translate('transfer_details.note')}</AppText>
                        <AppText style={styles.note}>{data?.comment}</AppText>
                    </View>
                    <View style={{ height: 50 }} />
                </KeyboardAwareScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { width: '100%', height: '100%', paddingTop: 86, justifyContent: 'flex-end' },
    overlay: { width: width(100), height: height(100), position: 'absolute', top: 0, left: 0 },
    container: {
        justifyContent: "center",
        alignItems: "center",
        borderTopLeftRadius: 26,
        borderTopRightRadius: 26,
        width: '100%',
        flex: 1,
        backgroundColor: Theme.colors.white,
    },
    header: {
        width: '100%',
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginTop: 15,
        justifyContent: 'flex-start'
    },
    photoView: { width: 74, height: 74, },
    avatarImg: { width: 74, height: 74, borderRadius: 40, },
    imgArrow: { position: 'absolute', bottom: -2, right: -2, backgroundColor: Theme.colors.cyan2, width: 28, height: 28, borderRadius: 15, borderWidth: 2, borderColor: '#fff' },
    amount: {
        fontSize: 22,
        lineHeight: 26,
        color: Theme.colors.text,
        fontFamily: Theme.fonts.semiBold,
    },
    subtitle: { fontSize: 17, color: Theme.colors.text, fontFamily: Theme.fonts.medium, },
    infoBlock: {
        width: '100%',
        borderRadius: 12,
        backgroundColor: Theme.colors.gray9,
        padding: 16,
        marginTop: 20,
    },
    label: { fontSize: 16, color: Theme.colors.text, fontFamily: Theme.fonts.medium },
    info: { fontSize: 16, color: Theme.colors.text, fontFamily: Theme.fonts.semiBold },
    note: { width: '100%', marginTop: 12, fontSize: 16, color: Theme.colors.text, fontFamily: Theme.fonts.medium }
});

const mapStateToProps = ({ app, chat }) => ({
});

export default connect(
    mapStateToProps,
    {
    },
)(withNavigation(TransferDetailsScreen));
