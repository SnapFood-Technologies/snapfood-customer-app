import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
	createStackNavigator,
	TransitionPresets,
	CardStyleInterpolators,
	TransitionSpecs,
} from '@react-navigation/stack';
import { connect } from 'react-redux';
import { EventRegister } from 'react-native-event-listeners';
import { isEmpty } from '../common/services/utility';
// custom input
import RouteNames from './names';
// guest modules
import WelcomeScreen from '../modules/tour/screens/WelcomeScreen';
import LoginScreen from '../modules/tour/screens/LoginScreen';
import RegisterScreen from '../modules/tour/screens/RegisterScreen';
import ForgetPassScreen from '../modules/tour/screens/ForgetPassScreen';
import ResetPassScreen from '../modules/tour/screens/ResetPassScreen';
import ResetPassDoneScreen from '../modules/tour/screens/ResetPassDoneScreen';
import AlmostDoneScreen from '../modules/tour/screens/AlmostDoneScreen';
import LocationSetupScreen from '../modules/tour/screens/LocationSetupScreen';
import OnboardingScreen from '../modules/tour/screens/OnboardingScreen';
import PhoneVerificationScreen from '../modules/tour/screens/PhoneVerificationScreen';
import EditPhoneScreen from '../modules/tour/screens/EditPhoneScreen';
import ReferralCodeInputScreen from '../modules/tour/screens/ReferralCodeInputScreen';
// member modules
import HomeTabs from './home';
import FilterScreen from '../modules/home/screens/FilterScreen';
import VendorScreen from '../modules/home/screens/VendorScreen';
import VendorVoiceOrderScreen from '../modules/home/screens/VendorVoiceOrderScreen';
import VendorVoiceFaqScreen from '../modules/home/screens/VoiceOrderFaqs';
import VendorLocationScreen from '../modules/home/screens/VendorLocationScreen';
import FoodScreen from '../modules/home/screens/FoodScreen';
import PastOrderScreen from '../modules/home/screens/PastOrderScreen';
import CartScreen from '../modules/home/screens/CartScreen';
import NewAddressScreen from '../modules/home/screens/NewAddressScreen';
import AddressMapScreen from '../modules/home/screens/AddressMapScreen';
import CartPaymentScreen from '../modules/home/screens/CartPaymentScreen';
import CartSplitScreen from '../modules/home/screens/CartSplitScreen';
import SplitOrderScreen from '../modules/home/screens/SplitOrderScreen';
import CartSplitRequestScreen from '../modules/home/screens/CartSplitRequestScreen';
import SplitOrderNotuserScreen from '../modules/home/screens/SplitOrderNotuserScreen';
import OrderSummScreen from '../modules/orders/screens/OrderSummScreen';
import OrderSummPayCard from '../modules/orders/screens/OrderSummPayCard';
import ScantoPay from '../modules/orders/screens/ScantoPay';
import SnapfoodersSplitScreen from '../modules/home/screens/SnapfoodersSplitScreen';
// order
import OrderFilterScreen from '../modules/orders/screens/FilterScreen';
import TrackOrderScreen from '../modules/orders/screens/TrackOrderScreen';
import OrderReviewScreen from '../modules/orders/screens/OrderReviewScreen';
import OrderHelp from '../modules/orders/screens/OrderHelp';
import OrderFaqs from '../modules/orders/screens/OrderFaqs';
import OrderSupport from '../modules/orders/screens/OrderSupport';
import SplitsHistScreen from '../modules/orders/screens/SplitsHistScreen';
// profile
import SettingScreen from '../modules/profile/screens/SettingScreen';
import ChangePasswordScreen from '../modules/profile/screens/ChangePasswordScreen';
import DeleteAccountScreen from '../modules/profile/screens/DeleteAccountScreen';
import FavouritesScreen from '../modules/profile/screens/FavouritesScreen';
import AddressesScreen from '../modules/profile/screens/AddressesScreen';
import WalletScreen from '../modules/profile/screens/WalletScreen';
import DepositCardScreen from '../modules/profile/screens/DepositCardScreen';
import DepositSuccessScreen from '../modules/profile/screens/DepositSuccessScreen';
import CashbackOrdersScreen from '../modules/profile/screens/CashbackOrdersScreen';
import TransferScreen from '../modules/profile/screens/TransferScreen';
import TransferDetailsScreen from '../modules/profile/screens/TransferDetailsScreen';
import PickFriendsScreen from '../modules/profile/screens/PickFriendsScreen';
import DepositTransferHistScreen from '../modules/profile/screens/DepositTransferHistScreen';
import GalleryScreen from '../modules/profile/screens/GalleryScreen';
import GallerySettingScreen from '../modules/profile/screens/GallerySettingScreen';
import ProfileInterestsScreen from '../modules/profile/screens/InterestsScreen';
import InterestSettingScreen from '../modules/profile/screens/InterestSettingScreen';
import BioSettingScreen from '../modules/profile/screens/BioSettingScreen'
import GetPromoScreen from '../modules/profile/screens/GetPromoScreen';
import PromosCalendarScreen from '../modules/profile/screens/PromosCalendarScreen';
import ScanQRcodeScreen from '../modules/profile/screens/ScanQRcodeScreen';

import EarnScreen from '../modules/profile/screens/EarnScreen';
import InviteScreen from '../modules/profile/screens/InviteScreen';
import InvitationHistScreen from '../modules/profile/screens/InvitationHistScreen';
import InvitationReferralsHistScreen from '../modules/profile/screens/InvitationReferralsHistScreen';
import InvitationDetailsScreen from '../modules/profile/screens/InvitationDetailsScreen';
import InvitationFriendsScreen from '../modules/profile/screens/InvitationFriendsScreen';
import InvitationSnapfoodersScreen from '../modules/profile/screens/InvitationSnapfoodersScreen';

import ConfirmIdentityScreen from '../modules/profile/screens/ConfirmIdentityScreen';
import PaymentMethodsScreen from '../modules/profile/screens/PaymentMethodsScreen';
import NewCardScreen from '../modules/profile/screens/NewCardScreen';
import ProfileEditScreen from '../modules/profile/screens/ProfileEditScreen';
import BlogScreen from '../modules/profile/screens/BlogScreen';
import BlogDetailsScreen from '../modules/profile/screens/BlogDetailsScreen';
import BlogFilterScreen from '../modules/profile/screens/BlogFilterScreen';
import PromotionsScreen from '../modules/profile/screens/PromotionsScreen';
import VendorPromotionsScreen from '../modules/profile/screens/VendorPromotionsScreen';
import SnapfoodPromotionsScreen from '../modules/profile/screens/SnapfoodPromotionsScreen';
import StudentVerifyScreen from '../modules/profile/screens/StudentVerifyScreen';
import ReportFeedbackScreen from '../modules/profile/screens/ReportFeedbackScreen';
import MembershipScreen from '../modules/profile/screens/MembershipScreen';
import MembershipInfoScreen from '../modules/profile/screens/MembershipInfoScreen';
import ChangeMembershipPlan from '../modules/profile/screens/ChangeMembershipPlan';
import MembershipFaqs from '../modules/profile/screens/MembershipFaqs';

// chat
import NewCallScreen from '../modules/chat/screens/NewCallScreen';
import NewChatScreen from '../modules/chat/screens/NewChatScreen';
import ShareChatScreen from '../modules/chat/screens/ShareChatScreen';
import NewGroupScreen from '../modules/chat/screens/NewGroupScreen';
import InvitationsScreen from '../modules/chat/screens/InvitationsScreen';
import SnapfoodMapScreen from '../modules/chat/screens/SnapfoodMapScreen';
import SnapfoodMapSettingsScreen from '../modules/chat/screens/SnapfoodMapSettingsScreen';
import MyFriendsScreen from '../modules/chat/screens/MyFriendsScreen';
import MyContacts from '../modules/chat/screens/MyContacts';
import SnapfoodersScreen from '../modules/chat/screens/SnapfoodersScreen';
import VideoCallScreen from '../modules/chat/screens/VideoCall';
import SnapfooderScreen from '../modules/chat/screens/SnapfooderScreen';
import CreateGroupScreen from '../modules/chat/screens/CreateGroupScreen';
import MessagesScreen from '../modules/chat/screens/MessagesScreen';
import LocationPickupScreen from '../modules/chat/screens/LocationPickupScreen';
import LocationMsgScreen from '../modules/chat/screens/LocationMsgScreen';
import ChooseFriendsScreen from '../modules/chat/screens/ChooseFriendsScreen';
import ForwardScreen from '../modules/chat/screens/ForwardScreen';
import StorySettingScreen from '../modules/chat/screens/StorySettingScreen';
import StoryPreviewScreen from '../modules/chat/screens/StoryPreviewScreen';
import GiftUserPickScreen from '../modules/home/screens/GiftUserPickScreen';
import AskContactsScreen from '../modules/tour/screens/AskContactsScreen';
import ContactsScreen from '../modules/tour/screens/ContactsScreen';
import EditNameScreen from '../modules/tour/screens/EditNameScreen';
import CourierScreen from '../modules/chat/screens/CourierScreen';
import CameraScreen from '../modules/chat/screens/CameraScreen';
import InterestsScreen from '../modules/tour/screens/InterestsScreen';

const OnboardStack = createStackNavigator();
const GuestStack = createStackNavigator();
const PhoneVerifyStack = createStackNavigator();
const EditNameStack = createStackNavigator();
const ReferralCodeStack = createStackNavigator();
const SetupLocationStack = createStackNavigator();
const MemberStack = createStackNavigator();
const MemberStackSnapfoodMap = createStackNavigator();

function OnBoardRoute() {
	return (
		<NavigationContainer>
			<OnboardStack.Navigator
				// this options hide all header
				screenOptions={{
					headerShown: false,
					gestureEnabled: false,
					gestureDirection: 'horizontal',
					...TransitionPresets.SlideFromRightIOS,
				}}
				initialRouteName={RouteNames.OnboardingScreen}
			>
				<OnboardStack.Screen name={RouteNames.OnboardingScreen} component={OnboardingScreen} />
				<OnboardStack.Screen name={RouteNames.AlmostDoneScreen} component={AlmostDoneScreen} />
				<OnboardStack.Screen
					name={RouteNames.LocationSetupScreen}
					component={LocationSetupScreen}
					options={{
						gestureEnabled: false,
					}}
				/>
			</OnboardStack.Navigator>
		</NavigationContainer>
	);
}

function GuestRoute() {
	return (
		<NavigationContainer>
			<GuestStack.Navigator
				// this options hide all header
				screenOptions={{
					headerShown: false,
					gestureEnabled: true,
					gestureDirection: 'horizontal',
					gestureResponseDistance: {
						horizontal: 100,
					},
					...TransitionPresets.SlideFromRightIOS,
				}}
				initialRouteName={RouteNames.WelcomeScreen}
			>
				<GuestStack.Screen name={RouteNames.WelcomeScreen} component={WelcomeScreen} />
				<GuestStack.Screen name={RouteNames.LoginScreen} component={LoginScreen} />
				<GuestStack.Screen name={RouteNames.RegisterScreen} component={RegisterScreen} />
				<GuestStack.Screen name={RouteNames.ForgotScreen} component={ForgetPassScreen} />
				<GuestStack.Screen name={RouteNames.ResetPassScreen} component={ResetPassScreen} />
				<GuestStack.Screen name={RouteNames.ResetPassDoneScreen} component={ResetPassDoneScreen} />
			</GuestStack.Navigator>
		</NavigationContainer>
	);
}

function PhoneVerifyRoute() {
	return (
		<NavigationContainer>
			<PhoneVerifyStack.Navigator
				// this options hide all header
				screenOptions={{
					headerShown: false,
				}}
				initialRouteName={RouteNames.PhoneVerificationScreen}
			>
				<PhoneVerifyStack.Screen
					name={RouteNames.PhoneVerificationScreen}
					component={PhoneVerificationScreen}
				/>
				<PhoneVerifyStack.Screen name={RouteNames.EditPhoneScreen} component={EditPhoneScreen} />
			</PhoneVerifyStack.Navigator>
		</NavigationContainer>
	);
}

function SetupLocationRoute() {
	return (
		<NavigationContainer>
			<SetupLocationStack.Navigator
				// this options hide all header
				screenOptions={{
					headerShown: false,
					gestureEnabled: false,
					gestureDirection: 'horizontal',
					gestureResponseDistance: {
						horizontal: 100,
					},
					...TransitionPresets.SlideFromRightIOS,
				}}
				initialRouteName={RouteNames.AlmostDoneScreen}
			>
				<SetupLocationStack.Screen name={RouteNames.AlmostDoneScreen} component={AlmostDoneScreen} />
				<SetupLocationStack.Screen name={RouteNames.LocationSetupScreen} component={LocationSetupScreen} />
			</SetupLocationStack.Navigator>
		</NavigationContainer>
	);
}

function ContactsRoute() {
	return (
		<NavigationContainer>
			<SetupLocationStack.Navigator
				// this options hide all header
				screenOptions={{
					headerShown: false,
					gestureEnabled: false,
					gestureDirection: 'horizontal',
					gestureResponseDistance: {
						horizontal: 100,
					},
					...TransitionPresets.SlideFromRightIOS,
				}}
				initialRouteName={RouteNames.AskContactsScreen}
			>
				<SetupLocationStack.Screen name={RouteNames.AskContactsScreen} component={AskContactsScreen} />
				<SetupLocationStack.Screen name={RouteNames.ContactsScreen} component={ContactsScreen} />
			</SetupLocationStack.Navigator>
		</NavigationContainer>
	);
}

function EditNameRoute() {
	return (
		<NavigationContainer>
			<EditNameStack.Navigator
				// this options hide all header
				screenOptions={{
					headerShown: false,
					gestureEnabled: false,
					gestureDirection: 'horizontal',
					gestureResponseDistance: {
						horizontal: 100,
					},
					...TransitionPresets.SlideFromRightIOS,
				}}
				initialRouteName={RouteNames.EditNameScreen}
			>
				<EditNameStack.Screen name={RouteNames.EditNameScreen} component={EditNameScreen} />
			</EditNameStack.Navigator>
		</NavigationContainer>
	);
}


function ReferralCodeInputRoute() {
	return (
		<NavigationContainer>
			<ReferralCodeStack.Navigator
				// this options hide all header
				screenOptions={{
					headerShown: false,
					gestureEnabled: false,
					gestureDirection: 'horizontal',
					gestureResponseDistance: {
						horizontal: 100,
					},
					...TransitionPresets.SlideFromRightIOS,
				}}
				initialRouteName={RouteNames.ReferralCodeInputScreen}
			>
				<ReferralCodeStack.Screen name={RouteNames.ReferralCodeInputScreen} component={ReferralCodeInputScreen} />
			</ReferralCodeStack.Navigator>
		</NavigationContainer>
	);
}

function MemberRoute() {
	return (
		<NavigationContainer>
			<MemberStack.Navigator
				// this options hide all header
				screenOptions={{
					headerShown: false,
					gestureEnabled: true,
					gestureDirection: 'horizontal',
					gestureResponseDistance: {
						horizontal: 100,
					},
					...TransitionPresets.SlideFromRightIOS,
				}}
				initialRouteName={RouteNames.BottomTabs}
			>
				<MemberStack.Screen name={RouteNames.BottomTabs} component={HomeTabs} />
				<MemberStack.Screen name={RouteNames.LocationSetupScreen} component={LocationSetupScreen} />
				<MemberStack.Screen options={{ gestureEnabled: false }} name={RouteNames.FilterScreen} component={FilterScreen} />
				<MemberStack.Screen
					name={RouteNames.VendorScreen}
					component={VendorScreen}
					options={{
						gestureResponseDistance: {
							horizontal: 40,
						},
					}}
				/>
				<MemberStack.Screen
					name={RouteNames.VendorVoiceOrderScreen}
					component={VendorVoiceOrderScreen}
					options={{
						gestureResponseDistance: {
							horizontal: 40,
						},
					}}
				/>
				<MemberStack.Screen name={RouteNames.VendorVoiceFaqScreen} component={VendorVoiceFaqScreen} />
				<MemberStack.Screen name={RouteNames.VendorLocationScreen} component={VendorLocationScreen} />
				<MemberStack.Screen name={RouteNames.FoodScreen} component={FoodScreen} />
				<MemberStack.Screen name={RouteNames.PastOrderScreen} component={PastOrderScreen} />
				<MemberStack.Screen name={RouteNames.CartScreen} component={CartScreen} />
				<MemberStack.Screen name={RouteNames.NewAddressScreen} component={NewAddressScreen} />
				<MemberStack.Screen name={RouteNames.AddressMapScreen} component={AddressMapScreen} />
				<MemberStack.Screen name={RouteNames.CartPaymentScreen} component={CartPaymentScreen} />
				<MemberStack.Screen name={RouteNames.CartSplitScreen} component={CartSplitScreen} />
				<MemberStack.Screen name={RouteNames.SplitOrderScreen} component={SplitOrderScreen} />
				<MemberStack.Screen name={RouteNames.CartSplitRequestScreen} component={CartSplitRequestScreen} />
				<MemberStack.Screen name={RouteNames.SplitOrderNotuserScreen} component={SplitOrderNotuserScreen} />
				<MemberStack.Screen
					name={RouteNames.OrderSummScreen}
					component={OrderSummScreen}
					options={{ gestureEnabled: false }}
				/>
				<MemberStack.Screen name={RouteNames.OrderFilterScreen} component={OrderFilterScreen} />
				<MemberStack.Screen name={RouteNames.TrackOrderScreen} component={TrackOrderScreen} />
				<MemberStack.Screen name={RouteNames.OrderReviewScreen} component={OrderReviewScreen} />
				<MemberStack.Screen name={RouteNames.ScantoPay} component={ScantoPay} />
				<MemberStack.Screen name={RouteNames.OrderHelp} component={OrderHelp} />
				<MemberStack.Screen name={RouteNames.OrderFaqs} component={OrderFaqs} />
				<MemberStack.Screen
					name={RouteNames.OrderSupport}
					component={OrderSupport}
					options={{
						gestureResponseDistance: {
							horizontal: 20,
						},
					}}
				/>
				<MemberStack.Screen name={RouteNames.SplitsHistScreen} component={SplitsHistScreen} />

				<MemberStack.Screen name={RouteNames.SettingScreen} component={SettingScreen} />
				<MemberStack.Screen name={RouteNames.ChangePasswordScreen} component={ChangePasswordScreen} />
				<MemberStack.Screen name={RouteNames.DeleteAccountScreen} component={DeleteAccountScreen} />
				<MemberStack.Screen name={RouteNames.ReportFeedbackScreen} component={ReportFeedbackScreen} />
				<MemberStack.Screen name={RouteNames.FavouritesScreen} component={FavouritesScreen} />
				<MemberStack.Screen name={RouteNames.AddressesScreen} component={AddressesScreen} />
				<MemberStack.Screen name={RouteNames.WalletScreen} component={WalletScreen} />
				<MemberStack.Screen name={RouteNames.DepositCardScreen} component={DepositCardScreen} />
				<MemberStack.Screen name={RouteNames.DepositSuccessScreen} component={DepositSuccessScreen} />
				<MemberStack.Screen name={RouteNames.TransferScreen} component={TransferScreen} />
				<MemberStack.Screen name={RouteNames.DepositTransferHistScreen} component={DepositTransferHistScreen} />
				<MemberStack.Screen name={RouteNames.PickFriendsScreen} component={PickFriendsScreen} />
				<MemberStack.Screen name={RouteNames.CashbackOrdersScreen} component={CashbackOrdersScreen} />
				<MemberStack.Screen name={RouteNames.EarnScreen} component={EarnScreen} />
				<MemberStack.Screen name={RouteNames.InviteScreen} component={InviteScreen} />
				<MemberStack.Screen name={RouteNames.InvitationHistScreen} component={InvitationHistScreen} />
				<MemberStack.Screen
					name={RouteNames.InvitationReferralsHistScreen}
					component={InvitationReferralsHistScreen}
				/>
				<MemberStack.Screen name={RouteNames.InvitationDetailsScreen} component={InvitationDetailsScreen} />
				<MemberStack.Screen name={RouteNames.InvitationFriendsScreen} component={InvitationFriendsScreen} />
				<MemberStack.Screen
					name={RouteNames.InvitationSnapfoodersScreen}
					component={InvitationSnapfoodersScreen}
				/>
				<MemberStack.Screen name={RouteNames.ConfirmIdentityScreen} component={ConfirmIdentityScreen} />
				<MemberStack.Screen name={RouteNames.PaymentMethodsScreen} component={PaymentMethodsScreen} />
				<MemberStack.Screen name={RouteNames.NewCardScreen} component={NewCardScreen} />
				<MemberStack.Screen name={RouteNames.ProfileEditScreen} component={ProfileEditScreen} />
				<MemberStack.Screen name={RouteNames.BlogScreen} component={BlogScreen} />
				<MemberStack.Screen name={RouteNames.BlogDetailsScreen} component={BlogDetailsScreen} />
				<MemberStack.Screen name={RouteNames.BlogFilterScreen} component={BlogFilterScreen} />
				<MemberStack.Screen name={RouteNames.PromotionsScreen} component={PromotionsScreen} />
				<MemberStack.Screen name={RouteNames.VendorPromotionsScreen} component={VendorPromotionsScreen} />
				<MemberStack.Screen name={RouteNames.SnapfoodPromotionsScreen} component={SnapfoodPromotionsScreen} />
				<MemberStack.Screen name={RouteNames.StudentVerifyScreen} component={StudentVerifyScreen} />
				<MemberStack.Screen name={RouteNames.SnapfoodersSplitScreen} component={SnapfoodersSplitScreen} />
				<MemberStack.Screen name={RouteNames.GalleryScreen} component={GalleryScreen} />
				<MemberStack.Screen name={RouteNames.GallerySettingScreen} component={GallerySettingScreen} />
				<MemberStack.Screen name={RouteNames.ProfileInterestScreen} component={ProfileInterestsScreen} />
				<MemberStack.Screen name={RouteNames.InterestSettingScreen} component={InterestSettingScreen} />
				<MemberStack.Screen name={RouteNames.BioSettingScreen} component={BioSettingScreen} />
				<MemberStack.Screen name={RouteNames.GetPromoScreen} component={GetPromoScreen} />
				<MemberStack.Screen name={RouteNames.PromosCalendarScreen} component={PromosCalendarScreen} />
				<MemberStack.Screen name={RouteNames.ScanQRcodeScreen} component={ScanQRcodeScreen} />
				<MemberStack.Screen name={RouteNames.MembershipScreen} component={MembershipScreen} />
				<MemberStack.Screen name={RouteNames.ChangeMembershipPlan} component={ChangeMembershipPlan} />
				<MemberStack.Screen name={RouteNames.MembershipFaqs} component={MembershipFaqs} />

				<MemberStack.Screen
					name={RouteNames.TransferDetailsScreen}
					component={TransferDetailsScreen}
					options={{
						presentation: 'transparentModal',
						transitionSpec: {
							open: TransitionSpecs.TransitionIOSSpec,
							close: TransitionSpecs.TransitionIOSSpec,
						},
						cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
						gestureEnabled: false,
						cardStyle: { backgroundColor: '#2E3F5780' },
					}}
				/>
				<MemberStack.Screen
					name={RouteNames.MembershipInfoScreen}
					component={MembershipInfoScreen}
					options={{
						presentation: 'transparentModal',
						transitionSpec: {
							open: TransitionSpecs.TransitionIOSSpec,
							close: TransitionSpecs.TransitionIOSSpec,
						},
						cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
						gestureEnabled: false,
						cardStyle: { backgroundColor: '#2E3F5780' },
					}}
				/>
				<MemberStack.Screen
					name={RouteNames.OrderSummPayCard}
					component={OrderSummPayCard}
					options={{
						presentation: 'transparentModal',
						transitionSpec: {
							open: TransitionSpecs.TransitionIOSSpec,
							close: TransitionSpecs.TransitionIOSSpec,
						},
						cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
						gestureEnabled: false,
						cardStyle: { backgroundColor: '#2E3F5780' },
					}}
				/>
				{/* chat */}

				<MemberStack.Screen name={RouteNames.CameraScreen} component={CameraScreen} />
				<MemberStack.Screen name={RouteNames.VideoCallScreen} component={VideoCallScreen} />
				<MemberStack.Screen name={RouteNames.NewCallScreen} component={NewCallScreen} />
				<MemberStack.Screen name={RouteNames.NewChatScreen} component={NewChatScreen} />
				<MemberStack.Screen name={RouteNames.ShareChatScreen} component={ShareChatScreen} />
				<MemberStack.Screen name={RouteNames.NewGroupScreen} component={NewGroupScreen} />
				<MemberStack.Screen name={RouteNames.InvitationsScreen} component={InvitationsScreen} />
				<MemberStack.Screen name={RouteNames.SnapfoodMapScreen} component={SnapfoodMapScreen}
					options={{
						gestureResponseDistance: {
							horizontal: 20,
						},
					}}
				/>
				<MemberStack.Screen
					name={RouteNames.SnapfoodMapSettingsScreen}
					component={SnapfoodMapSettingsScreen}
				/>
				<MemberStack.Screen name={RouteNames.StorySettingScreen} component={StorySettingScreen} />
				<MemberStack.Screen name={RouteNames.SnapfoodersScreen} component={SnapfoodersScreen} />
				<MemberStack.Screen name={RouteNames.MyFriendsScreen} component={MyFriendsScreen} />
				<MemberStack.Screen name={RouteNames.MyContacts} component={MyContacts} />
				<MemberStack.Screen name={RouteNames.SnapfooderScreen} component={SnapfooderScreen} />
				<MemberStack.Screen name={RouteNames.CourierScreen} component={CourierScreen} />
				<MemberStack.Screen name={RouteNames.CreateGroupScreen} component={CreateGroupScreen} />
				<MemberStack.Screen
					name={RouteNames.MessagesScreen}
					component={MessagesScreen}
					options={{
						gestureResponseDistance: {
							horizontal: 20,
						},
					}}
				/>
				<MemberStack.Screen name={RouteNames.LocationPickupScreen} component={LocationPickupScreen} />
				<MemberStack.Screen name={RouteNames.LocationMsgScreen} component={LocationMsgScreen} />
				<MemberStack.Screen name={RouteNames.ChooseFriendsScreen} component={ChooseFriendsScreen} />
				<MemberStack.Screen name={RouteNames.StoryPreviewScreen} component={StoryPreviewScreen} />
				<MemberStack.Screen name={RouteNames.GiftUserPickScreen} component={GiftUserPickScreen} />


				<MemberStack.Screen
					name={RouteNames.ForwardScreen}
					component={ForwardScreen}
					options={{
						presentation: 'transparentModal',
						transitionSpec: {
							open: TransitionSpecs.TransitionIOSSpec,
							close: TransitionSpecs.TransitionIOSSpec,
						},
						cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
						gestureEnabled: false,
						cardStyle: { backgroundColor: '#2E3F5780' },
					}}
				/>

				{/* not loggedin user */}
				<MemberStack.Screen name={RouteNames.WelcomeScreen} component={WelcomeScreen} />
				<MemberStack.Screen name={RouteNames.LoginScreen} component={LoginScreen} />
				<MemberStack.Screen name={RouteNames.RegisterScreen} component={RegisterScreen} />
				<MemberStack.Screen name={RouteNames.ForgotScreen} component={ForgetPassScreen} />
				<MemberStack.Screen name={RouteNames.ResetPassScreen} component={ResetPassScreen} />
				<MemberStack.Screen name={RouteNames.ResetPassDoneScreen} component={ResetPassDoneScreen} />
			</MemberStack.Navigator>
		</NavigationContainer>
	);
}

function SnapfoodMapNavigation() {
	return (
		<MemberStackSnapfoodMap.Navigator mode='modal' headerMode='none'>
			<MemberStackSnapfoodMap.Screen name={RouteNames.SnapfoodMapScreen} component={SnapfoodMapScreen} />
			<MemberStackSnapfoodMap.Screen
				name={RouteNames.SnapfoodMapSettingsScreen}
				component={SnapfoodMapSettingsScreen}
			/>
		</MemberStackSnapfoodMap.Navigator>
	);
}

class RootStack extends React.Component {
	constructor(props) {
		super(props);
		this.props = props;
	}

	componentDidMount() {
		this.languageChangeListener = EventRegister.on('language-updated', () => {
			this.forceUpdate();
		});
	}

	componentWillUnmount() {
		EventRegister.removeEventListener(this.languageChangeListener);
	}

	render() {
		const { user, isLoggedIn, seenOnboard, hasVerifiedPhone, needLogin, hasLocation, asked_contacts_permission, asked_interests,
			skipReferralCodeInputView, referralsRewardsSetting, systemSettings } = this.props;

		console.log(
			user.phone,
			isLoggedIn,
			seenOnboard,
			hasVerifiedPhone,
			needLogin,
			hasLocation,
			asked_contacts_permission,
			asked_interests
		);
		if (!isLoggedIn && seenOnboard == false) {
			return <OnBoardRoute />;
		} else if (!isLoggedIn && seenOnboard == true && needLogin == true) {
			return <GuestRoute />;
		}
		else if (
			isLoggedIn && !hasVerifiedPhone &&
			referralsRewardsSetting.show_referral_module == true &&
			systemSettings?.enable_referral_input == 1 &&
			(user.user_referral_id == null) &&
			!skipReferralCodeInputView &&
			(user.apple_id != null || user.google_id != null || user.facebook_id != null)
		) {
			return <ReferralCodeInputRoute />;
		}
		else if (isLoggedIn && !hasVerifiedPhone) {
			return <PhoneVerifyRoute />;
		} else if (!asked_contacts_permission) {
			return <ContactsRoute />;
		}
		else if (systemSettings?.enable_interests == 1 && !asked_interests) {
			return <InterestsScreen />;
		}
		else if (!hasLocation) {
			return <SetupLocationRoute />;
		} else if (
			isLoggedIn &&
			(user.full_name == null || user.full_name.trim() == '') &&
			(user.username == null || user.username.trim() == '')
		) {
			return <EditNameRoute />;
		}
		return <MemberRoute />;
	}
}

const mapStateToProps = ({ app }) => {
	return {
		user: app.user,
		language: app.language,
		isLoggedIn: app.isLoggedIn,
		hasLocation: app.hasLocation,
		seenOnboard: app.seenOnboard,
		hasVerifiedPhone: app.hasVerifiedPhone,
		needLogin: app.needLogin,
		asked_contacts_permission: app.asked_contacts_permission,
		asked_interests: app.asked_interests,
		skipReferralCodeInputView: app.skipReferralCodeInputView,
		referralsRewardsSetting: app.referralsRewardsSetting || {},
		systemSettings: app.systemSettings || {},
	};
};

export default connect(mapStateToProps, {})(RootStack);
