import React, { useEffect, useState } from 'react';
import { TouchableOpacity, StyleSheet, View, Text, Linking, Platform } from 'react-native';
import Modal from 'react-native-modal';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FastImage from 'react-native-fast-image';
import { connect } from 'react-redux';
import { height } from 'react-native-dimension';
import { AppText, MainBtn } from '..';
import Theme from "../../../theme";
import { translate } from '../../../common/services/translate'
import { setShowEarnInviteRemindModal } from '../../../store/actions/app';
import RouteNames from '../../../routes/names';

const EarnInvitationRemindModal = (props) => {
    const onClose = () => {
        props.setShowEarnInviteRemindModal(false);
    }

    const getEarnHowToWorksDescription = () => {
        let defaultMsg = translate('invitation_earn.earn_desc');
        if (props.language == 'sq' && isEmpty(props.referralsRewardsSetting.earninvitation_howto_works) == false) {
            defaultMsg = props.referralsRewardsSetting.earninvitation_howto_works;
        }
        else if (props.language == 'en' && isEmpty(props.referralsRewardsSetting.earninvitation_howto_works_en) == false) {
            defaultMsg = props.referralsRewardsSetting.earninvitation_howto_works_en;
        }
        else if (props.language == 'it' && isEmpty(props.referralsRewardsSetting.earninvitation_howto_works_it) == false) {
            defaultMsg = props.referralsRewardsSetting.earninvitation_howto_works_it;
        }
        defaultMsg = defaultMsg.replace('XXX', `${(props.referralsRewardsSetting.cycle_hours_earn_invitation || 1)}`);

        return defaultMsg;
    }

    return <Modal
        isVisible={props.show_remind_earn_invite_modal == true}
        backdropOpacity={0.33}
        onSwipeComplete={() => onClose()}
        onBackdropPress={() => onClose()}
    >
        <View style={[Theme.styles.col_center, styles.modalContent]}>
            <View style={[Theme.styles.row_center, styles.header]}>
                <AppText style={styles.modalTitle}>{translate('invitation_earn.alert_available_title')}</AppText>
                <TouchableOpacity onPress={onClose} style={[{ marginTop: 15, height: 35 }]}>
                    <AntDesign name={"close"} size={22} color={Theme.colors.gray5} />
                </TouchableOpacity>
            </View>
            <FastImage
                resizeMode={FastImage.resizeMode.contain}
                source={require('../../../common/assets/images/earn_referal.png')}
                style={{ width: 150, height: 130 }}
            />
            <Text style={styles.description}>{getEarnHowToWorksDescription()}</Text>
            <View style={[{ width: '100%', paddingHorizontal: 20, marginTop: 20 }]}>
                <MainBtn
                    title={translate('Invite_Earn_btn')}
                    style={{ paddingBottom: 2 }}
                    onPress={() => {
                        props.setShowEarnInviteRemindModal(false);
                        props.navigation.navigate(RouteNames.EarnScreen, { fromPush: false })
                    }}
                />
            </View>
        </View>
    </Modal>
}

const styles = StyleSheet.create({
    header: { width: '100%' },
    modalContent: { width: '100%', maxHeight: 500, paddingHorizontal: 20, paddingBottom: 30, paddingTop: 12, backgroundColor: Theme.colors.white, borderRadius: 15, },
    modalTitle: { flex: 1, textAlign: 'center', fontSize: 22, lineHeight: 26, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text, },
    operationTab: { width: '100%', marginTop: 5 },
    description: { marginTop: 15, textAlign: 'center', fontFamily: Theme.fonts.medium, fontSize: 16, color: Theme.colors.text },
    spaceCol: { height: 10 },
});

const mapStateToProps = ({ app }) => ({
    user: app.user,
    referralsRewardsSetting: app.referralsRewardsSetting,
    show_remind_earn_invite_modal: app.show_remind_earn_invite_modal,
});

export default connect(mapStateToProps, {
    setShowEarnInviteRemindModal
})(EarnInvitationRemindModal);
