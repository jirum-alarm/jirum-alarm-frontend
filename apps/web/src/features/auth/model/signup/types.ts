import { type ICategoryForm } from '@/entities/category';
import { Gender } from '@/shared/api/gql/graphql';

export interface Input {
  value: string;
  error: boolean;
  focus: boolean;
}

export interface PersonalFormValues {
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
  personal: PersonalFormValues;
}
