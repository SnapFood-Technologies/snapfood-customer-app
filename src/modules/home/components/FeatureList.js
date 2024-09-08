import React, { useEffect, useState, useRef } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import Feather from 'react-native-vector-icons/Feather'
import Carousel from 'react-native-snap-carousel';
import { height, width } from 'react-native-dimension';
import { AppText } from '../../../common/components';
import Theme from '../../../theme';
import { VendorItem } from '../../../common/components';
import _ from 'react-native-google-places';
import { useSelector } from 'react-redux';

const sliderWidth = width(100) - 20;
const itemWidth = sliderWidth;

const FeatureList = ({ label, items, active_vendors = [], goVendorDetail, onFavChange, isPromoBannerBeneath }) => {
    const _carousel = useRef(null);
    const _itemIndex = useRef(0);

    const [showAll, setShowAll] = useState(false);
    const [isLeftArroyVisible, setLeftArroyVisible] = useState(true);
    const [isRightArroyVisible, setRightArroyVisible] = useState(true);
    const dividerForBanner = useSelector(state => (state.app.all_banners) ? (state.app.all_banners.length > 0) : false);
    // const [direction, setDirection] = useState(null);
    const [loopFeature, setLoopFeature] = useState(false);
    useEffect(() => {
      const isAnyClosed = items.some(item => {
            return item.is_open == 0;
      });
      if (isAnyClosed) {
        setLeftArroyVisible(false)
      }
      setLoopFeature(!isAnyClosed);
    }, []);
 
    return <View style={[Theme.styles.col_center_start, { width: '100%', alignItems: 'flex-start', marginBottom: 16 }]}>
        <AppText style={styles.subjectTitle}>{label}</AppText>
        <SafeAreaView>
            <View style={{ width: '100%', marginTop: 12, }}>
                <Carousel
                    ref={_carousel}
                    onScroll={(e) => {
                        setShowAll(true);
                    }}
                    autoplay={false}
                    useScrollView={true}
                    horizontal={true}
                    loopClonesPerSide={showAll == true ? items.length : 2}
                    loop={loopFeature}
                    data={items.slice(0, (showAll == true ? items.length : 2))}
                    sliderWidth={sliderWidth}
                    itemWidth={itemWidth}
                    itemHeight={150}
                    sliderHeight={250}
                    inactiveSlideScale={1}
                    inactiveSlideOpacity={1}
                    style={{ backgroundColor: '#f00' }}
                    renderItem={({ item }) => (
                        <VendorItem
                            key={item.id}
                            data={item}
                            vendor_id={item.id}
                            isFav={item.isFav}
                            is_open={active_vendors.findIndex(v => v.id == item.id) != -1}
                            style={{ width: width(100) - 40, marginRight: 20, }}
                            onFavChange={onFavChange}
                            onSelect={() => goVendorDetail(item)}
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
                        if (items.length >= 1) {
                            if (loopFeature == false && (items.length == (index + 1))) {
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
        {
            items.length > 1 &&
            <View style={[Theme.styles.row_center, { marginVertical: 8 }]}>
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
        }
        {(dividerForBanner == true && isPromoBannerBeneath == true) ?
        <View style={styles.dividerBanner} />
        : <View style={styles.divider} />
        }
        
    </View>
};

const styles = StyleSheet.create({
    subjectTitle: { fontSize: 21, fontFamily: Theme.fonts.bold, color: Theme.colors.text },
    divider: { width: '100%', height: 1, backgroundColor: '#F6F6F9' },
    dividerBanner: { width: '100%', height: 5, backgroundColor: '#E9E9F7', marginTop: 8 },
    leftArrowView: { paddingHorizontal: 4 },
    rightArrowView: { paddingHorizontal: 4 },
    arrow: { width: 32, height: 32, borderRadius: 18, borderWidth: 1, borderColor: Theme.colors.cyan2 },
})
export default FeatureList;
