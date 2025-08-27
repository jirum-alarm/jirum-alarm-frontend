import type { SVGProps } from 'react';

const Etc = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="8.5" r="6.5" fill="#FFCC4A" />
      <path
        d="M7.5 11.75H12.5V15.75C12.5 17.1307 11.3807 18.25 10 18.25C8.61929 18.25 7.5 17.1307 7.5 15.75V11.75Z"
        fill="#FFCC4A"
      />
      <path
        d="M8 9V8.75H9V9C9 9.55228 9.44772 10 10 10C10.5523 10 11 9.55228 11 9V8.75H12V9C12 10.1046 11.1046 11 10 11C8.89543 11 8 10.1046 8 9Z"
        fill="white"
      />
      <path d="M10.5 10.5V13.3906H9.5V10.5H10.5Z" fill="white" />
      <path d="M7.5 15.2559L12.5 15.2559L12.5 16.2559L7.5 16.2559L7.5 15.2559Z" fill="white" />
    </svg>
  );
};

export default Etc;
