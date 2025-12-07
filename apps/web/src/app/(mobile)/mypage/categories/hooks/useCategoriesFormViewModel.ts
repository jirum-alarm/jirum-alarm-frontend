import { useSuspenseQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { CATEGORIES, MAX_SELECTION_COUNT } from '@shared/config/categories';
import { shallowArrayEqual } from '@shared/lib/utils/object';

import { AuthQueries } from '@entities/auth';
import { type ICategoryForm } from '@entities/category';

import { useUpdateCategory } from '@features/mypage/model/update-category';

const FAVORITE_CATEGORIES = CATEGORIES.map((category) => ({
  ...category,
  isChecked: false,
}));

export const useCategoriesFormViewModel = () => {
  const {
    data: { me },
  } = useSuspenseQuery(AuthQueries.me());

  const { mutate: updateProfile } = useUpdateCategory();

  const [categories, setCategories] = useState<ICategoryForm[]>(FAVORITE_CATEGORIES);
  const [originalCategory, setOriginalCategory] = useState<ICategoryForm[]>(FAVORITE_CATEGORIES);

  useEffect(() => {
    const favoriteCategories = me?.favoriteCategories;
    if (!favoriteCategories) return;

    const _FAVORITE_CATEGORIES = FAVORITE_CATEGORIES.map((category) => ({
      ...category,
      isChecked:
        !!favoriteCategories &&
        favoriteCategories.some((categoryNumber) => Number(categoryNumber) === category.value),
    }));
    setCategories(_FAVORITE_CATEGORIES);
    setOriginalCategory(_FAVORITE_CATEGORIES);
  }, [me?.favoriteCategories]);

  const SELECTION_COUNT = categories.filter((category) => category.isChecked).length;

  const isMaxSelection = () => MAX_SELECTION_COUNT > SELECTION_COUNT;

  const canSubmit = () => {
    return !shallowArrayEqual(originalCategory, categories);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateProfile({
      favoriteCategories: categories.reduce<number[]>((cur, acc) => {
        if (acc.isChecked) {
          cur.push(acc.value);
        }
        return cur;
      }, []),
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

  return {
    handleSubmit,
    handleCheckChange,
    categories,
    canSubmit,
    SELECTION_COUNT,
  };
};
