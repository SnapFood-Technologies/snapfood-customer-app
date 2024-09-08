import {Dimensions, StyleSheet} from 'react-native';
import Theme from '../../../theme';

const {width} = Dimensions.get('window');

const orderItemStyles = StyleSheet.create({
    itemContainer: {
        backgroundColor: Theme.colors.white,
        width: width - 20,
        margin: 10,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 4,
    },
    topSection: {
        flexDirection: 'row',
    },
    topSectionLeft: {
        flexDirection: 'row',
        flex: 5,
        alignItems: 'center',
    },
    topSectionLeftTitle: {
        color: Theme.colors.black,
        fontFamily: 'SanFranciscoDisplay-Semibold',
        fontSize: 15,
        textAlign: 'left',
    },
    topSectionLeftPrice: {
        paddingVertical: 5,
        color: Theme.colors.black,
        fontFamily: 'SanFranciscoDisplay-Bold',
        fontSize: 14,
        textAlign: 'right',
    },
    topSectionRight: {
        flex: 2,
        padding: 5,
        backgroundColor: '#7fbfd1',
        justifyContent: 'center',
        alignItems: 'center',
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 4,
    },
    topSectionRightText: {
        color: Theme.colors.white,
        fontFamily: 'SanFranciscoDisplay-Medium',
        fontSize: 12,
        textAlign: 'center',
    },
    middleSection: {
        paddingTop: 10,
    },
    middleSectionFoodContainer: {
        flexDirection: 'row',
        flex: 9,
        paddingVertical: 2,
    },
    middleSectionNr: {
        color: Theme.colors.cyan2,
        fontFamily: 'SanFranciscoDisplay-Medium',
        fontSize: 13,
    },
    middleSectionFood: {
        color: Theme.colors.gray2,
        fontFamily: 'SanFranciscoDisplay-Medium',
        fontSize: 13,
    },
    productPrice: {
        color: Theme.colors.gray2,
        fontFamily: 'SanFranciscoDisplay-Medium',
        fontSize: 13,
        textAlign: 'right',
    },
    bottomSection: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    bottomSectionImage: {
        width: 30,
        height: 30,
    },
    bottomSectionIco: {
        width: 13,
        height: 13,
    },
    bottomSectionText: {
        color: Theme.colors.gray2,
        fontFamily: 'SanFranciscoDisplay-Regular',
        fontSize: 11,
    },
    bottomSectionLeft: {
        flexDirection: 'row',
        marginRight: 10,
    },
    bottomSectionMiddle: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    bottomSectionRight: {
        flex: 1,
        marginTop: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
export default orderItemStyles;
