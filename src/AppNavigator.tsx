import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from './screens/HomeScreen';
import AccountScreen from './screens/AccountScreen';
import {Colors, FontSizes} from './theme/colors';
import {View, Platform} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import AsyncStorage from '@react-native-async-storage/async-storage';

const Tab = createBottomTabNavigator();

// Tab icons (pure RN View — clean geometric shapes)
const HomeIcon = ({color, focused}: {color: string; focused: boolean}) => (
  <View style={{width: 26, height: 26, alignItems: 'center', justifyContent: 'flex-end'}}>
    <View style={{
      width: 0, height: 0,
      borderLeftWidth: 13, borderRightWidth: 13, borderBottomWidth: 11,
      borderLeftColor: 'transparent', borderRightColor: 'transparent',
      borderBottomColor: color,
    }} />
    <View style={{
      width: 16, height: 11, backgroundColor: color,
      marginTop: 1, borderBottomLeftRadius: 2, borderBottomRightRadius: 2,
    }} />
    {/* Door */}
    <View style={{
      position: 'absolute', bottom: 0,
      width: 6, height: 7, backgroundColor: focused ? Colors.background : Colors.surfaceElevated,
      borderTopLeftRadius: 2, borderTopRightRadius: 2,
    }} />
  </View>
);

const UserIcon = ({color}: {color: string}) => (
  <View style={{width: 26, height: 26, alignItems: 'center', justifyContent: 'center'}}>
    <View style={{
      width: 12, height: 12, borderRadius: 6,
      backgroundColor: color, marginBottom: 2,
    }} />
    <View style={{
      width: 20, height: 9, borderTopLeftRadius: 10, borderTopRightRadius: 10,
      backgroundColor: color,
    }} />
  </View>
);

export default function AppNavigator({navigation}: any) {
  const insets = useSafeAreaInsets();
  
  // Calculate dynamic bottom padding to prevent overlap with Android navigation bar
  const bottomPadding = Platform.OS === 'ios' 
    ? Math.max(insets.bottom, 20) 
    : Math.max(insets.bottom, 10);
    
  const tabHeight = 60 + bottomPadding;

  const onLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['@auth_token', '@user_role']);
    } catch {}
    navigation.replace('Login');
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          height: tabHeight,
          paddingBottom: bottomPadding,
          paddingTop: 10,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarLabelStyle: {
          fontSize: FontSizes.xs,
          fontWeight: '600',
          marginTop: 4,
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({color, focused}) => <HomeIcon color={color} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        initialParams={{onLogout}}
        options={{
          tabBarIcon: ({color, focused}) => <UserIcon color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
