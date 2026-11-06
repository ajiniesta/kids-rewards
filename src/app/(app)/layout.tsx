import { AppHeader } from "@/components/app-header";
import { getCurrentMembership, getCurrentProfile, requireUser } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  const profile = await getCurrentProfile();
  const membership = await getCurrentMembership();

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader
        name={profile?.full_name ?? null}
        email={profile?.email ?? ""}
        familyName={membership?.family.name ?? null}
        hasFamily={Boolean(membership)}
      />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
        {children}
      </main>
    </div>
  );
}