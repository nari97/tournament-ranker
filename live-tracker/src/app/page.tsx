import { getSweepstakesState } from "@/lib/state";
import Dashboard from "@/components/Dashboard";

export const revalidate = 60; // Next.js ISR: Cache this page and revalidate every 60 seconds

export default async function Home() {
  const state = await getSweepstakesState();

  return (
    <main className="flex-1 w-full flex flex-col items-center p-4 sm:p-8">
      <Dashboard initialState={state} />
    </main>
  );
}
