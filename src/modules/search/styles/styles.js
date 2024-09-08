import {Platform, StyleSheet} from 'react-native';
import Theme from '../../../theme';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Theme.specifications.statusBarHeight,
        backgroundColor: '#ffffff',
    },

    searchView: { flex: 1, width: '100%', backgroundColor: '#ffffff',},

    /* Category Item style properties */

    cat: {
        flexDirection: 'row',
        paddingVertical: 15,  
        justifyContent: 'center',
        borderBottomWidth: 1, 
        borderBottomColor: Theme.colors.gray9,
    },
    cat1: {
        flexDirection: 'row',
        marginVertical: 5, 
        marginTop: 15,
        justifyContent: 'center'
    }, 
    catImage: {
        width: 23,
        height: 23
    },
    ItemImage: {
        width: 55,
        height: 55,
        borderWidth:0.1,
        borderRadius:4,
        marginRight: 20,
        marginTop: 2.5
    },
    ItemImage1: {
        width: 45,
        height: 45,
        borderWidth:0.1,
        borderRadius:4,
        marginRight: 20,
    },
    catTitleContainer: {
        flex: 1, 
        justifyContent: 'center', 
    },
    catTitle: {
        color: Theme.colors.text,
        fontFamily: Theme.fonts.medium,
        fontSize: 15,

    },
    items: {
        color: '#7E7E7E',
        fontFamily: Theme.fonts.medium,
        fontSize: 14,
        paddingVertical: 2,

    },
    rate: {
        color: '#25252D',
        fontFamily: Theme.fonts.medium,
        fontSize: 13,
        //paddingVertical: 3,
        marginLeft: 4
    },
    /* Search bar style properties */

    searchContainer: {
        backgroundColor: Theme.colors.white,
    },
    search: {
        backgroundColor: Theme.colors.white,
        flex: 1,
        margin: 10,
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    icoContainer: {
        marginLeft: 5,
        marginRight: 7,
        justifyContent: 'center',
    },
    ico: {
        width: Platform.OS === 'ios' ? 20 : 18,
        height: Platform.OS === 'ios' ? 20 : 18,
    },
    placeholderContainer: {
        flex: 1,
    },
    placeholder: {
        fontSize: 19,
        fontFamily: Theme.fonts.medium,
        color: Theme.colors.white,
    },
    buttonPrimaryStyle: {
        backgroundColor: "blue",
        width: '80%',
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    subjectTitle : { marginTop: 15, marginBottom: 12, fontSize: 16, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text},
    clearallBtn: {fontSize: 16, fontFamily: Theme.fonts.semiBold, color: Theme.colors.gray7},
    popularSearches : {width: '100%', flexDirection: 'row', flexWrap : 'wrap', },
    popularItem : {paddingHorizontal: 32, paddingVertical: 10, borderRadius: 9, backgroundColor: '#50b7ed26', marginRight: 12, marginBottom: 12 },
    popularTitle : {fontSize: 16, fontFamily: Theme.fonts.semiBold, color: Theme.colors.cyan2},
    suggestedTxt : {fontSize: 15, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text},
});

export default styles;