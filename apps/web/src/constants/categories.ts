import { CategoryIcons } from '@/components/common/icons';

export const CATEGORIES = [
  {
    icon: '💻',
    text: '컴퓨터',
    value: 1,
    iconComponent: CategoryIcons.ComputerOn,
    offIconComponent: CategoryIcons.ComputerOff,
  },
  {
    icon: '🛒',
    text: '생활/식품',
    value: 2,
    iconComponent: CategoryIcons.CartOn,
    offIconComponent: CategoryIcons.CartOff,
  },
  {
    icon: '💄',
    text: '화장품',
    value: 3,
    iconComponent: CategoryIcons.CosmeticsOn,
    offIconComponent: CategoryIcons.CosmeticsOff,
  },
  {
    icon: '📗',
    text: '도서',
    value: 5,
    iconComponent: CategoryIcons.BookOn,
    offIconComponent: CategoryIcons.BookOff,
  },
  {
    icon: '🛏',
    text: '가전/가구',
    value: 6,
    iconComponent: CategoryIcons.ElectricOn,
    offIconComponent: CategoryIcons.ElectricOff,
  },
  {
    icon: '🧗‍♀️',
    text: '등산/레저',
    value: 7,
    iconComponent: CategoryIcons.LeisureOn,
    offIconComponent: CategoryIcons.LeisureOff,
  },
  {
    icon: '🎮',
    text: '디지털',
    value: 9,
    iconComponent: CategoryIcons.GameOn,
    offIconComponent: CategoryIcons.GameOff,
  },
  {
    icon: '🍼',
    text: '육아',
    value: 10,
    iconComponent: CategoryIcons.BabyOn,
    offIconComponent: CategoryIcons.BabyOff,
  },
  {
    icon: '💸',
    text: '상품권',
    value: 8,
    iconComponent: CategoryIcons.GiftcardOn,
    offIconComponent: CategoryIcons.GiftcardOff,
  },
  {
    icon: '👕',
    text: '의류/잡화',
    value: 4,
    iconComponent: CategoryIcons.FashionOn,
    offIconComponent: CategoryIcons.FashionOff,
  },
  {
    icon: '🔍',
    text: '기타',
    value: 11,
    iconComponent: CategoryIcons.EtcOn,
    offIconComponent: CategoryIcons.EtcOff,
  },
] as const;

export const CATEGORY_MAP = CATEGORIES.reduce(
  (acc, category) => {
    acc[category.value] = category;
    return acc;
  },
  {} as Record<string, (typeof CATEGORIES)[number]>,
);

export const MAX_SELECTION_COUNT = 5;
