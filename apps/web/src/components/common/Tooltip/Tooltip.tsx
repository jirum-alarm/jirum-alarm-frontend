const Tooltip = () => {
  return (
    <div className="fixed left-0 top-0 z-50" style={{ transform: `translate(${100}px,${100}px)` }}>
      <div className="rounded-lg bg-gray-300 px-[16px] py-[10px]">
        <p className="text-s">
          다나와 최저가와 역대 최저가를 비교하여
          <br /> 현재 핫딜 정도를 계산해 볼 수 있어요
        </p>
      </div>
      <span className="absolute -top-[8px] left-5 text-gray-300">
        <svg
          width="10"
          height="8"
          viewBox="0 0 10 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M5 0L10 8H0L5 0Z" fill="currentColor" />
        </svg>
      </span>
    </div>
  );
};

export default Tooltip;
