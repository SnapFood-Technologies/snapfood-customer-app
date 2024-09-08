import {StyleSheet} from 'react-native';
import Theme from '../../../theme';

export default styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        zIndex: 100,
        top: Theme.specifications.statusBarHeight,
        marginHorizontal: Theme.sizes.small,
        marginVertical: Theme.sizes.tiny,
    },
    headerTitle: {
        color: Theme.colors.white,
        fontSize: 29,
        fontFamily: 'SanFranciscoDisplay-Semibold',
        marginVertical: Theme.sizes.tiny,
    },
    forgotPasswordText: {
        color: '#A8A8A8',
        fontFamily: 'SanFranciscoDisplay-Light',
        textAlign: 'right',
        marginVertical: Theme.sizes.xTiny,
    },
    loginButton: {
        borderRadius: 5,
        backgroundColor: Theme.colors.cyan2,
        marginVertical: Theme.sizes.small,
    },
    loginButtonText: {
        color: Theme.colors.white,
        fontFamily: 'SanFranciscoDisplay-Semibold',
        textAlign: 'center',
        fontSize: 20,
        paddingVertical: Theme.sizes.tiny,
    },
    verifyButton: {
        borderRadius: 5,
        backgroundColor: Theme.colors.cyan2,
        marginTop: Theme.sizes.base,
    },
    updatePhoneButton: {
        borderRadius: 5,
        backgroundColor: Theme.colors.cyan2,
        marginVertical: Theme.sizes.base,
    },
    verifyButtonText: {
        color: Theme.colors.white,
        fontFamily: 'SanFranciscoDisplay-Semibold',
        textAlign: 'center',
        fontSize: 20,
        paddingVertical: Theme.sizes.tiny,
    },
    registerText: {
        color: Theme.colors.cyan2,
        fontFamily: 'SanFranciscoDisplay-Semibold',
        textAlign: 'center',
        fontSize: 14,
        paddingVertical: Theme.sizes.tiny,
    },
    mainContainer: {
        backgroundColor: Theme.colors.white,
        borderRadius: 5,
    },
    centeredContainer: {
        flex: 1,
        margin: Theme.sizes.large,
        justifyContent: 'center',
    },
    registerButton: {
        alignItems: 'center',
        borderWidth: 1,
        width: 120,
        borderColor: Theme.colors.cyan2,
        borderRadius: 5,
        paddingVertical: Theme.sizes.xTiny,
        marginBottom: Theme.sizes.base,
    },
    phoneFormActionButton: {
        flex: 1,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Theme.colors.cyan2,
        borderRadius: 5,
        paddingVertical: Theme.sizes.xTiny,
        marginBottom: Theme.sizes.base,
    },
    registerFormButton: {
        borderRadius: 5,
        backgroundColor: Theme.colors.cyan2,
        marginTop: Theme.sizes.base,
        marginBottom: Theme.sizes.normal,
    },
    registerButtonText: {
        color: Theme.colors.cyan2,
    },
    connectWith: {
        fontFamily: 'SanFranciscoDisplay-Semibold',
        fontSize: 17,
        marginVertical: Theme.sizes.base,
        color: '#D6D6D6',
    },

    appleButton: {
        width: '100%',
        height: 45,
        shadowColor: '#555',
        shadowOpacity: 0.5,
        shadowOffset: {
            width: 0,
            height: 3
        },
        marginVertical: 15,
    },

    appleButtonRegister: {
        width: '100%',
        height: 45,
        shadowColor: '#555',
        shadowOpacity: 0.5,
        shadowOffset: {
            width: 0,
            height: 3
        },
        marginBottom: Theme.sizes.normal,
    },


    phoneNumber : {
        fontSize: 17, 
        fontFamily: Theme.fonts.medium,
        color: Theme.colors.red1,
        textDecorationLine : 'underline',
    },
    verifybtn : {
        width: '100%',
        marginTop: 50, 
    },
    callmeTxt :  {
        fontSize: 17, 
        fontFamily: Theme.fonts.semiBold,
        color: Theme.colors.text,
        marginRight: 6,
    },
    resendText : {
        fontSize: 17, 
        fontFamily: Theme.fonts.semiBold,
        color: Theme.colors.cyan2
    },
});
