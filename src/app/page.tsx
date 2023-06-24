import { gql } from "@apollo/client";
import Head from "next/head";
import { PiBellSimpleBold } from "react-icons/pi";
import { getClient } from "../lib/client";

const query = gql`
  query {
    products(limit: 100) {
      id
      title
      url
      category
      provider {
        nameKr
      }
    }
  }
`;

interface Response {
  products: {
    id: number;
    title: string;
    url: string;
    category?: string;
    provider: { nameKr: string };
  }[];
}

export const revalidate = 60 * 5;

async function getProducts() {
  return getClient().query<Response>({ query });
}

export default async function Home() {
  const data = await getProducts();

  return (
    <main>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1 " />
      </Head>
      <div className="font-mono min-w-min max-w-screen-lg mx-auto ">
        <div className="p-10 flex justify-center ">
          <div className="flex content-center ">
            <h1 className="text-center flex center text-4xl font-medium">
              지름알림
            </h1>
            <PiBellSimpleBold className="ml-1 w-10 h-10 text-yellow-500" />
          </div>
        </div>

        <div className="flex ">
          <div className="item-center m-10 grid grid-cols-1 gap-14 sm:grid-cols-3 ">
            {data.data.products.map((product) => (
              <div
                key="{product.id}"
                className="h-full rounded-md border border-gray-300 shadow h-100"
              >
                <a href={product.url} target="_blank">
                  <div className="flex bg-blue-300 mb-5 px-5 py-3 justify-between">
                    <h2 className="font-bold">{product.provider.nameKr}</h2>
                    <h2>{product.category}</h2>
                  </div>
                  <div>
                    <h3 className="h-full px-5 my-8 flex content-center">
                      {product.title}
                    </h3>
                  </div>
                </a>
                {/* <div className="bg-blue-300">hello</div> */}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
