import React from 'react';

// 흰 카드 틀(테두리·그림자·다크모드)만 책임진다. 안쪽 여백·레이아웃은 화면마다 달라 className 으로 받는다.
// Card 와 따로 둔 이유: Card 는 테두리·그림자·다크모드 없이 안쪽 패딩 div 를 한 겹 더 두르고
// overflow-hidden 이라, 이 틀 자리에 넣으면 모양이 바뀌고 flex gap·드롭다운이 깨진다.
const Panel = ({
  children,
  rounded = 'lg',
  className = '',
}: {
  children: React.ReactNode;
  rounded?: 'sm' | 'lg';
  className?: string;
}) => (
  <div
    className={`${rounded === 'sm' ? 'rounded-xs' : 'rounded-lg'} border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark ${className}`}
  >
    {children}
  </div>
);

export default Panel;
