import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { LiaUserCircle } from "react-icons/lia";

export default async function Home() {
  return (
    <>
      <div className="min-h-screen flex flex-col justify-center md:pt-8">
        <div className="px-2 mx-auto md:w-full md:max-w-md">
          <div className="bg-white shadow w-full rounded-lg divide-y divide-gray-200">
            <div className="px-5 py-5">
              <h1 className="font-bold text-center text-2xl mb-4">로그인</h1>
              <label className="font-semibold text-sm text-gray-600 block">
                이메일
              </label>
              <input
                type="text"
                className="border rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full"
              />
              <label className="font-semibold text-sm text-gray-600 block">
                비밀번호
              </label>
              <input
                type="text"
                className="border rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full"
              />
              <button
                type="button"
                className="transition duration-200 bg-blue-500 hover:bg-blue-600 focus:bg-blue-700 focus:shadow-sm focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 text-white w-full py-2.5 rounded-lg text-sm shadow-sm hover:shadow-md font-semibold text-center inline-block"
              >
                <span className="inline-block">로그인</span>
              </button>
            </div>
            <div className="p-2">
              <div className="grid gap-2">
                <a href="https://jirum-api.kyojs.com/login/kakao">
                  <button
                    type="button"
                    className="h-12 transition duration-200 border border-gray-200 w-full py-2.5 rounded-lg text-sm shadow-sm hover:shadow-md font-semibold relative"
                  >
                    <svg
                      width="32"
                      height="32"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 64 64"
                      preserveAspectRatio="none"
                      className="absolute top-2 left-2"
                    >
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M29.85 0h4.3c7.517 0 12.376 1.202 16.598 3.46 4.221 2.258 7.534 5.57 9.792 9.792C62.798 17.474 64 22.332 64 29.85v4.3c0 7.517-1.202 12.376-3.46 16.598-2.258 4.221-5.57 7.534-9.792 9.792C46.526 62.798 41.668 64 34.15 64h-4.3c-7.517 0-12.376-1.202-16.598-3.46-4.221-2.258-7.534-5.57-9.792-9.792C1.202 46.526 0 41.668 0 34.15v-4.3c0-7.517 1.202-12.376 3.46-16.598 2.258-4.221 5.57-7.534 9.792-9.792C17.474 1.202 22.332 0 29.85 0z"
                        fill="#FFE900"
                      ></path>
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M32 15c-9.941 0-18 6.455-18 14.418 0 5.149 3.37 9.666 8.437 12.217-.276.966-1.772 6.214-1.831 6.627 0 0-.036.31.161.428.198.118.43.026.43.026.567-.08 6.567-4.363 7.606-5.106a22.45 22.45 0 003.197.227c9.941 0 18-6.456 18-14.419S41.941 15 32 15z"
                        fill="#000"
                      ></path>
                      <path
                        opacity=".1"
                        d="M29.85.5h4.3c7.458 0 12.23 1.192 16.362 3.4 4.134 2.212 7.376 5.454 9.587 9.588C62.31 17.62 63.5 22.392 63.5 29.85v4.3c0 7.458-1.192 12.23-3.4 16.362-2.212 4.134-5.454 7.376-9.588 9.587C46.38 62.31 41.608 63.5 34.15 63.5h-4.3c-7.458 0-12.23-1.192-16.362-3.4-4.134-2.212-7.376-5.454-9.587-9.588C1.69 46.38.5 41.608.5 34.15v-4.3c0-7.458 1.192-12.23 3.4-16.362 2.212-4.134 5.454-7.376 9.588-9.587C17.62 1.69 22.392.5 29.85.5z"
                        stroke="#EFEFEF"
                      ></path>
                    </svg>
                    카카오톡으로 로그인
                  </button>
                </a>
                <a href="https://jirum-api.kyojs.com/login/naver">
                  <button
                    type="button"
                    className="h-12 transition duration-200 border border-gray-200 w-full py-2.5 rounded-lg text-sm shadow-sm hover:shadow-md font-semibold relative"
                  >
                    <span>
                      <svg
                        width="32"
                        height="32"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 64 64"
                        preserveAspectRatio="none"
                        className="absolute top-2 left-2"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M29.85 0h4.3c7.517 0 12.376 1.202 16.598 3.46 4.221 2.258 7.534 5.57 9.792 9.792C62.798 17.474 64 22.332 64 29.85v4.3c0 7.517-1.202 12.376-3.46 16.598-2.258 4.221-5.57 7.534-9.792 9.792C46.526 62.798 41.668 64 34.15 64h-4.3c-7.517 0-12.376-1.202-16.598-3.46-4.221-2.258-7.534-5.57-9.792-9.792C1.202 46.526 0 41.668 0 34.15v-4.3c0-7.517 1.202-12.376 3.46-16.598 2.258-4.221 5.57-7.534 9.792-9.792C17.474 1.202 22.332 0 29.85 0z"
                          fill="#00B600"
                        ></path>
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M36.45 18v13.658L27.584 18H18v27.07h9.552V31.412l8.866 13.658H46V18h-9.55z"
                          fill="#fff"
                        ></path>
                      </svg>
                    </span>
                    네이버로 로그인
                  </button>
                </a>
                <a href="https://jirum-api.kyojs.com/login/google">
                  <button
                    type="button"
                    className="h-12 relative transition duration-200 border border-gray-200 w-full py-2.5 rounded-lg text-sm shadow-sm hover:shadow-md font-semibold text-center inline-block"
                  >
                    <FcGoogle className="absolute text-3xl top-2 left-2"></FcGoogle>
                    구글로 로그인
                  </button>
                </a>
              </div>
            </div>
            <div className="px-2 py-2">
              <div className="grid grid-cols-2 gap-1">
                <div className="text-center whitespace-nowrap">
                  <button className="transition duration-200 px-5 py-2 cursor-pointer font-normal text-sm rounded-lg text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-200 focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 ring-inset">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="w-4 h-4 inline-block align-text-top"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="inline-block ml-1">
                      비밀번호를 잊어버리셨나요?
                    </span>
                  </button>
                </div>
                <div className="text-center whitespace-nowrap">
                  <button className="transition duration-200 px-5 py-2 cursor-pointer font-normal text-sm rounded-lg text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-200 focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 ring-inset">
                    <LiaUserCircle className="w-4 h-4 inline-block align-text-top"></LiaUserCircle>
                    <span className="inline-block ml-1">회원가입</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="py-2">
            <div className="grid grid-cols-2 gap-1">
              <div className="text-center sm:text-left whitespace-nowrap">
                <button className="transition duration-200 px-5 py-4 cursor-pointer font-normal text-sm rounded-lg text-gray-500 hover:bg-gray-200 focus:outline-none focus:bg-gray-300 focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 ring-inset">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="w-4 h-4 inline-block align-text-top"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  <Link href="/">
                    <span className="inline-block ml-1">
                      지름알림으로 되돌아가기
                    </span>
                  </Link>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
