import { Suspense } from "react";
import { FinalCta } from "./_components/landing/final-cta";
import { Hero } from "./_components/landing/hero";
import {
  InventorySection,
  InventorySkeleton,
} from "./_components/landing/inventory-section";
import { ProviderCallout } from "./_components/landing/provider-callout";
import { RentalFlow } from "./_components/landing/rental-flow";
import {
  ReviewsSection,
  ReviewsSkeleton,
} from "./_components/landing/reviews-section";

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
