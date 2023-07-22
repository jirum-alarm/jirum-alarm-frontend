import { PiBellSimpleBold } from "react-icons/pi";
import { GA_TRACKING_ID } from "../common/constant";
import ProductList from "../components/product_list";
import GoogleAnalytics from "./googleAnalitics";

export default async function Home() {
  return (
    <>
      <GoogleAnalytics GA_TRACKING_ID={GA_TRACKING_ID} />
      <main>
        <div className="font-mono max-w-screen-lg mx-auto">
          <div className="px-4">
            <div className="p-8 flex justify-center">
              <div className="flex content-center ">
                <h1 className="text-center flex center text-4xl font-medium">
                  지름알림
                </h1>
                <PiBellSimpleBold className="ml-1 w-10 h-10 text-yellow-500" />
              </div>
            </div>

            <ProductList />
          </div>
        </div>
      </main>
    </>
  );
}
