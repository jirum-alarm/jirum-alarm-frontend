import { ICategoryForm } from '@/entities/category/model/types';

import { Gender } from '@/shared/api/gql/graphql';


interface Input {
  value: string;
  error: boolean;
  focus: boolean;
}

interface Personal {
  birthYear?: string | null;
  gender: Gender | null;
}

export interface Registration {
  email: Input;
  password: Input & { invalidType: boolean; invalidLength: boolean };
  termsOfService: boolean;
  privacyPolicy: boolean;
  nickname: Input;
  categories: ICategoryForm[];
  personal: Personal;
}
