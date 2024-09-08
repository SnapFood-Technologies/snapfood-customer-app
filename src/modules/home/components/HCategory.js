import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Carousel from 'react-native-snap-carousel';
import Theme from '../../../theme';

const HCategory = ({ items, curitem,sliderWidth, itemWidth, onSelect }) => {
    const curItem = items.length > 0 && curitem == null ? items[0] : curitem

    _renderItem = ({ item, index }) => {
        return (
            <TouchableOpacity key={index} style={[curItem == item ? styles.activeCat : null, { marginRight: 30 }]}>
                <Text style={[styles.catItem, curItem == item && { color: Theme.colors.cyan2 }]}>{item}</Text>
            </TouchableOpacity>
        );
    }

    return <Carousel
        ref={(c) => { this._carousel = c; }}
        data={items}
        renderItem={this._renderItem}
        sliderWidth={sliderWidth}
        itemWidth={itemWidth}
    />
};

const styles = StyleSheet.create({
    catItem: { fontSize: 14, fontFamily: Theme.fonts.semiBold, color: Theme.colors.gray7 },
    activeCat: { borderBottomColor: Theme.colors.cyan2, borderBottomWidth: 1, },
})
export default HCategory;
