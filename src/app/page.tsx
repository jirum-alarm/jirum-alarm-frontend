import Head from "next/head";
import { PiBellSimpleBold } from "react-icons/pi";
import ProductList from "../components/product_list";

export default async function Home() {
  return (
    <main>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </Head>
      <div className="font-mono max-w-screen-lg mx-auto">
        <div className="px-4">
          <div className="p-8 flex justify-center">
            <div className="flex content-center ">
              <h1 className="text-center flex center text-4xl font-medium">
                지름알림
              </h1>
              <PiBellSimpleBold className="ml-1 w-10 h-10 text-yellow-500" />
            </div>
          </div>

          <div className="max-w-md mx-auto">
            <div className="relative flex items-center w-full h-12 rounded-lg focus-within:shadow-lg bg-white overflow-hidden">
              <div className="grid place-items-center h-full w-12 text-gray-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              <input
                className="peer h-full w-full outline-none text-sm text-gray-700 pr-2"
                type="text"
                id="search"
                placeholder="Search something.."
              />
            </div>
          </div>
          <ProductList />
        </div>
      </div>
    </main>
  );
}
