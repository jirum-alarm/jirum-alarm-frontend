import React from 'react';
import {Pressable, Text, View} from 'react-native';
import CaretLeft from '@/shared/components/icons/caret_left.tsx';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {cn} from '@/shared/lib/styling';

interface Props {
  children?: React.ReactNode;
  title?: string;
  hasBackButton?: boolean;
}

const BasicLayout = ({children, hasBackButton, title}: Props) => {
  const insets = useSafeAreaInsets();
  const router = useNavigation();

  return (
    <View className="flex-1 bg-white">
      <View
        className={cn('py-[12px] px-[20px] flex-row w-full items-center', {
          'justify-start': hasBackButton,
          'justify-center': !hasBackButton,
        })}
        style={{paddingTop: 12 + insets.top}}>
        {hasBackButton && (
          <>
            <Pressable onPress={router.goBack}>
              <CaretLeft />
            </Pressable>
            {title && (
              <Text className="pl-[20px] text-[18px] font-pretendard-bold">
                {title}
              </Text>
            )}
          </>
        )}
        {!hasBackButton && title && (
          <Text className="text-[18px] font-pretendard-bold">{title}</Text>
        )}
      </View>
      {children}
    </View>
  );
};

export default BasicLayout;
