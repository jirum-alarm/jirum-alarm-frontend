import { execute } from '@/shared/lib/http-client';

import { graphql } from '../gql';
import {
  CreateProductImageUploadUrlMutationVariables,
  CreateUserProductMutationVariables,
} from '../gql/graphql';

const MutationCreateUserProduct = graphql(`
  mutation CreateUserProduct(
    $title: String!
    $url: String!
    $categoryId: Int!
    $price: String
    $thumbnail: String
    $content: String
  ) {
    createUserProduct(
      title: $title
      url: $url
      categoryId: $categoryId
      price: $price
      thumbnail: $thumbnail
      content: $content
    )
  }
`);

const MutationCreateProductImageUploadUrl = graphql(`
  mutation CreateProductImageUploadUrl($contentType: String!) {
    createProductImageUploadUrl(contentType: $contentType) {
      uploadUrl
      imageUrl
    }
  }
`);

export const UserProductService = {
  async createUserProduct(variables: CreateUserProductMutationVariables) {
    return execute(MutationCreateUserProduct, variables).then((res) => res.data.createUserProduct);
  },

  /**
   * 상품 썸네일 이미지를 업로드한다.
   * 1) 서버에서 presigned PUT URL 발급 → 2) S3 에 파일 직접 PUT → 3) CDN imageUrl 반환.
   */
  async uploadProductImage(file: File): Promise<string> {
    const variables: CreateProductImageUploadUrlMutationVariables = { contentType: file.type };
    const { uploadUrl, imageUrl } = await execute(
      MutationCreateProductImageUploadUrl,
      variables,
    ).then((res) => res.data.createProductImageUploadUrl);

    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    });
    if (!uploadRes.ok) {
      throw new Error('이미지 업로드에 실패했어요.');
    }
    return imageUrl;
  },
};
