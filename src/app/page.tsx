import { gql } from "@apollo/client";
import { getClient } from "../lib/client";

const query = gql`
  query {
    products(limit: 10) {
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
    <main className="flex min-w-min max-w-screen-md mx-auto">
      <div className="item-center grid grid-cols-2 sm:grid-cols-4 gap-4 m-10">
        {data.data.products.map((product) => (
          <div key={product.id} className="border border-black">
            <div className="">
              <a href={product.url}>
                <h3>{product.title}</h3>
              </a>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
