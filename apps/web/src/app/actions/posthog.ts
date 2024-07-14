'use server';
import { cookies } from 'next/headers';
import { postHogClient } from '@/lib/posthog';
import { IS_VERCEL_PRD } from '@/constants/env';

const FEATURE_FLAG_PRD_SUFFIX = '_PROD';
const FEATURE_FLAG_DEV_SUFFIX = '_DEV';
type WithSuffix<T extends string, Suffix extends string> = `${T}${Suffix}`;

type FeatureFlagKeys<T extends string> =
  | WithSuffix<T, typeof FEATURE_FLAG_PRD_SUFFIX>
  | WithSuffix<T, typeof FEATURE_FLAG_DEV_SUFFIX>;

type FeatureFlags = 'MAIN_PAGE_RENEWAL_FEATURE';
type FeatureFlagsWithSuffix = FeatureFlagKeys<FeatureFlags>;

type FeatureFlagMap = Record<FeatureFlags, string | boolean>;
type FeatureFlagMapWithSuffix = Record<FeatureFlagsWithSuffix, string | boolean>;

interface BootstrapData {
  distinctID: string;
  featureFlags: FeatureFlagMap;
}

interface BootstrapCookie {
  name: 'bootstrapData';
  value: string;
}

// @description 접미사를 제거한 후 기본 FeatureFlags 타입으로 변환하는 함수
const removeSuffix = (key: FeatureFlagsWithSuffix, suffix: string) => {
  return key.slice(0, -suffix.length) as FeatureFlags;
};

// @description dev,prod환경에 따라서 featureflags를 필터링하고 접미사를 제외한 객체를 반환해주는 함수
const filterAndNormalizeFeatureFlags = (data: FeatureFlagMapWithSuffix, isProd: boolean) => {
  const SUFFIX = isProd ? FEATURE_FLAG_PRD_SUFFIX : FEATURE_FLAG_DEV_SUFFIX;

  const keys = Object.keys(data) as FeatureFlagsWithSuffix[];
  const filtered = keys.filter((flag) => flag.endsWith(SUFFIX));
  const obj = filtered.reduce((obj, key) => {
    const baseKey = removeSuffix(key, SUFFIX);
    obj[baseKey] = data[key];
    return obj;
  }, {} as FeatureFlagMap);

  return obj;
};

//@description posthog에서 설정한 featureflag에 _PRD 또는 _DEV 접미사가 제대로 붙었는지 유효성 검사 하는 함수
const validateFeatureFlagKeys = (data: FeatureFlagMapWithSuffix) => {
  const invalidKeys = Object.keys(data).filter(
    (key) => !key.endsWith(FEATURE_FLAG_PRD_SUFFIX) && !key.endsWith(FEATURE_FLAG_DEV_SUFFIX),
  );

  if (invalidKeys.length > 0) {
    throw new Error(
      `Invalid feature flag keys: ${invalidKeys.join(', ')}. Please ensure all keys end with '_PRD' or '_DEV'.`,
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

  const flags = (await posthog.getAllFlags(distinctID)) as FeatureFlagMapWithSuffix;
  validateFeatureFlagKeys(flags);

  return { flags: filterAndNormalizeFeatureFlags(flags, IS_VERCEL_PRD) };
}

export { getFeatureFlag };
