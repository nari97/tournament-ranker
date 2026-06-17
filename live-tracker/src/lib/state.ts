import path from 'path';
import fs from 'fs';

interface Team {
  id: string;
  name: string;
  code: string;
  flag: string;
  group: string;
  rank: number;
  pool: number;
}

interface ApiMatch {
  id: string;
  home_team_id: string;
  away_team_id: string;
  home_score: string;
  away_score: string;
  home_scorers: string;
  away_scorers: string;
  group: string;
  matchday: string;
  local_date: string;
  stadium_id: string;
  finished: string;
  time_elapsed: string;
  type: string;
  home_team_name_en: string;
  away_team_name_en: string;
}

function parseScorers(raw: string): string[] {
  if (!raw || raw === 'null') return [];
  try {
    // The API returns scorers in a Postgres-style array string like {"Scorer 1","Scorer 2"}
    const cleaned = raw.replace(/^\{/, '').replace(/\}$/, '');
    if (!cleaned || cleaned === 'null') return [];
    // Split by "," but handle quoted strings
    const scorers: string[] = [];
    let current = '';
    let inQuote = false;
    for (const char of cleaned) {
      if (char === '"') {
        inQuote = !inQuote;
      } else if (char === ',' && !inQuote) {
        if (current.trim()) scorers.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    if (current.trim()) scorers.push(current.trim());
    return scorers;
  } catch {
    return [];
  }
}

function mapStatus(apiMatch: ApiMatch): 'LIVE' | 'FINISHED' | 'SCHEDULED' {
  if (apiMatch.time_elapsed === 'live') return 'LIVE';
  if (apiMatch.finished === 'TRUE' || apiMatch.time_elapsed === 'finished') return 'FINISHED';
  return 'SCHEDULED';
}

export async function getSweepstakesState() {
  const teamsPath = path.join(process.cwd(), 'src/data/teams.json');
  const squadsPath = path.join(process.cwd(), 'src/data/squads.json');

  const teams: Team[] = JSON.parse(fs.readFileSync(teamsPath, 'utf-8'));
  const squadsData = JSON.parse(fs.readFileSync(squadsPath, 'utf-8'));

  // Fetch live match data from the real API
  let apiMatches: ApiMatch[] = [];
  try {
    const res = await fetch('https://worldcup26.ir/get/games', {
      next: { revalidate: 30 }, // Cache for 30 seconds in Next.js
    });
    const data = await res.json();
    apiMatches = data.games || [];
  } catch (err) {
    console.error('Failed to fetch live match data, falling back to static file:', err);
    // Fallback to static file if API is down
    const matchesPath = path.join(process.cwd(), 'src/data/matches.json');
    const staticMatches = JSON.parse(fs.readFileSync(matchesPath, 'utf-8'));
    apiMatches = staticMatches.map((m: any) => ({
      id: m.id,
      home_team_id: m.home_team_id,
      away_team_id: m.away_team_id,
      home_score: String(m.home_score),
      away_score: String(m.away_score),
      home_scorers: 'null',
      away_scorers: 'null',
      group: m.group,
      matchday: '1',
      local_date: m.kickoff,
      stadium_id: '1',
      finished: m.status === 'FINISHED' ? 'TRUE' : 'FALSE',
      time_elapsed: m.status === 'LIVE' ? 'live' : m.status === 'FINISHED' ? 'finished' : 'notstarted',
      type: 'group',
      home_team_name_en: '',
      away_team_name_en: '',
    }));
  }

  // Compute team stats from live data
  const teamStats = new Map<string, { points: number; gd: number; mp: number; w: number; d: number; l: number }>();
  teams.forEach(t => teamStats.set(t.code, { points: 0, gd: 0, mp: 0, w: 0, d: 0, l: 0 }));

  apiMatches.forEach(m => {
    const status = mapStatus(m);
    if (status === 'FINISHED' || status === 'LIVE') {
      const homeTeam = teams.find(t => t.id === m.home_team_id);
      const awayTeam = teams.find(t => t.id === m.away_team_id);

      if (homeTeam && awayTeam) {
        const homeStats = teamStats.get(homeTeam.code)!;
        const awayStats = teamStats.get(awayTeam.code)!;
        const homeScore = parseInt(m.home_score) || 0;
        const awayScore = parseInt(m.away_score) || 0;

        homeStats.mp++;
        awayStats.mp++;

        homeStats.gd += homeScore - awayScore;
        awayStats.gd += awayScore - homeScore;

        if (homeScore > awayScore) {
          homeStats.w++;
          homeStats.points += 3;
          awayStats.l++;
        } else if (homeScore < awayScore) {
          awayStats.w++;
          awayStats.points += 3;
          homeStats.l++;
        } else {
          homeStats.d++;
          homeStats.points += 1;
          awayStats.d++;
          awayStats.points += 1;
        }
      }
    }
  });

  // Build leaderboard
  const leaderboard = squadsData.players.map((player: any) => {
    let total_points = 0;
    let total_goal_difference = 0;

    const squad = player.squad.map((teamCode: string) => {
      const teamInfo = teams.find(t => t.code === teamCode)!;
      const stats = teamStats.get(teamCode)!;

      total_points += stats.points;
      total_goal_difference += stats.gd;

      return {
        team_id: teamInfo.id,
        name: teamInfo.name,
        code: teamInfo.code,
        flag: teamInfo.flag,
        mp: stats.mp,
        w: stats.w,
        d: stats.d,
        l: stats.l,
        points: stats.points,
        gd: stats.gd,
      };
    });

    return {
      player_name: player.player_name,
      total_points,
      total_goal_difference,
      squad,
    };
  });

  leaderboard.sort((a: any, b: any) => {
    if (b.total_points !== a.total_points) return b.total_points - a.total_points;
    return b.total_goal_difference - a.total_goal_difference;
  });

  leaderboard.forEach((player: any, index: number) => (player.rank = index + 1));

  // Build owner lookup
  const ownerByTeamCode = new Map<string, string>();
  squadsData.players.forEach((p: any) => {
    p.squad.forEach((code: string) => {
      ownerByTeamCode.set(code, p.player_name);
    });
  });

  // Build all matches with hydrated team data
  const all_matches = apiMatches.map(m => {
    const homeTeam = teams.find(t => t.id === m.home_team_id);
    const awayTeam = teams.find(t => t.id === m.away_team_id);
    const homeScore = parseInt(m.home_score) || 0;
    const awayScore = parseInt(m.away_score) || 0;

    return {
      match_id: m.id,
      status: mapStatus(m),
      group: m.group,
      kickoff: m.local_date,
      matchday: m.matchday,
      type: m.type,
      home_team: {
        id: homeTeam?.id || '',
        name: homeTeam?.name || m.home_team_name_en,
        code: homeTeam?.code || '',
        flag: homeTeam?.flag || '',
        score: homeScore,
        owner: homeTeam ? ownerByTeamCode.get(homeTeam.code) || null : null,
        scorers: parseScorers(m.home_scorers),
      },
      away_team: {
        id: awayTeam?.id || '',
        name: awayTeam?.name || m.away_team_name_en,
        code: awayTeam?.code || '',
        flag: awayTeam?.flag || '',
        score: awayScore,
        owner: awayTeam ? ownerByTeamCode.get(awayTeam.code) || null : null,
        scorers: parseScorers(m.away_scorers),
      },
    };
  });

  return {
    payouts: squadsData.payouts,
    totalPot: squadsData.totalPot,
    leaderboard,
    all_matches,
  };
}
