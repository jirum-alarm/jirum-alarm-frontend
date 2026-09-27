import ProductDetail from './components/ProductDetail';

const ProductDetailPage = async ({ params }: { params: Promise<{ productId: string }> }) => {
  const { productId } = await params;

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-black dark:text-white">상품 상세</h2>
      </div>
      <ProductDetail productId={productId} />
    </>
  );
};

export default ProductDetailPage;
