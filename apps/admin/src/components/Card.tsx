import React from 'react';

const Card = ({
  children,
  title,
  disablePadding = false,
  className,
}: {
  children: React.ReactNode;
  title?: React.ReactNode;
  disablePadding?: boolean;
  className?: string;
}) => {
  return (
    <div className={`w-full overflow-hidden rounded-lg bg-white ${className}`}>
      {title}
      <div className={disablePadding ? 'p-0' : 'p-5'}>{children}</div>
    </div>
  );
};

export default Card;
