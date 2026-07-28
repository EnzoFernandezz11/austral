export function PageHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-5 flex min-h-11 items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description === undefined ? null : (
          <p className="mt-1 text-sm text-ink/60">{description}</p>
        )}
      </div>
      {action}
    </header>
  );
}
