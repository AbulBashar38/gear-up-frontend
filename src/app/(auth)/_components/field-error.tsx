import { AlertCircle } from "lucide-react";

type FieldErrorProps = {
  id: string;
  messages?: string[];
};

export function FieldError({ id, messages }: FieldErrorProps) {
  if (!messages || messages.length === 0) return null;

  return (
    <p
      id={id}
      className="flex items-center gap-1.5 text-xs font-medium text-signal"
    >
      <AlertCircle aria-hidden="true" className="size-3.5 shrink-0" />
      {messages[0]}
    </p>
  );
}
