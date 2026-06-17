import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface RawTeam {
  _id: string;
  name_en: string;
  name_fa: string;
  flag: string;
  fifa_code: string;
  iso2: string;
  groups: string;
  id: string;
}

interface RawMatch {
  _id: string;
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
  persian_date: string;
  stadium_id: string;
  finished: string;
  time_elapsed: string;
  type: string;
  home_team_name_en?: string;
  away_team_name_en?: string;
}

interface NormalizedTeam {
  id: string;
  name: string;
  code: string;
  flag: string;
  group: string;
  rank: number;
  pool: number;
}

interface NormalizedMatch {
  id: string;
  home_team_id: string;
  away_team_id: string;
  home_score: number;
  away_score: number;
  status: 'SCHEDULED' | 'LIVE' | 'HALF_TIME' | 'FINISHED';
  minute: number;
  group: string;
  kickoff: string;
}

const normalizationMap: Record<string, string> = {
  'Czech Republic': 'Czechia',
  'United States': 'USA',
  'Bosnia and Herzegovina': 'Bosnia & Herzegovina',
  'Democratic Republic of the Congo': 'DR Congo',
};

async function seed() {
  console.log('Starting World Cup 2026 Sweepstakes Seeding...');

  try {
    // 1. Fetch Teams
    console.log('Fetching teams from worldcup26.ir/get/teams...');
    const teamsRes = await fetch('https://worldcup26.ir/get/teams');
    const teamsObj = (await teamsRes.json()) as { teams: RawTeam[] };
    const rawTeams = teamsObj.teams;
    console.log(`Fetched ${rawTeams.length} teams.`);

    // 2. Fetch Matches
    console.log('Fetching games from worldcup26.ir/get/games...');
    const gamesRes = await fetch('https://worldcup26.ir/get/games');
    const gamesObj = (await gamesRes.json()) as { games: RawMatch[] };
    const rawMatches = gamesObj.games;
    console.log(`Fetched ${rawMatches.length} total matches.`);

    // 3. Fetch FIFA rankings
    console.log('Fetching rankings from salah23222/worldcup2026 GitHub raw feed...');
    const rankingsRes = await fetch(
      'https://raw.githubusercontent.com/salah23222/worldcup2026/main/data/rankings.json'
    );
    const rankings = (await rankingsRes.json()) as Record<string, number>;

    // 4. Match and normalize teams
    const normalizedTeams: NormalizedTeam[] = [];

    for (const team of rawTeams) {
      const name = team.name_en;
      let rank = rankings[name];
      if (rank === undefined) {
        const normalizedName = normalizationMap[name] || name;
        rank = rankings[normalizedName];
      }

      // Hardcode Sweden's ranking to 28 if missing
      if (rank === undefined && name === 'Sweden') {
        rank = 28;
      }

      if (rank === undefined) {
        console.warn(`WARNING: Could not find ranking for team "${name}". Defaulting to 99.`);
        rank = 99;
      }

      normalizedTeams.push({
        id: team.id,
        name: team.name_en,
        code: team.fifa_code,
        flag: team.flag,
        group: team.groups,
        rank: rank,
        pool: 0, // Assigned below
      });
    }

    // 5. Assign Pools (1-4)
    // Sort all 48 teams by their ranking ascending (lower rank number = better team)
    normalizedTeams.sort((a, b) => a.rank - b.rank);

    // Split into 4 pools of 12
    for (let i = 0; i < normalizedTeams.length; i++) {
      const pool = Math.floor(i / 12) + 1;
      normalizedTeams[i].pool = pool;
    }

    // Sort back by ID or name for convenience
    normalizedTeams.sort((a, b) => Number(a.id) - Number(b.id));

    // Print pools count for verification
    const poolCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
    normalizedTeams.forEach((t) => poolCounts[t.pool]++);
    console.log('Pool distribution:', poolCounts);

    // 6. Filter and Normalize Matches
    const groupMatches = rawMatches.filter((m) => m.type === 'group');
    console.log(`Filtered down to ${groupMatches.length} group stage matches.`);

    const normalizedMatches: NormalizedMatch[] = groupMatches.map((m) => {
      let status: NormalizedMatch['status'] = 'SCHEDULED';
      let minute = 0;

      if (m.finished === 'TRUE' || m.time_elapsed === 'finished') {
        status = 'FINISHED';
      } else if (m.time_elapsed === 'notstarted') {
        status = 'SCHEDULED';
      } else if (m.time_elapsed === 'h-t') {
        status = 'HALF_TIME';
        minute = 45;
      } else {
        status = 'LIVE';
        minute = parseInt(m.time_elapsed) || 0;
      }

      return {
        id: m.id,
        home_team_id: m.home_team_id,
        away_team_id: m.away_team_id,
        home_score: parseInt(m.home_score) || 0,
        away_score: parseInt(m.away_score) || 0,
        status,
        minute,
        group: m.group,
        kickoff: m.local_date, // E.g., "06/11/2026 13:00"
      };
    });

    // 7. Save to JSON files
    const dataDir = path.join(__dirname);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(dataDir, 'teams.json'),
      JSON.stringify(normalizedTeams, null, 2)
    );
    fs.writeFileSync(
      path.join(dataDir, 'matches.json'),
      JSON.stringify(normalizedMatches, null, 2)
    );

    console.log('Seeding completed successfully!');
    console.log(`Saved ${normalizedTeams.length} teams to teams.json`);
    console.log(`Saved ${normalizedMatches.length} matches to matches.json`);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seed();
