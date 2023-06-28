import { IProduct } from "../interface";

interface IProps {
  product: IProduct;
}

export default function Product(props: IProps) {
  const product = props.product;
  return (
    <>
      {
        <div className="rounded-md border border-gray-300 shadow">
          <a href={product.url} target="_blank" rel="noopener noreferrer">
            <div className="flex bg-blue-300 px-5 py-3 justify-between">
              <h2 className="font-bold">{product.provider.nameKr}</h2>
              <h2>{product.category}</h2>
            </div>
            <div>
              <h3 className="px-5 my-2 flex content-center">{product.title}</h3>
            </div>
          </a>
        </div>
      }
    </>
  );
}
