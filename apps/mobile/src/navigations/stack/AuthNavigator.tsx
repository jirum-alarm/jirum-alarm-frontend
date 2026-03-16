import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import {authNavigations} from '@/shared/constant/nagivations';
import AuthHomeScreen from '@/screens/auth/AuthHomeScreen';
import EmailLoginNavigator from '@/navigations/stack/EmailLoginNavigator';
export type AuthParamList = {
  [authNavigations.AUTH_HOME]: undefined;
  [authNavigations.AUTH_EMAIL_LOGIN]: undefined;
};

const Stack = createNativeStackNavigator<AuthParamList>();

function AuthStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={authNavigations.AUTH_HOME}
        component={AuthHomeScreen}
        options={{headerTitle: '', headerShown: false}}
      />
      <Stack.Screen
        name={authNavigations.AUTH_EMAIL_LOGIN}
        component={EmailLoginNavigator}
        options={{headerTitle: '', headerShown: false}}
      />
    </Stack.Navigator>
  );
}

export default AuthStackNavigator;
