import { AlertTriangle, Inbox } from "lucide-react";
import type { ApiProblem } from "@/lib/types";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

export function DashboardApiFeedback({
  problems,
}: {
  problems: ApiProblem[];
}) {
  const messages = [...new Set(problems.map((problem) => problem.message))];
  if (messages.length === 0) return null;

  return (
    <Alert variant="destructive" className="rounded-none p-5">
      <AlertTriangle aria-hidden="true" />
      <AlertTitle>Some live dashboard data is unavailable</AlertTitle>
      <AlertDescription>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {messages.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}

export function DashboardEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="grid min-h-56 place-items-center border border-dashed border-ink/25 bg-card/45 p-8 text-center">
      <div>
        <Inbox aria-hidden="true" className="mx-auto size-8 text-signal" />
        <h3 className="mt-5 font-display text-3xl font-black uppercase">
          {title}
        </h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink/65">
          {description}
        </p>
      </div>
    </div>
  );
}
