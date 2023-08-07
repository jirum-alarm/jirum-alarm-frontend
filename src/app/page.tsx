import ProductList from "../components/ProductList";

export default async function Home() {
  return (
    <>
      <main>
        <div className="px-4">
          <ProductList />
        </div>
      </main>
    </>
  );
}
