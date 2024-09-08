import React, { useEffect, useState, useRef } from 'react';
import { ScrollView, View, Text, StyleSheet, Dimensions, TouchableOpacity, SafeAreaView } from 'react-native';
import Feather from 'react-native-vector-icons/Feather'
import Carousel from 'react-native-snap-carousel';
import { height, width } from 'react-native-dimension';
import { AppText } from '../../../common/components';
import Theme from '../../../theme';
import { VendorItem } from '../../../common/components';
import _ from 'react-native-google-places';
import { useSelector } from 'react-redux';
import PromoBannerItem from '../../../common/components/banner/PromoBannerItem';
import { useMemo } from 'react';

const itemOffset = 8;
const itemHorizontalMargin = 4;
export const sliderWidth = width(100) - 40;
export const itemWidth = sliderWidth - itemHorizontalMargin - itemOffset;

const BannerList = ({ navigation, position = 'in_vendor', hasDivider, }) => {
    const total_banners = useSelector(state => state.app.all_banners || []);

    const _carousel = useRef(null);
    const _itemIndex = useRef(0);

    const [showAll, setShowAll] = useState(false);
    const [isLeftArroyVisible, setLeftArroyVisible] = useState(false);
    const [isRightArroyVisible, setRightArroyVisible] = useState(false);

    // const [direction, setDirection] = useState(null);
    const [loopFeature, setLoopFeature] = useState(false);
    useEffect(() => {
        setLoopFeature(false);
    }, []);

    const all_banners = useMemo(()=> {
        if (total_banners != null && total_banners.length > 0 ) {
            if (position == 'in_vendor') {
                return total_banners.filter(b => b.position == 1);
            }
            else {
                return total_banners.filter(b => b.position == 0);
            }
        }
        return [];
    }, [total_banners, position])

    if (all_banners.length == 0) {
        return null;
    }

    return <View style={[Theme.styles.col_center_start, { width: '100%', alignItems: 'flex-start', marginBottom: 12 }]}>
        <SafeAreaView>
            <View style={{ width: '100%', marginTop: 0, }}>
                <Carousel
                    ref={_carousel}
                    onScroll={(e) => {
                        setShowAll(true);
                    }}
                    autoplay={false}
                    // layout={'stack'}
                    useScrollView={true}
                    horizontal={true}
                    // loopClonesPerSide={showAll == true ? all_banners.length : 2}
                    loop={loopFeature}
                    data={all_banners.slice(0, (showAll == true ? all_banners.length : 3))}
                    sliderWidth={sliderWidth}
                    itemWidth={all_banners.length == 1 ? sliderWidth : (
                        ((isLeftArroyVisible && !isRightArroyVisible) || (!isLeftArroyVisible && isRightArroyVisible)) ?
                            (itemWidth - itemHorizontalMargin - itemOffset) : ((isLeftArroyVisible && isRightArroyVisible) ) ?
                            (itemWidth - itemOffset) : (itemWidth - itemOffset - itemHorizontalMargin)
                    )}
                    itemHeight={138}
                    sliderHeight={250}
                    inactiveSlideScale={1}
                    inactiveSlideOpacity={1}
                    activeSlideAlignment={(isLeftArroyVisible && isRightArroyVisible) ? 'center' :
                        isLeftArroyVisible ? 'end' : 'start'
                    }
                    slideStyle={{ justifyContent: 'center' }}
                    renderItem={({ item, index }) => (
                        <PromoBannerItem
                            key={item.id}
                            navigation={navigation}
                            item={item}
                            style={{
                                marginRight: 0, width: '100%',
                                paddingLeft: (index == 0 ? 0 : itemHorizontalMargin),
                                paddingRight: (index == (all_banners.length - 1) ? 0 : itemHorizontalMargin),
                            }}
                        />
                    )}
                    onSnapToItem={index => {
                        // if (_itemIndex.current < index) {
                        //     setDirection('right');
                        // }
                        // else {
                        //     setDirection('left');
                        // }
                        if (index == 0 && loopFeature == false) {
                            setLeftArroyVisible(false)
                        } else {
                            setLeftArroyVisible(true)
                        }
                        if (all_banners.length >= 1) {
                            if (loopFeature == false && (all_banners.length == (index + 1))) {
                                setRightArroyVisible(false)
                            } else {
                                setRightArroyVisible(true)
                            }
                        }
                        _itemIndex.current = index;
                    }}
                />
            </View>
        </SafeAreaView>
        {/* {
            all_banners.length > 1 &&
            <View style={[Theme.styles.row_center, { marginVertical: 8, marginBottom: 16 }]}>
                {isLeftArroyVisible && (
                    <TouchableOpacity style={[Theme.styles.col_center, styles.leftArrowView]}
                        onPress={() => {
                            _carousel.current?.snapToPrev();
                        }}
                    >
                        <View style={[Theme.styles.col_center, styles.arrow,
                        {
                            backgroundColor: Theme.colors.white
                        }
                        ]}>
                            <Feather name='chevron-left' color={Theme.colors.cyan2} size={20} />
                        </View>
                    </TouchableOpacity>
                )}
                {isRightArroyVisible && (
                    <TouchableOpacity style={[Theme.styles.col_center, styles.rightArrowView]}
                        onPress={() => {
                            _carousel.current?.snapToNext();
                        }}
                    >
                        <View style={[Theme.styles.col_center, styles.arrow,
                        {
                            backgroundColor: Theme.colors.white
                        }
                        ]}>
                            <Feather name='chevron-right' color={Theme.colors.cyan2} size={20} />
                        </View>
                    </TouchableOpacity>
                )}
            </View>
        } */}
        {hasDivider ? <View style={styles.divider} /> : <View style={{ marginTop: 8 }}></View>}
    </View>
};

const styles = StyleSheet.create({
    subjectTitle: { fontSize: 21, fontFamily: Theme.fonts.bold, color: Theme.colors.text },
    divider: { width: '100%', height: 5, backgroundColor: '#E9E9F7', marginTop: 16 },
    leftArrowView: { paddingHorizontal: 4 },
    rightArrowView: { paddingHorizontal: 4 },
    arrow: { width: 32, height: 32, borderRadius: 18, borderWidth: 1, borderColor: Theme.colors.cyan2 },
})
export default BannerList;
