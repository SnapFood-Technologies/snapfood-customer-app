import { StyleSheet } from 'react-native';
import { width } from 'react-native-dimension';
import Theme from '../../../theme';

export default StyleSheet.create({
  catItem: { fontSize: 20, fontFamily: Theme.fonts.semiBold, color: Theme.colors.gray7 },
  activeCat: { borderBottomColor: Theme.colors.cyan2, borderBottomWidth: 1, },
  container: { 
    height: 45,
    width: width(100) - 40,
  },
  scrollViewContentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
