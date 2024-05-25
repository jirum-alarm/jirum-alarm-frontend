import React from 'react';

const Card = ({ children }: { children: React.ReactNode }) => {
  return <div className="rounded-lg bg-white p-5">{children}</div>;
};

export default Card;
