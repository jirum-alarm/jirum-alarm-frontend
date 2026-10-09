import React from 'react';
import {Pressable, View} from 'react-native';
import Svg, {Circle, Path} from 'react-native-svg';
import Toast, {type ToastConfig} from 'react-native-toast-message';
import {Text} from '@/shared/components/ui/Text/AppText';
import type {ToastAction} from '@/shared/lib/feedback/toast';

const SuccessIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 20 20">
    <Circle cx={10} cy={10} r={10} fill="#9EF22E" /* primary-500 */ />
    <Path
      d="M6 10.2l2.6 2.6L14 7.4"
      stroke="#101828" /* gray-900 */
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

const ErrorIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 20 20">
    <Circle cx={10} cy={10} r={10} fill="#EF334A" /* error-400 */ />
    <Path
      d="M10 5.5v5.5"
      stroke="#FFFFFF"
      strokeWidth={2}
      strokeLinecap="round"
    />
    <Circle cx={10} cy={14.3} r={1.2} fill="#FFFFFF" />
  </Svg>
);

function ToastBody({
  icon,
  text,
  action,
}: {
  icon?: React.ReactNode;
  text?: string;
  action?: ToastAction;
}) {
  return (
    <View
      className="mx-5 flex-row items-center gap-x-2 rounded-xl bg-fixed-800 py-[13px] pl-4 pr-4"
      accessibilityLiveRegion="polite">
      {icon}
      <Text className="flex-1 text-sm font-pretendard text-fixed-white">
        {text}
      </Text>
      {action && (
        <Pressable
          onPress={() => {
            Toast.hide();
            action.onPress();
          }}
          hitSlop={8}
          accessibilityRole="button"
          className="active:opacity-60">
          <Text className="text-sm font-semibold text-primary-500">
            {action.label}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

// 타입이 하나라도 빠지면 라이브러리 기본 흰 카드로 떨어진다 — 넷 다 채운다.
export const toastConfig: ToastConfig = {
  success: ({text1, props}) => (
    <ToastBody icon={<SuccessIcon />} text={text1} action={props?.action} />
  ),
  error: ({text1}) => <ToastBody icon={<ErrorIcon />} text={text1} />,
  info: ({text1}) => <ToastBody text={text1} />,
  warning: ({text1}) => <ToastBody text={text1} />,
};
