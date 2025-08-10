'use server';

import { ProductService } from '@shared/api/product';

export async function collectProductAction(productId: number) {
  await ProductService.collectProductServer({ productId });
}
