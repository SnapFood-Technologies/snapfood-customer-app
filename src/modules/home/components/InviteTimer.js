import React, { useEffect, useState, useRef } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import * as Progress from 'react-native-progress';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { connect } from 'react-redux';
import Toast from 'react-native-toast-message';
import Theme from '../../../theme';
import { translate } from '../../../common/services/translate';
import { isEmpty } from '../../../common/services/utility';
import Svg_timer from '../../../common/assets/svgs/timer_icon.svg';
import { setInvitationTimerSetting } from '../../../store/actions/app';

const CIRCLE_SIZE = 38;
const InviteTimer = (props) => {
    const { invitationTimerSetting, referralsRewardsSetting, style } = props;

    const _Timer = useRef(null);
    const totalTime = invitationTimerSetting.total_invite_time || 0;
    const remainingTime = invitationTimerSetting.remaining_time_to_use || 0;
    const [currentTime, setTime] = useState(totalTime - remainingTime);
    useEffect(() => {
        _Timer.current = setInterval(() => {
            if (totalTime == 0 || currentTime >= totalTime) {
                onClose();
            }
            else {
                setTime(pre => pre + 1);
            }
        }, 60000);

        return () => {
            if (_Timer.current) {
                onClose();
            }
        }
    }, []);

    const onClose = () => {
        
        clearInterval(_Timer.current);
        _Timer.current = null;

        props.setInvitationTimerSetting({ showTimer: false })
    }

    const onPress=()=>{
        let text = referralsRewardsSetting.earninvite_timer_popup_message;
        if (props.language == 'en') {
            text = referralsRewardsSetting.earninvite_timer_popup_message_en
        }
        else if (props.language == 'it') {
            text = referralsRewardsSetting.earninvite_timer_popup_message_it
        }
        
        if (isEmpty(text)) {
            return;
        }

        Toast.show({
            type: 'vendorCloseToast',
            visibilityTime: 5000,
            position: 'top',
            topOffset: 42,
            text1: text
        });
    }

    if (totalTime == 0 || currentTime >= totalTime) {
        return null;
    }

    return <TouchableOpacity activeOpacity={1} onPress={onPress} style={[Theme.styles.row_center, styles.container, style]}>
        <View
            style={[
                Theme.styles.col_center,
                styles.progressCircle,
            ]}>
            <View
                style={[
                    Theme.styles.col_center,
                    styles.progressCircle,
                    { position: 'absolute', top: 0, left: 0, backgroundColor: '#FFF' }
                ]}>
                <Progress.Circle
                    size={CIRCLE_SIZE}
                    indeterminate={false}
                    progress={currentTime / totalTime}
                    thickness={3}
                    borderWidth={0}
                    borderColor={Theme.colors.white}
                    color={Theme.colors.text}
                    unfilledColor={Theme.colors.white}
                />
            </View>
            <Svg_timer style={styles.icon} width={CIRCLE_SIZE - 8} height={CIRCLE_SIZE - 8} />
        </View>
        <View style={{ marginLeft: 5 }}>
            <Text style={[styles.text, { marginBottom: 4 }]}>
                {translate('invitation_earn.invite_more_people')} {'\n'}
                {translate('invitation_earn.in_x_mins').replace('XXX', (totalTime - currentTime))}
            </Text>
        </View>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <AntDesign name='close' size={12} color={Theme.colors.white} />
        </TouchableOpacity>
    </TouchableOpacity>;
};

const styles = StyleSheet.create({
    container: { height: 48, marginBottom: 16, borderRadius: 24, backgroundColor: Theme.colors.red1, paddingHorizontal: 5, },
    progressCircle: { borderRadius: CIRCLE_SIZE / 2, width: CIRCLE_SIZE, height: CIRCLE_SIZE },
    text: { fontSize: 14, color: Theme.colors.white, fontFamily: Theme.fonts.medium, },
    closeBtn: { padding: 4, borderRadius: 15, backgroundColor: Theme.colors.cyan2, position: 'absolute', top: -4, right: -4 },
})

const mapStateToProps = ({ app, shop }) => ({
    language: app.language,
    invitationTimerSetting: app.invitationTimerSetting || {},
    referralsRewardsSetting: app.referralsRewardsSetting || {},
});

export default connect(mapStateToProps, {
    setInvitationTimerSetting
})(InviteTimer);
