import { defineRegistry } from '@json-render/react';

import NativeAnswerText from '../features/answer/ui/AnswerText';
import NativeDistribution from '../features/answer/ui/Distribution';
import ExampleChips from '../features/answer/ui/ExampleChips';
import NativeFollowUp from '../features/answer/ui/FollowUp';
import NativePartialAnswer from '../features/answer/ui/PartialAnswer';
import NativePricePosition from '../features/answer/ui/PricePosition';
import NativePriceTrend from '../features/answer/ui/PriceTrend';

import { DanawaFloor } from './components/DanawaFloor';
import { DealCard } from './components/DealCard';
import { DealList } from './components/DealList';
import { Failure, Review, Verdict } from './components/Wrappers';

import { dealCatalog } from './index';

export function PartialAnswer({ props }: { props: { reason?: any; filteredCount: number } }) {
  return (
    <NativePartialAnswer reason={props.reason}>
      {props.reason?.code === 'NO_RESULTS' ? (
        <ExampleChips />
      ) : props.filteredCount > 0 ? (
        <p className="text-[12px] text-gray-600">
          걸러낸 딜 {props.filteredCount}개는 아래에 있어요.
        </p>
      ) : null}
    </NativePartialAnswer>
  );
}

export function Distribution({ props }: { props: { prices: number[] } }) {
  return <NativeDistribution prices={props.prices} />;
}

export function PricePosition({ props }: { props: { position?: any; title: string } }) {
  return <NativePricePosition position={props.position} title={props.title} />;
}

export function PriceTrend({
  props,
}: {
  props: { points?: any[]; current: number; confidence?: any };
}) {
  return (
    <NativePriceTrend
      points={props.points || []}
      current={props.current}
      confidence={props.confidence}
    />
  );
}

export function AnswerText({ props }: { props: { markdown: string } }) {
  return <NativeAnswerText markdown={props.markdown} />;
}

export function FollowUp({ props }: { props: { suggestions: string[] } }) {
  return <NativeFollowUp suggestions={props.suggestions} />;
}

export const { registry } = defineRegistry(dealCatalog, {
  components: {
    DealCard,
    DealList,
    Verdict,
    PartialAnswer,
    Distribution,
    PricePosition,
    PriceTrend,
    AnswerText,
    FollowUp,
    Review,
    DanawaFloor,
    Failure,
  },
  actions: {},
});
