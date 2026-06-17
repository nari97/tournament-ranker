"use client";

import { useState } from "react";
import Link from "next/link";
import { Trophy, Activity, ChevronDown, ChevronUp, Clock, DollarSign, CalendarDays, ArrowRight, BookOpen } from "lucide-react";

export default function Dashboard({ initialState }: { initialState: any }) {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [timezone, setTimezone] = useState<'EST' | 'PST'>('EST');

  const toggleRow = (playerName: string) => {
    setExpandedRows(prev => ({ ...prev, [playerName]: !prev[playerName] }));
  };

  const { payouts, totalPot, leaderboard, all_matches } = initialState;

  // Get today's date string (MM/DD/YYYY format matching the API)
  const now = new Date();
  const todayStr = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/${now.getFullYear()}`;

  const todaysMatches = all_matches.filter((m: any) => m.kickoff.startsWith(todayStr));

  const liveMatches = todaysMatches.filter((m: any) => m.status === 'LIVE');
  const finishedMatches = todaysMatches.filter((m: any) => m.status === 'FINISHED');
  const upcomingMatches = todaysMatches.filter((m: any) => m.status === 'SCHEDULED');

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-20">
      
      {/* Header Panel */}
      <header className="flex flex-col md:flex-row items-center justify-between bg-zinc-900/50 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="flex items-center gap-4 z-10">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/50">
            <Trophy className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">World Cup &apos;26</h1>
            <p className="text-zinc-400 font-medium">Manager Standings</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center md:justify-end items-center gap-4 mt-6 md:mt-0 z-10 w-full md:w-auto">
          
          <Link href="/rules" className="flex items-center gap-2 bg-zinc-950/50 hover:bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl transition-colors text-zinc-400 hover:text-white">
            <BookOpen className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Rules</span>
          </Link>

          {/* Timezone Toggle */}
          <div className="flex items-center bg-zinc-950/50 rounded-xl border border-zinc-800 p-1">
            <button 
              onClick={() => setTimezone('PST')} 
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${timezone === 'PST' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              PST
            </button>
            <button 
              onClick={() => setTimezone('EST')} 
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${timezone === 'EST' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              EST
            </button>
          </div>

          {/* Pot Info */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 bg-zinc-950/50 p-4 rounded-xl border border-zinc-800 w-full sm:w-auto">
            <div className="flex flex-col items-center sm:items-end">
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Total Pot</span>
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span className="text-2xl font-black text-white">{totalPot}</span>
              </div>
            </div>
            <div className="hidden sm:block h-10 w-[1px] bg-zinc-800"></div>
            <div className="flex gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">1st</span>
                <span className="text-sm font-bold text-white">${payouts.first}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">2nd</span>
                <span className="text-sm font-bold text-white">${payouts.second}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">3rd</span>
                <span className="text-sm font-bold text-white">${payouts.third}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column: Today's Matches */}
        <div className="xl:col-span-4">
          <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-sm shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-white">Today&apos;s Matches</h2>
              </div>
              <Link href="/matches" className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-bold uppercase tracking-wider transition-colors">
                All Matches <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 scrollbar-thin">
              {liveMatches.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Now
                  </h3>
                  {liveMatches.map((m: any) => <MatchCard key={m.match_id} match={m} tz={timezone} />)}
                </div>
              )}

              {upcomingMatches.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" /> Upcoming
                  </h3>
                  {upcomingMatches.map((m: any) => <MatchCard key={m.match_id} match={m} tz={timezone} />)}
                </div>
              )}

              {finishedMatches.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Finished
                  </h3>
                  {finishedMatches.map((m: any) => <MatchCard key={m.match_id} match={m} tz={timezone} />)}
                </div>
              )}

              {todaysMatches.length === 0 && (
                <p className="text-zinc-500 text-sm text-center py-8">No matches scheduled today.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Leaderboard */}
        <div className="xl:col-span-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">Live Leaderboard</h2>
            </div>
            <span className="text-xs text-zinc-500 font-medium bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
              Updated Live
            </span>
          </div>

          <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-zinc-800 bg-zinc-900/80 text-xs font-bold text-zinc-400 uppercase tracking-wider">
              <div className="col-span-2 text-center">Rank</div>
              <div className="col-span-6">Manager</div>
              <div className="col-span-2 text-center">GD</div>
              <div className="col-span-2 text-center text-emerald-400">Pts</div>
            </div>

            {/* Manager Rows */}
            <div className="divide-y divide-zinc-800/50">
              {leaderboard.map((player: any) => {
                const isExpanded = expandedRows[player.player_name];
                return (
                  <div key={player.player_name} className="flex flex-col transition-colors hover:bg-zinc-800/20">
                    <button 
                      onClick={() => toggleRow(player.player_name)}
                      className="grid grid-cols-12 gap-4 p-4 items-center cursor-pointer w-full text-left focus:outline-none"
                    >
                      <div className="col-span-2 flex justify-center">
                        <RankBadge rank={player.rank} />
                      </div>
                      <div className="col-span-6 flex items-center gap-3">
                        <div className="font-bold text-white text-base">{player.player_name}</div>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                      </div>
                      <div className="col-span-2 text-center font-mono text-zinc-300">{player.total_goal_difference > 0 ? `+${player.total_goal_difference}` : player.total_goal_difference}</div>
                      <div className="col-span-2 text-center font-black text-lg text-white">{player.total_points}</div>
                    </button>

                    {/* Expanded Squad View */}
                    {isExpanded && (
                      <div className="bg-zinc-950/60 p-4 border-t border-zinc-800/50">
                        <div className="grid grid-cols-12 gap-4 px-4 pb-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                          <div className="col-span-5">Drafted Team</div>
                          <div className="col-span-1 text-center">MP</div>
                          <div className="col-span-1 text-center">W</div>
                          <div className="col-span-1 text-center">D</div>
                          <div className="col-span-1 text-center">L</div>
                          <div className="col-span-1 text-center">GD</div>
                          <div className="col-span-2 text-center">Pts</div>
                        </div>
                        <div className="space-y-1">
                          {player.squad.map((team: any) => (
                            <div key={team.code} className="grid grid-cols-12 gap-4 px-4 py-2.5 bg-zinc-900/50 rounded-lg items-center border border-zinc-800/30">
                              <div className="col-span-5 flex items-center gap-3">
                                <img src={team.flag} alt={team.name} className="w-6 h-4 rounded-sm object-cover shadow-sm" />
                                <span className="font-bold text-zinc-200 text-sm">{team.name} <span className="text-zinc-500 font-normal ml-1 text-xs">({team.code})</span></span>
                              </div>
                              <div className="col-span-1 text-center text-zinc-400 text-xs font-mono">{team.mp}</div>
                              <div className="col-span-1 text-center text-emerald-400 text-xs font-mono">{team.w}</div>
                              <div className="col-span-1 text-center text-zinc-400 text-xs font-mono">{team.d}</div>
                              <div className="col-span-1 text-center text-rose-400 text-xs font-mono">{team.l}</div>
                              <div className="col-span-1 text-center text-zinc-300 text-xs font-mono">{team.gd > 0 ? `+${team.gd}` : team.gd}</div>
                              <div className="col-span-2 text-center text-white font-bold text-sm">{team.points}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Subcomponents
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-400 flex items-center justify-center font-black text-sm shadow-[0_0_15px_rgba(245,158,11,0.2)]">1</div>;
  if (rank === 2) return <div className="w-8 h-8 rounded-full bg-slate-300/10 border border-slate-300/30 text-slate-300 flex items-center justify-center font-black text-sm">2</div>;
  if (rank === 3) return <div className="w-8 h-8 rounded-full bg-orange-700/20 border border-orange-700/40 text-orange-400 flex items-center justify-center font-black text-sm">3</div>;
  return <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 flex items-center justify-center font-bold text-sm">{rank}</div>;
}

function formatTime(kickoff: string, tz: 'EST' | 'PST') {
  if (!kickoff || !kickoff.includes(' ')) return '';
  const timePart = kickoff.split(' ')[1];
  if (!timePart) return '';
  const [hStr, mStr] = timePart.split(':');
  let h = parseInt(hStr, 10);
  if (tz === 'PST') {
    h -= 3;
    if (h < 0) h += 24;
  }
  return `${h.toString().padStart(2, '0')}:${mStr} ${tz}`;
}

function MatchCard({ match, tz }: { match: any; tz: 'EST' | 'PST' }) {
  const isLive = match.status === 'LIVE';
  
  return (
    <Link href={`/matches?highlight=${match.match_id}`} className="block group">
      <div className={`p-4 rounded-xl border transition-all ${isLive ? 'bg-zinc-900/80 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.05)]' : 'bg-zinc-900/40 border-zinc-800/80'} backdrop-blur-md hover:border-zinc-500 hover:bg-zinc-800/60`}>
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider group-hover:text-zinc-400 transition-colors">Group {match.group}</span>
          {isLive ? (
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full animate-pulse">LIVE</span>
          ) : (
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider group-hover:text-zinc-400 transition-colors">{match.status === 'FINISHED' ? 'FT' : formatTime(match.kickoff, tz)}</span>
          )}
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={match.home_team.flag} alt={match.home_team.code} className="w-6 h-4 rounded-sm object-cover" />
              <div className="flex flex-col">
                <span className="font-bold text-white text-sm">{match.home_team.name}</span>
                {match.home_team.owner && <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">MGR: {match.home_team.owner}</span>}
              </div>
            </div>
            <div className="font-mono text-lg font-bold text-white">{match.home_team.score}</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={match.away_team.flag} alt={match.away_team.code} className="w-6 h-4 rounded-sm object-cover" />
              <div className="flex flex-col">
                <span className="font-bold text-white text-sm">{match.away_team.name}</span>
                {match.away_team.owner && <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">MGR: {match.away_team.owner}</span>}
              </div>
            </div>
            <div className="font-mono text-lg font-bold text-white">{match.away_team.score}</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
