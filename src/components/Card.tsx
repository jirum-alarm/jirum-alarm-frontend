import React from 'react';

const Card = ({
  children,
  title,
  disablePadding = false,
  bgColor = 'bg-white',
}: {
  children: React.ReactNode;
  title?: React.ReactNode;
  disablePadding?: boolean;
  bgColor?: string;
}) => {
  return (
    <div className={`w-full overflow-hidden rounded-lg ${bgColor}`}>
      {title}
      <div className={disablePadding ? 'p-0' : 'p-5'}>{children}</div>
    </div>
  );
};

export default Card;
