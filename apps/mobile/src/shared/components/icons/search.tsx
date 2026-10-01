import React from 'react';
import Svg, {Path, type SvgProps} from 'react-native-svg';

import {useColors} from '@/shared/theme/useColors';

/** web shared/ui/common/icons/Search.tsx 와 같은 마크. */
const Search = ({color, width, height, ...props}: SvgProps) => {
  const c = useColors();
  return (
    <Svg
      width={width ?? 28}
      height={height ?? 28}
      viewBox="0 0 28 28"
      fill="none"
      {...props}>
      <Path
        d="M23 23L17.0001 17M19 12C19 15.866 15.866 19 12 19C8.13401 19 5 15.866 5 12C5 8.13401 8.13401 5 12 5C15.866 5 19 8.13401 19 12Z"
        stroke={(color as string) ?? c.gray[800]}
        strokeWidth={1.5}
        strokeLinecap="square"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default Search;
