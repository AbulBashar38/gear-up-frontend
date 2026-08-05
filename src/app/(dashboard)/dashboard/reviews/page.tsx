import { listReviews } from "@/services/reviews";
import { DashboardRegisterPage } from "../../_components/dashboard-register-page";
import { ReviewList } from "../../_components/dashboard-record-lists";
import { requireDashboardRole } from "../../_utils/dashboard-access";
import {
  type DashboardListPageProps,
  parseDashboardPage,
} from "../../_utils/dashboard-query";
import { getResultTotal } from "../../_utils/dashboard-results";

export default async function AdminReviewsPage({
  searchParams,
}: DashboardListPageProps) {
  const { page: rawPage } = await searchParams;
  const page = parseDashboardPage(rawPage);
  await requireDashboardRole("ADMIN", "/dashboard/reviews");
  const result = await listReviews({ page, limit: 8 });

  return (
    <DashboardRegisterPage
      eyebrow="Admin register // moderation"
      title="Customer reviews"
      description="Review feedback is tied to returned orders. Moderation calls the protected delete endpoint rather than hiding content locally."
      total={getResultTotal(result)}
      problem={result.ok ? undefined : result.error}
      meta={result.ok ? result.meta : undefined}
      pathname="/dashboard/reviews"
    >
      {result.ok && <ReviewList reviews={result.data} adminActions />}
    </DashboardRegisterPage>
  );
}
