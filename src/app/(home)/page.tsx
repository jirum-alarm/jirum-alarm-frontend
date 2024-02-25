import ProductList from '@/app/(home)/components/ProductList';
import NavBar from '@/components/Navbar';

export default async function Home() {
  return (
    <>
      <main>
        <div className="mx-auto max-w-screen-lg">
          <div className="px-5">
            <NavBar />
            <ProductList />
          </div>
        </div>
      </main>
    </>
  );
}
