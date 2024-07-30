import BasicLayout from '@/components/layout/BasicLayout';
import ProductDetailContainer from './components/ProductDetailContainer';
import { getFeatureFlag } from '@/app/actions/posthog';

export default async function ProductDetail({ params }: { params: { id: string } }) {
  const { flags } = await getFeatureFlag();

  return (
    <BasicLayout hasBackButton>
      {flags.DETAIL_PAGE_RENEWAL && <ProductDetailContainer id={params.id} />}
    </BasicLayout>
  );
}
