'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { CATEGORIES, MAX_SELECTION_COUNT } from '@/shared/config/categories';
import { shallowArrayEqual } from '@/shared/lib/utils/object';

import { AuthQueries } from '@/entities/auth';
import { type ICategoryForm } from '@/entities/category/model/types';

import { useUpdateCategory } from './update-category';

const FAVORITE_CATEGORIES = CATEGORIES.map((category) => ({
  ...category,
  isChecked: false,
}));

const toCategoryForm = (favoriteCategories: readonly (number | string)[]): ICategoryForm[] =>
  FAVORITE_CATEGORIES.map((category) => ({
    ...category,
    isChecked: favoriteCategories.some(
      (categoryNumber) => Number(categoryNumber) === category.value,
    ),
  }));

export const useCategoriesFormViewModel = () => {
  const {
    data: { me },
  } = useSuspenseQuery(AuthQueries.me());

  const { mutate: updateProfile } = useUpdateCategory();

  // 서버 값(me.favoriteCategories)이 바뀌면 폼을 그 값으로 다시 맞춘다 — effect 대신 렌더 중 비교로.
  const favoriteCategories = me?.favoriteCategories;
  const [syncedFavorites, setSyncedFavorites] = useState(favoriteCategories);
  const [categories, setCategories] = useState<ICategoryForm[]>(() =>
    favoriteCategories ? toCategoryForm(favoriteCategories) : FAVORITE_CATEGORIES,
  );
  const [originalCategory, setOriginalCategory] = useState<ICategoryForm[]>(() =>
    favoriteCategories ? toCategoryForm(favoriteCategories) : FAVORITE_CATEGORIES,
  );
  if (favoriteCategories !== syncedFavorites) {
    setSyncedFavorites(favoriteCategories);
    if (favoriteCategories) {
      const next = toCategoryForm(favoriteCategories);
      setCategories(next);
      setOriginalCategory(next);
    }
  }

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
