import { getStatusBarHeight } from 'react-native-status-bar-height';
import Config from '../config';

const Theme = {};

// Fonts
// ------------------------------------------------------------
Theme.fonts = {
	extraBold: 'Yellix-ExtraBold',
	bold: 'Yellix-Bold',
	semiBold: 'Yellix-SemiBold',
	light: 'Yellix-Light',
	medium: 'Yellix-Medium',
	regular: 'Yellix-Regular',
	thin: 'Yellix-Thin',
	black: 'Yellix-Black',
	italicExtraBold: 'Yellix-ExtraBoldItalic',
	italicBold: 'Yellix-BoldItalic',
	italicLight: 'Yellix-LightItalic',
	italicMedium: 'Yellix-MediumItalic',
};

// ------------------------------------------------------------
// Sizing
// ------------------------------------------------------------
Theme.sizes = {
	xsTiny: 4,
	xTiny: 8,
	tiny: 12,
	smallTiny: 14,
	small: 16,
	normalM: 19,
	normal: 20,
	base: 24,
	large: 48,
	xLarge: 64,
};

Theme.icons = {
	tiny: 10,
	small: 20,
	headerIcon: 24,
	base: 30,
	large: 40,
	xLarge: 50,
};

// ------------------------------------------------------------
// Specifications
//
Theme.specifications = {
	statusBarHeight: Config.isAndroid ? 5 : getStatusBarHeight(),
	headerHeight: 40,
};

// ------------------------------------------------------------
// Colors
//
Theme.colors = {
	transparent: 'transparent',
	background: '#FAFAFA',
	darkerBackground: '#ededed',
	greyBackground: '#f5f5f5',
	text: '#222222',
	text1: '#3E4958',
	subText: '#AFAFAF',
	placeholder: '#595959',
	whitePrimary: '#FFFFFF',
	blackPrimary: '#000000',
	btnPrimary: '#50B7ED',
	disabled: '#C9D6DF',
	blackTransparent6: 'rgba(0, 0, 0, 0.6)',
	backgroundTransparent3: 'rgba(225, 225, 225, 0.3)',
	backgroundTransparent4: 'rgba(225, 225, 225, 0.4)',
	backgroundTransparent5: 'rgba(225, 225, 225, 0.5)',
	backgroundTransparent6: 'rgba(225, 225, 225, 0.6)',
	backgroundTransparent7: 'rgba(225, 225, 225, 0.7)',
	backgroundTransparent8: 'rgba(225, 225, 225, 0.8)',
	primaryTransparent8: 'rgba(34, 173, 196, 0.8);',
	inactiveTintColor: '#373A3F',
	backgroundColor: '#f2f7f9',
	listBorderColor: '#d3e0e5',
	primary: '#50B7ED',
	secondary: '#32db64',
	danger: '#f53d3d',
	light: '#f4f4f4',
	dark: '#222',
	black: '#000',
	white: '#fff',
	red: '#f00',
	gray1: '#454b4c',
	gray2: '#707a7c',
	gray3: '#8c9799',
	gray4: '#737373',
	gray5: '#D5D4E0',
	gray6: '#E9E9F7',
	gray7: '#AAA8BF',
	gray8: '#FAFAFC',
	gray9: '#F6F6F9',
	cyan1: '#21adc4',
	cyan2: '#50B7ED',
	cyan3: '#23dee2',
	red1: '#f55a00',
	red2: '#00C22D',
	blue1: '#9900FF',
	alertError: '#cc1c4e',
	alertSuccess: '#1dd890',
	alertWarning: '#f4e637',
	warning: '#f4be38',
	alertInfo: '#109df7',
	alertNeutral: '#7850dd',
	socialFacebook: '#3b5998',
	socialTwitter: '#00aced',
};

Theme.styles = {
	container: {
		flex: 1,
		marginTop: Theme.specifications.statusBarHeight,
		backgroundColor: '#fff',
	},
	row_center: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
	col_center: { flexDirection: 'column', justifyContent: 'center', alignItems: 'center' },
	row_center_start: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' },
	col_center_start: { flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center' },
	row_center_end: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
	row_start_center: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start' },
	col_center_end: { flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' },
	flex_between: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
	w100: { width: '100%' },
	flex_1: { flex: 1 },
	appText: {
		fontFamily: 'Yellix-Medium',
	},
	background: {
		width: '100%',
		height: '100%',
		padding: 20,
		backgroundColor: '#ffffff',
	},
	divider: {
		height: 1,
		width: '100%',
		backgroundColor: '#E9E9F7',
	},
	top: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	title: {
		margin: 10,
		fontFamily: Theme.fonts.bold,
		color: Theme.colors.white,
		fontSize: 18,
		textAlign: 'center',
	},
	description: {
		fontFamily: Theme.fonts.medium,
		color: Theme.colors.text,
		fontSize: 16,
	},
	locationTitle: {
		margin: 10,
		fontFamily: Theme.fonts.bold,
		color: Theme.colors.text,
		fontSize: 20,
		textAlign: 'center',
	},
	locationDescription: {
		marginLeft: 10,
		marginRight: 10,
		fontFamily: Theme.fonts.medium,
		color: Theme.colors.text,
		fontSize: 16,
		textAlign: 'center',
	},
	logo: {
		width: 280,
		height: 36,
		resizeMode: 'contain',
	},
	location: {
		width: 180,
		height: 150,
		resizeMode: 'contain',
	},
	bottom: {
		flex: 1,
	},
	button: {
		backgroundColor: Theme.colors.btnPrimary,
		height: 50,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 12,
	},
	dot_button: {
		backgroundColor: Theme.colors.white,
		height: 50,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 12,
		borderWidth: 1,
		borderColor: Theme.colors.cyan2,
		borderStyle: 'dashed',
	},
	transbtn: {
		backgroundColor: Theme.colors.transparent,
	},
	disabledButton: {
		opacity: 0.5,
	},
	buttonText: {
		fontFamily: Theme.fonts.semiBold,
		color: Theme.colors.white,
		fontSize: 18,
	},
	dotButtonText: {
		fontFamily: Theme.fonts.semiBold,
		color: Theme.colors.cyan2,
		fontSize: 18,
		lineHeight: 18,
	},
	alert: {
		fontFamily: 'Yellix-Medium',
		fontSize: Theme.sizes.normal,
		lineHeight: Theme.sizes.normal,
		marginRight: Theme.sizes.small,
		color: Theme.colors.whitePrimary,
	},
	headerTitle: {
		color: Theme.colors.text,
		fontFamily: Theme.fonts.bold,
		fontSize: 20,
		textAlign: 'center',
		justifyContent: 'center',
		alignItems: 'center',
		alignSelf: 'center',
	},
	subjectTitle: {
		fontFamily: Theme.fonts.bold,
		color: Theme.colors.text,
		fontSize: 16,
	},
	noData: {
		imageContainer: {
			justifyContent: 'center',
			alignItems: 'center',
		},
		noImage: {
			width: 200,
			height: 180,
		},
		noTitle: {
			color: Theme.colors.black,
			fontFamily: 'Yellix-Bold',
			fontSize: 19,
			padding: 10,
			textAlign: 'center',
		},
		noDescription: {
			color: Theme.colors.gray1,
			fontFamily: 'Yellix-Medium',
			fontSize: 16,
			paddingTop: 0,
			padding: 10,
			textAlign: 'center',
		},
		button: {
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
		buttonText: {
			fontFamily: 'Yellix-Medium',
			color: Theme.colors.white,
			fontSize: 18,
			textAlign: 'center',
		},
	},
};

export default Theme;
