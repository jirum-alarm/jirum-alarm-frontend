export const IS_API_MOCKING = process.env.NEXT_PUBLIC_API_MOCKING === 'enable';
export const IS_PRD = process.env.NODE_ENV === 'production';
export const SERVICE_URL = IS_PRD
  ? 'https://jirum-alarm.com'
  : (process.env.NEXT_PUBLIC_SERVICE_URL ?? 'http://dev.jirum-alarm.com');
