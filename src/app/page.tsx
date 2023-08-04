import { GA_TRACKING_ID } from "../common/constant";
import { ComplexNavbar } from "../components/NavBar";
import ProductList from "../components/product_list";
import GoogleAnalytics from "./GoogleAnalitics";

export default async function Home() {
  return (
    <>
      <GoogleAnalytics GA_TRACKING_ID={GA_TRACKING_ID} />

      <main>
        <div className="font-mono max-w-screen-lg mx-auto">
          <div className="px-4">
            <ComplexNavbar></ComplexNavbar>
            <ProductList />
          </div>
        </div>
      </main>
    </>
  );
}
