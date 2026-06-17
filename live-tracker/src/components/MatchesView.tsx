"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ChevronDown, ChevronUp, Clock, CalendarDays, Swords, Trophy, BookOpen } from "lucide-react";

interface MatchData {
  match_id: string;
  status: string;
  group: string;
  kickoff: string;
  matchday: string;
  type: string;
  home_team: {
    id: string;
    name: string;
    code: string;
    flag: string;
    score: number;
    owner: string | null;
    scorers: string[];
  };
  away_team: {
    id: string;
    name: string;
    code: string;
    flag: string;
    score: number;
    owner: string | null;
    scorers: string[];
  };
}

function getDateLabel(dateStr: string): string {
  // dateStr is like "06/13/2026"
  const [month, day] = dateStr.split('/');
  const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(month)]} ${parseInt(day)}`;
}

function isToday(dateStr: string): boolean {
  const now = new Date();
  const todayStr = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/${now.getFullYear()}`;
  return dateStr === todayStr;
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

export default function MatchesView({ allMatches }: { allMatches: MatchData[] }) {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('highlight');

  // Extract unique dates and sort chronologically
  const allDates = [...new Set(allMatches.map(m => m.kickoff.split(' ')[0]))].sort((a, b) => {
    const [am, ad, ay] = a.split('/').map(Number);
    const [bm, bd, by] = b.split('/').map(Number);
    return new Date(ay, am - 1, ad).getTime() - new Date(by, bm - 1, bd).getTime();
  });

  // Default to today's date, or the first date with matches
  const todayDate = allDates.find(d => isToday(d)) || allDates[0];
  const [selectedDate, setSelectedDate] = useState(todayDate);
  const [expandedMatch, setExpandedMatch] = useState<string | null>(highlightId);
  const [timezone, setTimezone] = useState<'EST' | 'PST'>('EST');

  // Auto-expand highlighted match
  useEffect(() => {
    if (highlightId) {
      const match = allMatches.find(m => m.match_id === highlightId);
      if (match) {
        setSelectedDate(match.kickoff.split(' ')[0]);
        setExpandedMatch(highlightId);
      }
    }
  }, [highlightId, allMatches]);

  const filteredMatches = allMatches.filter(m => m.kickoff.startsWith(selectedDate));

  // Group filtered matches by status
  const liveMatches = filteredMatches.filter(m => m.status === 'LIVE');
  const upcomingMatches = filteredMatches.filter(m => m.status === 'SCHEDULED');
  const finishedMatches = filteredMatches.filter(m => m.status === 'FINISHED');
  const orderedMatches = [...liveMatches, ...upcomingMatches, ...finishedMatches];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-20">
      {/* Navigation */}
      <div className="flex flex-wrap flex-col sm:flex-row items-center justify-between gap-4 w-full">
        <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors w-fit">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-bold uppercase tracking-wider">Dashboard</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link href="/rules" className="flex items-center gap-2 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 px-4 py-2 rounded-xl transition-colors text-zinc-400 hover:text-white">
            <BookOpen className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Rules</span>
          </Link>

          {/* Timezone Toggle */}
          <div className="flex items-center bg-zinc-900/50 rounded-xl border border-zinc-800 p-1">
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
        </div>
      </div>

      <h1 className="text-2xl font-black text-white tracking-tight">Match Schedule</h1>

      {/* Date Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {allDates.map(date => {
          const isSelected = date === selectedDate;
          const today = isToday(date);
          const hasLive = allMatches.some(m => m.kickoff.startsWith(date) && m.status === 'LIVE');
          return (
            <button
              key={date}
              onClick={() => { setSelectedDate(date); setExpandedMatch(null); }}
              className={`relative flex-shrink-0 px-4 py-2 rounded-lg text-sm font-bold transition-all border ${
                isSelected
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                  : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-300'
              }`}
            >
              {today ? 'Today' : getDateLabel(date)}
              {hasLive && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Match List */}
      <div className="space-y-3">
        {orderedMatches.length === 0 && (
          <p className="text-zinc-500 text-sm text-center py-12">No matches on this date.</p>
        )}
        {orderedMatches.map(match => {
          const isExpanded = expandedMatch === match.match_id;
          const isLive = match.status === 'LIVE';

          return (
            <div key={match.match_id} className={`rounded-2xl border transition-all overflow-hidden ${
              isLive 
                ? 'bg-zinc-900/80 border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.06)]' 
                : 'bg-zinc-900/40 border-zinc-800/80'
            } backdrop-blur-md`}>
              {/* Match Summary Row (clickable) */}
              <button
                onClick={() => setExpandedMatch(isExpanded ? null : match.match_id)}
                className="w-full p-5 flex items-center gap-4 cursor-pointer text-left hover:bg-zinc-800/30 transition-colors"
              >
                {/* Time / Status */}
                <div className="w-16 flex-shrink-0 text-center">
                  {isLive ? (
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full animate-pulse">LIVE</span>
                  ) : match.status === 'FINISHED' ? (
                    <span className="text-xs font-bold text-zinc-500">FT</span>
                  ) : (
                    <span className="text-[10px] font-bold text-zinc-400">{formatTime(match.kickoff, timezone)}</span>
                  )}
                </div>

                {/* Home Team */}
                <div className="flex-1 flex items-center gap-3 justify-end">
                  <div className="text-right">
                    <div className="font-bold text-white text-sm">{match.home_team.name}</div>
                    {match.home_team.owner && <div className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">{match.home_team.owner}</div>}
                  </div>
                  <img src={match.home_team.flag} alt={match.home_team.code} className="w-8 h-5 rounded-sm object-cover shadow-sm" />
                </div>

                {/* Score */}
                <div className="w-20 flex-shrink-0 text-center">
                  <span className="text-xl font-black text-white tabular-nums">{match.home_team.score} - {match.away_team.score}</span>
                </div>

                {/* Away Team */}
                <div className="flex-1 flex items-center gap-3">
                  <img src={match.away_team.flag} alt={match.away_team.code} className="w-8 h-5 rounded-sm object-cover shadow-sm" />
                  <div>
                    <div className="font-bold text-white text-sm">{match.away_team.name}</div>
                    {match.away_team.owner && <div className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">{match.away_team.owner}</div>}
                  </div>
                </div>

                {/* Group + Expand */}
                <div className="w-20 flex-shrink-0 flex items-center justify-end gap-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">GRP {match.group}</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                </div>
              </button>

              {/* Expanded Match Detail */}
              {isExpanded && (
                <div className="border-t border-zinc-800/50 bg-zinc-950/60 p-6 space-y-6">
                  {/* Large Scoreboard */}
                  <div className="flex items-center justify-center gap-8">
                    <div className="flex flex-col items-center gap-3">
                      <img src={match.home_team.flag} alt={match.home_team.name} className="w-20 h-14 rounded-lg object-cover shadow-xl border border-zinc-800" />
                      <div className="text-center">
                        <div className="text-lg font-black text-white">{match.home_team.name}</div>
                        <div className="text-zinc-500 font-bold text-xs">{match.home_team.code}</div>
                      </div>
                    </div>

                    <div className="text-5xl font-black text-white tabular-nums tracking-tight">
                      {match.home_team.score} - {match.away_team.score}
                    </div>

                    <div className="flex flex-col items-center gap-3">
                      <img src={match.away_team.flag} alt={match.away_team.name} className="w-20 h-14 rounded-lg object-cover shadow-xl border border-zinc-800" />
                      <div className="text-center">
                        <div className="text-lg font-black text-white">{match.away_team.name}</div>
                        <div className="text-zinc-500 font-bold text-xs">{match.away_team.code}</div>
                      </div>
                    </div>
                  </div>

                  {/* Goal Scorers */}
                  {(match.home_team.scorers.length > 0 || match.away_team.scorers.length > 0) && (
                    <div className="bg-zinc-900/50 rounded-xl border border-zinc-800/50 p-4">
                      <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">⚽ Goal Scorers</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          {match.home_team.scorers.map((s: string, i: number) => (
                            <div key={i} className="text-sm text-zinc-300 flex items-center gap-2">
                              <span className="text-emerald-400">⚽</span> {s}
                            </div>
                          ))}
                        </div>
                        <div className="space-y-1">
                          {match.away_team.scorers.map((s: string, i: number) => (
                            <div key={i} className="text-sm text-zinc-300 flex items-center gap-2">
                              <span className="text-emerald-400">⚽</span> {s}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Head to Head - Sweepstakes Impact */}
                  {(match.home_team.owner || match.away_team.owner) && (
                    <div className="bg-zinc-900/50 rounded-xl border border-zinc-800/50 p-4">
                      <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Swords className="w-4 h-4" /> Sweepstakes Head-to-Head
                      </h4>
                      <div className="flex items-center justify-center gap-6">
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-sm">
                            {match.home_team.owner ? match.home_team.owner.charAt(0) : '?'}
                          </div>
                          <span className="text-xs text-zinc-300 font-bold">{match.home_team.owner || 'Unowned'}</span>
                          <span className="text-[10px] text-zinc-500">{match.home_team.name}</span>
                        </div>
                        <div className="text-zinc-600 font-bold text-xs uppercase tracking-widest">vs</div>
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-sm">
                            {match.away_team.owner ? match.away_team.owner.charAt(0) : '?'}
                          </div>
                          <span className="text-xs text-zinc-300 font-bold">{match.away_team.owner || 'Unowned'}</span>
                          <span className="text-[10px] text-zinc-500">{match.away_team.name}</span>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-500 text-center mt-3">
                        {match.home_team.owner && match.away_team.owner
                          ? `${match.home_team.owner} vs ${match.away_team.owner} — Winner takes 3 pts, draw gives 1 pt each`
                          : match.home_team.owner
                            ? `${match.home_team.owner} looking to secure 3 pts with ${match.home_team.name}`
                            : `${match.away_team.owner} looking to secure 3 pts with ${match.away_team.name}`
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
