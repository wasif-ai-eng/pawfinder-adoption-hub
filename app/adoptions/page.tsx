import Link from "next/link";
import UserSwitcher from "@/components/UserSwitcher";
import AdoptionsBoard from "@/components/AdoptionsBoard";

export default function AdoptionsPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-1">
            <Link
              href="/"
              className="w-fit text-xs font-semibold uppercase tracking-wide text-amber-600 hover:underline dark:text-amber-400"
            >
              ← Back to pets
            </Link>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              My Requests &amp; Adoptions
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Review adoption requests for pets you listed, and track the status of
              pets you&apos;ve requested to adopt.
            </p>
          </div>
          <UserSwitcher variant="dark" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10 sm:px-8">
        <AdoptionsBoard />
      </main>
    </div>
  );
}
