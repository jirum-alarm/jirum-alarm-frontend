import ProductList from '@/app/(home)/components/ProductList';
import NavBar from '@/components/Navbar';
import AddFCMToken from './components/AddFCMToken';

export default function Home() {
  return (
    <>
      <AddFCMToken />
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
