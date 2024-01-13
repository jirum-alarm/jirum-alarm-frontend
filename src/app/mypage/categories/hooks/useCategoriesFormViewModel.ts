import { useEffect, useState } from 'react';
import { CATEGORIES, MAX_SELECTION_COUNT } from '@/constants/categories';
import { MutationUpdateUserProfile, QueryMe } from '@/graphql/auth';
import { useQuery } from '@apollo/experimental-nextjs-app-support/ssr';
import { useToast } from '@/components/common/Toast';
import useGoBack from '@/hooks/useGoBack';
import { useMutation } from '@apollo/client';
import { type User } from '@/types/user';
import { type ICategoryForm } from '@/features/categories/types';

export const useCategoriesFormViewModel = () => {
  const { data } = useQuery<{ me: Pick<User, 'favoriteCategories'> }>(QueryMe);
  const { showToast } = useToast();
  const goBack = useGoBack();
  const [updateProfile] = useMutation<
    { updateUserProfile: boolean },
    { favoriteCategories: number[] }
  >(MutationUpdateUserProfile, {
    onCompleted: () => {
      // showToast('관심 카테고리가 저장됐어요')
      goBack();
    },
    onError: () => {
      // showToast('관심 카테고리 저장중 에러가 발생했어요')
    },
  });

  const [categories, setCategories] = useState<ICategoryForm[]>(
    CATEGORIES.map((category) => ({ ...category, isChecked: false })),
  );

  useEffect(() => {
    const favoriteCategories = data?.me.favoriteCategories;
    if (!favoriteCategories) return;
    setCategories((prev) =>
      prev.map((category) => ({
        ...category,
        isChecked:
          !!favoriteCategories &&
          favoriteCategories.some((categoryNumber) => Number(categoryNumber) === category.value),
      })),
    );
  }, [data?.me.favoriteCategories]);

  const isMaxSelection = () =>
    MAX_SELECTION_COUNT >= categories.filter((category) => category.isChecked).length + 1;

  const canSubmit = categories.filter((category) => category.isChecked).length > 0;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateProfile({
      variables: {
        favoriteCategories: categories.reduce<number[]>((cur, acc) => {
          if (acc.isChecked) {
            cur.push(acc.value);
          }
          return cur;
        }, []),
      },
    });
  };

  const handleCheckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.currentTarget;
    if (checked && !isMaxSelection()) return;
    setCategories((prev) =>
      prev.map((category) => ({
        ...category,
        ...(category.value === Number(value)
          ? { isChecked: checked }
          : { isChecked: category.isChecked }),
      })),
    );
  };

  return { handleSubmit, handleCheckChange, categories, canSubmit };
};
