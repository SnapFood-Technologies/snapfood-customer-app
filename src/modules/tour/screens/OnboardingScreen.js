
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import AntDesign from 'react-native-vector-icons/AntDesign'
import LinearGradient from 'react-native-linear-gradient';
import Swiper from 'react-native-swiper';
import { translate } from '../../../common/services/translate';
import Theme from '../../../theme';
import { height, width } from 'react-native-dimension';
import { getStorageKey, KEYS, setStorageKey } from '../../../common/services/storage';
import { setAsSeenOnboard } from '../../../store/actions/auth'
import AlmostDoneScreen from './AlmostDoneScreen';
// svgs
import Svg_onboard1 from '../../../common/assets/svgs/auth/1.svg';
import Svg_onboard2 from '../../../common/assets/svgs/auth/2.svg';
import Svg_onboard3 from '../../../common/assets/svgs/auth/3.svg';
import Svg_onboard4 from '../../../common/assets/svgs/auth/4.svg';
import Svg_onboard5 from '../../../common/assets/svgs/auth/5.svg';
import Svg_onboard6 from '../../../common/assets/svgs/auth/6.svg';

const config = [
    {
        id: 1,
        colors: ['#50b7ed', '#07CCFE'],
        title: 'chat_social',
        desc: 'chat_social_desc',
        img: <Svg_onboard1 width={width(100) - 60} />
    },
    {
        id: 2,
        colors: ['#F55A00', '#FF6767'],
        title: 'spend_wallet',
        desc: 'spend_wallet_desc',
        img: <Svg_onboard2 width={width(100) - 60} />
    },
    {
        id: 3,
        colors: ['#00C22D', '#08F1EA'],
        title: 'save_cashback',
        desc: 'save_cashback_desc',
        img: <Svg_onboard3 width={width(100) - 60} />
    },
    {
        id: 4,
        colors: ['#9900FF', '#08F1EA'],
        title: 'split_bill',
        desc: 'split_bill_desc',
        img: <Svg_onboard4 width={width(100) - 60} />
    },
    {
        id: 5,
        colors: ['#D59515', '#FFD700'],
        title: 'gift_order_onboard',
        desc: 'gift_order_onboard_desc',
        img: <Svg_onboard5 width={'100%'} />
    },
    {
        id: 6,
        colors: ['#50b7ed', '#00C0CE'],
        title: 'refer_onboard',
        desc: 'refer_onboard_desc',
        img: <Svg_onboard6 width={'100%'} />
    },
]

const OnboardingScreen = (props) => {

    const [page_step, setStep] = useState(0)

    const onGoWelcome = async () => {
        await setStorageKey(KEYS.SEEN_ONBOARD, true);
        await props.setAsSeenOnboard()
    }

    const _renderHeader = () => {
        return <TouchableOpacity style={styles.skipBtnHeader} onPress={onGoWelcome}>
            <Text style={styles.skipBtn}>{translate('skip')}</Text>
        </TouchableOpacity>
    }

    const _renderStepper = (step) => {
        return <View style={[Theme.styles.row_center, {marginVertical : height(4)}]}>
            {
                config.map((item, index) =>
                    <View key={index} style={item.id == (step + 1) ? styles.activeStep : styles.inactiveStep} />
                )
            }
        </View>
    }

    const _renderBottomView = (page, step) => {
        return (
            <View key={step} style={[Theme.styles.col_center, styles.bottomView]}>
                <Text style={styles.btmtitle}>{translate(page.title)}</Text>
                <Text style={styles.btmdesc}>{translate(page.desc)}</Text>
                {_renderStepper(step)}
                <View style={[Theme.styles.row_center, ]} >
                    {
                        step > 0 && <TouchableOpacity onPress={() => setStep(step - 1)}>
                            <Text style={styles.btmbtntxt}>{translate('previous')}</Text>
                        </TouchableOpacity>
                    }
                    <View style={{ flex: 1 }} />
                    <TouchableOpacity style={[Theme.styles.row_center,]}
                        onPress={() => {
                            setStep(step + 1)
                        }}
                    >
                        {
                            step == (config.length - 1) ?
                                <Text style={[styles.btm_nextbtntxt, { color: Theme.colors.red1, marginRight: 6, }]}>{translate('get_started')}</Text> :
                                <Text style={[styles.btm_nextbtntxt, { marginRight: 6 }]}>{translate('next')}</Text>
                        }
                        <AntDesign name="arrowright" size={18} color={step == (config.length - 1) ? Theme.colors.red1 : '#000'} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <Swiper onIndexChanged={(index) => {
            if (index == config.length) {
                
                onGoWelcome()
            }
        }} loop={false} index={page_step} showsPagination={false}>
            <LinearGradient colors={config[0].colors} style={{ flex: 1, height: height(100) }}>
                <View style={[Theme.styles.col_center_start, styles.imgcontainer]}>
                    <View style={[Theme.styles.col_center, { flex: 1, width: '100%', }]}>
                        {config[0].img}
                    </View>
                </View>
                {_renderBottomView(config[0], 0)}
                {_renderHeader()}
            </LinearGradient>
            <LinearGradient colors={config[1].colors} style={{ flex: 1, height: height(100) }}>
                <View style={[Theme.styles.col_center_start, styles.imgcontainer]}>
                    <View style={[Theme.styles.col_center, { flex: 1, width: '100%', }]}>
                        {config[1].img}
                    </View>
                </View>
                {_renderBottomView(config[1], 1)}
                {_renderHeader()}
            </LinearGradient>
            <LinearGradient colors={config[2].colors} style={{ flex: 1, height: height(100) }}>
                <View style={[Theme.styles.col_center_start, styles.imgcontainer]}>
                    <View style={[Theme.styles.col_center, { flex: 1, width: '100%', }]}>
                        {config[2].img}
                    </View>
                </View>
                {_renderBottomView(config[2], 2)}
                {_renderHeader()}
            </LinearGradient>
            <LinearGradient colors={config[3].colors} style={{ flex: 1, height: height(100) }}>
                <View style={[Theme.styles.col_center_start, styles.imgcontainer]}>
                    <View style={[Theme.styles.col_center, { flex: 1, width: '100%', }]}>
                        {config[3].img}
                    </View>
                </View>
                {_renderBottomView(config[3], 3)}
                {_renderHeader()}
            </LinearGradient>
            <LinearGradient colors={config[4].colors} style={{ flex: 1, height: height(100) }}>
                <View style={[Theme.styles.col_center_start, styles.imgcontainer]}>
                    <View style={[Theme.styles.col_center, { flex: 1, width: '100%', }]}>
                        {config[4].img}
                    </View>
                </View>
                {_renderBottomView(config[4], 4)}
                {_renderHeader()}
            </LinearGradient>
            <LinearGradient colors={config[5].colors} style={{ flex: 1, height: height(100) }}>
                <View style={[Theme.styles.col_center_start, styles.imgcontainer]}>
                    <View style={[Theme.styles.col_center, { flex: 1, width: '100%', }]}>
                        {config[5].img}
                    </View>
                </View>
                {_renderBottomView(config[5], 5)}
                {_renderHeader()}
            </LinearGradient>
            <AlmostDoneScreen {...props} />
        </Swiper>
    );
}

const styles = StyleSheet.create({
    skipBtnHeader: {
        right: 0, position: 'absolute', top: 40,
    },
    skipBtn: { marginRight: 20, color: Theme.colors.white, fontSize: 16, fontFamily: Theme.fonts.semiBold, },
    bottomView: {
        width: width(100), elevation: 4, borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingTop: height(4), paddingHorizontal: 20, paddingBottom: 40, backgroundColor: Theme.colors.white,
    },
    btmtitle: { fontSize: 20, fontFamily: Theme.fonts.bold, color: Theme.colors.text, },
    btmdesc: { marginTop: 12, textAlign: 'center', fontSize: 16, fontFamily: Theme.fonts.medium, color: Theme.colors.text, },
    btmbtntxt: { fontSize: 16, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text, },
    btm_nextbtntxt: { fontSize: 16, fontFamily: Theme.fonts.bold, color: Theme.colors.text, },

    inactiveStep: { marginRight: 8, width: 6, height: 3, borderRadius: 4, backgroundColor: Theme.colors.gray5 },
    activeStep: { marginRight: 8, width: 30, height: 5, borderRadius: 4, backgroundColor: Theme.colors.gray5 },
    stepper: { marginTop: 10, backgroundColor: Theme.colors.gray9 },
    imgcontainer: { flex: 1, paddingHorizontal: 25, }
});

function mapStateToProps({ app }) {
    return {
        coordinates: app.coordinates,
    };
}

export default connect(mapStateToProps, {
    setAsSeenOnboard
})(OnboardingScreen);
