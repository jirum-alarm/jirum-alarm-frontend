'use client';
import { SwiperSlide, Swiper } from 'swiper/react';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import 'swiper/css';
import Image from 'next/image';

const JirumRankingSlider = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between px-4 pb-5 pt-2">
        <h2 className="text-lg font-semibold text-gray-900">지름알림 랭킹</h2>
        <span className="text-sm text-gray-500">더보기</span>
      </div>
      <div>
        <Swiper
          centeredSlides={true}
          slidesPerView={1.5577}
          loop={true}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          initialSlide={0}
          onInit={(swiper) => {
            setTimeout(() => {
              /**
               * NOTE:
               * 이 설정이 없으면 초기 렌더링 때
               * 요소가 3 1 2 가 아니라 3 1 만 화면에 보임
               */
              swiper.slideToLoop(0, 0, false);
            }, 0);
          }}
        >
          {data.map((item, i) => (
            <SwiperSlide key={item.id} className="pb-2">
              <div
                className={cn(
                  `h-[340px] origin-center overflow-hidden rounded-lg bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] transition-all`,
                  {
                    'scale-100': activeIndex === i,
                    'scale-90': activeIndex !== i,
                  },
                )}
              >
                <div className="relative h-[240px] w-full">
                  <div className="absolute left-0 top-0 z-10 flex h-[26px] w-[26px] items-center justify-center rounded-br-lg bg-gray-900 text-sm text-primary-500">
                    {i + 1}
                  </div>
                  <Image fill className="object-cover" src={item.imageSrc} alt="임시" />
                </div>
                <div className="p-3 pb-0">
                  <div className="line-clamp-2 text-sm text-gray-700">{item.text}</div>
                  <div className="pt-2 text-lg font-semibold text-gray-900">{`${item.price}원`}</div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="mt-3 flex h-[20px] w-full items-center justify-center">
          {Array.from({ length: data.length }).map((_, i) => (
            <div
              key={i}
              className={cn(`h-[3px] w-[3px] bg-gray-400`, {
                'ml-[6px] mr-[6px] h-[4px] w-[4px] bg-gray-600': activeIndex === i,
              })}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default JirumRankingSlider;

const data = [
  {
    id: 1,
    text: '일동 아이키즈 더키움 츄어블 2개월 일동 아이키즈 더키움 츄어블 2개월 일동 아이키즈 더키움 츄어블 2개월',
    price: '28,000',
    imageSrc: 'https://file.jirum-alarm.com/ppomppu/557852.jpg',
  },
  {
    id: 2,
    text: '일동 아이키즈 더키움 츄어블 2개월',
    price: '28,000',
    imageSrc: 'https://file.jirum-alarm.com/ppomppu/557852.jpg',
  },
  {
    id: 3,
    text: '일동 아이키즈 더키움 츄어블 2개월',
    price: '28,000',
    imageSrc: 'https://file.jirum-alarm.com/ppomppu/557852.jpg',
  },
  {
    id: 4,
    text: '일동 아이키즈 더키움 츄어블 2개월',
    price: '28,000',
    imageSrc: 'https://file.jirum-alarm.com/ppomppu/557852.jpg',
  },
  {
    id: 5,
    text: '일동 아이키즈 더키움 츄어블 2개월',
    price: '28,000',
    imageSrc: 'https://file.jirum-alarm.com/ppomppu/557852.jpg',
  },
  {
    id: 6,
    text: '일동 아이키즈 더키움 츄어블 2개월',
    price: '28,000',
    imageSrc: 'https://file.jirum-alarm.com/ppomppu/557852.jpg',
  },
  {
    id: 7,
    text: '일동 아이키즈 더키움 츄어블 2개월',
    price: '28,000',
    imageSrc: 'https://file.jirum-alarm.com/ppomppu/557852.jpg',
  },
  {
    id: 8,
    text: '일동 아이키즈 더키움 츄어블 2개월',
    price: '28,000',
    imageSrc: 'https://file.jirum-alarm.com/ppomppu/557852.jpg',
  },
  {
    id: 9,
    text: '일동 아이키즈 더키움 츄어블 2개월',
    price: '28,000',
    imageSrc: 'https://file.jirum-alarm.com/ppomppu/557852.jpg',
  },
  {
    id: 10,
    text: '일동 아이키즈 더키움 츄어블 2개월',
    price: '28,000',
    imageSrc: 'https://file.jirum-alarm.com/ppomppu/557852.jpg',
  },
];
