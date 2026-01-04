import { Gender } from '@/shared/api/gql/graphql';

import { type ICategoryForm } from '@/entities/category';

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

const CONSENT_REQUIRED = {
  termsOfService: '[필수] 서비스 이용약관 동의',
  privacyPolicy: '[필수] 개인정보 처리방침 동의',
} as const;

export type ConsentRequiredKey = keyof typeof CONSENT_REQUIRED;
