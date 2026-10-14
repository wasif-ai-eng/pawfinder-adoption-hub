import { Suspense } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Species, PetWithRelations } from "@/types/database";
import PetsBrowser from "@/components/PetsBrowser";
import UserSwitcher from "@/components/UserSwitcher";

async function getAvailablePets(): Promise<PetWithRelations[]> {
  const { data, error } = await supabase
    .from("pets")
    .select(
      "pet_id, owner_id, name, species_id, breed, age_months, description, status, created_at, species ( species_name ), users ( full_name, email )"
    )
    .eq("status", "Available")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load pets: ${error.message}`);
  }

  return (data ?? []) as unknown as PetWithRelations[];
}

async function getSpecies(): Promise<Species[]> {
  const { data, error } = await supabase
    .from("species")
    .select("species_id, species_name")
    .order("species_name", { ascending: true });

  if (error) {
    throw new Error(`Failed to load species: ${error.message}`);
  }

  return data ?? [];
}

function PetsGridSkeleton() {
  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-8 w-28 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-48 animate-pulse rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900"
          />
        ))}
      </div>
    </div>
  );
}

async function AvailablePets() {
  let pets: PetWithRelations[] = [];
  let speciesList: Species[] = [];
  let loadError: string | null = null;

  try {
    [pets, speciesList] = await Promise.all([
      getAvailablePets(),
      getSpecies(),
    ]);
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Unknown error";
  }

  if (loadError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
        <p className="font-semibold">Couldn&apos;t load pets</p>
        <p className="mt-1">{loadError}</p>
      </div>
    );
  }

  if (pets.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-950">
        <p className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
          No pets available right now
        </p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Check back later or list a pet for adoption yourself.
        </p>
      </div>
    );
  }

  return <PetsBrowser pets={pets} speciesList={speciesList} />;
}

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-50 dark:bg-black">
      {/* Hero */}
      <header className="relative overflow-hidden border-b border-zinc-200 bg-gradient-to-br from-amber-500 via-amber-600 to-orange-700 dark:border-zinc-800">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.15),_transparent_55%)]"
        />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-5 px-6 py-20 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="w-fit rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur">
              🐾 PawFinder
            </span>
            <UserSwitcher />
          </div>
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Find your new best friend
          </h1>
          <p className="max-w-xl text-base text-amber-100 sm:text-lg">
            Browse pets looking for a loving home — dogs, cats, birds,
            and rabbits — and send an adoption request in one click.
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <a
              href="#listings"
              className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-amber-700 shadow-sm transition-colors hover:bg-amber-50"
            >
              Browse pets
            </a>
            <Link
              href="/adoptions"
              className="rounded-full border border-white/30 px-5 py-2.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/10"
            >
              My requests &amp; adoptions
            </Link>
          </div>
        </div>
      </header>

      {/* How it works */}
      <section className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-10 sm:grid-cols-3 sm:px-8">
          {[
            {
              title: "1. Browse",
              desc: "Filter by species to find dogs, cats, birds, or rabbits near you.",
            },
            {
              title: "2. Request",
              desc: "Send an adoption request describing your home and preferred pickup date.",
            },
            {
              title: "3. Adopt",
              desc: "Once approved, coordinate with the owner and welcome your new companion home.",
            },
          ].map((step) => (
            <div key={step.title} className="flex flex-col gap-1">
              <h3 className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                {step.title}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <main
        id="listings"
        className="mx-auto w-full max-w-6xl flex-1 px-6 py-10 sm:px-8"
      >
        <Suspense fallback={<PetsGridSkeleton />}>
          <AvailablePets />
        </Suspense>
      </main>
    </div>
  );
}
