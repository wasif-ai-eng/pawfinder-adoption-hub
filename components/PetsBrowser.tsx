"use client";

import { useMemo, useState } from "react";
import type { Species, PetWithRelations } from "@/types/database";
import AdoptRequestModal from "@/components/AdoptRequestModal";
import AddPetModal from "@/components/AddPetModal";

const statusStyles: Record<string, string> = {
  Available:
    "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-950 dark:text-green-400",
  Pending:
    "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950 dark:text-amber-400",
  Adopted:
    "bg-zinc-100 text-zinc-700 ring-zinc-600/20 dark:bg-zinc-800 dark:text-zinc-300",
};

function formatAge(months: number | null): string {
  if (months === null || months === undefined) return "Age unknown";
  if (months < 1) return "< 1 month";
  if (months < 12) return `${months} month${months === 1 ? "" : "s"}`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (rem === 0) return `${years} year${years === 1 ? "" : "s"}`;
  return `${years}y ${rem}m`;
}

export default function PetsBrowser({
  pets,
  speciesList,
}: {
  pets: PetWithRelations[];
  speciesList: Species[];
}) {
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<number | "all">(
    "all"
  );

  const filteredPets = useMemo(() => {
    if (selectedSpeciesId === "all") return pets;
    return pets.filter((pet) => pet.species_id === selectedSpeciesId);
  }, [pets, selectedSpeciesId]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Pets looking for a home
        </h2>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-400">
            {filteredPets.length} of {pets.length} pet
            {pets.length === 1 ? "" : "s"}
          </span>
          <AddPetModal speciesList={speciesList} />
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelectedSpeciesId("all")}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
            selectedSpeciesId === "all"
              ? "border-amber-600 bg-amber-600 text-white"
              : "border-zinc-300 bg-white text-zinc-700 hover:border-amber-400 hover:text-amber-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300"
          }`}
        >
          All species
        </button>
        {speciesList.map((sp) => (
          <button
            type="button"
            key={sp.species_id}
            onClick={() => setSelectedSpeciesId(sp.species_id)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              selectedSpeciesId === sp.species_id
                ? "border-amber-600 bg-amber-600 text-white"
                : "border-zinc-300 bg-white text-zinc-700 hover:border-amber-400 hover:text-amber-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300"
            }`}
          >
            {sp.species_name}
          </button>
        ))}
      </div>

      {filteredPets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-950">
          <p className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
            No pets match this filter
          </p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Try a different species or check back later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPets.map((pet) => (
            <article
              key={pet.pet_id}
              className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    {pet.name}
                  </h3>
                  <span
                    className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                      statusStyles[pet.status] ?? statusStyles.Available
                    }`}
                  >
                    {pet.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {pet.species?.species_name && (
                    <span className="inline-flex w-fit items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                      {pet.species.species_name}
                    </span>
                  )}
                  {pet.breed && (
                    <span className="inline-flex w-fit items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {pet.breed}
                    </span>
                  )}
                  <span className="inline-flex w-fit items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {formatAge(pet.age_months)}
                  </span>
                </div>

                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {pet.description || "No description provided."}
                </p>

                <p className="text-xs text-zinc-500 dark:text-zinc-500">
                  Listed by{" "}
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    {pet.users?.full_name ?? "Unknown owner"}
                  </span>
                </p>
              </div>

              <div className="mt-6">
                <AdoptRequestModal
                  petId={pet.pet_id}
                  petName={pet.name}
                  ownerId={pet.owner_id}
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
