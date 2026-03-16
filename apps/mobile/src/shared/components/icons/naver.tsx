import Svg, {Path, type SvgProps} from 'react-native-svg';

const KaKao = (props: SvgProps) => (
  <Svg
    width={props.width ?? 25}
    height={props.height ?? 24}
    viewBox="0 0 25 24"
    fill="none">
    <Path
      d="M15.3569 12.5603L9.40851 4.04541H4.47754V19.9541H9.64297V11.4403L15.5913 19.9541H20.5223V4.04541H15.3569V12.5603Z"
      fill="white"
    />
  </Svg>
);
export default KaKao;
