const IntroductionHeader = () => {
  return (
    <div className="sticky top-0 -mb-60 flex h-60 w-full flex-col items-center justify-between bg-gray-50 pb-7">
      <div className="pointer-events-none h-14 w-full bg-white lg:h-15" />
      <div className="flex flex-col items-center gap-y-2">
        <p className="font-bold text-gray-500">서비스 소개</p>
        <h2 className="text-[40px] font-bold">필요한 정보만! 핫딜 쇼핑이 쉬워져요</h2>
      </div>
    </div>
  );
};

export default IntroductionHeader;
