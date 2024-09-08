import { StyleSheet } from 'react-native';
import Theme from '../../../theme';

const resultsStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.white,
    },
    nores: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        color: Theme.colors.text,
        fontFamily: Theme.fonts.bold,
        fontSize: 23,
        textAlign: 'center',
        paddingTop: 20,
    },
    description: {
        color: Theme.colors.text,
        lineHeight: 25,
        fontFamily: Theme.fonts.medium,
        fontSize: 18,
        textAlign: 'center', 
        paddingHorizontal: 20,
    },
    image: {
        width: 300,
        height: 110,
    },
    ////////////////////////////////////////////////////////////////
    closedModalView: {
        paddingTop: 10,
        paddingLeft: 10,
        backgroundColor: Theme.colors.white,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
    },
    closedModalTitle: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        color: Theme.colors.black,
        fontFamily: Theme.fonts.bold,
        fontSize: 17,
    },
    closedModalDesc: {
        paddingLeft: 10,
        paddingVertical: 5,
        color: Theme.colors.gray1,
        fontFamily: Theme.fonts.medium,
        fontSize: 15,
    },
    closedModalImageContainer: {
        //flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closedModalImage: {
        height: 60,
        width: 60,
        borderRadius: 8,
        resizeMode: 'contain',
        overflow: 'hidden',
    },
    closedModalInfoContainer: {
        marginTop: 30,
        flexDirection: 'row',
    },
    closedModalInfo: {
        flex: 1,
    },
    closedModalInfoDesc: {
        paddingHorizontal: 10,
        paddingVertical: 20,
        color: Theme.colors.gray1,
        fontFamily: Theme.fonts.medium,
        fontSize: 13,
        textAlign: 'center',
    },
    closedModalIcoContainer: {
        paddingVertical: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closedModalIco: {
        height: 20,
        width: 20,
        resizeMode: 'contain',
    },
    modal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    modalView: {
        paddingTop: 10,
        backgroundColor: Theme.colors.white,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
    },
});
export default resultsStyles;