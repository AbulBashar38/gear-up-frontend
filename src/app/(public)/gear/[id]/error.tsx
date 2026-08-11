"use client";

import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function GearDetailError({ unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  return (
    <main id="main-content" tabIndex={-1} className="grid min-h-[75dvh] place-items-center bg-paper px-5 pb-20 pt-36">
      <Alert variant="destructive" className="max-w-2xl rounded-none p-6">
        <TriangleAlert aria-hidden="true" />
        <AlertTitle className="font-display text-3xl font-black uppercase">This gear item could not be loaded.</AlertTitle>
        <AlertDescription className="mt-2">Retry this item or return to the gear catalog.</AlertDescription>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Button type="button" onClick={() => unstable_retry()} variant="primary">Retry listing</Button>
          <Button asChild variant="outline-accent"><Link href="/gear">Browse all gear</Link></Button>
        </div>
      </Alert>
    </main>
  );
}
