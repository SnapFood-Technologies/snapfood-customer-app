import React, { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { connect } from 'react-redux'
import RouteNames from './names';
import { setHomeTabNavigation } from '../store/actions/app'
/**
 * screens
 *  */
// home tab modules 
import HomePage from '../modules/home/screens/HomePage';
import CartScreen from '../modules/home/screens/CartScreen';
// search tab modules
import SearchScreen from '../modules/search/screens/SearchScreen';
// chat tab modules
import ChatScreen from '../modules/chat/screens/ChatScreen';
import WelcomeChatScreen from '../modules/chat/screens/WelcomeChatScreen';
import OfflineContactSupportScreen from '../modules/chat/screens/OfflineContactSupportScreen';
// orders tab modules
import OrdersScreen from '../modules/orders/screens/OrdersScreen';
// profile tab modules
import ProfileScreen from '../modules/profile/screens/ProfileScreen';
import AddressesScreen from '../modules/profile/screens/AddressesScreen';
import EditPhoneScreen from '../modules/profile/screens/EditPhoneScreen';
import BlogScreen from '../modules/profile/screens/BlogScreen';
import BlogDetailsScreen from '../modules/profile/screens/BlogDetailsScreen';


const HomeStack = createStackNavigator();
function HomeTabRoute(props) {

    const { rootStackNav, homeTabNav } = props
    useEffect(() => {
        props.setHomeTabNavigation(homeTabNav)
    }, [])


    useEffect(() => {
        if (props.isGeneralStoryVisible == true) {
            homeTabNav.navigate(RouteNames.ChatStack, { fromPush: true })
        }
    }, [props.isGeneralStoryVisible])

    return (
        <HomeStack.Navigator
            // this options hide all header
            screenOptions={{
                headerShown: false
            }}
            initialRouteName={RouteNames.HomeScreen}
        >
            {/* <HomeStack.Screen name={RouteNames.HomeScreen} component={HomeScreen} /> */}
            <HomeStack.Screen name={RouteNames.HomeScreen}
                children={(_props) => <HomePage rootStackNav={rootStackNav} homeTabNav={homeTabNav} navigation={_props.navigation} />}
            />
            <HomeStack.Screen name={RouteNames.CartScreen}
                children={(_props) => <CartScreen rootStackNav={rootStackNav} homeTabNav={homeTabNav} navigation={_props.navigation} />}
            />
        </HomeStack.Navigator>
    );
}

const mapStateToProps = ({ app }) => ({
    hometab_navigation: app.hometab_navigation,
    isGeneralStoryVisible: app.isGeneralStoryVisible,
});
export default connect(mapStateToProps, { setHomeTabNavigation })(HomeTabRoute);

const SearchStack = createStackNavigator();
export function SearchTabRoute({ rootStackNav, homeTabNav }) {
    return (
        <SearchStack.Navigator
            // this options hide all header
            screenOptions={{
                headerShown: false
            }}
            initialRouteName={RouteNames.SearchScreen}
        >
            {/* <SearchStack.Screen name={RouteNames.SearchScreen} component={SearchScreen} /> */}
            <SearchStack.Screen name={RouteNames.SearchScreen}
                children={(_props) => <SearchScreen rootStackNav={rootStackNav} homeTabNav={homeTabNav} navigation={_props.navigation} />}
            />
            <SearchStack.Screen name={RouteNames.SearchCartScreen}
                children={(_props) => <CartScreen rootStackNav={rootStackNav} homeTabNav={homeTabNav} navigation={_props.navigation} />}
            />
        </SearchStack.Navigator>
    );
}

const ChatStack = createStackNavigator();
export function ChatTabRoute({ rootStackNav, homeTabNav }) {
    return (
        <ChatStack.Navigator
            // this options hide all header
            screenOptions={{
                headerShown: false
            }}
            initialRouteName={RouteNames.ChatScreen}
        >
            <ChatStack.Screen name={RouteNames.WelcomeChatScreen}
                children={(_props) => <WelcomeChatScreen rootStackNav={rootStackNav} homeTabNav={homeTabNav} navigation={_props.navigation} />}
            />
            <ChatStack.Screen name={RouteNames.ChatScreen}
                children={(_props) => <ChatScreen rootStackNav={rootStackNav} homeTabNav={homeTabNav} navigation={_props.navigation} />}
            />
            <ChatStack.Screen name={RouteNames.OfflineContactSupportScreen}
                children={(_props) => <OfflineContactSupportScreen rootStackNav={rootStackNav} homeTabNav={homeTabNav} navigation={_props.navigation} />}
            />
        </ChatStack.Navigator>
    );
}

const OrdersStack = createStackNavigator();
export function OrdersTabRoute({ rootStackNav, homeTabNav }) {
    return (
        <OrdersStack.Navigator
            // this options hide all header
            screenOptions={{
                headerShown: false
            }}
            initialRouteName={RouteNames.OrdersScreen}
        >
            <OrdersStack.Screen name={RouteNames.OrdersScreen}
                children={(_props) => <OrdersScreen rootStackNav={rootStackNav} homeTabNav={homeTabNav} navigation={_props.navigation} />}
            />
            <OrdersStack.Screen name={RouteNames.OrdersCartScreen}
                children={(_props) => <CartScreen rootStackNav={rootStackNav} homeTabNav={homeTabNav} navigation={_props.navigation} />}
            />
        </OrdersStack.Navigator>
    );
}

const ProfileStack = createStackNavigator();
export function ProfileTabRoute({ rootStackNav, homeTabNav }) {
    return (
        <ProfileStack.Navigator
            // this options hide all header
            screenOptions={{
                headerShown: false
            }}
            initialRouteName={RouteNames.ProfileScreen}
        >
            <ProfileStack.Screen name={RouteNames.ProfileScreen}
                children={(_props) => <ProfileScreen rootStackNav={rootStackNav} homeTabNav={homeTabNav} navigation={_props.navigation} />}
            />
        </ProfileStack.Navigator>
    );
}