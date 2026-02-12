'use client';

import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Drawer } from 'vaul';

import { ProductService } from '@/shared/api/product';
import useRedirectIfNotLoggedIn from '@/shared/hooks/useRedirectIfNotLoggedIn';
import { cn } from '@/shared/lib/cn';
import Button from '@/shared/ui/common/Button';
import { useToast } from '@/shared/ui/common/Toast';

import { ProductQueries } from '@/entities/product';

const ProductReport = ({ productId }: { productId: number }) => {
  const { data: product } = useSuspenseQuery(ProductQueries.productStats({ id: productId }));

  return (
    <div
      className={cn(`flex h-14 items-center justify-between rounded-lg border bg-white p-[16px]`)}
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
        <Drawer.Overlay className="fixed inset-0 z-9999 bg-black/40" />
        <Drawer.Content className="max-w-mobile-max fixed inset-x-0 right-0 bottom-0 left-0 z-9999 mx-auto h-fit rounded-t-[20px] bg-white outline-hidden">
          <div className="flex flex-col items-center">
            <Drawer.Title asChild>
              <h2 className="pt-[32px] text-xl font-bold">판매가 종료된 상품인가요?</h2>
            </Drawer.Title>
            <SoldOutIcon />
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

function SoldOutIcon() {
  return (
    <div className="relative mt-0.5 flex h-[172px] w-fit items-center justify-center">
      <svg
        width="136"
        height="136"
        viewBox="0 0 136 136"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#clip0_2105_36155)">
          <rect width="136" height="136" rx="68" fill="#E6F1D7" />
          <path
            d="M52.5764 119.435C54.2684 119.643 57.1684 119.79 59.0276 119.853V145.656C59.0275 146.512 58.3385 147.18 57.5032 147.181H39.2874C38.3683 147.181 37.6582 146.366 37.7834 145.447C38.6149 139.336 43.9141 139.306 43.9661 139.306H49.8762C50.3775 139.306 50.795 138.93 50.8577 138.449L52.5764 119.435ZM73.1418 138.449C73.2045 138.93 73.6229 139.306 74.1243 139.306H80.0334C80.0334 139.306 85.3815 139.306 86.217 145.447C86.3422 146.366 85.632 147.18 84.7131 147.181H66.4973C65.6618 147.181 64.972 146.513 64.9719 145.656V119.853C66.8311 119.79 69.7311 119.643 71.4231 119.435L73.1418 138.449Z"
            fill="url(#paint0_linear_2105_36155)"
          />
          <path
            d="M80.3213 12.8193C86.5231 18.3669 90.4397 30.5111 88.8438 40.3047C86.9264 52.0699 82.6317 52.3202 82.5439 57.1543C82.5447 57.3706 82.5505 57.5966 82.5625 57.834C82.9034 64.5797 92.6509 65.367 94.0195 59.208C94.4585 57.2325 94.3242 55.1942 93.9971 53.3457C101.432 61.2234 105.992 71.845 105.992 83.5322C105.992 107.826 86.297 127.521 62.0029 127.521C37.7084 127.521 18.0137 107.827 18.0137 83.5322C18.0137 73.7861 21.1843 64.7813 26.5488 57.4902C26.5349 57.7948 26.5283 58.0989 26.5283 58.4004C26.5284 62.309 27.6204 64.8552 29.6953 65.6621C31.7701 66.4683 34.2431 64.3591 35.0078 60.8174C35.7726 57.2754 37.8195 51.8738 43.3887 46.8066C43.6459 46.5727 43.9036 46.3486 44.1602 46.1318C53.6833 37.8148 63.0352 39.1467 72.7002 30.6533C81.0701 23.2979 80.3264 12.8895 80.3213 12.8193Z"
            fill="url(#paint1_radial_2105_36155)"
          />
          <path
            d="M51.9209 88.6026C49.6942 88.6026 47.8891 86.7975 47.8891 84.5708C47.8891 82.3441 49.6942 80.5391 51.9209 80.5391C54.1475 80.5391 55.9526 82.3441 55.9526 84.5708C55.9526 86.7975 54.1475 88.6026 51.9209 88.6026Z"
            fill="#162034"
          />
          <path
            d="M72.0822 88.6026C69.8556 88.6026 68.0505 86.7975 68.0505 84.5708C68.0505 82.3441 69.8556 80.5391 72.0822 80.5391C74.3089 80.5391 76.114 82.3441 76.114 84.5708C76.114 86.7975 74.3089 88.6026 72.0822 88.6026Z"
            fill="#162034"
          />
          <path
            d="M56.7609 100.769L54.7285 99.5952L56.7445 96.1034L58.7769 97.2768C62.0712 99.1787 66.284 98.0503 68.1861 94.7562L69.3598 92.7231L72.8517 94.7391L71.6779 96.7722C68.6624 101.995 61.9837 103.784 56.7609 100.769Z"
            fill="#162034"
          />
        </g>
        <defs>
          <linearGradient
            id="paint0_linear_2105_36155"
            x1="62"
            y1="119.435"
            x2="62"
            y2="147.181"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#00A838" />
            <stop offset="1" stopColor="#02501B" />
          </linearGradient>
          <radialGradient
            id="paint1_radial_2105_36155"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(62.0024 76.9687) rotate(-47.3122) scale(95.1173 96.5837)"
          >
            <stop offset="0.296239" stopColor="#67FF53" />
            <stop offset="1" stopColor="#00B5C9" />
          </radialGradient>
          <clipPath id="clip0_2105_36155">
            <rect width="136" height="136" rx="68" fill="white" />
          </clipPath>
        </defs>
      </svg>
      <div className="absolute top-0 -right-[2.65rem] z-50">
        <Clock />
      </div>
    </div>
  );
}

const Clock = () => {
  return (
    <svg width="90" height="88" viewBox="0 0 90 88" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g filter="url(#filter0_d_3_8145)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M46 74C63.6731 74 78 59.6731 78 42C78 24.3269 63.6731 10 46 10C28.3269 10 14 24.3269 14 42C14 46.2935 14.8456 50.3895 16.3793 54.1305L12 68.3164L24.2943 65.5132C29.9982 70.7813 37.6233 74 46 74Z"
          fill="white"
        />
      </g>
      <path
        d="M50.1667 26.3749H41.8333C40.5833 26.3749 39.75 25.5416 39.75 24.2916C39.75 23.0416 40.5833 22.2083 41.8333 22.2083H50.1667C51.4167 22.2083 52.25 23.0416 52.25 24.2916C52.25 25.5416 51.4167 26.3749 50.1667 26.3749Z"
        fill="#BC0017"
      />
      <path
        d="M45.9998 47.2084C44.7498 47.2084 43.9165 46.3751 43.9165 45.1251V38.8751C43.9165 37.6251 44.7498 36.7917 45.9998 36.7917C47.2498 36.7917 48.0832 37.6251 48.0832 38.8751V45.1251C48.0832 46.3751 47.2498 47.2084 45.9998 47.2084Z"
        fill="white"
      />
      <path
        d="M46.0002 28.4583C36.8335 28.4583 29.3335 35.9583 29.3335 45.1249C29.3335 54.2916 36.8335 61.7916 46.0002 61.7916C55.1668 61.7916 62.6668 54.2916 62.6668 45.1249C62.6668 35.9583 55.1668 28.4583 46.0002 28.4583ZM48.0835 45.1249C48.0835 46.3749 47.2502 47.2083 46.0002 47.2083C44.7502 47.2083 43.9168 46.3749 43.9168 45.1249V38.8749C43.9168 37.6249 44.7502 36.7916 46.0002 36.7916C47.2502 36.7916 48.0835 37.6249 48.0835 38.8749V45.1249Z"
        fill="#F799A4"
      />
      <path
        d="M32.875 34.9167C33.7083 33.875 34.75 32.8333 35.7917 32L33.9167 30.125C33.0833 29.2917 31.8333 29.2917 31 30.125C30.1667 30.9583 30.1667 32.2083 31 33.0417L32.875 34.9167ZM59.125 34.9167L61 33.0417C61.8333 32.2083 61.8333 30.9583 61 30.125C60.1667 29.2917 58.9167 29.2917 58.0833 30.125L56.2083 32C57.25 32.8333 58.2917 33.875 59.125 34.9167Z"
        fill="#BC0017"
      />
      <path
        d="M46 48.25C47.7259 48.25 49.125 46.8509 49.125 45.125C49.125 43.3991 47.7259 42 46 42C44.2741 42 42.875 43.3991 42.875 45.125C42.875 46.8509 44.2741 48.25 46 48.25Z"
        fill="#BC0017"
      />
      <defs>
        <filter
          id="filter0_d_3_8145"
          x="0"
          y="0"
          width="90"
          height="88"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2" />
          <feGaussianBlur stdDeviation="6" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_3_8145" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_3_8145"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
};
