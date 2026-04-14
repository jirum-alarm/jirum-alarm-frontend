import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import {authNavigations} from '@/shared/constant/navigations';
import EmailLoginScreen from '@/screens/auth/EmailLoginScreen';

export type AuthParamList = {
  [authNavigations.AUTH_HOME]: undefined;
};

const Stack = createNativeStackNavigator<AuthParamList>();

function EmailLoginNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={authNavigations.AUTH_HOME}
        component={EmailLoginScreen}
        options={{headerTitle: '', headerShown: false}}
      />
    </Stack.Navigator>
  );
}

export default EmailLoginNavigator;
