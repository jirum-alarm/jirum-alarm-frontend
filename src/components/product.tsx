import { IProduct } from "../graphql/interface";

interface IProps {
  product: IProduct;
}

export default function Product(props: IProps) {
  const product = props.product;
  return (
    //   <div className="rounded-md border border-gray-300 shadow">
    //   <a href={product.url} target="_blank" rel="noopener noreferrer">
    //     <div className="flex bg-blue-300 px-5 py-3 justify-between">
    //       <h2 className="font-bold">{product.provider.nameKr}</h2>
    //       <h2>{product.category}</h2>
    //     </div>
    //     <div>
    //       <h3 className="px-5 my-2 flex content-center">{product.title}</h3>
    //     </div>
    //   </a>
    // </div>
    <div className="flex bg-white">
      <a
        href="#"
        className="w-[30rem] border-2 border-b-4 border-gray-200 rounded-xl hover:bg-gray-50"
      >
        <p className="bg-sky-500 w-fit px-4 py-1 text-sm font-bold text-white rounded-tl-lg rounded-br-xl">
          {product.provider.nameKr}
        </p>
        <div className="p-2">
          {/* <div>
              <img
                src="https://picsum.photos/seed/2/200/200"
                className="max-w-16 max-h-16 rounded-full"
              />
            </div> */}
          <div className="col-span-5 md:col-span-4 ml-4">
            <p className="text-sky-500 font-bold text-xs">{product.category}</p>

            <p className="text-gray-600 font-bold py-2">{product.title}</p>

            {/* <p className="text-gray-400"> Beginner speakers </p> */}
          </div>

          {/* <div className="flex col-start-2 ml-4 md:col-start-auto md:ml-0 md:justify-end">
            <p className="rounded-lg text-sky-500 font-bold bg-sky-100  py-1 px-3 text-sm w-fit h-fit">
              $ 5
            </p>
          </div> */}
        </div>
      </a>
    </div>
  );
}
