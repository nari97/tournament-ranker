import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DraftEngine } from '../draft/draftEngine.js';
import { getTeams, Team } from '../data/metadata.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SQUADS_FILE_PATH = path.join(__dirname, '../data/squads.json');

async function runTests() {
  console.log('===================================================');
  console.log('       Running Draft Engine Invariant Tests        ');
  console.log('===================================================');

  const engine = new DraftEngine();

  // Helper to reset files
  const cleanFiles = () => {
    engine.resetDraft();
  };

  // Test 1: Invalid Player Count
  try {
    cleanFiles();
    console.log('Test 1: Initializing draft with 5 players (should fail)...');
    engine.initDraft(['Ashok', 'Bhavs', 'Nari', 'John', 'Jane']);
    assert.fail('Should have thrown an error for < 8 players');
  } catch (err: any) {
    assert.strictEqual(err.message, 'Draft requires between 8 and 12 players.');
    console.log('✓ Test 1 Passed (Properly rejected small player count)');
  }

  // Test 2: Valid Initialization
  try {
    cleanFiles();
    console.log('Test 2: Initializing draft with 8 players...');
    const state = engine.initDraft([
      'Ashok',
      'Bhavs',
      'Nari',
      'John',
      'Jane',
      'Mike',
      'Sarah',
      'Dave',
    ]);
    assert.strictEqual(state.status, 'DRAFTING');
    assert.strictEqual(state.players.length, 8);
    assert.strictEqual(state.currentRound, 1);
    assert.strictEqual(state.currentTurnIndex, 0);
    assert.ok(state.drawnTeamCode !== null);
    console.log('✓ Test 2 Passed (Successful initialization)');
  } catch (err) {
    console.error('Test 2 Failed:', err);
    process.exit(1);
  }

  // Test 3: Mulligan Retry Mechanics
  try {
    cleanFiles();
    console.log('Test 3: Testing Mulligan retry mechanic...');
    const playerNames = ['Ashok', 'Bhavs', 'Nari', 'John', 'Jane', 'Mike', 'Sarah', 'Dave'];
    engine.initDraft(playerNames);
    
    // Get state for the first player
    const stateBefore = engine.getState();
    const firstPlayerIndex = stateBefore.currentPlayerIndex;
    const firstPlayer = stateBefore.players[firstPlayerIndex];
    const firstDrawnTeamCode = stateBefore.drawnTeamCode!;
    
    assert.strictEqual(firstPlayer.has_retry, true);
    assert.strictEqual(stateBefore.canRetry, true);

    // Trigger retry
    console.log(`Retrying team ${firstDrawnTeamCode} for player ${firstPlayer.name}...`);
    const stateAfterRetry = engine.retryTeam();
    
    // Check that the active player is still the same, but token is burned
    assert.strictEqual(stateAfterRetry.currentTurnIndex, 0); // Turn has NOT advanced yet
    const playerAfterRetry = stateAfterRetry.players[firstPlayerIndex];
    assert.strictEqual(playerAfterRetry.has_retry, false); // Token burned
    assert.strictEqual(playerAfterRetry.squad.length, 0); // No team in squad yet
    assert.notStrictEqual(stateAfterRetry.drawnTeamCode, firstDrawnTeamCode); // Drawn team has changed
    const newDrawnTeamCode = stateAfterRetry.drawnTeamCode!;

    // Now accept the retried team
    console.log(`Accepting retried team ${newDrawnTeamCode} for player ${firstPlayer.name}...`);
    const stateAfterAccept = engine.acceptTeam();

    // Since the team is accepted, turn should now advance
    assert.strictEqual(stateAfterAccept.currentTurnIndex, 1);
    const playerAfterAccept = stateAfterAccept.players[firstPlayerIndex];
    assert.strictEqual(playerAfterAccept.squad.length, 1);
    assert.strictEqual(playerAfterAccept.squad[0], newDrawnTeamCode); // Correct team accepted
    
    // Check that the retried team is in the active drafted list
    assert.ok(stateAfterAccept.draftedTeamCodes.includes(newDrawnTeamCode));
    // The original team should NOT be in drafted list (recirculated)
    assert.ok(!stateAfterAccept.draftedTeamCodes.includes(firstDrawnTeamCode));
    
    console.log('✓ Test 3 Passed (Mulligan correctly executed, token burned, team swapped)');
  } catch (err) {
    console.error('Test 3 Failed:', err);
    process.exit(1);
  }

  // Test 4: Complete Draft Simulation & Invariant Checks
  try {
    cleanFiles();
    console.log('Test 4: Simulating full draft of 8 players (32 total turns)...');
    const playerNames = ['Ashok', 'Bhavs', 'Nari', 'John', 'Jane', 'Mike', 'Sarah', 'Dave'];
    engine.initDraft(playerNames);

    let turnsCount = 0;
    while (engine.getState().status === 'DRAFTING') {
      const state = engine.getState();
      
      // Randomly retry some times to test retry mixed with accept
      const player = state.players[state.currentPlayerIndex];
      const shouldRetry = player.has_retry && state.canRetry && Math.random() > 0.6;
      
      if (shouldRetry) {
        engine.retryTeam();
      } else {
        engine.acceptTeam();
      }
      turnsCount++;
    }

    const finalState = engine.getState();
    assert.strictEqual(finalState.status, 'COMPLETED');
    console.log(`Draft completed in ${turnsCount} turns.`);

    // Invariant Check 1: 4 teams per player, 1 from each pool
    console.log('Checking Invariant 1: 4 teams per player, 1 from each Pool...');
    const allTeams = getTeams();
    
    for (const player of finalState.players) {
      assert.strictEqual(player.squad.length, 4);
      
      const pools = player.squad.map(code => {
        const team = allTeams.find(t => t.code === code)!;
        return team.pool;
      });
      
      // Sort and verify pools are exactly [1, 2, 3, 4]
      pools.sort((a, b) => a - b);
      assert.deepStrictEqual(pools, [1, 2, 3, 4]);
    }
    console.log('✓ Invariant 1 Passed');

    // Invariant Check 2: Group Conflict Prevention (no 2 teams in the same FIFA group)
    console.log('Checking Invariant 2: Group Conflict Prevention...');
    for (const player of finalState.players) {
      const groups = player.squad.map(code => {
        const team = allTeams.find(t => t.code === code)!;
        return team.group;
      });
      
      // Set size should be 4 (all distinct)
      const distinctGroups = new Set(groups);
      assert.strictEqual(distinctGroups.size, 4);
    }
    console.log('✓ Invariant 2 Passed');

    // Invariant Check 3: Exclusivity (no team owned by more than 1 player)
    console.log('Checking Invariant 3: Exclusivity...');
    const allDrafted = finalState.players.flatMap(p => p.squad);
    const uniqueDrafted = new Set(allDrafted);
    assert.strictEqual(allDrafted.length, uniqueDrafted.size);
    assert.strictEqual(allDrafted.length, 32); // 8 players * 4 teams
    console.log('✓ Invariant 3 Passed');

    // Invariant Check 4: squads.json Export
    console.log('Checking Invariant 4: squads.json persistence...');
    assert.ok(fs.existsSync(SQUADS_FILE_PATH));
    const squadsData = JSON.parse(fs.readFileSync(SQUADS_FILE_PATH, 'utf-8'));
    assert.strictEqual(squadsData.entryFee, 10);
    assert.strictEqual(squadsData.totalPot, 80);
    assert.strictEqual(squadsData.payouts.first, 48);
    assert.strictEqual(squadsData.players.length, 8);
    assert.strictEqual(squadsData.players[0].player_name, playerNames[0]);
    assert.strictEqual(squadsData.players[0].squad.length, 4);
    console.log('✓ Invariant 4 Passed');

  } catch (err) {
    console.error('Test 4 Failed:', err);
    process.exit(1);
  }

  console.log('\n===================================================');
  console.log('        All Draft Engine Tests Passed! 🎉          ');
  console.log('===================================================');
}

runTests();
