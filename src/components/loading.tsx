export function Loading() {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center">
      <div className="space-y-4 text-center">
        <div className="w-16 h-16 border-4 border-santa-red rounded-full border-t-transparent animate-spin mx-auto" />
        <p className="text-lg font-medium text-muted-foreground">Loading Santa&apos;s Workshop...</p>
      </div>
    </div>
  )
}
