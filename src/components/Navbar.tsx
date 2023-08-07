import Link from "next/link";
import { PiBellSimpleBold } from "react-icons/pi";

export default function NavBar() {
  return (
    <>
      <div className="p-8">
        <div className="flex items-center justify-between">
          <div className="w-3/12"></div>
          <Link href="/">
            <h1 className="text-center flex center text-3xl">
              지름알림
              <PiBellSimpleBold className="w-8 h-8 text-yellow-500" />
            </h1>
          </Link>

          <div className="w-3/12 flex justify-end">
            <Link href="/login">
              <span className="font-semibold">로그인</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
