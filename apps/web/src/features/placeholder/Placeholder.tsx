export function Placeholder({ title }: { title: string }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground">Coming soon.</p>
    </div>
  );
}
