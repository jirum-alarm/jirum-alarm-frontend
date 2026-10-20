import {
  INTEREST_CATEGORIES,
  type InterestCategoryId,
  MAX_INTEREST_CATEGORIES,
} from '@jirum/domain/categories';

import { CategoryIcons } from '@/shared/ui/common/icons';

// id·이름·순서·이모지는 정본 @jirum/domain/categories(앱 관심 카테고리와 같은 표). 여기는 web 아이콘만 붙인다.
const ICONS: Record<
  InterestCategoryId,
  {
    on: (typeof CategoryIcons)[keyof typeof CategoryIcons];
    off: (typeof CategoryIcons)[keyof typeof CategoryIcons];
  }
> = {
  1: { on: CategoryIcons.ComputerOn, off: CategoryIcons.ComputerOff },
  2: { on: CategoryIcons.CartOn, off: CategoryIcons.CartOff },
  3: { on: CategoryIcons.CosmeticsOn, off: CategoryIcons.CosmeticsOff },
  5: { on: CategoryIcons.BookOn, off: CategoryIcons.BookOff },
  6: { on: CategoryIcons.ElectricOn, off: CategoryIcons.ElectricOff },
  7: { on: CategoryIcons.LeisureOn, off: CategoryIcons.LeisureOff },
  9: { on: CategoryIcons.GameOn, off: CategoryIcons.GameOff },
  10: { on: CategoryIcons.BabyOn, off: CategoryIcons.BabyOff },
  8: { on: CategoryIcons.GiftcardOn, off: CategoryIcons.GiftcardOff },
  4: { on: CategoryIcons.FashionOn, off: CategoryIcons.FashionOff },
  12: { on: CategoryIcons.PetOn, off: CategoryIcons.PetOff },
  11: { on: CategoryIcons.EtcOn, off: CategoryIcons.EtcOff },
};

export const CATEGORIES = INTEREST_CATEGORIES.map((c) => ({
  icon: c.emoji,
  text: c.text,
  value: c.value,
  iconComponent: ICONS[c.value].on,
  offIconComponent: ICONS[c.value].off,
}));

export const CATEGORY_MAP = CATEGORIES.reduce(
  (acc, category) => {
    acc[category.value] = category;
    return acc;
  },
  {} as Record<string, (typeof CATEGORIES)[number]>,
);

export const MAX_SELECTION_COUNT = MAX_INTEREST_CATEGORIES;
