import { TouchableOpacity, View, Text, StyleSheet, Dimensions } from 'react-native';
import FastImage from 'react-native-fast-image';
import AppText from '../../../common/components/AppText';
import { translate, getLanguage } from '../../../common/services/translate';
import Theme from '../../../theme';
import Config from '../../../config';
import React from 'react';
import { isEmpty } from '../../../common/services/utility';
// svgs
import Svg_allcohol from '../../../common/assets/svgs/food_cats/allcohol.svg';
import Svg_bio from '../../../common/assets/svgs/food_cats/bio.svg';
import Svg_chinese from '../../../common/assets/svgs/food_cats/chinese.svg';
import Svg_crepe from '../../../common/assets/svgs/food_cats/crepe.svg';
import Svg_dessert from '../../../common/assets/svgs/food_cats/dessert.svg';
import Svg_drugs from '../../../common/assets/svgs/food_cats/drugs.svg';
import Svg_fastfood from '../../../common/assets/svgs/food_cats/fastfood.svg';
import Svg_grocery from '../../../common/assets/svgs/food_cats/grocery.svg';
import Svg_japanese from '../../../common/assets/svgs/food_cats/japanese.svg';
import Svg_juice from '../../../common/assets/svgs/food_cats/juice.svg';
import Svg_market from '../../../common/assets/svgs/food_cats/market.svg';
import Svg_meat from '../../../common/assets/svgs/food_cats/meat.svg';
import Svg_mediterranean from '../../../common/assets/svgs/food_cats/mediterranean.svg';
import Svg_mexican from '../../../common/assets/svgs/food_cats/mexican.svg';
import Svg_smoothie from '../../../common/assets/svgs/food_cats/smoothie.svg';
import Svg_soup from '../../../common/assets/svgs/food_cats/soup.svg';
import Svg_pizza from '../../../common/assets/svgs/food_cats/pizza.svg';
import Svg_breakfast from '../../../common/assets/svgs/food_cats/breakfast.svg';
import Svg_sushi from '../../../common/assets/svgs/food_cats/sushi.svg';
import Svg_burger from '../../../common/assets/svgs/food_cats/burger.svg';
import Svg_vegan from '../../../common/assets/svgs/food_cats/vegan.svg';
import Svg_winery from '../../../common/assets/svgs/food_cats/winery.svg';


const windowWidth = Dimensions.get('window').width;
const btnWidth = parseInt((windowWidth - 96) / 4.2);
const btnHeight = 92;
const CategItem = ({ category, isSelected, onSelect }) => {
    const getIcon = () => {
        if (category.icon == 'glass-3') {
            return <Svg_allcohol width={27} height={27} />;
        }
        else if (category.icon == 'pizza') {
            return <Svg_pizza width={27} height={27} />;
        }
        else if (category.icon == 'broccoli') {
            return <Svg_bio width={27} height={27} />;
        }
        else if (category.icon == 'noodles') {
            return <Svg_chinese width={27} height={27} />;
        }
        else if (category.icon == 'kebab') {
            return <Svg_crepe width={27} height={27} />;
        }
        else if (category.icon == 'cupcake') {
            return <Svg_dessert width={27} height={27} />;
        }
        else if (category.icon == 'tea') {
            return <Svg_drugs width={27} height={27} />;
        }
        else if (category.icon == 'kebab') {
            return <Svg_fastfood width={27} height={27} />;
        }
        else if (category.icon == 'apple') {
            return <Svg_grocery width={27} height={27} />;
        }
        else if (category.icon == 'sushi-2') {
            return <Svg_japanese width={27} height={27} />;
        }
        else if (category.icon == 'frappe') {
            return <Svg_juice width={27} height={27} />;
        }
        else if (category.icon == 'groceries') {
            return <Svg_market width={27} height={27} />;
        }
        else if (category.icon == 'steak') {
            return <Svg_meat width={27} height={27} />;
        }
        else if (category.icon == 'spaguetti') {
            return <Svg_mediterranean width={27} height={27} />;
        }
        else if (category.icon == 'taco') {
            return <Svg_mexican width={27} height={27} />;
        }
        else if (category.icon == 'coffee-4') {
            return <Svg_smoothie width={27} height={27} />;
        }
        else if (category.icon == 'coffee') {
            return <Svg_soup width={27} height={27} />;
        }
        else if (category.icon == 'sushi-1') {
            return <Svg_sushi width={27} height={27} />;
        }
        else if (category.icon == 'hamburguer-1') {
            return <Svg_burger width={27} height={27} />;
        }
        else if (category.icon == 'carrot') {
            return <Svg_vegan width={27} height={27} />;
        }
        else if (category.icon == 'glass-4') {
            return <Svg_winery width={27} height={27} />;
        }
        return <Svg_breakfast width={27} height={27} />;
    }


    return <TouchableOpacity onPress={() => onSelect(category)}
        style={[Theme.styles.col_center, styles.container, isSelected && { backgroundColor: Theme.colors.cyan2 }]}>
        <View style={[Theme.styles.col_center, styles.imgView]}>
            {
                isEmpty(category.image) ?
                    getIcon()
                    :
                    <FastImage
                        source={{ uri: Config.IMG_BASE_URL + category.image }}
                        style={{ width: 26, height: 26 }}
                        resizeMode={FastImage.resizeMode.contain}
                    />
            }
        </View>
        <AppText style={[styles.text, isSelected && { color: Theme.colors.white }]} numberOfLines={1}>
            {getLanguage() == 'en' ? category.title_en : category.title_sq}
        </AppText>
        <View style={[styles.indicator, isSelected && { backgroundColor: Theme.colors.white }]} />
    </TouchableOpacity>;
};

const styles = StyleSheet.create({
    container: { justifyContent: 'space-between', height: btnHeight, maxWidth: 76, width: '100%', borderRadius: 50, backgroundColor: Theme.colors.gray6, padding: 7, },
    imgView: { width: 50, height: 50, borderRadius: 25, backgroundColor: Theme.colors.white },
    text: { fontSize: 13, color: Theme.colors.gray7, fontFamily: Theme.fonts.semiBold, },
    indicator: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: Theme.colors.gray6, }
})


function arePropsEqual(prevProps, nextProps) {
    if (prevProps.isSelected != nextProps.isSelected ||
        prevProps.cat_id != nextProps.cat_id
    ) {
        return false;
    }
    return true;
}

export default React.memo(CategItem, arePropsEqual);
