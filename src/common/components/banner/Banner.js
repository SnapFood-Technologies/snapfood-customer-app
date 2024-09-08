import React from 'react';
import {Dimensions, View} from 'react-native';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import BannerElement from './BannerElement';
import {connect} from 'react-redux';
import Theme from '../../../theme';

const sliderWidth = Dimensions.get('window').width - 20;
const itemWidth = sliderWidth - 20;

class Banner extends React.Component {
    constructor (props) {
        super(props);
        this.state = {};
    }

    get pagination () {
        const {activeSlide} = this.state;
        const {banners} = this.props;

        return <Pagination dotsLength={banners ? banners.length : 0}
                           activeDotIndex={activeSlide || 0}
                           containerStyle={{paddingVertical: 0}}
                           dotStyle={{
                               width: 7,
                               height: 7,
                               borderRadius: 3.5,
                               backgroundColor: Theme.colors.primary,
                               marginVertical: 0,
                           }}
                           inactiveDotOpacity={0.4}
                           inactiveDotScale={0.6}
        />;
    }

    render () {
        const {banners, goToRestaurantDetails} = this.props;

        return (
            <View>
                <Carousel loop={true}
                          data={banners}
                          sliderWidth={sliderWidth}
                          itemWidth={itemWidth}
                          renderItem={({item}) => <BannerElement item={item}
                                                                 goToRestaurantDetails={goToRestaurantDetails}/>}
                          onSnapToItem={index => this.setState({activeSlide: index})}
                />
                {this.pagination}
            </View>

        );
    }
}

function mapStateToProps ({app}) {
    return {
        banners: app.banners,
    };
}

export default connect(
    mapStateToProps,
    {},
)(Banner);
