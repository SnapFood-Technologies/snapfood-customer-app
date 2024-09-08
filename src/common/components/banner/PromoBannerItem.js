import React from 'react';
import { Dimensions, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Tag from './Tag';
import apiFactory from '../../services/apiFactory';
import Theme from '../../../theme';
import RouteNames from '../../../routes/names';
import ImgBg from '../../assets/images/banner_bg.png';
import { width } from 'react-native-dimension';
import Config from '../../../config'

const sliderWidth = Dimensions.get('window').width;

class PromoBannerItem extends React.PureComponent {

    onBannerPressed = (item) => {
        const { navigation } = this.props;
        apiFactory.put(`banners/${item.id}`, {}).then();
        if (item['redirect_type'] == 2) {
            navigation?.navigate(RouteNames.PromotionsScreen)
        }
        else if (item['redirect_type'] == 3) {
            navigation?.navigate(RouteNames.VendorPromotionsScreen)
        }
        else if (item['redirect_type'] == 4) {
            navigation?.navigate(RouteNames.StudentVerifyScreen)
        }
        else if (item['redirect_type'] == 5) {
            navigation?.navigate(RouteNames.MembershipScreen)
        }
    };

    render() {
        const { item, style } = this.props;
        return (<TouchableOpacity onPress={() => this.onBannerPressed(item)} activeOpacity={0.95} style={[styles.container, style]}>
            <ImageBackground source={{ uri: Config.IMG_BASE_URL + `${item['image_path']}` }}
                style={[styles.backgroundImage]}
                imageStyle={{ borderRadius: 4 }}
                resizeMode= 'stretch'
                >
                {/* {!!item.title && <Text style={styles.title}>{item.title}</Text>}
                {!!item.description && <Text style={styles.subtitle}>{item.description}</Text>} */}
            </ImageBackground>
        </TouchableOpacity>);
    }
}

const styles = StyleSheet.create({
    container: { width: '100%' },
    backgroundImage: {
        borderRadius: 4,
        width: '100%', height: 138,
        // backgroundColor: '#F6F6F9'
    },
    title: {
        color: Theme.colors.white,
        fontFamily: Theme.fonts.semiBold,
        fontSize: 18,
        lineHeight: 26,
    },
    subtitle: {
        color: Theme.colors.white,
        fontSize: 15,
        lineHeight: 21,
        fontFamily: Theme.fonts.medium,
        marginTop: 16,
        paddingRight: 60,
    },
});

export default PromoBannerItem;
