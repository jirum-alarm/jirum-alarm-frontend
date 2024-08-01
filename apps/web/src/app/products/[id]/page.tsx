import BasicLayout from '@/components/layout/BasicLayout';
import ProductDetailContainer from './components/ProductDetailContainer';
import { getFeatureFlag } from '@/app/actions/posthog';
import { Metadata } from 'next';
import { getProductDetail } from '@/features/products/server/productDetail';
import { SERVICE_URL } from '@/constants/env';
import ProductDetailPageHeader from './components/ProductDeatilPageHeader';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { flags } = await getFeatureFlag();

  if (!flags.DETAIL_PAGE_RENEWAL) {
    return {};
  }

  const id = params.id;

  const { data } = await getProductDetail(+id);
  const product = data.product;

  const title = `${product.title} | 지름알림`;
  const description =
    product.guides?.map((guide) => guide.content).join(', ') || '핫딜 정보를 알려드려요!';
  const image = product.thumbnail || '/opengraph-image.png';

  return {
    title,
    openGraph: {
      title,
      description,
      url: `${SERVICE_URL}/products/${id}`,
      type: 'website',
      images: [{ url: image }],
    },
    icons: {
      icon: '/icon.png',
    },
  };
}

export default async function ProductDetail({ params }: { params: { id: string } }) {
  const { flags } = await getFeatureFlag();

  if (!flags.DETAIL_PAGE_RENEWAL) {
    return;
  }

  const id = params.id;

  const { data } = await getProductDetail(+id);
  const product = data.product;

  return (
    <BasicLayout header={<ProductDetailPageHeader product={product} />}>
      <ProductDetailContainer id={params.id} />
    </BasicLayout>
  );
}
