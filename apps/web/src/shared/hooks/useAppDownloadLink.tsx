import { useDevice } from '@/hooks/useDevice';

const GooglePlayLink = 'https://play.google.com/store/apps/details?id=com.solcode.jirmalam';
const AppStoreLink =
  'https://apps.apple.com/sg/app/%EC%A7%80%EB%A6%84%EC%95%8C%EB%A6%BC/id6474611420';

const useAppDownloadLink = () => {
  const { isApple, isAndroid, isJirumAlarmApp } = useDevice();

  if (isApple) {
    return { type: 'apple', link: AppStoreLink } as const;
  }
  if (isAndroid) {
    return { type: 'android', link: GooglePlayLink } as const;
  }

  return { type: null, link: null } as const;
};

export default useAppDownloadLink;
