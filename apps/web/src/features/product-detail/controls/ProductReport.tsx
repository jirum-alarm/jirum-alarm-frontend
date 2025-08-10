'use client';

import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Drawer } from 'vaul';

import Button from '@/components/common/Button';
import { useToast } from '@/components/common/Toast';
import { cn } from '@/lib/cn';

import { ProductService } from '@shared/api/product';
import useRedirectIfNotLoggedIn from '@shared/hooks/useRedirectIfNotLoggedIn';

import { ProductQueries } from '@entities/product';

const ProductReport = ({ productId }: { productId: number }) => {
  const { data: product } = useSuspenseQuery(ProductQueries.productStats({ id: productId }));

  return (
    <div
      className={cn(
        `flex h-[56px] items-center justify-between rounded-lg border bg-white p-[16px]`,
      )}
    >
      {product.isMyReported ? (
        <p className="flex items-center gap-2 text-sm text-gray-600">
          종료된 상품으로 제보해주셔서 감사해요 <span className="text-lg">😄</span>
        </p>
      ) : (
        <>
          <span className="text-sm text-gray-600">혹시 판매가 종료된 상품인가요?</span>
          <ProductReportModal productId={productId} />
        </>
      )}
    </div>
  );
};

export default ProductReport;

const ProductReportModal = ({ productId }: { productId: number }) => {
  const queryClient = useQueryClient();
  const productKey = ProductQueries.productStats({ id: productId }).queryKey;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const { checkAndRedirect } = useRedirectIfNotLoggedIn();
  const { mutate: reportExpiredProduct } = useMutation({
    mutationFn: ProductService.reportExpiredProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: productKey,
      });
      setIsModalOpen(false);
      toast('제보해주셔서 감사해요 :)');
    },
    onError: () => {
      setIsModalOpen(false);
      toast('이미 종료 제보된 상품입니다 :(');
    },
  });

  const handleReportExpiredProductClick = () => {
    if (checkAndRedirect()) return;
    reportExpiredProduct({ productId });
  };

  const handleOpenChange = (open: boolean) => {
    setIsModalOpen(open);
  };
  return (
    <Drawer.Root onOpenChange={handleOpenChange} open={isModalOpen}>
      <Drawer.Trigger asChild>
        <button className="-m-2 p-2 text-gray-900">제보하기</button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[9999] bg-black/40" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 left-0 right-0 z-[9999] mx-auto h-fit max-w-screen-mobile-max rounded-t-[20px] bg-white outline-none">
          <div className="flex flex-col items-center">
            <Drawer.Title asChild>
              <h2 className="pt-[32px] text-xl font-bold">판매가 종료된 상품인가요?</h2>
            </Drawer.Title>
            <p className="py-3 text-center text-gray-700">
              더 빠른 핫딜 확인을 위해
              <br />
              종료된 상품을 제보해 주세요!
            </p>
            <div className="flex w-full gap-[12px] p-5">
              <Drawer.Close asChild>
                <Button color={'secondary'}>취소</Button>
              </Drawer.Close>
              <Button onClick={handleReportExpiredProductClick}>종료 제보하기</Button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
