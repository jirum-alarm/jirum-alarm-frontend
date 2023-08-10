import NavBar from '../components/Navbar'
import ProductList from '../components/ProductList'

export default async function Home() {
  return (
    <>
      <NavBar></NavBar>
      <main>
        <div className="font-mono max-w-screen-lg mx-auto">
          <div className="px-4">
            <ProductList />
          </div>
        </div>
      </main>
    </>
  )
}
