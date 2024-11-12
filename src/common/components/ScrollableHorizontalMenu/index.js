import React, { useState, useRef, useEffect } from 'react';
import { Text, ScrollView, TouchableOpacity, View } from 'react-native';

import GestureRecognizer from 'react-native-swipe-gestures';
import Theme from '../../../theme';

import styles from './styles';

const ScrollableHorizontalMenu = ({ items = [], onItemSelected = () => { }, selectedItem = 0, style = {} }) => {
  const [selected, setSelected] = useState(0);
  const [categoriesDimensions, setCategoriesDimensions] = useState([]);
  const scrollView = useRef(null);

  useEffect(() => {
    if (selectedItem < categoriesDimensions.length && categoriesDimensions[selectedItem]) {
      setSelected(selectedItem);
      const { x } = categoriesDimensions[selectedItem];
      scrollView.current && scrollView.current.scrollTo({ x: x - 10 <= 0 ? x : x - 10 });
    }
  }, [selectedItem]);

  const renderMenuItems = () => {
    return items.map((item, index) => (
      <TouchableOpacity
        style={[{ marginRight: 30 }, selected === index && styles.activeCat]}
        onLayout={(event) => {
          if (categoriesDimensions[index] == null) {
            const { width, x } = event.nativeEvent.layout;
            const newCategDimensions = [...categoriesDimensions];
            newCategDimensions[index] = { index, width, x };
            setCategoriesDimensions(newCategDimensions);
          }
        }}
        activeOpacity={1}
        key={index}
        onPress={() => {
          setSelected(index);
          onItemSelected(index);
        }}
      >
        <Text style={[styles.catItem, selected === index && { color: Theme.colors.cyan2 }]}>{item.title}</Text>
      </TouchableOpacity>
    ));
  };

  return (
    <View style={[Theme.styles.row_center]}>
      <ScrollView
        style={[styles.container]}
        horizontal
        contentContainerStyle={styles.scrollViewContentContainer}
        ref={scrollView}
      >
        <View style={[Theme.styles.row_center]}>
          {renderMenuItems()}
        </View>
      </ScrollView>
    </View>
  );
};

function arePropsEqual(prevProps, nextProps) {
  if (prevProps.selectedItem != nextProps.selectedItem) {
    
    return false;
  }
  let isEqual = true;
  if (prevProps.items.length != nextProps.items.length || nextProps.items.filter((x) => prevProps.items.findIndex(i => i.id != x.id) === -1).length > 0) {
    isEqual = false;
    
  }
  return true;
}

export default React.memo(ScrollableHorizontalMenu, arePropsEqual);
