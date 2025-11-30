import { FileQuestion, Search, FolderOpen, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type EmptyStateVariant = "default" | "search" | "folder" | "inbox";

interface EmptyStateProps {
  title: string;
  description?: string;
  variant?: EmptyStateVariant;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const icons: Record<EmptyStateVariant, React.ElementType> = {
  default: FileQuestion,
  search: Search,
  folder: FolderOpen,
  inbox: Inbox,
};

export function EmptyState({
  title,
  description,
  variant = "default",
  action,
  className,
}: EmptyStateProps) {
  const Icon = icons[variant];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 text-center",
        className
      )}
    >
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground mb-4 max-w-sm">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  );
}

