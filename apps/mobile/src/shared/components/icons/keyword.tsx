import Svg, {Path, Rect, type SvgProps} from 'react-native-svg';

import {useColors} from '@/shared/theme/useColors';

/** 하단 탭 「키워드」 — 둥근 칸 안의 #. web `shared/ui/common/icons/Keyword`·tab-icons/keyword@3x.png 와 같은 모양. */
const Keyword = (props: SvgProps) => {
  const c = useColors();
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28" fill="none" {...props}>
      <Rect
        x={4.75}
        y={4.75}
        width={18.5}
        height={18.5}
        rx={5}
        stroke={c.gray[500]}
        strokeWidth={1.5}
      />
      <Path
        d="M12.4 9.25 11.1 18.75M16.9 9.25 15.6 18.75M9.25 12h9.5M9.25 16h9.5"
        stroke={c.gray[500]}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
};
export default Keyword;
