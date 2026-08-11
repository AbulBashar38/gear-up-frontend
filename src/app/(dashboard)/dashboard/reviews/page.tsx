import { z } from "zod";
import { getGearItem, listGear } from "@/services/gear";
import { listReviews } from "@/services/reviews";
import {
  DashboardApiFeedback,
  DashboardEmptyState,
} from "../../_components/dashboard-feedback";
import { DashboardRegisterPage } from "../../_components/dashboard-register-page";
import { ReviewList } from "../../_components/dashboard-record-lists";
import {
  ProviderReviewFilters,
  ReviewRegisterFilters,
  type ProviderReviewFilterValues,
  type ReviewFilterValues,
} from "../../_components/dashboard-register-filters";
import { requireDashboardRoles } from "../../_utils/dashboard-access";
import {
  type DashboardListPageProps,
  parseDashboardPage,
  parseDashboardText,
} from "../../_utils/dashboard-query";
import { getResultTotal } from "../../_utils/dashboard-results";

const uuidSchema = z.uuid();

/** The backend accepts ratings of 1–5 in 0.1 steps. */
function parseRatingParam(raw: string) {
  const rating = Number(raw);
  const valid =
    raw.length > 0 &&
    Number.isFinite(rating) &&
    rating >= 1 &&
    rating <= 5 &&
    Number.isInteger(rating * 10);

  return valid ? raw : "";
}

export default async function DashboardReviewsPage({
  searchParams,
}: DashboardListPageProps) {
  const params = await searchParams;
  const page = parseDashboardPage(params.page);
  const search = parseDashboardText(params.search);
  const rating = parseRatingParam(parseDashboardText(params.rating, 3));
  const user = await requireDashboardRoles(
    ["ADMIN", "PROVIDER"],
    "/dashboard/reviews",
  );

  if (user.role === "PROVIDER") {
    return providerReviews({ user, page, search, rating, params });
  }

  const values: ReviewFilterValues = { search, rating };
  const result = await listReviews({
    search: values.search || undefined,
    rating: values.rating ? Number(values.rating) : undefined,
    page,
    limit: 8,
  });

  return (
    <DashboardRegisterPage
      eyebrow="Admin register // moderation"
      title="Customer reviews"
      description="Review feedback is tied to returned orders. Moderation calls the protected delete endpoint rather than hiding content locally."
      total={getResultTotal(result)}
      problem={result.ok ? undefined : result.error}
      meta={result.ok ? result.meta : undefined}
      pathname="/dashboard/reviews"
      paginationQuery={{
        search: values.search || undefined,
        rating: values.rating || undefined,
      }}
      filters={<ReviewRegisterFilters values={values} />}
    >
      {result.ok && <ReviewList reviews={result.data} adminActions />}
    </DashboardRegisterPage>
  );
}

/**
 * Providers read feedback on gear they own. `GET /reviews` has no provider
 * filter, so the register is scoped to one owned `gearItemId` at a time and
 * ownership is verified against the canonical gear record rather than trusted
 * from the query string. Every control here is read-only: review mutations stay
 * with the owning customer and the admin moderator.
 */
async function providerReviews({
  user,
  page,
  search,
  rating,
  params,
}: {
  user: { id: string };
  page: number;
  search: string;
  rating: string;
  params: Awaited<DashboardListPageProps["searchParams"]>;
}) {
  const requestedGearId = parseDashboardText(params.gearItemId, 255);
  const parsedGearId = uuidSchema.safeParse(requestedGearId);
  const gearListResult = await listGear({
    providerId: user.id,
    limit: 100,
  });

  // The selection is checked against the gear record itself so a provider with
  // more listings than one page still resolves correctly.
  const selectedGearResult = parsedGearId.success
    ? await getGearItem(parsedGearId.data)
    : null;
  const ownedGear =
    selectedGearResult?.ok && selectedGearResult.data.providerId === user.id
      ? selectedGearResult.data
      : null;
  const selectedGearId = ownedGear?.id ?? "";
  const selectedGearName = ownedGear?.name ?? null;

  const reviewsResult = selectedGearId
    ? await listReviews({
        gearItemId: selectedGearId,
        search: search || undefined,
        rating: rating ? Number(rating) : undefined,
        page,
        limit: 8,
      })
    : null;

  const values: ProviderReviewFilterValues = {
    gearItemId: selectedGearId,
    search,
    rating,
  };

  return (
    <DashboardRegisterPage
      eyebrow="Provider register // feedback"
      title="Reviews of your gear"
      description={
        selectedGearName
          ? `Customer feedback for ${selectedGearName}. Reviews belong to the customer who wrote them, so this view is read-only.`
          : "Customer feedback is published per listing. Choose one of your gear items to read its reviews; only the reviewing customer or an admin can change a review."
      }
      total={reviewsResult ? getResultTotal(reviewsResult) : null}
      problem={
        reviewsResult && !reviewsResult.ok ? reviewsResult.error : undefined
      }
      meta={reviewsResult?.ok ? reviewsResult.meta : undefined}
      pathname="/dashboard/reviews"
      paginationQuery={{
        gearItemId: selectedGearId || undefined,
        search: search || undefined,
        rating: rating || undefined,
      }}
      filters={
        <>
          <ProviderReviewFilters
            values={values}
            gear={gearListResult.ok ? gearListResult.data : []}
          />
          {!gearListResult.ok && (
            <div className="mt-4">
              <DashboardApiFeedback problems={[gearListResult.error]} />
            </div>
          )}
        </>
      }
    >
      {requestedGearId && !ownedGear ? (
        <DashboardEmptyState
          title="That listing isn't yours"
          description="This register only shows reviews for gear you own. Pick one of your listings from the filter above."
        />
      ) : !selectedGearId ? (
        <DashboardEmptyState
          title="Choose a listing"
          description="The reviews API filters by gear item, so select one of your gear listings above to read its customer feedback."
        />
      ) : (
        reviewsResult?.ok && <ReviewList reviews={reviewsResult.data} />
      )}
    </DashboardRegisterPage>
  );
}
