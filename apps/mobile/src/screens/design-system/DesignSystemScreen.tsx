import {catalog} from '@jirum/design-system/catalog';
import {cardThumb} from '@jirum/design-system/recipes';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';

import StackHeader from '@/features/mypage/ui/StackHeader';
import type {TabStackParamList} from '@/navigations/tab/types';
import {HotDealType} from '@/shared/api/gql/graphql';
import BottomSheet from '@/shared/components/BottomSheet';
import ConfirmSheet from '@/shared/components/ConfirmSheet';
import HotdealBadge from '@/shared/components/product/HotdealBadge';
import ProductCardStatus from '@/shared/components/product/ProductCardStatus';
import {SkeletonBox, ListRowsSkeleton} from '@/shared/components/Skeletons';
import Badge from '@/shared/components/ui/Badge';
import Button from '@/shared/components/ui/Button';
import Chip from '@/shared/components/ui/Chip';
import SectionHeader from '@/shared/components/ui/SectionHeader';
import Switch from '@/shared/components/ui/Switch';
import TabPill from '@/shared/components/ui/TabPill';
import {Text} from '@/shared/components/ui/Text/AppText';
import TextField from '@/shared/components/ui/Text/TextField';
import {tabStackNavigations} from '@/shared/constant/navigations';
import {showToast} from '@/shared/lib/feedback/toast';
import {
  COLOR_SCHEME_LABEL,
  type ColorSchemePreference,
  useColorSchemePreference,
} from '@/shared/theme/color-scheme-preference';

type Props = NativeStackScreenProps<
  TabStackParamList,
  typeof tabStackNavigations.DESIGN_SYSTEM
>;

/**
 * 앱 부품 놀이터 — RN 부품을 실기기·시뮬레이터에서 한 화면에 늘어놓고 눌러 본다.
 * web 부품은 놀이터 앱(apps/design, Storybook)에서, 앱 부품은 여기서 본다(RN 은 실제 기기에서 그려야 진짜 모양이다).
 *
 * 목록은 @jirum/design-system 카탈로그의 `app` 경로가 있는 부품 — 부품이 늘면 DEMOS 에 한 줄 더한다
 * (`__tests__/design-system-screen.test.ts` 가 빠진 데모를 막는다).
 * 들어가는 길: 딥링크 `jirumalarm://design-system`(운영 앱에서도 열림, 메뉴엔 없음) · 개발 빌드 내정보 메뉴.
 */
export default function DesignSystemScreen({navigation}: Props) {
  const [preference, changePreference] = useColorSchemePreference();
  const appParts = catalog.filter(e => e.app);

  return (
    <View className="flex-1 bg-white">
      <StackHeader title="디자인 시스템" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <View className="gap-y-2">
          <Text className="text-sm text-gray-500">
            앱 부품 {appParts.length}개 · 값은 packages/design-system 한 곳
          </Text>
          <View className="flex-row gap-x-2">
            {(['system', 'light', 'dark'] as ColorSchemePreference[]).map(p => (
              <TabPill
                key={p}
                label={COLOR_SCHEME_LABEL[p]}
                selected={preference === p}
                size="sm"
                onPress={() => changePreference(p)}
              />
            ))}
          </View>
        </View>

        {appParts.map(entry => {
          const Demo = DEMOS[entry.id];
          return (
            <View key={entry.id} className="gap-y-3">
              <View className="gap-y-1">
                <Text className="text-lg font-bold text-gray-900">
                  {entry.name}
                </Text>
                <Text className="text-sm text-gray-500">{entry.use}</Text>
              </View>
              {Demo ? (
                <Demo />
              ) : (
                <Text className="text-sm text-gray-500">데모 없음</Text>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const Row = ({children}: {children: React.ReactNode}) => (
  <View className="flex-row flex-wrap items-center gap-2">{children}</View>
);

function ButtonDemo() {
  const sizes = ['lg', 'md', 'sm'] as const;
  const colors = ['primary', 'secondary', 'error'] as const;
  return (
    <View className="gap-y-3">
      {sizes.map(size => (
        <Row key={size}>
          {colors.map(color => (
            <Button key={color} size={size} color={color}>
              {`${size} ${color}`}
            </Button>
          ))}
        </Row>
      ))}
      <Row>
        <Button size="md" variant="outlined">
          테두리
        </Button>
        <Button size="md" disabled>
          비활성
        </Button>
        <Button size="md" loading>
          불러오는 중
        </Button>
      </Row>
      <Button size="lg" disabled>
        lg 비활성
      </Button>
    </View>
  );
}

function ChipDemo() {
  const [picked, setPicked] = useState('전체');
  const sizes = ['md', 'sm', 'xs'] as const;
  return (
    <View className="gap-y-3">
      {sizes.map(size => (
        <Row key={size}>
          {['전체', '디지털', '식품'].map(label => (
            <Chip
              key={label}
              label={label}
              size={size}
              selected={picked === label}
              onPress={() => setPicked(label)}
            />
          ))}
        </Row>
      ))}
    </View>
  );
}

function TabDemo() {
  const [picked, setPicked] = useState(0);
  return (
    <View className="gap-y-3">
      {(['neutral', 'brand'] as const).map(variant => (
        <Row key={variant}>
          {['전체', '인기', '공지'].map((label, i) => (
            <TabPill
              key={label}
              label={label}
              variant={variant}
              selected={picked === i}
              onPress={() => setPicked(i)}
            />
          ))}
        </Row>
      ))}
    </View>
  );
}

function SwitchDemo() {
  const [on, setOn] = useState(true);
  return (
    <Row>
      <Switch value={on} onChange={setOn} accessibilityLabel="알림 켜기" />
      <Switch
        value={false}
        disabled
        onChange={() => {}}
        accessibilityLabel="비활성 스위치"
      />
      <Text className="text-sm text-gray-700">{on ? '켜짐' : '꺼짐'}</Text>
    </Row>
  );
}

function BadgeDemo() {
  const tones = ['gray', 'secondary', 'success', 'warning', 'error'] as const;
  const sizes = ['xs', 'sm', 'md'] as const;
  return (
    <View className="gap-y-2">
      {sizes.map(size => (
        <Row key={size}>
          {tones.map(tone => (
            <Badge key={tone} size={size} variant="soft" tone={tone}>
              {tone}
            </Badge>
          ))}
        </Row>
      ))}
      <Row>
        <Badge variant="solid" tone="secondary">
          NEW
        </Badge>
        <Badge variant="solid" tone="error">
          급상승
        </Badge>
        <Badge size="tag" variant="outline" tone="gray">
          판매종료
        </Badge>
        <Badge pill variant="soft" tone="success">
          역대 최저 · 9%↓
        </Badge>
        <Badge pill variant="soft" tone="warning">
          평소보다 비싸요
        </Badge>
      </Row>
    </View>
  );
}

const HOTDEAL_TYPES = [
  HotDealType.HotDeal,
  HotDealType.SuperDeal,
  HotDealType.UltraDeal,
];

function HotdealBadgeDemo() {
  return (
    <View className="gap-y-2">
      {(['page', 'card'] as const).map(v => (
        <Row key={v}>
          {HOTDEAL_TYPES.map(t => (
            <HotdealBadge key={t} hotdealType={t} badgeVariant={v} />
          ))}
        </Row>
      ))}
    </View>
  );
}

const Thumb = ({children}: {children: React.ReactNode}) => (
  <View className={`relative h-28 w-28 ${cardThumb}`}>{children}</View>
);

function CardStatusDemo() {
  return (
    <Row>
      <Thumb>
        <ProductCardStatus product={{hotDealType: HotDealType.SuperDeal}} />
      </Thumb>
      <Thumb>
        <ProductCardStatus product={{isEnd: true}} />
      </Thumb>
      <Thumb>
        <ProductCardStatus
          product={{earliestExpiryDate: '2026-12-31', isRising: true}}
        />
      </Thumb>
    </Row>
  );
}

function SectionHeaderDemo() {
  return (
    <View>
      <SectionHeader
        title="실시간 핫딜"
        onPressMore={() => showToast.info('더보기')}
      />
      <SectionHeader title="더보기 없는 섹션" />
    </View>
  );
}

function InputDemo() {
  const [value, setValue] = useState('');
  return (
    <View className="gap-y-3">
      <TextField
        placeholder="닉네임을 입력해주세요."
        value={value}
        onChangeText={setValue}
        helperText="공백없이 2~12자로 입력해주세요."
      />
      <TextField
        placeholder="이메일"
        value="useremail"
        error
        helperText="올바른 이메일 주소를 입력해주세요"
      />
    </View>
  );
}

function ToastDemo() {
  return (
    <Row>
      <Button
        size="sm"
        color="secondary"
        onPress={() => showToast.success('저장했어요')}>
        성공
      </Button>
      <Button
        size="sm"
        color="secondary"
        onPress={() => showToast.error('저장하지 못했어요')}>
        실패
      </Button>
      <Button
        size="sm"
        color="secondary"
        onPress={() => showToast.info('안내 문구예요')}>
        안내
      </Button>
      <Button
        size="sm"
        color="secondary"
        onPress={() =>
          showToast.success('키워드를 추가했어요', {
            action: {
              label: '보기',
              onPress: () => showToast.info('보기를 눌렀어요'),
            },
          })
        }>
        동작 버튼
      </Button>
    </Row>
  );
}

function ConfirmDemo() {
  const [open, setOpen] = useState<null | 'default' | 'danger'>(null);
  return (
    <Row>
      <Button size="sm" color="secondary" onPress={() => setOpen('default')}>
        확인 창
      </Button>
      <Button size="sm" color="error" onPress={() => setOpen('danger')}>
        위험 확인 창
      </Button>
      <ConfirmSheet
        visible={open !== null}
        tone={open === 'danger' ? 'danger' : 'default'}
        title={open === 'danger' ? '키워드를 지울까요?' : '로그아웃할까요?'}
        description="놀이터 예시예요. 아무 일도 일어나지 않아요."
        confirmLabel={open === 'danger' ? '지우기' : '로그아웃'}
        onCancel={() => setOpen(null)}
        onConfirm={() => setOpen(null)}
      />
    </Row>
  );
}

function SheetDemo() {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <Button size="sm" color="secondary" onPress={() => setOpen(true)}>
        바텀시트 열기
      </Button>
      <BottomSheet
        visible={open}
        onClose={() => setOpen(false)}
        accessibilityLabel="놀이터 바텀시트">
        <View className="gap-y-3 px-5 pb-6 pt-4">
          <Text className="text-lg font-bold text-gray-900">바텀시트</Text>
          <Text className="text-sm text-gray-500">
            겉(가림막·모서리·손잡이)만 공통, 안은 자리마다 채운다. 끌어내려 닫아
            보세요.
          </Text>
          <Button size="lg" onPress={() => setOpen(false)}>
            닫기
          </Button>
        </View>
      </BottomSheet>
    </View>
  );
}

function SkeletonDemo() {
  return (
    <View className="gap-y-3">
      <Row>
        <SkeletonBox className="h-28 w-28 rounded-lg" />
        <View className="flex-1 gap-y-2">
          <SkeletonBox className="h-4 w-full rounded" />
          <SkeletonBox className="h-4 w-2/3 rounded" />
        </View>
      </Row>
      <ListRowsSkeleton count={2} />
    </View>
  );
}

/** 카탈로그 id → 데모. 카탈로그에 app 부품이 생기면 여기에도 한 줄(테스트가 막는다). */
export const DEMOS: Record<string, React.ComponentType> = {
  button: ButtonDemo,
  chip: ChipDemo,
  tab: TabDemo,
  toggle: SwitchDemo,
  input: InputDemo,
  badge: BadgeDemo,
  hotdealBadge: HotdealBadgeDemo,
  cardLabel: CardStatusDemo,
  sectionTitle: SectionHeaderDemo,
  toast: ToastDemo,
  confirm: ConfirmDemo,
  sheet: SheetDemo,
  skeleton: SkeletonDemo,
};

// 조립 규칙(@jirum/design-system/layout): 좌우 gutter 20 · 섹션 사이 32.
const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 64,
    rowGap: 32,
  },
});
