import { listReviews } from "@/services/reviews";
import { DashboardRegisterPage } from "../../_components/dashboard-register-page";
import { ReviewList } from "../../_components/dashboard-record-lists";
import {
  ReviewRegisterFilters,
  type ReviewFilterValues,
} from "../../_components/dashboard-register-filters";
import { requireDashboardRole } from "../../_utils/dashboard-access";
import {
  type DashboardListPageProps,
  parseDashboardPage,
  parseDashboardText,
} from "../../_utils/dashboard-query";
import { getResultTotal } from "../../_utils/dashboard-results";

export default async function AdminReviewsPage({
  searchParams,
}: DashboardListPageProps) {
  const params = await searchParams;
  const page = parseDashboardPage(params.page);
  const rawRating = parseDashboardText(params.rating, 3);
  const parsedRating = Number(rawRating);
  const hasValidRating =
    rawRating.length > 0 &&
    Number.isFinite(parsedRating) &&
    parsedRating >= 1 &&
    parsedRating <= 5 &&
    Number.isInteger(parsedRating * 10);
  const values: ReviewFilterValues = {
    search: parseDashboardText(params.search),
    rating: hasValidRating ? rawRating : "",
  };
  await requireDashboardRole("ADMIN", "/dashboard/reviews");
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
