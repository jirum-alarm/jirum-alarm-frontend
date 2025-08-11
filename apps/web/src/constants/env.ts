export const IS_API_MOCKING = process.env.NEXT_PUBLIC_API_MOCKING === 'enable';
export const IS_PRD = process.env.NODE_ENV === 'production';
export const IS_STAGING = process.env.NODE_ENV === 'test';
export const SERVICE_URL = process.env.SERVICE_URL;
export const DEFAULT_SERVICE_URL = 'https://jirum-alarm.com';
export const METADATA_SERVICE_URL = SERVICE_URL ?? DEFAULT_SERVICE_URL;
export const API_URL = process.env.API_URL;
export const LANDING_URL = process.env.LANDING_URL ?? 'https://about-us.jirum-alarm.com';
