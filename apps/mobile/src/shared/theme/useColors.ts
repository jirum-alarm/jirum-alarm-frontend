import {useColorScheme} from 'react-native';

import {dark, light} from '@jirum/design-system';

/**
 * className 이 안 닿는 자리(아이콘 color·placeholderTextColor·RefreshControl·네이티브 헤더 옵션)에
 * 넘길 색. 값은 tailwind 토큰과 같은 토큰(@jirum/design-system)에서 오므로 `c.gray[500]` == `text-gray-500`.
 * className 으로 되는 자리면 className 을 쓴다(ActivityIndicator 는 className="text-gray-500" 가 color 로 간다).
 */
export const useColors = () => (useColorScheme() === 'dark' ? dark : light);

export type Colors = typeof light;
