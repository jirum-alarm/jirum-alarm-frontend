'use server';
import { cookies } from 'next/headers';

import { IS_PRD } from '@/constants/env';
import { postHogClient } from '@/lib/posthog';

const FEATURE_FLAG_PRD_SUFFIX = '_PROD';
const FEATURE_FLAG_DEV_SUFFIX = '_DEV';
// type WithSuffix<T extends string, Suffix extends string> = `${T}${Suffix}`;

// type FeatureFlagKeys<T extends string> =
//   | WithSuffix<T, typeof FEATURE_FLAG_PRD_SUFFIX>
//   | WithSuffix<T, typeof FEATURE_FLAG_DEV_SUFFIX>;

type FeatureFlags = 'MAIN_PAGE_RENEWAL_FEATURE' | 'DETAIL_PAGE_RENEWAL';
// type FeatureFlagsWithSuffix = FeatureFlagKeys<FeatureFlags>;

type FeatureFlagMap = Record<FeatureFlags, string | boolean>;
// type FeatureFlagMapWithSuffix = Record<FeatureFlagsWithSuffix, string | boolean>;

interface BootstrapData {
  distinctID: string;
  featureFlags: FeatureFlagMap;
}

interface BootstrapCookie {
  name: 'bootstrapData';
  value: string;
}

// @description 접미사를 제거한 후 기본 FeatureFlags 타입으로 변환하는 함수
const removeSuffix = (key: FeatureFlags, suffix: string) => {
  return key.slice(0, -suffix.length) as FeatureFlags;
};

// @description dev,prod환경에 따라서 featureflags를 필터링하고 접미사를 제외한 객체를 반환해주는 함수
const filterAndNormalizeFeatureFlags = (data: FeatureFlagMap, isProd: boolean) => {
  const keys = Object.keys(data) as FeatureFlags[];
  const hasDevSuffix = (key: FeatureFlags) => key.endsWith(FEATURE_FLAG_DEV_SUFFIX);
  const hasProdSuffix = (key: FeatureFlags) => key.endsWith(FEATURE_FLAG_PRD_SUFFIX);

  return keys.reduce((obj, key) => {
    if (hasDevSuffix(key)) {
      if (isProd) return obj;
      const baseKey = removeSuffix(key, FEATURE_FLAG_DEV_SUFFIX);
      obj[baseKey] = data[key];
    } else if (hasProdSuffix(key)) {
      if (!isProd) return obj;
      const baseKey = removeSuffix(key, FEATURE_FLAG_PRD_SUFFIX);
      obj[baseKey] = data[key];
    } else {
      obj[key] = data[key];
    }
    return obj;
  }, {} as FeatureFlagMap);
};

//@description posthog에서 설정한 featureflag에 _PRD 또는 _DEV 접미사가 제대로 붙었는지 유효성 검사 하는 함수
const validateFeatureFlagKeys = (data: FeatureFlagMap) => {
  const invalidKeys = Object.keys(data).filter(
    (key) => !key.endsWith(FEATURE_FLAG_PRD_SUFFIX) && !key.endsWith(FEATURE_FLAG_DEV_SUFFIX),
  );

  if (invalidKeys.length > 0) {
    console.warn(
      `Warning: Invalid feature flag keys: ${invalidKeys.join(', ')}. Please ensure all keys end with '_PRD' or '_DEV'.`,
    );
  }
};

async function getFeatureFlag() {
  const posthog = postHogClient();
  const cookie = cookies().get('bootstrapData') as BootstrapCookie;
  const { distinctID, featureFlags } = JSON.parse(cookie.value) as BootstrapData;
  posthog.capture({
    distinctId: distinctID,
    event: 'Page was loaded',
  });

  const flags = (await posthog.getAllFlags(distinctID)) as FeatureFlagMap;
  validateFeatureFlagKeys(flags);

  return { flags: filterAndNormalizeFeatureFlags(flags, IS_PRD) };
}

export { getFeatureFlag };
