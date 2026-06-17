import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Revalidate this route every 60 seconds (ISR)
export const revalidate = 60;

interface Team {
  id: string;
  name: string;
  code: string;
  flag: string;
  group: string;
  rank: number;
  pool: number;
}

interface Match {
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

import { getSweepstakesState } from '@/lib/state';

export async function GET() {
  try {
    const state = await getSweepstakesState();
    return NextResponse.json({
      system: {
        last_fetch: new Date().toISOString(),
        cache_age_sec: 0
      },
      ...state
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
