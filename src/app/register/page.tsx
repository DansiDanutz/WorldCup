import { redirect } from "next/navigation";

type RegisterPageProps = {
  searchParams?: Promise<{ ref?: string | string[] }> | { ref?: string | string[] };
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const refParam = Array.isArray(resolvedSearchParams.ref)
    ? resolvedSearchParams.ref[0]
    : resolvedSearchParams.ref;
  redirect(refParam ? `/login?ref=${encodeURIComponent(refParam)}` : "/login");
}
