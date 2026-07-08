export function WolfMark({
  className,
  showDetail = true,
}: {
  className?: string;
  showDetail?: boolean;
}) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" className={className} aria-hidden>
      <polygon points="50,20 18,2 28,42 50,90 72,42 82,2" />
      {showDetail && <polygon points="43,55 50,65 57,55" fill="var(--brand)" />}
    </svg>
  );
}
