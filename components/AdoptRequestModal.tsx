"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import Modal from "@/components/Modal";

type SubmitState = "idle" | "loading" | "error" | "success";

export default function AdoptRequestModal({
  petId,
  petName,
  ownerId,
}: {
  petId: number;
  petName: string;
  ownerId: number;
}) {
  const { currentUser } = useAuth();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [preferredDate, setPreferredDate] = useState("");
  const [homeDescription, setHomeDescription] = useState("");
  const [state, setState] = useState<SubmitState>("idle");
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];
  const isOwnPet = currentUser?.user_id === ownerId;

  function resetForm() {
    setPreferredDate("");
    setHomeDescription("");
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

    setState("loading");
    setError(null);

    const { error: insertError } = await supabase.from("adoption_requests").insert({
      pet_id: petId,
      adopter_id: currentUser.user_id,
      status: "Pending",
      preferred_date: preferredDate || null,
      home_description: homeDescription.trim() || null,
    });

    if (insertError) {
      setState("error");
      setError(insertError.message);
      return;
    }

    await supabase.from("pets").update({ status: "Pending" }).eq("pet_id", petId);

    setState("success");
    router.refresh();
  }

  if (isOwnPet) {
    return (
      <p className="rounded-lg bg-zinc-100 px-3 py-2 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
        This is your pet
      </p>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-500"
      >
        Adopt this pet
      </button>

      <Modal open={open} onClose={handleClose} title={`Request to adopt "${petName}"`}>
        {state === "success" ? (
          <div className="flex flex-col gap-4">
            <p className="rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700 dark:bg-green-950 dark:text-green-400">
              Request sent! The owner will review it shortly.
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-500"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="preferred-date"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Preferred pickup date (optional)
              </label>
              <input
                id="preferred-date"
                type="date"
                min={today}
                value={preferredDate}
                onChange={(event) => setPreferredDate(event.target.value)}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="home-desc"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Tell the owner about your home (optional)
              </label>
              <textarea
                id="home-desc"
                value={homeDescription}
                onChange={(event) => setHomeDescription(event.target.value)}
                rows={3}
                placeholder="Describe your home environment, yard space, other pets, experience with animals..."
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
                {state === "loading" ? "Sending…" : "Send request"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
