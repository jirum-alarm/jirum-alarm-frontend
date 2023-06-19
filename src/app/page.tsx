import { gql } from "@apollo/client";
import { getClient } from "../lib/client";

const query = gql`
  query {
    products(limit: 100) {
      id
      title
      url
    }
  }
`;

interface Response {
  products: { id: number; title: string; url: string }[];
}

export default async function Home() {
  const data = await getClient().query<Response>({
    query,
  });

  return (
    <main>
      <div className="min-w-min max-w-screen-md mx-auto">
        <div className="mt-10">
          <h1 className="text-center text-4xl font-medium">지름알림🔔</h1>
        </div>

        <div className="flex ">
          <div className="item-center grid grid-cols-2 sm:grid-cols-4 gap-4 m-10">
            {data.data.products.map((product) => (
              <div key={product.id} className="border border-black h-full py-2">
                <a href={product.url} target="_blank">
                  <h3 className="h-full">{product.title}</h3>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
