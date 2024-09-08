import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import Modal from 'react-native-modal';
import { connect } from 'react-redux';
import Theme from '../../../theme';
import { translate } from '../../services/translate';
import { MainBtn, TransBtn } from '..';
import { setShowChangeCityModal, addDefaultAddress, getAddresses, setAddress } from '../../../store/actions/app';
import { updateProfileDetails } from '../../../store/actions/auth';
import { isEmpty } from '../../services/utility';
import Img_diff from '../../assets/images/diff_city_new.png';
import FastImage from 'react-native-fast-image';
import { getDefaultCity } from '../../services/user';

const CityChangeModal = (props) => {

    const onClose = () => {
        props.setShowChangeCityModal({
            showModal: false
        });
    }

    const onChange = async () => {
        onClose();

        if (props.new_city_location) {
            props.updateProfileDetails({
                latitude: props.new_city_location.latitude,
                longitude: props.new_city_location.longitude,
            });

            if (props.new_city_address != null) {

                let DEFAULT_CITY = getDefaultCity();

                let address_data = {
                    lat: props.new_city_location.latitude,
                    lng: props.new_city_location.longitude,
                    country: props.new_city_address.country || DEFAULT_CITY.country,
                    city: props.new_city_address.city || DEFAULT_CITY.city,
                    street: props.new_city_address.street || DEFAULT_CITY.street,
                };
                props.addDefaultAddress(address_data);
                props.getAddresses();

                props.setAddress({
                    coordinates: props.new_city_location,
                    address: props.new_city_address,
                });
            }
        }
    }

    return <Modal
        testID={'modal'}
        isVisible={props.show_change_city_modal == true}
        backdropOpacity={0.33}
        swipeDirection={['down']}
        style={{ justifyContent: 'flex-end', margin: 0 }}>
        <View style={[Theme.styles.col_center, styles.modalVendorContent]}>
            <FastImage
                source={Img_diff}
                resizeMode={'contain'}
                style={{ width: 250, height: 200 }}
            />
            <Text style={styles.modalTitle}>
                {translate('change_city.diff_location')}
                {props.new_city_address != null && !isEmpty(props.new_city_address.city) ?
                    ` (${props.new_city_address.city})` : ''
                }
            </Text>
            <MainBtn
                style={{ width: '100%' }}
                title={translate('change_city.change')}
                title_style={{
                    fontFamily: Theme.fonts.semiBold,
                    color: Theme.colors.white,
                    fontSize: 17,
                }}
                onPress={onChange}
            />
            <TransBtn
                onPress={onClose}
                style={{ marginTop: 8 }}
                title={translate('change_city.keep')}
                btnTxtColor={Theme.colors.text}
            />
        </View>
    </Modal>
};

const styles = StyleSheet.create({
    modalVendorContent: { width: '100%', paddingHorizontal: 15, paddingVertical: 32, backgroundColor: Theme.colors.white, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
    modalTitle: { width: '100%', marginTop: 10, marginBottom: 25, textAlign: 'center', fontSize: 19, lineHeight: 22, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text, },
})

const mapStateToProps = ({ app }) => ({
    show_change_city_modal: app.show_change_city_modal,
    new_city_address: app.new_city_address,
    new_city_location: app.new_city_location,
});

export default connect(mapStateToProps, {
    setShowChangeCityModal,
    addDefaultAddress,
    getAddresses,
    setAddress,
    updateProfileDetails
})(CityChangeModal);