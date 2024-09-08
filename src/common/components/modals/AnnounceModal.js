import React, { useEffect, useState } from 'react';
import { TouchableOpacity, StyleSheet, View, Dimensions, Text, Platform } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign'
import Modal from 'react-native-modal';
import { connect } from 'react-redux';
import { AppText, MainBtn } from '..';
import HTML from 'react-native-render-html';
import Theme from "../../../theme";
import { translate } from '../../../common/services/translate'
import { setShowAnnounceModal } from '../../../store/actions/app';
import { isEmpty, openExternalUrl } from '../../services/utility';

const AnnounceModal = (props) => {

    const onClose = () => {
        props.setShowAnnounceModal(false);
    }

    return <Modal
        isVisible={props.show_announce_modal == true && props.announce_data != null && !isEmpty(props.announce_data.title)}
        backdropOpacity={0.33}
        onSwipeComplete={() => onClose()}
        onBackdropPress={() => onClose()}
        swipeDirection={['down']}
        style={{ justifyContent: 'flex-end', margin: 0 }}
    >
        <View style={[Theme.styles.col_center, styles.modalContent]}>
            <View style={[Theme.styles.row_center, { marginBottom: 20, width: '100%' }]}>
                <AppText style={styles.modalTitle}>{props.announce_data.title}</AppText>
                <TouchableOpacity style={{ marginLeft: 8, position: 'absolute', right: 0, top: 0 }} onPress={onClose}>
                    <AntDesign name='close' size={24} color={Theme.colors.gray7} />
                </TouchableOpacity>
            </View>
            <HTML
                html={props.announce_data.content || ''}
                containerStyle={{ width: '100%' }}
                imagesMaxWidth={Dimensions.get('window').width}
                onLinkPress={(event, href) => openExternalUrl(href)}
                baseFontStyle={{ fontSize: 14 }}
                style={{ width: '100%' }}
            />
            <View style={{ height: 30 }} />
        </View>
    </Modal>
}

const styles = StyleSheet.create({
    modalContent: { width: '100%', paddingHorizontal: 20, paddingBottom: 30, paddingTop: 30, backgroundColor: Theme.colors.white, borderTopLeftRadius: 15, borderTopRightRadius: 15 },
    modalTitle: { fontSize: 19, lineHeight: 24, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text, },
    header: { width: '100%' },
    divider: { width: '100%', height: 1, backgroundColor: Theme.colors.gray6 },
});

const mapStateToProps = ({ app }) => ({
    language: app.language,
    show_announce_modal: app.show_announce_modal,
    announce_data: app.announce_data
});

export default connect(mapStateToProps, {
    setShowAnnounceModal
})(AnnounceModal);