export const IS_API_MOCKING = process.env.NEXT_PUBLIC_API_MOCKING === 'enable';
export const IS_PRD = process.env.NODE_ENV === 'production';
export const SERVICE_URL = process.env.SERVICE_URL ?? 'https://jirum-alarm.com';
export const LANDING_URL = process.env.LANDING_URL ?? 'https://about-us.jirum-alarm.com';
