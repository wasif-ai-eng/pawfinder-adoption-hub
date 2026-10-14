"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import type { Species } from "@/types/database";
import Modal from "@/components/Modal";

type SubmitState = "idle" | "loading" | "error";

export default function AddPetModal({
  speciesList,
}: {
  speciesList: Species[];
}) {
  const { currentUser } = useAuth();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [speciesId, setSpeciesId] = useState<number | "">(
    speciesList[0]?.species_id ?? ""
  );
  const [breed, setBreed] = useState("");
  const [ageMonths, setAgeMonths] = useState("");
  const [description, setDescription] = useState("");
  const [state, setState] = useState<SubmitState>("idle");
  const [error, setError] = useState<string | null>(null);

  function resetForm() {
    setName("");
    setSpeciesId(speciesList[0]?.species_id ?? "");
    setBreed("");
    setAgeMonths("");
    setDescription("");
    setState("idle");
    setError(null);
  }

  function handleClose() {
    setOpen(false);
    resetForm();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentUser) {
      setError("No active user selected. Pick a user from the switcher first.");
      return;
    }

    if (!name.trim() || speciesId === "") {
      setError("Pet name and species are required.");
      return;
    }

    setState("loading");
    setError(null);

    const { error: insertError } = await supabase.from("pets").insert({
      owner_id: currentUser.user_id,
      name: name.trim(),
      species_id: speciesId,
      breed: breed.trim() || null,
      age_months: ageMonths ? Number(ageMonths) : null,
      description: description.trim() || null,
      status: "Available",
    });

    if (insertError) {
      setState("error");
      setError(insertError.message);
      return;
    }

    handleClose();
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-500"
      >
        + List a pet
      </button>

      <Modal open={open} onClose={handleClose} title="List a pet for adoption">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="pet-name"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Pet Name
            </label>
            <input
              id="pet-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              maxLength={150}
              placeholder="e.g. Buddy"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="pet-species"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Species
            </label>
            <select
              id="pet-species"
              value={speciesId}
              onChange={(event) => setSpeciesId(Number(event.target.value))}
              required
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            >
              {speciesList.length === 0 && <option value="">No species</option>}
              {speciesList.map((sp) => (
                <option key={sp.species_id} value={sp.species_id}>
                  {sp.species_name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="pet-breed"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Breed (optional)
              </label>
              <input
                id="pet-breed"
                type="text"
                value={breed}
                onChange={(event) => setBreed(event.target.value)}
                maxLength={80}
                placeholder="e.g. Golden Retriever"
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="pet-age"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Age (months)
              </label>
              <input
                id="pet-age"
                type="number"
                min="0"
                value={ageMonths}
                onChange={(event) => setAgeMonths(event.target.value)}
                placeholder="e.g. 12"
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="pet-description"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Description (optional)
            </label>
            <textarea
              id="pet-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              placeholder="Temperament, vaccination status, special needs..."
              className="resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          {error && (
            <p className="text-sm font-medium text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={state === "loading"}
              className="inline-flex items-center justify-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {state === "loading" ? "Listing…" : "List pet"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
