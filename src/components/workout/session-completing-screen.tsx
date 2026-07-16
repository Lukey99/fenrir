export function SessionCompletingScreen() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="size-10 animate-spin rounded-full border-4 border-muted border-t-brand" />
      <p className="text-sm text-muted-foreground">Enregistrement de ta séance...</p>
    </div>
  );
}
