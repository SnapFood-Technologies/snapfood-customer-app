import {StyleSheet} from 'react-native';
import Theme from '../../../theme';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.white,
    },
    mainTitle: {
        padding: 10,
        paddingTop: 20,
        paddingBottom: 5,
        color: Theme.colors.gray2,
        fontFamily: 'SanFranciscoDisplay-Regular',
        fontSize: 17,
    },
    itemContainer: {
        flexDirection: 'row',
        backgroundColor: Theme.colors.white,
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.listBorderColor,
    },
    leftSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    leftSectionImage: {
        width: 55,
        height: 55,
        resizeMode: 'contain',
    },
    rightSection: {
        flex: 4,
    },
    rightTopSection: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    rightTopSectionTitle: {
        color: Theme.colors.black,
        fontFamily: 'SanFranciscoDisplay-Bold',
        fontSize: 17,
    },
    rightTopSectionImage: {
        width: 19,
        height: 19,
        resizeMode: 'contain',
    },
    rightBottomSection: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    rightBottomSectionText: {
        color: Theme.colors.gray2,
        fontFamily: 'SanFranciscoDisplay-Regular',
        fontSize: 12,
    },
    rightBottomSectionFirst: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    rightBottomSectionFirstImage: {
        width: 13,
        height: 13,
        resizeMode: 'contain',
    },
    rightBottomSectionSecond: {
        flex: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderLeftWidth: 2,
        borderLeftColor: Theme.colors.listBorderColor,
        borderRightWidth: 2,
        borderRightColor: Theme.colors.listBorderColor,
    },
    rightBottomSectionThird: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
export default styles;
