import React, { useEffect, useState, } from 'react';
import { TouchableOpacity, StyleSheet, View, Text, } from 'react-native';
import FastImage from 'react-native-fast-image';
import Gallery from 'react-native-image-gallery';
import Theme from '../../../theme';

const ImageCarousel = (({ images, titles, subtitles, style, imageStyle, onPress, onPageSelected }) => {

    const [curIndex, setIndex] = useState(0)
    const inactiveDotColor = Theme.colors.gray6
    const activeDotColor = Theme.colors.cyan2

    return (
        <View  style={[Theme.styles.col_center, styles.container, style]}>
            <Gallery
                style={styles.gallery}
                imageComponent={(image, dim) =>
                    <FastImage source={image.source}  style={[styles.img, imageStyle]} resizeMode={FastImage.resizeMode.cover} />
                }
                images={images}
                initialPage={curIndex}
                onPageSelected={(id) => {
                    setIndex(id)
                    if (onPageSelected != null) onPageSelected(id)
                }}
                onSingleTapConfirmed={onPress ? onPress : () => { }}
            />
            <View style={[Theme.styles.col_center, styles.pagination]}>
                <View style={[Theme.styles.row_center,]}>
                    {
                        (images || []).map((item, index) =>
                            <View key={index} style={[styles.indicator, { backgroundColor: curIndex == index ? activeDotColor : inactiveDotColor }]} />
                        )
                    }
                </View>
            </View>
            <Text style={styles.subtitle}>{titles[curIndex]}</Text>
            <Text style={styles.title}>{subtitles[curIndex]}</Text>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 190, 
    },
    gallery: { position: 'absolute', top: 0,  width: '100%', height: '100%', backgroundColor: Theme.colors.white },
    img: { width: '100%', height: '100%', resizeMode: 'cover', },
    pagination: { position: 'absolute', bottom: 2,  height: 20, width: '100%', },
    indicator: { width: 5, height: 5, borderRadius: 2.5, margin: 6, }, 
    title : {fontSize: 16, fontFamily: Theme.fonts.medium, color: Theme.colors.white },
    subtitle : { fontSize: 12, fontFamily: Theme.fonts.medium, color: Theme.colors.white },
});

export default ImageCarousel;
