import { gql } from "@apollo/client";
import { getClient } from "../../lib/client";

const query = gql`
  query {
    products(limit: 10) {
      id
      title
      mallId
      providerId
    }
  }
`;

interface Response {
  products: { id: number; title: string }[];
}

export default async function ServerSide() {
  const data = await getClient().query<Response>({
    query,
  });

  return (
    <main style={{ maxWidth: 1200, marginInline: "auto", padding: 20 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: 20,
        }}
      >
        {data.data.products.map((product) => (
          <div
            key={product.id}
            style={{ border: "1px solid #ccc", textAlign: "center" }}
          >
            <h3>{product.title}</h3>
          </div>
        ))}
      </div>
    </main>
  );
}
