type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg';
type SpinnerColor = 'primary' | 'white' | 'current';

// 크기와 테두리 두께는 짝이다 — 큰 링에 얇은 테두리를 섞으면 화면마다 굵기가 달라 보인다
const SIZE: Record<SpinnerSize, string> = {
  xs: 'h-3 w-3 border-2',
  sm: 'h-4 w-4 border-2',
  md: 'h-5 w-5 border-2',
  lg: 'h-8 w-8 border-4',
};

// 색은 prop 으로만 받는다 — className 으로 border-* 를 덧붙이면 CSS 순서에 따라 이기는 쪽이 바뀐다
const COLOR: Record<SpinnerColor, string> = {
  primary: 'border-primary',
  white: 'border-white',
  current: 'border-current',
};

interface SpinnerProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
  /** 옆에 붙일 문구. 주면 링+문구를 한 줄로 묶는다 */
  label?: string;
  className?: string;
}

const Spinner = ({ size = 'md', color = 'primary', label, className = '' }: SpinnerProps) => {
  const ring = `inline-block shrink-0 animate-spin rounded-full border-t-transparent ${SIZE[size]} ${COLOR[color]}`;

  if (!label) {
    return <span role="status" aria-label="로딩 중" className={`${ring} ${className}`} />;
  }

  return (
    <span role="status" className={`inline-flex items-center gap-2 ${className}`}>
      <span aria-hidden="true" className={ring} />
      <span>{label}</span>
    </span>
  );
};

export default Spinner;
