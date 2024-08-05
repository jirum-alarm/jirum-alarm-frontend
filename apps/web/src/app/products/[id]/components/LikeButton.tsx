'use client';

import Button from '@/components/common/Button';
import { EVENT } from '@/constants/mixpanel';
import { PAGE } from '@/constants/page';
import { useAddWishlist, useRemoveWishlist } from '@/features/products';
import { IProduct } from '@/graphql/interface';
import { cn } from '@/lib/cn';
import { mp } from '@/lib/mixpanel';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LikeButton({
  product,
  isUserLogin,
}: {
  product: IProduct;
  isUserLogin: boolean;
}) {
  const [isLiked, setIsLiked] = useState(product.isMyWishlist);

  const productId = +product.id;

  const router = useRouter();

  const addWishlist = useAddWishlist();
  const removeWishlist = useRemoveWishlist();

  const handleClickWishlist = () => {
    if (!isUserLogin) {
      mp.track(EVENT.PRODUCT_WISH.NAME, {
        type: EVENT.PRODUCT_WISH.TYPE.NOT_LOGGED_IN,
        page: EVENT.PAGE.DETAIL,
      });

      router.push(PAGE.LOGIN);

      return;
    }

    if (isLiked) {
      mp.track(EVENT.PRODUCT_WISH.NAME, {
        type: EVENT.PRODUCT_WISH.TYPE.REMOVE,
        page: EVENT.PAGE.DETAIL,
      });

      removeWishlist(productId);
      setIsLiked(false);

      return;
    }

    if (!isLiked) {
      mp.track(EVENT.PRODUCT_WISH.NAME, {
        type: EVENT.PRODUCT_WISH.TYPE.ADD,
        page: EVENT.PAGE.DETAIL,
      });

      addWishlist(productId);
      setIsLiked(true);

      return;
    }
  };

  return (
    <Button
      variant="outlined"
      onClick={handleClickWishlist}
      className="flex w-[52px] min-w-[52px] flex-col items-center justify-center border-gray-300 px-2 py-1"
    >
      <HeartIcon isLiked={isLiked} />
      <span className="text-[11px] leading-4 text-gray-900">찜하기</span>
    </Button>
  );
}

function HeartIcon({ isLiked }: { isLiked: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="transparent"
      className={cn({
        'fill-error-400': isLiked,
      })}
      style={{ transition: 'fill 0.3s ease-out' }}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.9931 5.33265C10.0271 3.03418 6.74861 2.4159 4.2853 4.52061C1.82199 6.62531 1.47519 10.1443 3.40964 12.6335C5.018 14.7032 9.88548 19.0682 11.4808 20.481C11.6593 20.639 11.7485 20.7181 11.8526 20.7491C11.9434 20.7762 12.0428 20.7762 12.1337 20.7491C12.2378 20.7181 12.327 20.639 12.5055 20.481C14.1008 19.0682 18.9683 14.7032 20.5766 12.6335C22.5111 10.1443 22.2066 6.60317 19.701 4.52061C17.1953 2.43804 13.9592 3.03418 11.9931 5.33265Z"
        stroke="#344054"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn({ 'stroke-error-400': isLiked })}
        style={{ transition: 'stroke 0.1s ease-out' }}
      />
    </svg>
  );
}
