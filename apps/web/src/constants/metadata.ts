import { SERVICE_URL } from './env';

export const defaultMetadata = {
  title: '지름알림: 핫딜 정보 모아보기',
  description: '지름 정보를 알려드려요!',
  openGraph: {
    title: '지름알림: 핫딜 정보 모아보기',
    description: '핫딜 정보를 알려드려요!',
    images: './opengraph-image.png',
  },
  icons: {
    icon: '/icon.png',
  },
  metadataBase: new URL(SERVICE_URL),
};
