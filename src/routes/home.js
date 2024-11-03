import React, { useEffect, useState } from 'react'
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { connect } from 'react-redux'
// custom input
import RouteNames from './names';
import Theme from '../theme';
import Config from '../config';
import { translate } from '../common/services/translate';
import HomeTabRoute, { SearchTabRoute, ChatTabRoute, OrdersTabRoute, ProfileTabRoute } from './index';
import { setVendorCart } from '../store/actions/shop';
// svgs
import Home_active from '../common/assets/svgs/home_active.svg';
import Home_inactive from '../common/assets/svgs/home_inactive.svg';
import Search_active from '../common/assets/svgs/search_active.svg';
import Search_inactive from '../common/assets/svgs/search_inactive.svg';
import Chat_active from '../common/assets/svgs/chat_active.svg';
import Chat_inactive from '../common/assets/svgs/chat_inactive.svg';
import Orders_active from '../common/assets/svgs/orders_active.svg';
import Orders_inactive from '../common/assets/svgs/orders_inactive.svg';
import Profile_active from '../common/assets/svgs/profile_active.svg';
import Profile_inactive from '../common/assets/svgs/profile_inactive.svg';
import {AppBadge} from "../common/components"
import ChatListener from "../modules/chat/components/ChatListener"
import {setActiveRoute, setShowOrderNowModal} from "../store/actions/app"

const Tab = createBottomTabNavigator();

const myTabBarState = ({ app, chat }) => {
    const userId = app.user?.id;
	const unreadChats = (chat.chat_channels || [])
		.map(({ unread_cnt }) => (unread_cnt[userId] ? 1 : 0))
		.filter(Boolean)
		.reduce((a, b) => a + b, 0);
    return {
		chatBadgeNumber: unreadChats + chat.new_invites?.length,
		homeScroller : app.homeScroller
	};
};

const MyTabBar = connect(myTabBarState, { setActiveRoute, setShowOrderNowModal })((myTabBarProps) => {
	const { state, descriptors, navigation, props, homeScroller, chatBadgeNumber, setActiveRoute, setShowOrderNowModal } = myTabBarProps;
	const focusedOptions = descriptors[state.routes[state.index].key].options;

	if (focusedOptions.tabBarVisible === false) return null;

	return (
		<View style={styles.barStyle}>
			{state.routes.map((route, index) => {
				const { key, name } = route;
				const { options } = descriptors[key];
				const { tabBarLabel, title } = options || {};
				const label = tabBarLabel !== undefined ? tabBarLabel : title !== undefined ? title : name;
				const isChat = label == translate(`bottomtabs.chat`);

				const isFocused = state.index === index;

				const onPress = () => {
					setActiveRoute(name);
					const isChatOrderOrProfile = ['chat', 'orders', 'profile'].some(
						(translateLabel) => label == translate(`bottomtabs.${translateLabel}`)
					);
					if (props.isLoggedIn == false && isChatOrderOrProfile) {
						props.navigation.push(RouteNames.WelcomeScreen, { backRoute: RouteNames.BottomTabs });
						return;
					}

					if (label == translate('bottomtabs.orders')) {
						
						setShowOrderNowModal(true);
					}

					if (homeScroller) {
						try {
							homeScroller.scrollToPosition(0, 0)
						} catch (error) {}
					}

					const event = navigation.emit({ type: 'tabPress', target: key, canPreventDefault: true });
					if (!isFocused && !event.defaultPrevented) navigation.navigate(name);
				};

				const onLongPress = () => {
					navigation.emit({ type: 'tabLongPress', target: route.key });
				};

				const color = Theme.colors[isFocused ? 'cyan2' : 'gray5'];

				return (
					<TouchableOpacity
						key={index}
						accessibilityRole='button'
						accessibilityState={isFocused ? { selected: true } : {}}
						accessibilityLabel={options.tabBarAccessibilityLabel}
						testID={options.tabBarTestID}
						onPress={onPress}
						onLongPress={onLongPress}
						style={[Theme.styles.col_center, { flex: 1, paddingBottom: 4 }]}
					>
						<View style={{ position: 'relative' }}>
							{options.tabBarIcon({ focused: isFocused, color, size: 20 })}
							{!!isChat && !!chatBadgeNumber && (
								<AppBadge onPress={onPress} value={chatBadgeNumber || 0} style={styles.badge} />
							)}
						</View>
						<Text style={[styles.labelStyle, { color }]}>{label}</Text>
					</TouchableOpacity>
				);
			})}
		</View>
	);
});

const HomeTabs = (props) => {
    useEffect(() => {

        if (props.isOrderSummVisible == true && props.pushOrderDetails != null) {
            props.navigation.navigate(RouteNames.OrderSummScreen, { isnew: false, fromPush: true, order_id: props.pushOrderDetails.id, order_status: props.pushOrderDetails.status });
        }
        if (props.isWalletVisible == true) {
            props.navigation.navigate(RouteNames.WalletScreen, { fromPush: true });
        }
        if (props.isInvitationVisible == true) {
            props.navigation.navigate(RouteNames.InvitationsScreen, { fromPush: true });
        }
        if (props.isChatVisible == true && props.pushConversationId != null) {
            if (props.pushConversationId.includes('order') == true) {
                
                props.navigation.navigate(RouteNames.OrderSupport, { fromPush: true, channelId: props.pushConversationId, pushChatMsgTime: props.pushChatMsgTime })
            }
            else {
                props.navigation.navigate(RouteNames.MessagesScreen, { fromPush: true, channelId: props.pushConversationId, pushChatMsgTime: props.pushChatMsgTime })
            }
        }
        if (props.isBlogVisible == true && props.pushBlogId != null) {
            props.navigation.navigate(RouteNames.BlogDetailsScreen, { fromPush: true, blog: { id: props.pushBlogId } })
        }
        if (props.isVendorVisible == true && props.pushVendorId != null) {
            props.navigation.navigate(RouteNames.VendorScreen);
        }
		if (props.isSnapfooderVisible == true && props.pushSnapfooderId != null) {
			props.navigation.navigate(RouteNames.SnapfooderScreen, { user: {id: props.pushSnapfooderId} });
        }
        if (props.isSharingVisible == true) {
            props.navigation.navigate(RouteNames.ShareChatScreen, { fromSharing: true, mimeType: props.shared_mime_type, content: props.shared_content })
        }
        if (props.isEarnInviteDetailsVisible == true && props.push_earn_invitation_id != null) {
            props.navigation.navigate(RouteNames.InvitationDetailsScreen, { fromPush: true, invitation_id: props.push_earn_invitation_id })
        }
        if (props.isReferralVisible == true) {
            props.navigation.navigate(RouteNames.InvitationReferralsHistScreen, { fromPush: true })
        }

        if (props.isCartSplitRequestVisible == true && props.push_cart_split_id != null) {
            props.navigation.navigate(RouteNames.CartSplitRequestScreen, { fromPush: true, split_id: props.push_cart_split_id })
        }

		if (props.isGetPromoVisible == true && props.promo_code != null) {
            props.navigation.navigate(RouteNames.GetPromoScreen, { fromPush: true, promo_code: props.promo_code })
        }

        if (props.isGeneralReferralVisible == true) {
            props.navigation.navigate(RouteNames.InviteScreen, { fromPush: true })
        }
        if (props.isGeneralEarnVisible == true) {
            props.navigation.navigate(RouteNames.EarnScreen, { fromPush: true })
        }
        if (props.isGeneralCashbackVisible == true) {
            props.navigation.navigate(RouteNames.WalletScreen, { fromPush: true })
        }

		if (props.isGeneralStudentVerifyVisible == true) {
            props.navigation.navigate(RouteNames.StudentVerifyScreen, { fromPush: true })
        }

        if (props.isIncomingCall == true) {
            props.navigation.navigate(RouteNames.VideoCallScreen, { fromPush: true, type: 'incoming', isVideoCall: (props.IncomingCallData?.call_type == 'video' ? true : false), IncomingCallData: props.IncomingCallData })
        }

        if (props.screenNavigate != null && props.screenNavigate != '' && props.screenNavigate != undefined) {
            props.navigation.navigate(props.screenNavigate, { fromPush: true })
        }

    }, [props.isOrderSummVisible, props.pushOrderDetails, props.isWalletVisible,
    props.isInvitationVisible, props.isChatVisible, props.pushConversationId,
    props.isBlogVisible, props.pushBlogId, props.pushChatMsgTime, props.isSharingVisible,
    props.shared_mime_type, props.shared_content,
    props.isVendorVisible, props.pushVendorId,
	props.isSnapfooderVisible, props.pushSnapfooderId,
    props.isIncomingCall, props.IncomingCallData,

    props.isEarnInviteDetailsVisible, props.push_earn_invitation_id,
    props.isReferralVisible, props.push_referral_id,

	props.isCartSplitRequestVisible, props.push_cart_split_id,

    props.isGeneralReferralVisible,
    props.isGeneralEarnVisible,
    props.isGeneralCashbackVisible,
	props.isGeneralStudentVerifyVisible,

	props.isGetPromoVisible, props.promo_code,
    props.screenNavigate
    ])


    return (
		<React.Fragment>
			<ChatListener navigation={props.navigation}/>
				<Tab.Navigator
					key={props.language}
					initialRouteName={RouteNames.HomeStack}
					tabBarOptions={{
						showLabel: true,
						style: {},
						tabStyle: {},
					}}
					tabBar={(_props) => <MyTabBar {..._props} props={props} />}
				>
					<Tab.Screen
						name={RouteNames.HomeStack}
						children={(_props) => (
							<HomeTabRoute rootStackNav={props.navigation} homeTabNav={_props.navigation} />
						)}
						options={{
							tabBarLabel: translate('bottomtabs.home'),
							tabBarIcon: ({ focused, color, size }) => (focused ? <Home_active /> : <Home_inactive />),
							//   tabBarBadge: 3,
						}}
					/>
					<Tab.Screen
						name={RouteNames.SearchStack}
						children={(_props) => (
							<SearchTabRoute rootStackNav={props.navigation} homeTabNav={_props.navigation} />
						)}
						options={{
							tabBarLabel: translate('bottomtabs.search'),
							tabBarIcon: ({ focused, color, size }) =>
								focused ? <Search_active /> : <Search_inactive />,
							//   tabBarBadge: 3,
						}}
					/>
					<Tab.Screen
						name={RouteNames.ChatStack}
						children={(_props) => (
							<ChatTabRoute rootStackNav={props.navigation} homeTabNav={_props.navigation} />
						)}
						options={{
							tabBarLabel: translate('bottomtabs.chat'),
							tabBarIcon: ({ focused, color, size }) => (focused ? <Chat_active /> : <Chat_inactive />),
							//   tabBarBadge: 3,
						}}
					/>
					<Tab.Screen
						name={RouteNames.OrdersStack}
						children={(_props) => (
							<OrdersTabRoute rootStackNav={props.navigation} homeTabNav={_props.navigation} />
						)}
						options={{
							tabBarLabel: translate('bottomtabs.orders'),
							tabBarIcon: ({ focused, color, size }) =>
								focused ? <Orders_active /> : <Orders_inactive />,
							//   tabBarBadge: 3,
						}}
					/>
					<Tab.Screen
						name={RouteNames.ProfileStack}
						children={(_props) => (
							<ProfileTabRoute rootStackNav={props.navigation} homeTabNav={_props.navigation} />
						)}
						options={{
							tabBarLabel: translate('bottomtabs.profile'),
							tabBarIcon: ({ focused, color, size }) =>
								focused ? <Profile_active /> : <Profile_inactive />,
							//   tabBarBadge: 3,
						}}
					/>
				</Tab.Navigator>
		</React.Fragment>
	);
}

const styles = StyleSheet.create({
	badge: {
		position: 'absolute',
		top: -8,
		right: -8,
		textAlign: 'center',
		color: 'white',
		fontSize: 12,
		lineHeight: 14,
		paddingHorizontal: 4,
		borderRadius: 15,
		backgroundColor: '#F55A00',
	},
	labelStyle: { fontSize: 12, fontFamily: Theme.fonts.semiBold, textAlign: 'center', marginTop: 5 },
	barStyle: {
		flexDirection: 'row',
		height: 76,
		paddingBottom: Config.isAndroid ? 13 : 21,
		paddingTop: 13,
		backgroundColor: Theme.colors.white,
		borderTopWidth: 1,
		borderTopColor: Theme.colors.gray6,
	},
});

const mapStateToProps = ({ app }) => ({
    isLoggedIn: app.isLoggedIn,
    language: app.language,
    hometabs_init_tabname: app.hometabs_init_tabname,

    pushOrderDetails: app.pushOrderDetails,
    pushConversationId: app.pushConversationId,
    isOrderSummVisible: app.isOrderSummVisible,
    isWalletVisible: app.isWalletVisible,
    isInvitationVisible: app.isInvitationVisible,
    isChatVisible: app.isChatVisible,
    isBlogVisible: app.isBlogVisible,
    pushBlogId: app.pushBlogId,

    isIncomingCall: app.isIncomingCall,
    IncomingCallData: app.IncomingCallData,

    isVendorVisible: app.isVendorVisible,
    pushVendorId: app.pushVendorId,

	isSnapfooderVisible: app.isSnapfooderVisible,
    pushSnapfooderId: app.pushSnapfooderId,

    isEarnInviteDetailsVisible: app.isEarnInviteDetailsVisible,
    push_earn_invitation_id: app.push_earn_invitation_id,

    isReferralVisible: app.isReferralVisible,
    push_referral_id: app.push_referral_id,

	isCartSplitRequestVisible: app.isCartSplitRequestVisible,
	push_cart_split_id: app.push_cart_split_id,

    pushChatMsgTime: app.pushChatMsgTime,
    isSharingVisible: app.isSharingVisible,
    shared_content: app.shared_content,
    shared_mime_type: app.shared_mime_type,

    isGeneralReferralVisible: app.isGeneralReferralVisible,
    isGeneralEarnVisible: app.isGeneralEarnVisible,
    isGeneralCashbackVisible: app.isGeneralCashbackVisible,
	isGeneralStudentVerifyVisible: app.isGeneralStudentVerifyVisible,

	isGetPromoVisible: app.isGetPromoVisible,
	promo_code: app.promo_code,
    screenNavigate: app.screenNavigate,
});

export default connect(mapStateToProps, {
    setVendorCart
})(HomeTabs);
