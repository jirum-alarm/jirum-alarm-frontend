import { QueryProducts } from "../../graphql";
import { IProductOutput } from "../../interface";
import { getClient } from "../../lib/client";

export default async function ServerSide() {
  const data = await getClient().query<IProductOutput>({
    query: QueryProducts,
    variables: { limit: 100 },
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
