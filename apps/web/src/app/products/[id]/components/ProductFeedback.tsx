'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ProductQueries } from '@/entities/product';
import useRedirectIfNotLoggedIn from '@/features/auth/useRedirectIfNotLoggedIn';
import { cn } from '@/lib/cn';
import { ProductQuery, UserLikeTarget } from '@/shared/api/gql/graphql';
import { LikeService } from '@/shared/api/like/like.service';

const ProductFeedback = ({ product }: { product: NonNullable<ProductQuery['product']> }) => {
  const queryClient = useQueryClient();
  const productKey = ProductQueries.product({ id: +product.id }).queryKey;

  const { mutate: addUserLikeOrDislike } = useMutation({
    mutationFn: LikeService.addUserLikeOrDislike,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: productKey,
      }),
  });
  const { checkAndRedirect } = useRedirectIfNotLoggedIn();

  const handleUserLikeClick = () => {
    if (checkAndRedirect()) return;
    if (product.isMyLike) {
      addUserLikeOrDislike({
        target: UserLikeTarget.Product,
        targetId: +product.id,
        isLike: null,
      });
    } else {
      addUserLikeOrDislike({
        target: UserLikeTarget.Product,
        targetId: +product.id,
        isLike: true,
      });
    }
  };
  const handleUserDisLikeClick = () => {
    if (checkAndRedirect()) return;
    if (product.isMyLike !== null && product.isMyLike === false) {
      addUserLikeOrDislike({
        target: UserLikeTarget.Product,
        targetId: +product.id,
        isLike: null,
      });
    } else {
      addUserLikeOrDislike({
        target: UserLikeTarget.Product,
        targetId: +product.id,
        isLike: false,
      });
    }
  };
  return (
    <div className="px-[20px]">
      <h2 className="py-[16px] font-semibold text-gray-900">상품 추천하기</h2>
      <div className="flex h-[140px] flex-col items-center gap-[12px] rounded-[8px] border border-secondary-200 bg-secondary-50 px-[31px] py-[20px]">
        <p className="text-center text-gray-800">
          이 상품 정말 <span className="font-semibold text-secondary-700">핫딜</span>이 맞나요?
          <br />
          의견을 알려주세요!
        </p>
        <div className="flex gap-[12px]">
          <button
            className={cn(
              `flex h-[40px] w-[130px] items-center justify-center gap-[8px] rounded-full bg-white py-[8px] text-gray-700`,
              {
                'border border-secondary-500 font-semibold text-secondary-700':
                  product.isMyLike !== null && product.isMyLike,
              },
            )}
            onClick={handleUserLikeClick}
          >
            <ThumbUp />
            <span>추천해요</span>
          </button>
          <button
            className={cn(
              `flex h-[40px] w-[130px] items-center justify-center gap-[8px] rounded-full bg-white py-[8px] text-gray-700`,
              {
                'border border-error-300 font-semibold text-error-800':
                  product.isMyLike !== null && !product.isMyLike,
              },
            )}
            onClick={handleUserDisLikeClick}
          >
            <ThumbDown />
            <span>비추천해요</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductFeedback;

const ThumbUp = () => {
  return (
    <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M18.1464 5.79086C18.3888 5.90023 18.6053 6.05994 18.7813 6.25938C18.9574 6.45888 19.089 6.6936 19.1674 6.94792C19.2458 7.20224 19.2692 7.47033 19.2359 7.73438L18.2984 15.2344C18.2413 15.6876 18.0208 16.1044 17.6781 16.4065C17.3354 16.7085 16.8943 16.8752 16.4375 16.875H3C2.66848 16.875 2.35054 16.7433 2.11612 16.5089C1.8817 16.2745 1.75 15.9565 1.75 15.625V8.75C1.75 8.41848 1.8817 8.10054 2.11612 7.86612C2.35054 7.6317 2.66848 7.5 3 7.5H6.36406L9.31563 1.59531C9.36759 1.49148 9.44744 1.40417 9.54625 1.34317C9.64505 1.28218 9.75889 1.24992 9.875 1.25C10.7038 1.25 11.4987 1.57924 12.0847 2.16529C12.6708 2.75134 13 3.5462 13 4.375V5.625H17.375C17.641 5.62495 17.9039 5.68148 18.1464 5.79086Z"
        fill="#DAE5FE"
      />
      <path
        d="M18.7813 6.25938C18.6053 6.05994 18.3888 5.90023 18.1464 5.79086C17.9039 5.68148 17.641 5.62495 17.375 5.625H13V4.375C13 3.5462 12.6708 2.75134 12.0847 2.16529C11.4987 1.57924 10.7038 1.25 9.875 1.25C9.75889 1.24992 9.64505 1.28218 9.54625 1.34317C9.44744 1.40417 9.36759 1.49148 9.31563 1.59531L6.36406 7.5H3C2.66848 7.5 2.35054 7.6317 2.11612 7.86612C1.8817 8.10054 1.75 8.41848 1.75 8.75V15.625C1.75 15.9565 1.8817 16.2745 2.11612 16.5089C2.35054 16.7433 2.66848 16.875 3 16.875H16.4375C16.8943 16.8752 17.3354 16.7085 17.6781 16.4065C18.0208 16.1044 18.2413 15.6876 18.2984 15.2344L19.2359 7.73438C19.2692 7.47033 19.2458 7.20224 19.1674 6.94792C19.089 6.6936 18.9574 6.45888 18.7813 6.25938ZM3 8.75H6.125V15.625H3V8.75ZM17.9953 7.57812L17.0578 15.0781C17.0388 15.2292 16.9653 15.3681 16.851 15.4688C16.7368 15.5695 16.5898 15.6251 16.4375 15.625H7.375V8.27266L10.243 2.53594C10.668 2.62101 11.0505 2.85075 11.3253 3.18605C11.6 3.52135 11.7501 3.9415 11.75 4.375V6.25C11.75 6.41576 11.8158 6.57473 11.9331 6.69194C12.0503 6.80915 12.2092 6.875 12.375 6.875H17.375C17.4637 6.87497 17.5514 6.89382 17.6322 6.93028C17.7131 6.96675 17.7852 7.02001 17.8439 7.08652C17.9026 7.15303 17.9464 7.23126 17.9725 7.31602C17.9986 7.40078 18.0064 7.49013 17.9953 7.57812Z"
        fill="#3964C7"
      />
    </svg>
  );
};

const ThumbDown = () => {
  return (
    <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M19.2359 12.2656L18.2984 4.76563C18.2413 4.31241 18.0208 3.89562 17.6781 3.59354C17.3354 3.29145 16.8943 3.12484 16.4375 3.125H3C2.66848 3.125 2.35054 3.2567 2.11612 3.49112C1.8817 3.72554 1.75 4.04348 1.75 4.375V11.25C1.75 11.5815 1.8817 11.8995 2.11612 12.1339C2.35054 12.3683 2.66848 12.5 3 12.5H6.36406L9.31562 18.4047C9.36758 18.5085 9.44744 18.5958 9.54625 18.6568C9.64505 18.7178 9.75889 18.7501 9.875 18.75C10.7038 18.75 11.4987 18.4208 12.0847 17.8347C12.6708 17.2487 13 16.4538 13 15.625V14.375H17.375C17.6411 14.3751 17.9041 14.3186 18.1467 14.2091C18.3892 14.0997 18.6057 13.94 18.7817 13.7404C18.9577 13.5409 19.0892 13.3062 19.1676 13.0519C19.2459 12.7976 19.2692 12.5296 19.2359 12.2656Z"
        fill="#FFE1E5"
      />
      <path
        d="M19.2359 12.2656L18.2984 4.76563C18.2413 4.31241 18.0208 3.89562 17.6781 3.59354C17.3354 3.29145 16.8943 3.12484 16.4375 3.125H3C2.66848 3.125 2.35054 3.2567 2.11612 3.49112C1.8817 3.72554 1.75 4.04348 1.75 4.375V11.25C1.75 11.5815 1.8817 11.8995 2.11612 12.1339C2.35054 12.3683 2.66848 12.5 3 12.5H6.36406L9.31563 18.4047C9.36759 18.5085 9.44744 18.5958 9.54625 18.6568C9.64505 18.7178 9.75889 18.7501 9.875 18.75C10.7038 18.75 11.4987 18.4208 12.0847 17.8347C12.6708 17.2487 13 16.4538 13 15.625V14.375H17.375C17.6411 14.3751 17.9041 14.3186 18.1467 14.2091C18.3892 14.0997 18.6057 13.94 18.7817 13.7404C18.9577 13.5409 19.0892 13.3062 19.1676 13.0519C19.2459 12.7976 19.2692 12.5296 19.2359 12.2656ZM6.125 11.25H3V4.375H6.125V11.25ZM17.8438 12.9133C17.7855 12.9803 17.7135 13.0339 17.6325 13.0704C17.5516 13.107 17.4638 13.1256 17.375 13.125H12.375C12.2092 13.125 12.0503 13.1908 11.9331 13.3081C11.8158 13.4253 11.75 13.5842 11.75 13.75V15.625C11.7501 16.0585 11.6 16.4787 11.3253 16.814C11.0505 17.1493 10.668 17.379 10.243 17.4641L7.375 11.7273V4.375H16.4375C16.5898 4.37495 16.7368 4.43048 16.851 4.53118C16.9653 4.63187 17.0388 4.7708 17.0578 4.92188L17.9953 12.4219C18.007 12.5099 17.9995 12.5994 17.9734 12.6842C17.9472 12.769 17.903 12.8472 17.8438 12.9133Z"
        fill="#EF334A"
      />
    </svg>
  );
};
