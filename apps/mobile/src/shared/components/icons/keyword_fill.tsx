import Svg, {Path, Rect, type SvgProps} from 'react-native-svg';

import {useColors} from '@/shared/theme/useColors';

const KeywordFill = (props: SvgProps) => {
  const c = useColors();
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28" fill="none" {...props}>
      <Rect
        x={4.75}
        y={4.75}
        width={18.5}
        height={18.5}
        rx={5}
        fill="#9EF22E"
        stroke={c.gray[900]}
        strokeWidth={1.5}
      />
      <Path
        d="M12.4 9.25 11.1 18.75M16.9 9.25 15.6 18.75M9.25 12h9.5M9.25 16h9.5"
        stroke={c.gray[900]}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
};
export default KeywordFill;
