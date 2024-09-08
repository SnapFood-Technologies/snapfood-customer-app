import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import FastImage from 'react-native-fast-image';
import { translate } from '../../../common/services/translate';
import HelpPage from '../../orders/components/HelpPage';
import FaqItem from '../../orders/components/FaqItem';
import AppText from '../../../common/components/AppText';
import apiFactory from '../../../common/services/apiFactory';
import Theme from '../../../theme';
import ImgLogoplus from '../../../common/assets/images/logo_plus.png';

const VoiceOrderFaqs = (props) => {
    const [faqsData, setFaqs] = useState([]);

    useEffect(() => {
        loadFaqs();
    }, []);

    const loadFaqs = () => {
        apiFactory.get(`get-membership-faqs`).then(
            ({ data }) => {
                let faqs = data.faqs || [];
                if (props.language == 'en') {
                    faqs = faqs.map((t) => ({ id: t.id, question: t.question_en, answer: t.answer_en }));
                } else if (props.language == 'it') {
                    faqs = faqs.map((t) => ({ id: t.id, question: t.question_it, answer: t.answer_it }));
                } else {
                    faqs = faqs.map((t) => ({ id: t.id, question: t.question_al, answer: t.answer_al }));
                }
                setFaqs(faqs);
            },
            (error) => {
                const message = error.message || translate('generic_error');
                // alerts.error(translate('alerts.error'), message);
            }
        );
    };

    const increaseFaqCount = (faq_id) => {
        apiFactory
            .post(`membership/increase-clicks-faqs`, {
                tag_id: faq_id,
            })
            .then(
                (res) => {},
                (error) => {}
            );
    };

    return (
        <React.Fragment>
            <HelpPage
                title={translate('vendor_voice_order_faq.faq_title')}
                titleStyle={{ width: 200 }}
                bodystyle={{ marginTop: 70 }}
                navigation={props.navigation}
            >
                <FastImage source={ImgLogoplus} style={styles.logoView} resizeMode={FastImage.resizeMode.cover} />
                <KeyboardAwareScrollView
                    style={{ flex: 1, width: '100%', paddingHorizontal: 20 }}
                    extraScrollHeight={65}
                    enableOnAndroid={true}
                    keyboardShouldPersistTaps='handled'
                >
                    <AppText style={styles.subtitle}>{translate('help.faqs')}</AppText>
                    {faqsData.map((faq, index) => (
                        <FaqItem
                            key={index}
                            data={faq}
                            onSelect={(isOpen) => {
                                if (isOpen == true) {
                                    increaseFaqCount(faq.id);
                                }
                            }}
                        />
                    ))}
                    <View style={{ height: 100 }} />
                </KeyboardAwareScrollView>
            </HelpPage>
        </React.Fragment>
    );
};

const styles = StyleSheet.create({
    title: {
        marginVertical: 20,
        width: '100%',
        paddingHorizontal: 20,
        textAlign: 'center',
        fontSize: 18,
        lineHeight: 20,
        fontFamily: Theme.fonts.bold,
        color: Theme.colors.text,
    },
    logoView: {
        width: 90,
        height: 90,
        marginTop: -45,
        borderWidth: 1,
        borderColor: Theme.colors.gray6,
        borderRadius: 20,
        backgroundColor: Theme.colors.white,
    },
    divider: { marginVertical: 20, width: '100%', height: 1, backgroundColor: Theme.colors.gray8 },
    subtitle: {
        marginBottom: 15,
        fontSize: 18,
        lineHeight: 22,
        fontFamily: Theme.fonts.bold,
        color: Theme.colors.text,
    },
});

function mapStateToProps({ app }) {
    return {
        user: app.user,
        language: app.language,
    };
}

export default connect(mapStateToProps, {})(VoiceOrderFaqs);