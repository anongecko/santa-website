export function TelegramIcon({
  className = 'w-4 h-4',
  ...props
}: { className?: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M21.6 3L2.4 10.2c-1.3.5-1.3 1.8 0 2.2l4.6 1.5 1.8 5.7c.2.7 1 .9 1.5.4l2.6-2.5 5.2 3.8c.7.5 1.7.1 1.9-.7L22.8 4c.2-1-.9-1.8-1.8-1z" />
      <path d="M8.5 13.5l7-7" />
    </svg>
  );
}
