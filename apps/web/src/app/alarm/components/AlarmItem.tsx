import Image from 'next/image';
import { INotification } from '@/graphql/interface';
import { displayTime } from '@/util/displayTime';
import React, { useState } from 'react';
import { cn } from '@/lib/cn';

const AlarmItem = ({ notification }: { notification: INotification }) => {
  const { message, url, createdAt, product } = notification;
  const { thumbnail, price, isHot, isEnd } = product ?? {};

  return (
    <li className="flex gap-x-3 ">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full p-5 hover:bg-gray-100"
      >
        <div className="flex-1 pr-3">
          <p className="line-clamp-2 w-full text-sm text-gray-900">{message}</p>
          <div className="flex items-center gap-x-3 pt-2">
            {(isHot || isEnd) && (
              <div
                className={cn(
                  'text-semibold flex h-[22px] items-center rounded-lg text-xs leading-normal',
                  {
                    'border border-gray-400 bg-white px-2 text-gray-500': isEnd,
                    'bg-error-500 px-3 text-white ': !isEnd && isHot,
                  },
                )}
              >
                {isEnd ? '판매종료' : isHot ? '핫딜' : ''}
              </div>
            )}
            {price && (
              <>
                <span className="line-clamp-1 max-w-56 font-semibold text-gray-900">{price}</span>
                <span className="inline-block h-2.5 border-l border-gray-400"></span>
              </>
            )}
            <span className="text-xs text-gray-400">{displayTime(createdAt)}</span>
          </div>
        </div>
        <div className="h-14 w-14 overflow-hidden rounded border border-gray-200">
          <ImageWithFallback src={thumbnail} title={message} />
        </div>
      </a>
    </li>
  );
};

export default AlarmItem;

const ImageWithFallback = React.memo(function ImageWithFallback({
  src,
  title,
}: {
  src: string | undefined;
  title: string;
}) {
  const [error, setError] = useState(false);

  return (
    <>
      {error || !src ? (
        <NoImage />
      ) : (
        <Image
          src={src}
          width={56}
          height={56}
          alt={title}
          onError={() => setError(true)}
          priority
          unoptimized
          placeholder="blur"
          blurDataURL="data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=="
        />
      )}
    </>
  );
});

function NoImage() {
  return (
    <div className="flex h-full items-center justify-center bg-gray-50">{<IllustStanding />}</div>
  );
}

/**
 * @TODO: 이미지 없는 일러스트 props로 크기 조절 가능하게 한 후 이 컴포 삭제
 */
function IllustStanding() {
  return (
    <div className="flex h-14 w-14 items-center justify-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
      >
        <path
          d="M32.0522 43.3049C32.0972 43.6349 31.8347 43.9274 31.5047 43.9274H24.9647C24.6647 43.9274 24.4172 43.6874 24.4172 43.3799V37.0499H24.6197C25.1147 37.0499 25.6247 37.0424 26.1497 37.0199C26.2172 37.0199 26.2847 37.0124 26.3447 37.0049L26.8097 40.7924C26.8322 40.9649 26.9822 41.0999 27.1622 41.0999H29.8322C29.8322 41.0999 31.7447 41.0999 32.0522 43.3049Z"
          fill="#E4E7EC"
        />
        <path
          d="M23.1046 37.0123V43.3798C23.1046 43.6873 22.8571 43.9273 22.5571 43.9273H16.0171C15.6871 43.9273 15.4321 43.6348 15.4771 43.3048C15.7771 41.0998 17.6971 41.0998 17.6971 41.0998H20.3596C20.5396 41.0998 20.6896 40.9648 20.7121 40.7923L21.1996 36.8623C21.8071 36.9373 22.4371 36.9898 23.1046 37.0123Z"
          fill="#E4E7EC"
        />
        <mask
          id="path-3-outside-1_892_1160"
          maskUnits="userSpaceOnUse"
          x="23.7844"
          y="19.8047"
          width="3"
          height="3"
          fill="black"
        >
          <rect fill="white" x="23.7844" y="19.8047" width="3" height="3" />
          <path d="M25.4594 22.1547C25.8322 22.1547 26.1344 21.8525 26.1344 21.4797C26.1344 21.1069 25.8322 20.8047 25.4594 20.8047C25.0866 20.8047 24.7844 21.1069 24.7844 21.4797C24.7844 21.8525 25.0866 22.1547 25.4594 22.1547Z" />
        </mask>
        <path
          d="M25.4594 22.1547C25.8322 22.1547 26.1344 21.8525 26.1344 21.4797C26.1344 21.1069 25.8322 20.8047 25.4594 20.8047C25.0866 20.8047 24.7844 21.1069 24.7844 21.4797C24.7844 21.8525 25.0866 22.1547 25.4594 22.1547Z"
          fill="#E4E7EC"
        />
        <path
          d="M25.4594 22.1547C25.8322 22.1547 26.1344 21.8525 26.1344 21.4797C26.1344 21.1069 25.8322 20.8047 25.4594 20.8047C25.0866 20.8047 24.7844 21.1069 24.7844 21.4797C24.7844 21.8525 25.0866 22.1547 25.4594 22.1547Z"
          stroke="#E4E7EC"
          stroke-width="0.4"
          mask="url(#path-3-outside-1_892_1160)"
        />
        <mask
          id="path-4-outside-2_892_1160"
          maskUnits="userSpaceOnUse"
          x="20.8"
          y="19.8047"
          width="3"
          height="3"
          fill="black"
        >
          <rect fill="white" x="20.8" y="19.8047" width="3" height="3" />
          <path d="M22.475 22.1547C22.8478 22.1547 23.15 21.8525 23.15 21.4797C23.15 21.1069 22.8478 20.8047 22.475 20.8047C22.1023 20.8047 21.8 21.1069 21.8 21.4797C21.8 21.8525 22.1023 22.1547 22.475 22.1547Z" />
        </mask>
        <path
          d="M22.475 22.1547C22.8478 22.1547 23.15 21.8525 23.15 21.4797C23.15 21.1069 22.8478 20.8047 22.475 20.8047C22.1023 20.8047 21.8 21.1069 21.8 21.4797C21.8 21.8525 22.1023 22.1547 22.475 22.1547Z"
          fill="#E4E7EC"
        />
        <path
          d="M22.475 22.1547C22.8478 22.1547 23.15 21.8525 23.15 21.4797C23.15 21.1069 22.8478 20.8047 22.475 20.8047C22.1023 20.8047 21.8 21.1069 21.8 21.4797C21.8 21.8525 22.1023 22.1547 22.475 22.1547Z"
          stroke="#E4E7EC"
          stroke-width="0.4"
          mask="url(#path-4-outside-2_892_1160)"
        />
        <mask
          id="path-5-outside-3_892_1160"
          maskUnits="userSpaceOnUse"
          x="19.6829"
          y="22.168"
          width="6"
          height="4"
          fill="black"
        >
          <rect fill="white" x="19.6829" y="22.168" width="6" height="4" />
          <path d="M23.2254 25.6205C21.8454 25.6205 21.0054 24.6005 20.7279 23.948C20.6079 23.663 20.7354 23.333 21.0204 23.213C21.3054 23.093 21.6354 23.2205 21.7554 23.5055C21.8154 23.648 22.4004 24.848 23.8479 24.398C24.1479 24.3005 24.4629 24.473 24.5529 24.7655C24.6429 25.0655 24.4779 25.3805 24.1854 25.4705C23.8404 25.5755 23.5179 25.628 23.2179 25.628L23.2254 25.6205Z" />
        </mask>
        <path
          d="M23.2254 25.6205C21.8454 25.6205 21.0054 24.6005 20.7279 23.948C20.6079 23.663 20.7354 23.333 21.0204 23.213C21.3054 23.093 21.6354 23.2205 21.7554 23.5055C21.8154 23.648 22.4004 24.848 23.8479 24.398C24.1479 24.3005 24.4629 24.473 24.5529 24.7655C24.6429 25.0655 24.4779 25.3805 24.1854 25.4705C23.8404 25.5755 23.5179 25.628 23.2179 25.628L23.2254 25.6205Z"
          fill="#E4E7EC"
        />
        <path
          d="M23.2254 25.6205C21.8454 25.6205 21.0054 24.6005 20.7279 23.948C20.6079 23.663 20.7354 23.333 21.0204 23.213C21.3054 23.093 21.6354 23.2205 21.7554 23.5055C21.8154 23.648 22.4004 24.848 23.8479 24.398C24.1479 24.3005 24.4629 24.473 24.5529 24.7655C24.6429 25.0655 24.4779 25.3805 24.1854 25.4705C23.8404 25.5755 23.5179 25.628 23.2179 25.628L23.2254 25.6205Z"
          stroke="#E4E7EC"
          stroke-width="0.4"
          mask="url(#path-5-outside-3_892_1160)"
        />
        <mask
          id="path-6-outside-4_892_1160"
          maskUnits="userSpaceOnUse"
          x="10.25"
          y="2.75"
          width="27"
          height="35"
          fill="black"
        >
          <rect fill="white" x="10.25" y="2.75" width="27" height="35" />
          <path d="M36.2 21.6375C36.02 21.3225 35.84 21 35.6675 20.685C34.8875 19.2675 34.3925 18.39 33.9725 18.105L33.5675 17.8275L33.41 18.3C33.2675 18.7275 32.99 19.1925 32.87 19.23C32.87 19.2225 32.555 19.095 32.2175 17.55C31.535 14.4375 29.1275 13.215 27.005 12.1425C26.3375 11.7975 25.7 11.475 25.1675 11.115C23.1275 9.72 22.37 4.6875 22.3625 4.635L22.2275 3.75L21.6875 4.47C19.58 7.26 19.34 9.63 19.0925 12.135C18.95 13.5825 18.8 15.075 18.2825 16.74C18.02 17.5575 17.6975 18.0225 17.3675 18.045H17.3375C16.4975 18.045 15.1625 15.87 14.48 14.31L14.225 13.7175L13.835 14.235C13.79 14.3025 12.62 15.9375 11.465 24.0225C10.865 28.245 11.5175 31.35 13.4675 33.51C15.1175 35.34 17.6675 36.45 21.2 36.8625C21.8075 36.9375 22.4375 36.99 23.105 37.0125C23.5325 37.035 23.9675 37.05 24.4175 37.05H24.62C25.115 37.05 25.625 37.0425 26.15 37.02C26.2175 37.02 26.285 37.0125 26.345 37.005C30.425 36.8025 33.5075 35.0325 35.27 31.8825C37.43 28.005 37.0175 23.085 36.2 21.6375ZM35.6975 28.725C35.465 29.67 35.1125 30.615 34.61 31.515C33.77 33.0225 32.6375 34.17 31.22 34.965C31.0475 35.0625 30.8675 35.16 30.68 35.2425C30.1475 35.4975 29.57 35.7075 28.9625 35.865C28.7525 35.925 28.535 35.97 28.3175 36.015C28.1075 36.06 27.8825 36.0975 27.665 36.1275C27.4325 36.165 27.2 36.195 26.96 36.21C26.7275 36.2325 26.4875 36.2475 26.2475 36.2625C26.21 36.27 26.165 36.27 26.1275 36.27C25.535 36.2925 24.965 36.3 24.4175 36.3C23.9675 36.3 23.525 36.285 23.105 36.2625C22.745 36.2475 22.3925 36.225 22.055 36.195C21.7925 36.1725 21.5375 36.15 21.29 36.12C21.08 36.0975 20.8775 36.0675 20.675 36.0375C20.495 36.015 20.315 35.985 20.1425 35.955C19.73 35.88 19.3325 35.7975 18.9575 35.7075C18.785 35.6625 18.6125 35.6175 18.44 35.565C18.3275 35.535 18.2225 35.505 18.1175 35.475C17.9075 35.4075 17.705 35.34 17.51 35.265C17.15 35.13 16.8125 34.9875 16.4975 34.8375C16.385 34.7775 16.2725 34.725 16.1675 34.665C15.5675 34.3425 15.035 33.9675 14.57 33.5475C14.48 33.4725 14.3975 33.3975 14.3225 33.315C14.2175 33.2175 14.12 33.1125 14.0225 33.0075C12.2375 31.02 11.645 28.1175 12.2075 24.1275C12.2525 23.7975 12.305 23.475 12.35 23.1675C12.3575 23.1 12.3725 23.0325 12.38 22.965C13.0775 18.45 13.7525 16.2825 14.135 15.33C14.7575 16.5825 16.04 18.795 17.345 18.795C17.3675 18.795 17.39 18.795 17.4125 18.795C18.095 18.7575 18.6275 18.1425 18.995 16.9725C19.04 16.8375 19.0775 16.7025 19.115 16.575C19.5575 15 19.7 13.59 19.835 12.2175C19.865 11.9325 19.895 11.655 19.925 11.3775V11.355C20.1425 9.4275 20.4575 7.6575 21.7775 5.6475C22.115 7.245 22.985 10.5375 24.7475 11.745C25.3175 12.1275 25.97 12.465 26.6675 12.8175C28.7375 13.8675 30.875 14.955 31.4825 17.715C31.82 19.2525 32.2325 19.95 32.825 19.98C33.3275 20.025 33.6575 19.5375 33.8825 19.1175C34.1975 19.575 34.625 20.3475 35.0075 21.0525C35.1875 21.3675 35.3675 21.69 35.5475 22.0125C36.0425 22.8975 36.44 25.7775 35.6975 28.7325V28.725Z" />
        </mask>
        <path
          d="M36.2 21.6375C36.02 21.3225 35.84 21 35.6675 20.685C34.8875 19.2675 34.3925 18.39 33.9725 18.105L33.5675 17.8275L33.41 18.3C33.2675 18.7275 32.99 19.1925 32.87 19.23C32.87 19.2225 32.555 19.095 32.2175 17.55C31.535 14.4375 29.1275 13.215 27.005 12.1425C26.3375 11.7975 25.7 11.475 25.1675 11.115C23.1275 9.72 22.37 4.6875 22.3625 4.635L22.2275 3.75L21.6875 4.47C19.58 7.26 19.34 9.63 19.0925 12.135C18.95 13.5825 18.8 15.075 18.2825 16.74C18.02 17.5575 17.6975 18.0225 17.3675 18.045H17.3375C16.4975 18.045 15.1625 15.87 14.48 14.31L14.225 13.7175L13.835 14.235C13.79 14.3025 12.62 15.9375 11.465 24.0225C10.865 28.245 11.5175 31.35 13.4675 33.51C15.1175 35.34 17.6675 36.45 21.2 36.8625C21.8075 36.9375 22.4375 36.99 23.105 37.0125C23.5325 37.035 23.9675 37.05 24.4175 37.05H24.62C25.115 37.05 25.625 37.0425 26.15 37.02C26.2175 37.02 26.285 37.0125 26.345 37.005C30.425 36.8025 33.5075 35.0325 35.27 31.8825C37.43 28.005 37.0175 23.085 36.2 21.6375ZM35.6975 28.725C35.465 29.67 35.1125 30.615 34.61 31.515C33.77 33.0225 32.6375 34.17 31.22 34.965C31.0475 35.0625 30.8675 35.16 30.68 35.2425C30.1475 35.4975 29.57 35.7075 28.9625 35.865C28.7525 35.925 28.535 35.97 28.3175 36.015C28.1075 36.06 27.8825 36.0975 27.665 36.1275C27.4325 36.165 27.2 36.195 26.96 36.21C26.7275 36.2325 26.4875 36.2475 26.2475 36.2625C26.21 36.27 26.165 36.27 26.1275 36.27C25.535 36.2925 24.965 36.3 24.4175 36.3C23.9675 36.3 23.525 36.285 23.105 36.2625C22.745 36.2475 22.3925 36.225 22.055 36.195C21.7925 36.1725 21.5375 36.15 21.29 36.12C21.08 36.0975 20.8775 36.0675 20.675 36.0375C20.495 36.015 20.315 35.985 20.1425 35.955C19.73 35.88 19.3325 35.7975 18.9575 35.7075C18.785 35.6625 18.6125 35.6175 18.44 35.565C18.3275 35.535 18.2225 35.505 18.1175 35.475C17.9075 35.4075 17.705 35.34 17.51 35.265C17.15 35.13 16.8125 34.9875 16.4975 34.8375C16.385 34.7775 16.2725 34.725 16.1675 34.665C15.5675 34.3425 15.035 33.9675 14.57 33.5475C14.48 33.4725 14.3975 33.3975 14.3225 33.315C14.2175 33.2175 14.12 33.1125 14.0225 33.0075C12.2375 31.02 11.645 28.1175 12.2075 24.1275C12.2525 23.7975 12.305 23.475 12.35 23.1675C12.3575 23.1 12.3725 23.0325 12.38 22.965C13.0775 18.45 13.7525 16.2825 14.135 15.33C14.7575 16.5825 16.04 18.795 17.345 18.795C17.3675 18.795 17.39 18.795 17.4125 18.795C18.095 18.7575 18.6275 18.1425 18.995 16.9725C19.04 16.8375 19.0775 16.7025 19.115 16.575C19.5575 15 19.7 13.59 19.835 12.2175C19.865 11.9325 19.895 11.655 19.925 11.3775V11.355C20.1425 9.4275 20.4575 7.6575 21.7775 5.6475C22.115 7.245 22.985 10.5375 24.7475 11.745C25.3175 12.1275 25.97 12.465 26.6675 12.8175C28.7375 13.8675 30.875 14.955 31.4825 17.715C31.82 19.2525 32.2325 19.95 32.825 19.98C33.3275 20.025 33.6575 19.5375 33.8825 19.1175C34.1975 19.575 34.625 20.3475 35.0075 21.0525C35.1875 21.3675 35.3675 21.69 35.5475 22.0125C36.0425 22.8975 36.44 25.7775 35.6975 28.7325V28.725Z"
          fill="#E4E7EC"
        />
        <path
          d="M36.2 21.6375C36.02 21.3225 35.84 21 35.6675 20.685C34.8875 19.2675 34.3925 18.39 33.9725 18.105L33.5675 17.8275L33.41 18.3C33.2675 18.7275 32.99 19.1925 32.87 19.23C32.87 19.2225 32.555 19.095 32.2175 17.55C31.535 14.4375 29.1275 13.215 27.005 12.1425C26.3375 11.7975 25.7 11.475 25.1675 11.115C23.1275 9.72 22.37 4.6875 22.3625 4.635L22.2275 3.75L21.6875 4.47C19.58 7.26 19.34 9.63 19.0925 12.135C18.95 13.5825 18.8 15.075 18.2825 16.74C18.02 17.5575 17.6975 18.0225 17.3675 18.045H17.3375C16.4975 18.045 15.1625 15.87 14.48 14.31L14.225 13.7175L13.835 14.235C13.79 14.3025 12.62 15.9375 11.465 24.0225C10.865 28.245 11.5175 31.35 13.4675 33.51C15.1175 35.34 17.6675 36.45 21.2 36.8625C21.8075 36.9375 22.4375 36.99 23.105 37.0125C23.5325 37.035 23.9675 37.05 24.4175 37.05H24.62C25.115 37.05 25.625 37.0425 26.15 37.02C26.2175 37.02 26.285 37.0125 26.345 37.005C30.425 36.8025 33.5075 35.0325 35.27 31.8825C37.43 28.005 37.0175 23.085 36.2 21.6375ZM35.6975 28.725C35.465 29.67 35.1125 30.615 34.61 31.515C33.77 33.0225 32.6375 34.17 31.22 34.965C31.0475 35.0625 30.8675 35.16 30.68 35.2425C30.1475 35.4975 29.57 35.7075 28.9625 35.865C28.7525 35.925 28.535 35.97 28.3175 36.015C28.1075 36.06 27.8825 36.0975 27.665 36.1275C27.4325 36.165 27.2 36.195 26.96 36.21C26.7275 36.2325 26.4875 36.2475 26.2475 36.2625C26.21 36.27 26.165 36.27 26.1275 36.27C25.535 36.2925 24.965 36.3 24.4175 36.3C23.9675 36.3 23.525 36.285 23.105 36.2625C22.745 36.2475 22.3925 36.225 22.055 36.195C21.7925 36.1725 21.5375 36.15 21.29 36.12C21.08 36.0975 20.8775 36.0675 20.675 36.0375C20.495 36.015 20.315 35.985 20.1425 35.955C19.73 35.88 19.3325 35.7975 18.9575 35.7075C18.785 35.6625 18.6125 35.6175 18.44 35.565C18.3275 35.535 18.2225 35.505 18.1175 35.475C17.9075 35.4075 17.705 35.34 17.51 35.265C17.15 35.13 16.8125 34.9875 16.4975 34.8375C16.385 34.7775 16.2725 34.725 16.1675 34.665C15.5675 34.3425 15.035 33.9675 14.57 33.5475C14.48 33.4725 14.3975 33.3975 14.3225 33.315C14.2175 33.2175 14.12 33.1125 14.0225 33.0075C12.2375 31.02 11.645 28.1175 12.2075 24.1275C12.2525 23.7975 12.305 23.475 12.35 23.1675C12.3575 23.1 12.3725 23.0325 12.38 22.965C13.0775 18.45 13.7525 16.2825 14.135 15.33C14.7575 16.5825 16.04 18.795 17.345 18.795C17.3675 18.795 17.39 18.795 17.4125 18.795C18.095 18.7575 18.6275 18.1425 18.995 16.9725C19.04 16.8375 19.0775 16.7025 19.115 16.575C19.5575 15 19.7 13.59 19.835 12.2175C19.865 11.9325 19.895 11.655 19.925 11.3775V11.355C20.1425 9.4275 20.4575 7.6575 21.7775 5.6475C22.115 7.245 22.985 10.5375 24.7475 11.745C25.3175 12.1275 25.97 12.465 26.6675 12.8175C28.7375 13.8675 30.875 14.955 31.4825 17.715C31.82 19.2525 32.2325 19.95 32.825 19.98C33.3275 20.025 33.6575 19.5375 33.8825 19.1175C34.1975 19.575 34.625 20.3475 35.0075 21.0525C35.1875 21.3675 35.3675 21.69 35.5475 22.0125C36.0425 22.8975 36.44 25.7775 35.6975 28.7325V28.725Z"
          stroke="#E4E7EC"
          stroke-width="0.4"
          mask="url(#path-6-outside-4_892_1160)"
        />
      </svg>
    </div>
  );
}
