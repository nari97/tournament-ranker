# FIFA World Cup 2026 Sweepstakes & Live Tracker

Welcome to the **FIFA World Cup 2026 Sweepstakes & Live Tracker** monorepo! This repository houses the design templates, local interactive frontend drafts, the Express backend engine, and the live-tracking web application for a complete world cup sweepstakes draft experience.

---

## 📂 Repository Structure

The project is divided into the following key directories:

- 🎨 **[frontend/](file:///Users/bhavanaravi/Documents/nari-projects/tournament%20ranker/frontend)**: Contains the local HTML/Tailwind mockup/pitch deck for the initial draft interface featuring high-fidelity interactive grid elements, animations, and custom typography.
- ⚙️ **[backend/](file:///Users/bhavanaravi/Documents/nari-projects/tournament%20ranker/backend)**: Express + TypeScript API server handling the sweepstakes seeder, team/match information, state persistence, and test cases for drafting squads.
- 📊 **[live-tracker/](file:///Users/bhavanaravi/Documents/nari-projects/tournament%20ranker/live-tracker)**: A premium Next.js dashboard built for tracking live sweepstakes metrics, team standings, match progress, and rules.
- 📐 **[design-skills/](file:///Users/bhavanaravi/Documents/nari-projects/tournament%20ranker/design-skills)**: A comprehensive set of guidelines, specifications, checklists, and templates focusing on typography, accessibility, motion, and UX principles.

---

## 🎯 System Stages & Core Mechanics

The system operates in two entirely decoupled phases, designed to keep runtime code simple, secure, and cost-efficient.

### Phase 1: The Draft Stage (Local Draft Studio)
The draft operates as an interactive state machine run locally on draft night. It processes players round-by-round and outputs the final teams configuration.

*   **Tier Balance**: 48 teams are divided into 4 balanced pools of 12 (based on FIFA rankings). Every player drafts exactly 1 team from Pool 1, 1 from Pool 2, 1 from Pool 3, and 1 from Pool 4.
*   **Group Conflict Prevention**: No player can hold more than 1 team from the same official tournament group (Groups A through L) to prevent internal point cannibalization.
*   **Exclusivity & Ghost Teams**: A country assigned to a player cannot be owned by anyone else. If there are fewer than 12 players ($P < 12$), exactly $12 - P$ teams per pool are designated as unowned "Ghost Teams."
*   **The Mulligan/Retry Mechanic**: Every player has exactly **one shared Retry token** (`has_retry: true`) for the entire draft.
    *   **Atomic Window**: Can only trigger the retry on the immediate country just drawn.
    *   **Recirculation**: Rejected teams are thrown straight back into the active pool.
    *   **Deadlock Safety Valve**: The engine disables the "Retry" button if the remaining pool doesn't contain at least one valid alternative team.
*   **Output**: Generates a frozen `squads.json` manifest.

### Phase 2: The Game Stage (Live Leaderboard)
Once the opening game kicks off, the draft configuration state undergoes a **Temporal Mutability Lock** and becomes permanently immutable. The application runs as a secure, read-only live tracker.

*   **Scoring Scope**: Points are accumulated strictly during the 72 group-stage matches. Knockout rounds have zero impact.
*   **Scoring Matrix**: Win = **3 points**, Draw = **1 point**, Loss = **0 points**. Leaderboard scores shift dynamically in real-time during live match windows.
*   **Leaderboard Tiebreakers**:
    1. Total Combined Squad Points
    2. Total Combined Squad Goal Difference
    3. Head-to-Head Point Multiplier (from matches where tied players' drafted teams faced each other directly)
*   **In-Memory Cache Gate**: Avoids third-party API rate limits by proxying requests. If the cache age is $< 60$ seconds, it serves the cached state; otherwise, it fetches fresh data, recalculates points, and updates the cache.

---

## 🚀 Getting Started

To run the application components locally, follow the instructions below.

### ⚙️ Backend Engine Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Seed the database (generates initial match, team, and squad states):
   ```bash
   npm run seed
   ```
4. Start the Express development server (runs on port `3001`):
   ```bash
   npm run dev
   ```
5. Run draft engine unit tests:
   ```bash
   npm run test:draft
   ```

### 📊 Live Tracker Dashboard Setup

1. Navigate to the live tracker directory:
   ```bash
   cd live-tracker
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the Next.js development server:
   ```bash
   npm run dev
   ```
4. Access the dashboard at [http://localhost:3000](http://localhost:3000).

---

## 🛠 Tech Stack

- **Frontend Mockup**: HTML, Vanilla Tailwind CSS, Canvas Confetti, Phosphor Icons
- **Backend API**: Node.js, Express, TypeScript, `tsx` runner
- **Live Tracker**: React, Next.js, TypeScript, Tailwind CSS
