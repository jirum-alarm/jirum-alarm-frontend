import React from 'react';
import Lottie from 'lottie-react';
import loading from '../../../../public/looties/loading.json';

const ProductLoading = () => {
  return (
    <div className="w-full pt-[320px] flex justify-center align-center">
      <div>상품정보를 불러오는 중입니다.</div>
      {/* <Lottie animationData={loading} className="w-[80px]" /> */}
    </div>
  );
};

export default ProductLoading;
