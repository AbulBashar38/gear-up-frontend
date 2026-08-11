"use client";

import { TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function GearCatalogError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="grid min-h-[70dvh] place-items-center bg-paper px-5 pb-20 pt-36"
    >
      <Alert
        variant="destructive"
        className="max-w-2xl rounded-none p-6"
      >
        <TriangleAlert aria-hidden="true" />
        <AlertTitle className="font-display text-3xl font-black uppercase">
          The gear catalog could not be loaded.
        </AlertTitle>
        <AlertDescription className="mt-2">
          Retry the page. If the problem continues, return home and try again
          shortly.
        </AlertDescription>
        <Button
          type="button"
          onClick={() => unstable_retry()}
          variant="primary"
          className="mt-5"
        >
          Retry catalog
        </Button>
      </Alert>
    </main>
  );
}
