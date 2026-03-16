import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import {mainNavigations} from '@/shared/constant/nagivations';
import JirumAlarmWebViewScreen from '@/screens/jirumalarmwebview/JirumAlarmWebViewScreen';

export type MainParamList = {
  [mainNavigations.JIRUM_ALARM_WEBVIEW]: {uri?: string};
};

const Stack = createNativeStackNavigator<MainParamList>();

function MainStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerTransparent: true,
      }}>
      <Stack.Screen
        name={mainNavigations.JIRUM_ALARM_WEBVIEW}
        component={JirumAlarmWebViewScreen}
      />
    </Stack.Navigator>
  );
}

export default MainStackNavigator;
