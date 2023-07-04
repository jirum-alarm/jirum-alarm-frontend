import { PiBellSimpleBold } from "react-icons/pi";
import ProductList from "../components/product_list";

export default async function Home() {
  return (
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
  );
}
