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
        className="max-w-2xl rounded-none border-red-300 bg-red-50 p-6"
      >
        <TriangleAlert aria-hidden="true" />
        <AlertTitle className="font-display text-3xl font-black uppercase">
          The catalog hit an unexpected trail block.
        </AlertTitle>
        <AlertDescription className="mt-2">
          The page could not finish rendering. Retry the route; if the problem
          continues, return to the landing page and try again shortly.
        </AlertDescription>
        <Button
          type="button"
          onClick={() => unstable_retry()}
          className="notch-button mt-5 min-h-11 rounded-none bg-ink px-6 font-extrabold text-paper hover:bg-pine"
        >
          Retry catalog
        </Button>
      </Alert>
    </main>
  );
}
