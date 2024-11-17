type IconProps = React.HTMLAttributes<SVGElement>

export const Icons = {
  spinner: (props: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  ),
  strava: (props: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" {...props}>
      <rect width="512" height="512" fill="#fc4c01" rx="15%"></rect>
      <path fill="#fff" d="M120 288 232 56l112 232h-72l-40-96-40 96z"></path>
      <path fill="#fda580" d="m280 288 32 72 32-72h48l-80 168-80-168z"></path>
    </svg>
  ),
}
