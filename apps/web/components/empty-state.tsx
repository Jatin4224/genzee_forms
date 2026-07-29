import { cn } from "~/lib/utils";

export function EmptyState({
  icon,
  title,
  description,
  action,
  bordered = true,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  bordered?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 p-10 text-center",
        bordered && "rounded-xl border border-dashed",
        className,
      )}
    >
      {icon && (
        <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground [&>svg]:size-6">
          {icon}
        </div>
      )}
      <div className="flex flex-col gap-1">
        {/* h2 inherits the display font from the base layer */}
        <h2 className="text-xl">{title}</h2>
        {description && (
          <p className="mx-auto max-w-sm text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
