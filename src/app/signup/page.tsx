import { redirect } from "next/navigation";

type SignupPageProps = {
  searchParams?: Promise<{ ref?: string | string[] }> | { ref?: string | string[] };
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const refParam = Array.isArray(resolvedSearchParams.ref)
    ? resolvedSearchParams.ref[0]
    : resolvedSearchParams.ref;
  redirect(refParam ? `/login?ref=${encodeURIComponent(refParam)}` : "/login");
}
