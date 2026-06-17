import express from 'express';
import cors from 'cors';
import { draftEngine } from './draft/draftEngine.js';
import { getTeams, getMatches } from './data/metadata.js';

const app = express();

app.use(cors());
app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Draft Session APIs
app.post('/api/v1/draft/init', (req, res) => {
  const { players, entryFee } = req.body;
  if (!players || !Array.isArray(players)) {
    return res.status(400).json({ error: 'players list must be an array of strings.' });
  }
  try {
    const parsedFee = entryFee !== undefined ? Number(entryFee) : 10;
    const state = draftEngine.initDraft(players, parsedFee);
    res.json(state);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/v1/draft/state', (req, res) => {
  try {
    const state = draftEngine.getState();
    res.json(state);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/draft/action', (req, res) => {
  const { action } = req.body;
  if (action !== 'accept' && action !== 'retry') {
    return res.status(400).json({ error: "action must be 'accept' or 'retry'." });
  }
  try {
    let state;
    if (action === 'accept') {
      draftEngine.acceptTeam();
    } else {
      draftEngine.retryTeam();
    }
    res.json(draftEngine.getState());
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/v1/draft/reset', (req, res) => {
  try {
    draftEngine.resetDraft();
    res.json({ message: 'Draft reset successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Metadata APIs
app.get('/api/v1/teams', (req, res) => {
  try {
    const teams = getTeams();
    res.json(teams);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/v1/matches', (req, res) => {
  try {
    const matches = getMatches();
    res.json(matches);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default app;
