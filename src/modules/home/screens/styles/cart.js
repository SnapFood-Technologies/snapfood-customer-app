import { Dimensions, StyleSheet } from 'react-native';
import Theme from '../../../../theme';

const { width } = Dimensions.get('window');

const cartStyles = StyleSheet.create({

	markerInfoView: { backgroundColor: '#fff', elevation: 4, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12 },
	markerAnchor: { position: 'absolute', elevation: 2, bottom: -8, left: '44%', width: 16, height: 16, backgroundColor: '#fff', transform: [{ rotate: '45deg' }] },
	brandImg: { width: 39, height: 39, borderRadius: 8, borderWidth: 1, borderColor: '#f6f6f9' },
	brandName: { marginRight: 8, fontSize: 19, fontFamily: Theme.fonts.bold, color: Theme.colors.text },

	LogoText: { flex: 1, color: Theme.colors.text, fontSize: 19, fontFamily: Theme.fonts.bold, marginLeft: 10, },
	LogoView: { width: 34, height: 34, borderRadius: 8, backgroundColor: Theme.colors.white, },
	Logo: { width: 28, height: 28, },
	container: {
		flex: 1,
		width: width,
		paddingTop: 20,
		backgroundColor: Theme.colors.white,
	},
	topContainer: {
		flex: 1, width: '100%',
	},
	bottomContainer: {
		flex: 0.08,
		flexDirection: 'row',
		backgroundColor: Theme.colors.cyan2,
		alignItems: 'center',
		justifyContent: 'center',
	},
	foodContainer: {
		backgroundColor: Theme.colors.white,
		paddingHorizontal: 15,
		paddingVertical: 4,
	},
	profileContainer: {
		flexDirection: 'row',
		backgroundColor: Theme.colors.white,
		paddingHorizontal: 15,
		paddingVertical: 15,
	},
	profileImageContainer: {
		backgroundColor: '#F4F4F4',
		borderRadius: 4,
		width: 70,
		height: 50,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 20,
	},
	profileImage: {
		width: 50,
		height: 50,
		resizeMode: 'contain',
	},
	infoContainer: {
		flex: 1,
		justifyContent: 'space-around',
		paddingVertical: 4,
	},
	footerImage: {
		width: 15,
		height: 15,
		resizeMode: 'contain',
	},
	subjectTitle: { fontSize: 17, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text, },
	divider: { width: '100%', height: 1, backgroundColor: Theme.colors.gray9 },
	sectionView: { width: '100%', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Theme.colors.gray9 },
	couponDescText: { width: '100%', marginBottom: 12, paddingHorizontal: 20, textAlign: 'center', fontSize: 17, fontFamily: Theme.fonts.semiBold, color: Theme.colors.text, },
	////////////////////////////////////////////
	favoriteContainer: {
		paddingVertical: 10,
		paddingHorizontal: 10,
		backgroundColor: Theme.colors.light,
		marginLeft: 15,
		alignItems: 'center',
		// width: width - 70,
		padding: 8,
		//paddingBottom: ,
		marginBottom: 15,
		borderRadius: 5,
		flexDirection: 'row',
	},
	favoriteTop: {
		flex: 2,
		marginRight: 30,
		// borderBottomWidth: 1,
		// borderBottomColor: Theme.colors.listBorderColor,
	},
	favoriteBottom: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		alignContent: 'center',
	},
	favoriteMainTitle: {
		padding: 10,
		marginLeft: 5,
		paddingTop: 10,
		color: Theme.colors.black,
		fontWeight: 'bold',
		fontSize: 14,
	},
	favoriteTitle: {
		textAlign: 'left',
		paddingLeft: 10,
		color: Theme.colors.black,
		fontFamily: 'SanFranciscoDisplay-Regular',
		fontSize: 14,
		maxWidth: width * 0.7 - (30 + 10 + 40 + 10 + 17),
	},
	favoritePrice: {
		paddingLeft: 10,
		color: Theme.colors.cyan2,
		fontFamily: 'SanFranciscoDisplay-Regular',
		fontSize: 13,
		textAlign: 'right',
	},
	////////////////////////////////////////////
	tariffContainer: {
		backgroundColor: Theme.colors.white,
		padding: 5,
		paddingTop: 10,
		paddingRight: 15,
	},
	tariffRow: {
		flexDirection: 'row',
		paddingVertical: 5,
	},
	leftRow: {
		flex: 4,
	},
	rightRow: {
		flex: 1,
	},
	rightRowText: {
		paddingLeft: 10,
		color: Theme.colors.black,
		fontFamily: 'SanFranciscoDisplay-Medium',
		fontSize: 16,
		textAlign: 'right',
	},
	leftRowText: {
		paddingLeft: 10,
		color: Theme.colors.black,
		fontFamily: 'SanFranciscoDisplay-Medium',
		fontSize: 16,
		textAlign: 'left',
	},
	bottomContainerButton: {
		backgroundColor: 'transparent',
		margin: 10,
		marginHorizontal: 15,
		padding: 7,
		paddingRight: 2,
		paddingLeft: 2,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 4,
		borderWidth: 1,
		borderColor: Theme.colors.danger,
	},
	bottomContainerButtonText: {
		fontFamily: 'SanFranciscoDisplay-Medium',
		color: Theme.colors.danger,
		fontSize: 15,
		textAlign: 'center',
	},

	changeOrderTopContainerText: {
		fontFamily: 'SanFranciscoDisplay-Medium',
		color: Theme.colors.gray4,
		fontSize: 14,
		flex: 7,
		textAlign: 'left',
	},
	changeOrderTopContainerMenu: {
		fontFamily: 'SanFranciscoDisplay-Medium',
		color: Theme.colors.cyan1,
		fontSize: 13,
		textAlign: 'right',
	},

	orderTopContainer: {
		flex: 3,
		backgroundColor: 'transparent',
		margin: 10,
		marginHorizontal: 15,
		padding: 4,
		paddingRight: 8,
		paddingLeft: 8,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 4,
		borderWidth: 1,
		borderColor: Theme.colors.cyan1,
	},

	priceStyle: {
		color: '#979797',
		fontSize: 14,
		paddingLeft: 10,
	},
	couponContainer: {
		backgroundColor: Theme.colors.white,
		paddingHorizontal: 15,
	},
	couponTitle: {
		marginVertical: 5,
		fontSize: 14,
		fontWeight: 'bold',
	},
	scrollviewHider: { width: '100%', marginTop: -12, height: 15, backgroundColor: Theme.colors.white },

	error_msg_view: {
		width: '100%',
		padding: 12,
		backgroundColor: Theme.colors.white,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 12,
		borderWidth: 1,
		borderColor: Theme.colors.red1,
		borderStyle: 'dashed',
	},
	error_msg: {
		fontSize: 14,
		lineHeight: 18,
		textAlign: 'center',
		fontFamily: Theme.fonts.semiBold,
		color: Theme.colors.red1
	},
	legal_age_view: { width: '100%', paddingHorizontal: 20, },
	legal_age: { flex: 1, marginLeft: 8, fontSize: 15, fontFamily: Theme.fonts.medium, color: Theme.colors.text },

	promo_badge_title: {width: '100%', fontSize: 18, lineHeight: 23, fontFamily: Theme.fonts.semiBold, color: Theme.colors.white },
	promo_badge_desc: {marginTop: 7, width: '100%', fontSize: 16, lineHeight: 18, fontFamily: Theme.fonts.medium, color: Theme.colors.white },
});
export default cartStyles;
