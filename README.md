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

## 🚀 Getting Started

To run the application components locally, follow the instructions below.

### ⚙️ Backend Engine Setup

The backend handles drafting mechanisms, match states, and squads.

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
4. Start the Express development server (runs with hot-reloading on port `3001`):
   ```bash
   npm run dev
   ```
5. *(Optional)* Run draft engine unit tests:
   ```bash
   npm run test:draft
   ```

### 📊 Live Tracker Dashboard Setup

The live tracker is a Next.js application built with TypeScript, React, and CSS.

1. Navigate to the live tracker directory:
   ```bash
   cd live-tracker
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Access the dashboard at [http://localhost:3000](http://localhost:3000).

---

## 🛠 Tech Stack

- **Frontend Mockup**: HTML, Vanilla Tailwind CSS, Canvas Confetti, Phosphor Icons
- **Backend API**: Node.js, Express, TypeScript, `tsx` runner
- **Live Tracker**: React, Next.js, TypeScript, Tailwind CSS
- **Design & Guidelines**: Markdown specifications for responsive typography, motion specs, and WCAG accessibility standards

---

## 🏆 Key Features

- **Interactive Draft Pitch**: Interactive draft interface for selecting FIFA 2026 squads.
- **Dynamic Seeder**: Populates complete schedules, groups, matches, teams, and dummy squads automatically.
- **Live Dashboard**: Monitors matches, standings, and sweepstakes points in real-time.
- **Robust Draft Engine**: Backend logic checking team selection limits, budget, and pick orders.
