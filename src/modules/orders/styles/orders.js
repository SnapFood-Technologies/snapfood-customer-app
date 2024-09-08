import {StyleSheet} from 'react-native';
import Theme from '../../../theme';

const orderStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#eae9ef',
    },
    overviewContainer: {
        flexDirection: 'row',
        padding: 10,
    },
    overviewItem: {
        flex: 1,
        margin: 5,
        padding: 3,
        paddingVertical: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
        borderBottomLeftRadius: 6,
        borderBottomRightRadius: 6,
    },
    overviewNumber: {
        color: Theme.colors.white,
        fontFamily: 'SanFranciscoDisplay-Medium',
        fontSize: 15,
        textAlign: 'center',
    },
    overviewTitle: {
        color: Theme.colors.white,
        fontFamily: 'SanFranciscoDisplay-Regular',
        fontSize: 8,
        textAlign: 'center',
    },
    noOrderImageContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    noOrderImage: {
        width: 200,
        height: 215,
    },
    noOrderTitle: {
        color: Theme.colors.black,
        fontFamily: 'SanFranciscoDisplay-Bold',
        fontSize: 19,
        padding: 10,
        textAlign: 'center',
    },
    noOrderDescription: {
        color: Theme.colors.gray1,
        fontFamily: 'SanFranciscoDisplay-Medium',
        fontSize: 16,
        paddingTop: 0,
        padding: 10,
        textAlign: 'center',
    },
    bottomContainerButton: {
        backgroundColor: Theme.colors.cyan2,
        marginTop: 30,
        margin: 10,
        marginHorizontal: 30,
        marginBottom: 0,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopLeftRadius: 100,
        borderTopRightRadius: 100,
        borderBottomLeftRadius: 100,
        borderBottomRightRadius: 100,
    },
    bottomContainerButtonText: {
        fontFamily: 'SanFranciscoDisplay-Medium',
        color: Theme.colors.white,
        fontSize: 18,
        textAlign: 'center',
    },
});

export default orderStyles;
