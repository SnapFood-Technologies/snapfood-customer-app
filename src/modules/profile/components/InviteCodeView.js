import React, { useEffect, useState, useRef } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Share, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'
import Clipboard from '@react-native-clipboard/clipboard';
import { connect } from 'react-redux';
import { translate } from '../../../common/services/translate';
import Theme from '../../../theme'
import { isEmpty, ucFirst } from '../../../common/services/utility';
import branch from "react-native-branch";
import apiFactory from '../../../common/services/apiFactory';

const InviteCodeView = (props) => {
    const { code } = props;
    const _isMounted = useRef(false);
    const [isCopied, setCopied] = useState(false);

    useEffect(() => {
        createUnitersalLink();
        _isMounted.current = true;
        return () => {
            _isMounted.current = false;
        }
    }, [code])

    const getShareText = () => {
        let description = translate('invitation_earn.share_desc');

        if (props.language == 'sq' && isEmpty(props.referralsRewardsSetting.referral_code_share_message) == false) {
            description = props.referralsRewardsSetting.referral_code_share_message;
        }
        else if (props.language == 'en' && isEmpty(props.referralsRewardsSetting.referral_code_share_message_en) == false) {
            description = props.referralsRewardsSetting.referral_code_share_message_en;
        }
        else if (props.language == 'it' && isEmpty(props.referralsRewardsSetting.referral_code_share_message_it) == false) {
            description = props.referralsRewardsSetting.referral_code_share_message_it;
        }

        description = description.replace('XXX', ucFirst(props.user.username || props.user.full_name));
        description = description.replace('{code_param}', code);
        return description;
    }

    const createUnitersalLink = async () => {
        if (Platform.OS != 'ios') {
            return;
        }
        let buo = await branch.createBranchUniversalObject("content/12345", {
            title: "SnapFood",
            contentDescription: getShareText(),
            contentMetadata: {
                customMetadata: {
                    code: code,
                },
            },
        });
        let linkProperties = {
            feature: "sharing",
            channel: "facebook",
            campaign: "content 123 launch",
        };

        let controlParams = {
            $desktop_url: "https://example.com/home",
            custom: "VRNBUTH",
        };
        let { url } = await buo.generateShortUrl(linkProperties, controlParams);

        apiFactory.post(`invite-earn/update-refferal-info`, {
            code: code,
            referral_link: url
        })
            .then(res => {
            })
            .catch(err => {
            });
    };

    const onCopy = () => {
        let message = getShareText();
        Clipboard.setString(message);
        setCopied(true);
        setTimeout(() => {
            if (_isMounted.current) {
                setCopied(false);
            }
        }, 5000)
    }

    const onShare = async () => {
        try {
            let message = getShareText();
            const shareOptions = {
                message: message,
            };
            await Share.share(shareOptions);
        } catch (error) {
        }
    };

    return (
        <View style={[Theme.styles.row_center_start, styles.container]}>
            <Text style={styles.codeTxt}>{code}</Text>
            <View style={[Theme.styles.row_center, { justifyContent: 'flex-start', }]}>
                <TouchableOpacity style={[Theme.styles.row_center]} onPress={onCopy}>
                    {
                        !isCopied && <Ionicons name='copy' color={Theme.colors.cyan2} size={16} />
                    }
                    <Text style={[styles.btntxt, isCopied && { color: Theme.colors.gray7 }]}>{isCopied ? translate('invitation_earn.copied') : translate('invitation_earn.copy')}</Text>
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity style={[Theme.styles.row_center]} onPress={onShare}>
                    <Ionicons name='share-social' color={Theme.colors.cyan2} size={16} />
                    <Text style={styles.btntxt}>{translate('invitation_earn.share')}</Text>
                </TouchableOpacity>
            </View>
        </View >
    )
};

const styles = StyleSheet.create({
    container: { marginTop: 20, justifyContent: 'space-between', width: '100%', backgroundColor: Theme.colors.gray9, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 20 },
    codeTxt: { fontSize: 19, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text },
    btntxt: { marginLeft: 8, fontSize: 16, fontFamily: Theme.fonts.semiBold, color: Theme.colors.cyan2 },
    divider: { width: 1, height: '100%', marginHorizontal: 8 }
});

function arePropsEqual(prevProps, nextProps) {
    return prevProps.code == nextProps.code;
}

const mapStateToProps = ({ app }) => ({
    user: app.user,
    language: app.language,
    referralsRewardsSetting: app.referralsRewardsSetting || {},
});

export default connect(mapStateToProps, {
})(React.memo(InviteCodeView, arePropsEqual));
