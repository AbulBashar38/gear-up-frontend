import { DashboardRegisterPage } from "../../../_components/dashboard-register-page";
import { ReviewList } from "../../../_components/dashboard-record-lists";
import {
  type DashboardListPageProps,
  parseDashboardPage,
} from "../../../_utils/dashboard-query";
import { getResultTotal } from "../../../_utils/dashboard-results";
import { listReviews } from "@/services/reviews";

export default async function AdminReviewsPage({
  searchParams,
}: DashboardListPageProps) {
  const { page: rawPage } = await searchParams;
  const page = parseDashboardPage(rawPage);
  const result = await listReviews({ page, limit: 8 });

  return (
    <DashboardRegisterPage
      eyebrow="Admin register // moderation"
      title="Customer reviews"
      description="Review feedback is tied to returned orders. Admin moderation actions will call the protected delete endpoint rather than hiding content locally."
      total={getResultTotal(result)}
      problem={result.ok ? undefined : result.error}
      meta={result.ok ? result.meta : undefined}
      pathname="/dashboard/admin/reviews"
    >
      {result.ok && <ReviewList reviews={result.data} adminActions />}
    </DashboardRegisterPage>
  );
}
