import NavBar from '../components/Navbar'
import ProductList from '../components/ProductList'

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
