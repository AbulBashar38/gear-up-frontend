import { Suspense } from "react";
import { FinalCta } from "@/components/landing/final-cta";
import { Hero } from "@/components/landing/hero";
import {
  InventorySection,
  InventorySkeleton,
} from "@/components/landing/inventory-section";
import { ProviderCallout } from "@/components/landing/provider-callout";
import { RentalFlow } from "@/components/landing/rental-flow";
import {
  ReviewsSection,
  ReviewsSkeleton,
} from "@/components/landing/reviews-section";

export default function HomePage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <Hero />
      <Suspense fallback={<InventorySkeleton />}>
        <InventorySection />
      </Suspense>
      <RentalFlow />
      <ProviderCallout />
      <Suspense fallback={<ReviewsSkeleton />}>
        <ReviewsSection />
      </Suspense>
      <FinalCta />
    </main>
  );
}
