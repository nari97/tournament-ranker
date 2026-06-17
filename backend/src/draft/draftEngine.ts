import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getTeams, Team } from '../data/metadata.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface DraftPlayer {
  name: string;
  has_retry: boolean;
  squad: string[]; // Team codes
  blocked_groups: string[]; // Group letters
}

export interface DraftState {
  players: DraftPlayer[];
  currentRound: number; // 1 to 4
  currentTurnIndex: number; // Index in turnOrder
  turnOrder: number[]; // Indices of players in the round's turn order
  status: 'SETUP' | 'DRAFTING' | 'COMPLETED';
  drawnTeamCode: string | null;
  draftedTeamCodes: string[]; // All teams drafted so far
  mulliganUsedThisTurn: boolean;
  entryFee: number;
}

const STATE_FILE_PATH = path.join(__dirname, 'draft_state.json');
const SQUADS_FILE_PATH = path.join(__dirname, '../data/squads.json');

export class DraftEngine {
  private state: DraftState;

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): DraftState {
    if (fs.existsSync(STATE_FILE_PATH)) {
      try {
        const data = fs.readFileSync(STATE_FILE_PATH, 'utf-8');
        return JSON.parse(data) as DraftState;
      } catch (err) {
        console.error('Failed to parse draft state file, creating new state:', err);
      }
    }
    return this.getInitialState();
  }

  private saveState(): void {
    fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(this.state, null, 2));
  }

  private getInitialState(): DraftState {
    return {
      players: [],
      currentRound: 1,
      currentTurnIndex: 0,
      turnOrder: [],
      status: 'SETUP',
      drawnTeamCode: null,
      draftedTeamCodes: [],
      mulliganUsedThisTurn: false,
      entryFee: 0,
    };
  }

  public resetDraft(): void {
    this.state = this.getInitialState();
    this.saveState();
    if (fs.existsSync(SQUADS_FILE_PATH)) {
      fs.unlinkSync(SQUADS_FILE_PATH);
    }
  }

  public initDraft(playerNames: string[], entryFee: number = 10): DraftState {
    if (playerNames.length < 8 || playerNames.length > 12) {
      throw new Error('Draft requires between 8 and 12 players.');
    }

    const players: DraftPlayer[] = playerNames.map(name => ({
      name,
      has_retry: true,
      squad: [],
      blocked_groups: [],
    }));

    this.state = {
      players,
      currentRound: 1,
      currentTurnIndex: 0,
      turnOrder: this.generateShuffledOrder(players.length),
      status: 'DRAFTING',
      drawnTeamCode: null,
      draftedTeamCodes: [],
      mulliganUsedThisTurn: false,
      entryFee,
    };

    // Draw first team for the first player
    this.drawCurrentPlayerTeam();
    this.saveState();
    return this.state;
  }

  private generateShuffledOrder(length: number): number[] {
    const indices = Array.from({ length }, (_, i) => i);
    // Fisher-Yates shuffle
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  }

  public getState() {
    if (this.state.status === 'SETUP') {
      return { status: 'SETUP' };
    }

    const currentPlayerIndex = this.state.turnOrder[this.state.currentTurnIndex];
    const currentPlayer = this.state.players[currentPlayerIndex];

    const canRetry = this.evaluateCanRetry(currentPlayer);

    return {
      ...this.state,
      currentPlayerName: currentPlayer.name,
      currentPlayerIndex,
      canRetry,
      drawnTeam: this.state.drawnTeamCode ? getTeams().find(t => t.code === this.state.drawnTeamCode) : null,
    };
  }

  private drawCurrentPlayerTeam(): void {
    const currentPlayerIndex = this.state.turnOrder[this.state.currentTurnIndex];
    const player = this.state.players[currentPlayerIndex];

    const allTeams = getTeams();
    const poolTeams = allTeams.filter(t => t.pool === this.state.currentRound);

    // Filter out already drafted teams and teams from blocked groups
    let validTeams = poolTeams.filter(
      t => !this.state.draftedTeamCodes.includes(t.code) && !player.blocked_groups.includes(t.group)
    );

    // Bipartite Deadlock Fallback: if no valid teams exist for this player, bypass group conflict check
    if (validTeams.length === 0) {
      console.warn(`[DraftEngine] Deadlock fallback triggered for player ${player.name} in Round ${this.state.currentRound}`);
      validTeams = poolTeams.filter(t => !this.state.draftedTeamCodes.includes(t.code));
    }

    if (validTeams.length === 0) {
      throw new Error(`Critical Draft Error: No teams available in Pool ${this.state.currentRound}`);
    }

    // Select random team
    const randomIndex = Math.floor(Math.random() * validTeams.length);
    this.state.drawnTeamCode = validTeams[randomIndex].code;
    this.state.mulliganUsedThisTurn = false;
  }

  private evaluateCanRetry(player: DraftPlayer): boolean {
    if (!player.has_retry || this.state.mulliganUsedThisTurn) {
      return false;
    }

    const currentDrawnTeam = getTeams().find(t => t.code === this.state.drawnTeamCode);
    if (!currentDrawnTeam) return false;

    const allTeams = getTeams();
    const poolTeams = allTeams.filter(t => t.pool === this.state.currentRound);

    // Find alternative teams: undrafted, not in blocked groups, and NOT the currently drawn team
    const alternatives = poolTeams.filter(
      t =>
        t.code !== currentDrawnTeam.code &&
        !this.state.draftedTeamCodes.includes(t.code) &&
        !player.blocked_groups.includes(t.group)
    );

    return alternatives.length > 0;
  }

  public acceptTeam(): DraftState {
    if (this.state.status !== 'DRAFTING' || !this.state.drawnTeamCode) {
      throw new Error('No draft in progress or no team drawn.');
    }

    const currentPlayerIndex = this.state.turnOrder[this.state.currentTurnIndex];
    const player = this.state.players[currentPlayerIndex];
    const drawnTeam = getTeams().find(t => t.code === this.state.drawnTeamCode)!;

    // Add to squad
    player.squad.push(drawnTeam.code);
    player.blocked_groups.push(drawnTeam.group);
    this.state.draftedTeamCodes.push(drawnTeam.code);

    this.advanceTurn();
    this.saveState();
    return this.state;
  }

  public retryTeam(): DraftState {
    if (this.state.status !== 'DRAFTING' || !this.state.drawnTeamCode) {
      throw new Error('No draft in progress or no team drawn.');
    }

    const currentPlayerIndex = this.state.turnOrder[this.state.currentTurnIndex];
    const player = this.state.players[currentPlayerIndex];

    if (!this.evaluateCanRetry(player)) {
      throw new Error('VAR Overturn is not allowed or unavailable.');
    }

    const currentDrawnTeam = getTeams().find(t => t.code === this.state.drawnTeamCode)!;
    const allTeams = getTeams();
    const poolTeams = allTeams.filter(t => t.pool === this.state.currentRound);

    // Find valid alternative teams (excluding current drawn team)
    const alternatives = poolTeams.filter(
      t =>
        t.code !== currentDrawnTeam.code &&
        !this.state.draftedTeamCodes.includes(t.code) &&
        !player.blocked_groups.includes(t.group)
    );

    if (alternatives.length === 0) {
      throw new Error('No alternative teams available to redraw.');
    }

    // Select random alternative
    const randomIndex = Math.floor(Math.random() * alternatives.length);
    const newTeam = alternatives[randomIndex];

    // Burn mulligan token and mark turn state
    player.has_retry = false;
    this.state.mulliganUsedThisTurn = true;

    // Assign the new team as the current drawn team code, but do NOT advance turn yet
    this.state.drawnTeamCode = newTeam.code;

    this.saveState();
    return this.state;
  }

  private advanceTurn(): void {
    this.state.drawnTeamCode = null;
    this.state.currentTurnIndex++;

    // Check if round is complete
    if (this.state.currentTurnIndex >= this.state.players.length) {
      this.state.currentRound++;
      this.state.currentTurnIndex = 0;

      // Check if draft is complete
      if (this.state.currentRound > 4) {
        this.state.status = 'COMPLETED';
        this.exportSquads();
      } else {
        // Snake Draft (ABBA) order: Reverse turn order for Round 2 and Round 4
        if (this.state.currentRound === 2 || this.state.currentRound === 4) {
          this.state.turnOrder.reverse();
        }
        this.drawCurrentPlayerTeam();
      }
    } else {
      this.drawCurrentPlayerTeam();
    }
  }

  private exportSquads(): void {
    const squads = this.state.players.map(p => ({
      player_name: p.name,
      has_retry: p.has_retry,
      squad: p.squad,
    }));
    
    const exportData = {
      entryFee: this.state.entryFee,
      totalPot: this.state.entryFee * this.state.players.length,
      payouts: {
        first: this.state.entryFee * this.state.players.length * 0.6,
        second: this.state.entryFee * this.state.players.length * 0.3,
        third: this.state.entryFee * this.state.players.length * 0.1,
      },
      players: squads,
    };

    fs.writeFileSync(SQUADS_FILE_PATH, JSON.stringify(exportData, null, 2));
    console.log(`[DraftEngine] Successfully exported squads to ${SQUADS_FILE_PATH}`);
  }
}
export const draftEngine = new DraftEngine();
