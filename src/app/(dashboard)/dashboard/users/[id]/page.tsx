import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { listGear } from "@/services/gear";
import { getUser } from "@/services/users";
import { UserDetail } from "../../../_components/user-detail";
import { requireDashboardRole } from "../../../_utils/dashboard-access";
import { userIdSchema } from "../../../validation/user.schema";

type UserDetailPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "User detail",
  description: "Admin view of a platform account, its activity, and its status.",
};

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = await params;
  const parsedId = userIdSchema.safeParse(id);

  if (!parsedId.success) {
    notFound();
  }

  const admin = await requireDashboardRole(
    "ADMIN",
    `/dashboard/users/${parsedId.data}`,
  );
  const result = await getUser(parsedId.data);

  if (!result.ok) {
    if (result.error.status === 404 || result.error.status === 403) {
      notFound();
    }

    return (
      <div className="mx-auto w-full max-w-2xl px-5 py-10 sm:px-8 lg:px-10">
        <Alert variant="destructive" className="rounded-none p-6">
          <TriangleAlert aria-hidden="true" />
          <AlertTitle className="font-display text-2xl font-black uppercase">
            {result.error.retryable
              ? "This account is temporarily unavailable."
              : "This account couldn't be opened."}
          </AlertTitle>
          <AlertDescription className="mt-2">
            {result.error.message}
          </AlertDescription>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="primary">
              <Link href={`/dashboard/users/${parsedId.data}`}>Retry</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/users">Back to users</Link>
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  // `GET /gear` has a real `providerId` filter, so a provider's inventory is a
  // genuine scoped read rather than a client-side slice of the catalog.
  const gearResult =
    result.data.role === "PROVIDER"
      ? await listGear({ providerId: result.data.id, limit: 5 })
      : null;

  return (
    <UserDetail
      user={result.data}
      currentAdminId={admin.id}
      providerGear={gearResult?.ok ? gearResult.data : undefined}
      providerGearTotal={gearResult?.ok ? gearResult.meta?.total ?? null : null}
      providerGearProblem={
        gearResult && !gearResult.ok ? gearResult.error : undefined
      }
    />
  );
}
