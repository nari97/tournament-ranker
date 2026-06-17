import { getSweepstakesState } from "@/lib/state";
import MatchesView from "@/components/MatchesView";
import { Suspense } from "react";

export const revalidate = 30;

export default async function MatchesPage() {
  const state = await getSweepstakesState();

  return (
    <main className="flex-1 w-full flex flex-col items-center p-4 sm:p-8">
      <Suspense fallback={<div className="text-zinc-500">Loading matches...</div>}>
        <MatchesView allMatches={state.all_matches} />
      </Suspense>
    </main>
  );
}
