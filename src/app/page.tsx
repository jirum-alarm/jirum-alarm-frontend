import Head from "next/head";
import { PiBellSimpleBold } from "react-icons/pi";
import ProductList from "../components/product_list";
import { QueryProducts } from "../graphql";
import { IProductOutput } from "../graphql/interface";
import { getClient } from "../lib/client";

export const revalidate = 60 * 5;

async function getProducts() {
  return getClient().query<IProductOutput>({
    query: QueryProducts,
    variables: { limit: 100 },
  });
}

export default async function Home() {
  const data = await getProducts();

  return (
    <main>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1 " />
      </Head>
      <div className="font-mono min-w-min max-w-screen-lg mx-auto ">
        <div className="p-8 flex justify-center ">
          <div className="flex content-center ">
            <h1 className="text-center flex center text-4xl font-medium">
              지름알림
            </h1>
            <PiBellSimpleBold className="ml-1 w-10 h-10 text-yellow-500" />
          </div>
        </div>

        <ProductList />
      </div>
    </main>
  );
}
