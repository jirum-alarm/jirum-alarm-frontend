import BasicLayout from '@/components/layout/BasicLayout';
import ProductDetailContainer from './components/ProductDetailContainer';
import { Metadata } from 'next';
import { getProductDetail } from '@/features/products/server/productDetail';
import { IS_VERCEL_PRD, SERVICE_URL } from '@/constants/env';
import ProductDetailPageHeader from './components/ProductDeatilPageHeader';
import { getProductGuides } from '@/features/products/server/productGuides';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  if (IS_VERCEL_PRD) {
    return {};
  }

  const id = params.id;

  const { data } = await getProductDetail(+id);
  const product = data.product;

  const { data: productGuides } = await getProductGuides(+product.id);

  const title = `지름알림 | ${product.title}`;
  const description =
    productGuides.productGuides.map((guide) => guide.content).join(', ') ||
    '핫딜 정보를 알려드려요!';
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
  if (IS_VERCEL_PRD) {
    return {};
  }

  const id = params.id;

  const { data } = await getProductDetail(+id);
  const product = data.product;

  return (
    <BasicLayout header={<ProductDetailPageHeader product={product} />}>
      <ProductDetailContainer product={product} />
    </BasicLayout>
  );
}
