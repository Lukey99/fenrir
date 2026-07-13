/** A plain, neutral backdrop — just a hint of grain for depth, no color
 * washes. Cards still use bg-glass/backdrop-blur, but read as understated
 * frosted panels over a flat surface rather than glass over an aurora. */
export function AppGlow() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="bg-noise absolute inset-0 opacity-[0.02] dark:opacity-[0.05]" />
    </div>
  );
}
