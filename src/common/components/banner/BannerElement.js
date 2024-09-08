import React from 'react';
import {Dimensions, ImageBackground, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Tag from './Tag';
import apiFactory from '../../services/apiFactory';
import {getLanguage} from '../../services/translate';
import Theme from '../../../theme';

const sliderWidth = Dimensions.get('window').width;
const itemHeight = 190;
let bannerType;

if (getLanguage() === 'sq') {
    bannerType = {
        0: '',
        1: 'E re',
        2: 'Ofertë',
    };
} else {
    bannerType = {
        0: '',
        1: 'New',
        2: 'Offer',
    };
}

class BannerElement extends React.PureComponent {

    onBannerPressed = (item) => {
        apiFactory.put(`banners/${item.id}`, {}).then();
        if (item['display_type'] === 2) {
            this.props.goToRestaurantDetails(item['vendor'] && item['vendor'].id ? item['vendor'] : {id: item['vendor_id']});
        }
    };

    render () {
        const {item} = this.props;
        return (<TouchableOpacity onPress={() => this.onBannerPressed(item)} activeOpacity={0.95}
                                  style={[{flex: 1, justifyContent: 'center', alignItems: 'center'}, styles.container]}>
            <ImageBackground source={{uri: `https://snapfoodal.imgix.net/${item['image_path']}?w=800&h=800`}}
                             style={[{height: itemHeight, width: sliderWidth - 20}, styles.backgroundImage]}
                             imageStyle={{borderRadius: 5}}>
                <Tag text={bannerType[item.label]}/>
                <View style={{backgroundColor: 'rgba(0, 0, 0, .3)', marginHorizontal: -10, paddingHorizontal: 10}}>
                    {!!item.title && <Text style={styles.title}>{item.title}</Text>}
                    {!!item.description && <Text style={styles.subtitle}>{item.description}</Text>}
                </View>
            </ImageBackground>
        </TouchableOpacity>);
    }
}

const styles = StyleSheet.create({
    backgroundImage: {
        borderRadius: 20,
        justifyContent: 'space-between',
        padding: 10,
        paddingBottom: 25,
        marginVertical: 10,
    },
    title: {
        color: Theme.colors.white,
        fontFamily: 'SanFranciscoDisplay-Semibold',
        fontSize: 20,
        paddingTop: 3.8,
    },
    subtitle: {
        color: Theme.colors.white,
        fontSize: 13,
        paddingBottom: 4.3,
    },
    container: {
        paddingHorizontal: 10,
        borderRadius: 20,
    },
});

export default BannerElement;
