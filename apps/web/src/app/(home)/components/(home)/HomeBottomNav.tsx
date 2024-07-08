import { cn } from '@/lib/cn';

const HomeBottomNav = () => {
  return (
    <div
      className={cn(
        `pb-safe-bottom fixed bottom-0 mx-auto w-full max-w-screen-md border-t border-t-[#D0D5DD] bg-white transition-transform`,
      )}
    >
      <ul className="flex items-center justify-around">
        <li className="flex-1">
          <div className="flex h-20 flex-col items-center justify-center">
            <div className=" h-7 w-7  bg-gray-400"></div>
            <span className="text-xs">홈</span>
          </div>
        </li>
        <li className="flex-1">
          <div className="flex h-20 flex-col items-center justify-center">
            <div className=" h-7 w-7  bg-gray-400"></div>
            <span className="text-xs">인기</span>
          </div>
        </li>
        <li className="flex-1">
          <div className="flex h-20 flex-col items-center justify-center">
            <div className=" h-7 w-7  bg-gray-400"></div>
            <span className="text-xs">알림</span>
          </div>
        </li>
        <li className="flex-1">
          <div className="flex h-20 flex-col items-center justify-center">
            <div className=" h-7 w-7  bg-gray-400"></div>
            <span className="text-xs">내정보</span>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default HomeBottomNav;
