import { useEffect, useState } from 'react';
import { CATEGORIES, MAX_SELECTION_COUNT } from '@/constants/categories';
import { MutationUpdateUserProfile, QueryMe } from '@/graphql/auth';
import { useQuery } from '@apollo/experimental-nextjs-app-support/ssr';
import { useToast } from '@/components/common/Toast';
import useGoBack from '@/hooks/useGoBack';
import { useMutation } from '@apollo/client';
import { type User } from '@/types/user';
import { type ICategoryForm } from '@/features/categories/types';
import { shallowArrayEqual } from '@/util/object';

const FAVORITE_CATEGORIES = CATEGORIES.map((category) => ({ ...category, isChecked: false }));

export const useCategoriesFormViewModel = () => {
  const { data } = useQuery<{ me: Pick<User, 'favoriteCategories'> }>(QueryMe);
  const { toast } = useToast();
  const goBack = useGoBack();
  const [updateProfile] = useMutation<
    { updateUserProfile: boolean },
    { favoriteCategories: number[] }
  >(MutationUpdateUserProfile, {
    refetchQueries: [{ query: QueryMe }],
    onCompleted: () => {
      toast('관심 카테고리가 저장됐어요.');
      goBack();
    },
    onError: () => {
      toast('관심 카테고리 저장중 에러가 발생했어요.');
    },
  });

  const [categories, setCategories] = useState<ICategoryForm[]>(FAVORITE_CATEGORIES);
  const [originalCategory, setOriginalCategory] = useState<ICategoryForm[]>(FAVORITE_CATEGORIES);

  useEffect(() => {
    const favoriteCategories = data?.me.favoriteCategories;
    if (!favoriteCategories) return;

    const _FAVORITE_CATEGORIES = FAVORITE_CATEGORIES.map((category) => ({
      ...category,
      isChecked:
        !!favoriteCategories &&
        favoriteCategories.some((categoryNumber) => Number(categoryNumber) === category.value),
    }));
    setCategories(_FAVORITE_CATEGORIES);
    setOriginalCategory(_FAVORITE_CATEGORIES);
  }, [data?.me.favoriteCategories]);

  const SELECTION_COUNT = categories.filter((category) => category.isChecked).length;

  const isMaxSelection = () => MAX_SELECTION_COUNT > SELECTION_COUNT;

  const canSubmit = () => {
    return !shallowArrayEqual(originalCategory, categories);
  };

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

  return { handleSubmit, handleCheckChange, categories, canSubmit, SELECTION_COUNT };
};
