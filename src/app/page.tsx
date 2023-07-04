import Head from "next/head";
import { PiBellSimpleBold } from "react-icons/pi";
import ProductList from "../components/product_list";

export default async function Home() {
  return (
    <main>
      <Head>
        <meta
          name="viewport"
          content="initial-scale=1.0,user-scalable=no,maximum-scale=1,width=device-width"
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

          <ProductList />
        </div>
      </div>
    </main>
  );
}
