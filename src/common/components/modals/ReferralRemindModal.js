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
import { setShowReferralRemindModal } from '../../../store/actions/app';
import RouteNames from '../../../routes/names';
import Svg_img from '../../../common/assets/svgs/invite/invite_earn.svg';
import { isEmpty } from '../../services/utility';

const ReferralRemindModal = (props) => {
    const onClose = () => {
        props.setShowReferralRemindModal(false);
    }

	const getTitle = () => {
		let defaultMsg = translate('invitation_earn.how_refer_work');
		if (props.language == 'sq' && isEmpty(props.referralsRewardsSetting.referral_howto_works_title) == false) {
			defaultMsg = props.referralsRewardsSetting.referral_howto_works_title;
		}
		else if (props.language == 'en' && isEmpty(props.referralsRewardsSetting.referral_howto_works_title_en) == false) {
			defaultMsg = props.referralsRewardsSetting.referral_howto_works_title_en;
		}
		else if (props.language == 'it' && isEmpty(props.referralsRewardsSetting.referral_howto_works_title_it) == false) {
			defaultMsg = props.referralsRewardsSetting.referral_howto_works_title_it;
		}
		defaultMsg = defaultMsg.replace('XXX', (props.referralsRewardsSetting.user_rewards || 100) + 'L');

		return defaultMsg;
	}

    return <Modal
        isVisible={props.show_remind_referral_modal == true}
        backdropOpacity={0.33}
        onSwipeComplete={() => onClose()}
        onBackdropPress={() => onClose()}
    >
        <View style={[Theme.styles.col_center, styles.modalContent]}>
            <View style={[Theme.styles.row_center, styles.header]}>
                <AppText style={styles.modalTitle}>{translate('Invite')}</AppText>
                <TouchableOpacity onPress={onClose} style={[{ marginTop: 15, height: 35 }]}>
                    <AntDesign name={"close"} size={22} color={Theme.colors.gray5} />
                </TouchableOpacity>
            </View>
            <Svg_img width={150} height={130} />
            <Text style={styles.description}>{getTitle()}</Text>
            <View style={[{ width: '100%', paddingHorizontal: 20, marginTop: 20 }]}>
                <MainBtn
                    title={translate('Invite')}
                    style={{ paddingBottom: 2 }}
                    onPress={() => {
                        props.setShowReferralRemindModal(false);
                        props.navigation.navigate(RouteNames.InviteScreen, { fromPush: false })
                    }}
                />
            </View>
        </View>
    </Modal>
}

const styles = StyleSheet.create({
    header: { width: '100%' },
    modalContent: { width: '100%', maxHeight: 500, paddingHorizontal: 20, paddingBottom: 30, paddingTop: 12, backgroundColor: Theme.colors.white, borderRadius: 15, },
    modalTitle: { flex: 1, textAlign: 'center', fontSize: 23, lineHeight: 28, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text, },
    operationTab: { width: '100%', marginTop: 5 },
    description: { marginTop: 15, textAlign: 'center', fontFamily: Theme.fonts.medium, fontSize: 18, lineHeight: 24, color: Theme.colors.text },
    spaceCol: { height: 10 },
});

const mapStateToProps = ({ app }) => ({
    user: app.user,
    language: app.language,
    referralsRewardsSetting: app.referralsRewardsSetting,
    show_remind_referral_modal: app.show_remind_referral_modal,
});

export default connect(mapStateToProps, {
    setShowReferralRemindModal
})(ReferralRemindModal);
