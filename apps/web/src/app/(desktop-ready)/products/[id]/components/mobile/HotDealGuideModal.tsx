'use client';

import { Drawer } from 'vaul';

import Button from '@/components/common/Button';
import HotdealBadge from '@/features/products/components/HotdealBadge';
import { cn } from '@/lib/cn';
import { HotDealType } from '@/shared/api/gql/graphql';

export default function HotdealGuideModal({ trigger }: { trigger: React.ReactNode }) {
  return (
    <Drawer.Root>
      <Drawer.Trigger asChild>{trigger}</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[9999] bg-black/40" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-[9999] mx-auto h-fit w-full max-w-screen-mobile-max rounded-t-[20px] bg-white outline-none">
          <div className="flex flex-col items-center">
            <Drawer.Title asChild>
              <h3 className="pb-[12px] pt-[32px] text-xl font-bold">핫딜 기준 안내</h3>
            </Drawer.Title>
            <p className="pb-[90px] text-center text-gray-700">
              AI를 활용해서 상품의 기존 가격과 할인된 가격을
              <br />
              비교해서 3단계로 구분해드려요!
            </p>
            <div className="w-[311px]">
              <div className="flex h-[20px] w-full items-center justify-around gap-[12px] rounded-[40px] bg-gradient-to-r from-[#FFEEE0] from-0% via-[#FFC0B2] via-[27%] to-[#FF4639] to-100%">
                {/* {Array.from({ length: 4 }, (_, i) => i).map((v) => ( */}
                <div className="relative h-[12px] w-[12px] rounded-full bg-white">
                  <div className="absolute -left-[calc(66px/2-6px)] -top-[calc(30px+12px)] inline-flex flex-col items-center">
                    <div
                      className={cn(
                        `flex h-[24px] w-[66px] items-center justify-center rounded-[8px] bg-gray-200 text-sm font-semibold text-gray-800`,
                      )}
                    >
                      기존 가격
                    </div>
                    <svg
                      className="-mt-[2px]"
                      width="10"
                      height="8"
                      viewBox="0 0 10 8"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M5 8L0.669873 0.499999L9.33013 0.5L5 8Z" fill="#E4E7EC" />
                    </svg>
                  </div>
                </div>
                <div className="relative h-[12px] w-[12px] rounded-full bg-white">
                  <div className="absolute -left-[calc(57px/2-6px)] -top-[calc(30px+12px)] inline-flex flex-col items-center">
                    <HotdealBadge badgeVariant="page" hotdealType={HotDealType.HotDeal} />
                    <svg
                      className="-mt-[2px]"
                      width="10"
                      height="8"
                      viewBox="0 0 10 8"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M5 8L0.669873 0.499999L9.33013 0.5L5 8Z" fill="#E25F03" />
                    </svg>
                  </div>
                </div>

                <div className="relative h-[12px] w-[12px] rounded-full bg-white">
                  <div className="absolute -left-[calc(57px/2-6px)] -top-[calc(30px+12px)] inline-flex flex-col items-center">
                    <HotdealBadge badgeVariant="page" hotdealType={HotDealType.SuperDeal} />
                    <svg
                      className="-mt-[2px]"
                      width="10"
                      height="8"
                      viewBox="0 0 10 8"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M5 8L0.669873 0.499999L9.33013 0.5L5 8Z" fill="#EC0621" />
                    </svg>
                  </div>
                </div>

                <div className="relative h-[12px] w-[12px] rounded-full bg-white">
                  <div className="absolute -left-[calc(62px/2-6px)] -top-[calc(30px+12px)] inline-flex flex-col items-center">
                    <HotdealBadge badgeVariant="page" hotdealType={HotDealType.UltraDeal} />
                    <svg
                      className="-mt-[2px]"
                      width="10"
                      height="8"
                      viewBox="0 0 10 8"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M5 8L0.669873 0.499999L9.33013 0.5L5 8Z" fill="#C00017" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="-mr-4 flex justify-end pt-[8px] text-sm text-gray-600">
                할인율이 높아져요
              </div>
            </div>
            <div className="mt-[34px] flex w-full p-5">
              <Drawer.Close asChild>
                <Button>확인</Button>
              </Drawer.Close>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
