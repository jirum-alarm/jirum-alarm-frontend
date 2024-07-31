import BasicLayout from '@/components/layout/BasicLayout';
import ProductDetailContainer from './components/ProductDetailContainer';
import { getFeatureFlag } from '@/app/actions/posthog';
import { Metadata } from 'next';
import { getProductDetail } from '@/features/products/server/productDetail';
import { SERVICE_URL } from '@/constants/env';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { flags } = await getFeatureFlag();

  if (flags.DETAIL_PAGE_RENEWAL) {
    return {
      title: '지름알림',
    };
  }

  const id = params.id;

  const { data } = await getProductDetail(+id);
  const product = data.product;

  const title = `${product.title} | 지름알림`;
  const description = product.guides?.map((guide) => guide.content).join(', ') || '';
  const images = product.thumbnail || './opengraph-image.png';

  return {
    title,
    openGraph: {
      title,
      description,
      images: [images],
    },
    icons: {
      icon: '/icon.png',
    },

    metadataBase: new URL(SERVICE_URL),
  };
}

export default async function ProductDetail({ params }: { params: { id: string } }) {
  const { flags } = await getFeatureFlag();

  return (
    <BasicLayout hasBackButton>
      {flags.DETAIL_PAGE_RENEWAL && <ProductDetailContainer id={params.id} />}
    </BasicLayout>
  );
}
