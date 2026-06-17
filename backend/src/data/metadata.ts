import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface Team {
  id: string;
  name: string;
  code: string;
  flag: string;
  group: string;
  rank: number;
  pool: number;
}

export interface Match {
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

let cachedTeams: Team[] | null = null;
let cachedMatches: Match[] | null = null;

export function getTeams(): Team[] {
  if (cachedTeams) return cachedTeams;
  
  const teamsPath = path.join(__dirname, 'teams.json');
  if (!fs.existsSync(teamsPath)) {
    throw new Error(`teams.json not found at ${teamsPath}. Please run seeder first.`);
  }
  
  const data = fs.readFileSync(teamsPath, 'utf-8');
  cachedTeams = JSON.parse(data) as Team[];
  return cachedTeams;
}

export function getMatches(): Match[] {
  if (cachedMatches) return cachedMatches;
  
  const matchesPath = path.join(__dirname, 'matches.json');
  if (!fs.existsSync(matchesPath)) {
    throw new Error(`matches.json not found at ${matchesPath}. Please run seeder first.`);
  }
  
  const data = fs.readFileSync(matchesPath, 'utf-8');
  cachedMatches = JSON.parse(data) as Match[];
  return cachedMatches;
}

export function getTeamById(id: string): Team | undefined {
  return getTeams().find(t => t.id === id);
}

export function getTeamByCode(code: string): Team | undefined {
  return getTeams().find(t => t.code === code);
}

export function getMatchById(id: string): Match | undefined {
  return getMatches().find(m => m.id === id);
}

export function getTeamsByPool(pool: number): Team[] {
  return getTeams().filter(t => t.pool === pool);
}
