import Head from "next/head";
import { PiBellSimpleBold } from "react-icons/pi";
import { QueryProducts } from "../graphql";
import { IProductOutput } from "../interface";
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

        <div className="flex">
          <div className="item-center mx-5 grid grid-cols-1 gap-8 sm:grid-cols-2">
            {data.data.products.map((product) => (
              <div
                key="{product.id}"
                className="rounded-md border border-gray-300 shadow"
              >
                <a href={product.url} target="_blank">
                  <div className="flex bg-blue-300 px-5 py-3 justify-between">
                    <h2 className="font-bold">{product.provider.nameKr}</h2>
                    <h2>{product.category}</h2>
                  </div>
                  <div>
                    <h3 className="px-5 my-2 flex content-center">
                      {product.title}
                    </h3>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
