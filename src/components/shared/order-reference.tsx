"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function OrderReference({
  orderId,
  label = "Order ID",
  className,
}: {
  orderId: string;
  /** Overridden for payment and Stripe references, which reuse this control. */
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  async function copyOrderId() {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard access is unavailable");
      }
      await navigator.clipboard.writeText(orderId);
      setCopied(true);
      toast.success(`${label} copied`);
    } catch {
      toast.error(
        `The ${label.toLowerCase()} could not be copied. Select it manually.`,
      );
    }
  }

  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-3 border border-ink/15 bg-mist/45 p-3 text-left",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[0.55rem] font-bold uppercase tracking-[0.14em] text-ink/50">
          {label}
        </p>
        <code className="mt-1 block select-all break-all font-mono text-[0.68rem] font-semibold lowercase leading-5 tracking-normal text-ink">
          {orderId}
        </code>
      </div>
      <Button
        type="button"
        variant="outline"
        size="compact"
        className="shrink-0"
        aria-label={`${copied ? "Copied" : "Copy"} ${label.toLowerCase()} ${orderId}`}
        onClick={copyOrderId}
      >
        {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  );
}
