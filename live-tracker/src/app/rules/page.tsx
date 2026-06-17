import Link from "next/link";
import { ArrowLeft, BookOpen, Trophy, Coins, Activity, Scale } from "lucide-react";

export default function RulesPage() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-20 p-4 sm:p-8">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors w-fit">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-bold uppercase tracking-wider">Dashboard</span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/50">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Official Rules</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Pot & Payouts */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6">
            <Coins className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">The Pot & Payouts</h2>
          </div>
          <ul className="space-y-4 text-zinc-300 text-sm leading-relaxed">
            <li className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <span className="font-bold text-zinc-400">Buy-In</span>
              <span className="font-mono text-white text-lg">$15</span>
            </li>
            <li className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <span className="font-bold text-zinc-400">Total Pot</span>
              <span className="font-mono font-black text-emerald-400 text-xl">$180</span>
            </li>
            <li className="flex items-center justify-between pt-2">
              <span className="font-bold text-amber-500">1st Place</span>
              <span className="font-mono text-white font-bold">$108 (60%)</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="font-bold text-zinc-400">2nd Place</span>
              <span className="font-mono text-white font-bold">$54 (30%)</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="font-bold text-orange-600">3rd Place</span>
              <span className="font-mono text-white font-bold">$18 (10%)</span>
            </li>
          </ul>
        </div>

        {/* Scoring System */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Scoring System</h2>
          </div>
          <p className="text-zinc-400 text-sm mb-4">
            Managers accumulate points based on the real-life performance of their drafted teams throughout the World Cup.
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-zinc-950/50 p-3 rounded-lg border border-zinc-800">
              <span className="font-bold text-emerald-400">Win</span>
              <span className="font-mono font-black text-white text-lg">3 pts</span>
            </div>
            <div className="flex items-center justify-between bg-zinc-950/50 p-3 rounded-lg border border-zinc-800">
              <span className="font-bold text-zinc-400">Draw</span>
              <span className="font-mono font-black text-white text-lg">1 pt</span>
            </div>
            <div className="flex items-center justify-between bg-zinc-950/50 p-3 rounded-lg border border-zinc-800">
              <span className="font-bold text-rose-400">Loss</span>
              <span className="font-mono font-black text-zinc-500 text-lg">0 pts</span>
            </div>
          </div>
        </div>

        {/* Tiebreakers */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-md md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Tiebreakers</h2>
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed mb-4">
            If two or more managers finish the tournament with the exact same number of points, the leaderboard relies on the following tiebreakers to determine the final rankings:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-zinc-300 text-sm font-medium">
            <li><span className="text-white font-bold">Total Goal Difference (GD):</span> The combined goal difference of all teams owned by the manager.</li>
            <li><span className="text-white font-bold">Most Wins:</span> The manager whose teams have accumulated the most overall wins.</li>
            <li><span className="text-white font-bold">Goals Scored:</span> The manager whose teams have scored the most total goals.</li>
          </ol>
        </div>

        {/* Head-to-Head */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-md md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-5 h-5 text-fuchsia-400" />
            <h2 className="text-xl font-bold text-white">Head-to-Head Matches</h2>
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed">
            When two teams owned by different managers play against each other, it's a direct Head-to-Head matchup! You can see who owns which team by expanding the match cards on the <strong>Matches</strong> tab. If you win a Head-to-Head, you take 3 points while your opponent gets nothing, making these the highest-stakes games in the sweepstakes.
          </p>
        </div>

      </div>
    </div>
  );
}
