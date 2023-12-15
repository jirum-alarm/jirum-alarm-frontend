import ProductList from '@/app/(home)/components/ProductList'
import NavBar from '@/components/Navbar'

export default async function Home() {
  return (
    <>
      <main>
        <div className="font-mono max-w-screen-lg mx-auto">
          <div className="px-4">
            <NavBar></NavBar>
            <ProductList />
          </div>
        </div>
      </main>
    </>
  )
}
