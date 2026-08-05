import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getGearItem } from "@/services/gear";
import { GearDetail } from "../../_components/gear/gear-detail";
import { publicGearIdSchema } from "../../validation/gear.schema";

type GearDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: GearDetailPageProps): Promise<Metadata> {
  const parsedId = publicGearIdSchema.safeParse((await params).id);

  if (!parsedId.success) {
    return { title: "Gear not found" };
  }

  const result = await getGearItem(parsedId.data);

  if (!result.ok) {
    return { title: "Gear listing" };
  }

  return {
    title: result.data.name,
    description: result.data.description.slice(0, 160),
  };
}

export default async function GearDetailPage({ params }: GearDetailPageProps) {
  const parsedId = publicGearIdSchema.safeParse((await params).id);

  if (!parsedId.success) {
    notFound();
  }

  const result = await getGearItem(parsedId.data);

  if (!result.ok) {
    if (result.error.status === 404) {
      notFound();
    }

    return (
      <main id="main-content" tabIndex={-1} className="grid min-h-[75dvh] place-items-center bg-paper px-5 pb-20 pt-36">
        <Alert variant="destructive" className="max-w-2xl rounded-none p-6">
          <TriangleAlert aria-hidden="true" />
          <AlertTitle className="font-display text-3xl font-black uppercase">
            {result.error.retryable ? "This listing is temporarily offline." : "This listing could not be opened."}
          </AlertTitle>
          <AlertDescription className="mt-2">{result.error.message}</AlertDescription>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="primary">
              <Link href={`/gear/${parsedId.data}`}>Retry listing</Link>
            </Button>
            <Button asChild variant="outline-accent">
              <Link href="/gear">Back to all gear</Link>
            </Button>
          </div>
        </Alert>
      </main>
    );
  }

  return <GearDetail gear={result.data} />;
}
