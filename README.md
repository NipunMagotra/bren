# Twitch Dataset Analytics Dashboard

[![Data Audited](https://img.shields.io/badge/DATA-AUDITED-00f0ff?style=flat-square)](https://github.com/luanaassis/TwitchDataset)
[![Records](https://img.shields.io/badge/Records-45%2C185-10b981?style=flat-square)](#dataset-statistics)
[![Snapshots](https://img.shields.io/badge/Snapshots-832-a855f7?style=flat-square)](#dataset-statistics)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-f59e0b.svg?style=flat-square)](https://www.gnu.org/licenses/gpl-3.0)
[![Deploy with Netlify](https://img.shields.io/badge/Deploy-Netlify-00ad9f?style=flat-square&logo=netlify)](https://www.netlify.com/)

A production-ready dark-mode analytics dashboard and empirical data-audit web application exploring the complete Twitch dataset collected between **October 13 and November 12, 2024** by [Luana Assis](https://github.com/luanaassis/TwitchDataset).

All 832 Excel snapshot spreadsheets from the repository were normalized, audited, and processed into optimized static JSON structures without inventing any statistics or utilizing synthetic numbers.

---

## ⚡ Key Dataset Statistics & Audit Findings

| Metric | Verified Real Value | Description |
|---|---|---|
| **Total Stream Records** | **45,185** | Normalized across all 832 `.xlsx` snapshot files |
| **Unique Broadcaster Channels** | **4,607** | Cryptographically anonymized via SHA-256 for privacy |
| **Unique Games & Categories** | **1,032** | Cross-referenced against IGDB v4 |
| **Collection Window** | **31 Days** | October 13, 2024 01:03:11 – November 12, 2024 23:34:23 UTC |
| **Total Viewers Tracked** | **843,896** | Audience tracked across live captures (Avg: 18.7 viewers) |
| **Mature Flag Rate (18+)** | **17.92% (8,100 streams)** | Streams flagged mature under family-friendly/kids tags |
| **Unique Broadcaster Tags** | **5,000+** | Community metadata tags |
| **Broadcast Languages** | **40+** | Leading: English (74.2%), German (8.6%), Russian (3.9%) |

### 🔍 The Core Research Finding: The Suitability Discrepancy
The collector crawler specifically queried Twitch tag directory endpoints intended for safe or younger audiences (`#FamilyFriendly`, `#SafeSpace`, `#SFW`, `#kids`, `#kid`, `#KidFriendly`, `#KidSafe`). 
Despite targeting these tags, **8,100 streams (17.92%)** were simultaneously marked with Twitch's **Mature (18+)** flag, were playing games classified by IGDB/ESRB as **Mature 17+ (M)** (e.g., *Grand Theft Auto V*, *Dead by Daylight*), or bore broadcaster-reported labels for **Profanity/Vulgarity** or **Graphic Violence**.

---

## 🛠️ Technology Stack

- **Frontend Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/) (Custom esports dark-mode palette, glowing borders, monospace typography)
- **Charts & Data Visualization**: [Recharts](https://recharts.org/) (Responsive Area Charts, Line Charts, Bar Charts, Donut Charts)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data Preprocessing**: Python 3.11 (`pandas`, `openpyxl`)
- **Hosting / Deployment Target**: [Netlify](https://www.netlify.com/) (100% static, fast edge CDN caching, zero backend required)

---

## 🚀 Local Development Quickstart

### Prerequisites
- Node.js `v18+` or `v20+` or `v24+`
- Python `3.10+` (only needed if re-running the raw Excel aggregator)

### 1. Clone the Project
```bash
git clone <your-repository-url>
cd bren
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build Production Bundle Locally
```bash
npm run build
```
This runs TypeScript checking (`tsc`) and bundles optimized static assets into the `dist/` directory.

### 5. Preview Production Build
```bash
npm run preview
```
Previews the exact production build on [http://localhost:4173](http://localhost:4173).

---

## 🌐 Netlify Deployment Guide

The web application is **100% static** and designed to deploy instantly to Netlify without requiring any environment variables or serverless functions.

### Option A: Deploy Directly from GitHub (Recommended)

1. Push your repository to GitHub.
2. Log in to [Netlify](https://app.netlify.com/) and click **"Add new site"** > **"Import an existing project"**.
3. Connect your GitHub account and select this repository.
4. Netlify will automatically detect `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Click **"Deploy site"**. Your dashboard will be live on a global CDN within seconds!

### Option B: Deploy via Netlify CLI

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Build the project
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

### 🔒 Zero Secrets Required
- **No Twitch Client ID / Secret required**: The dashboard analyzes the completed, audited dataset.
- **No IGDB API tokens required**: All ratings and labels are already cross-referenced and stored in static JSON.
- **No private API keys are ever exposed**.

---

## 📊 Preprocessing & Reproducibility Pipeline

If you ever wish to re-generate the JSON datasets directly from raw Excel files:

```bash
# 1. Install Python dependencies
pip install pandas openpyxl

# 2. Run the deterministic builder
python build_analytics_data.py

# 3. Synchronize processed data to public static folder
Copy-Item -Path "processed_data\*" -Destination "public\data\" -Recurse -Force  # PowerShell
# or: cp -r processed_data/* public/data/                                      # Bash
```

The script outputs:
- `public/data/overview.json`: Headline audit metrics & top games/tags.
- `public/data/games.json`: 1,032 games with tiers & daily time-series.
- `public/data/streams.json`: Broadcaster frequencies & audience histograms.
- `public/data/tags.json`: Tag frequencies & co-occurrence matrix.
- `public/data/content_age.json`: ESRB/PEGI ratings & safety cross-tabulation.
- `public/data/trends.json`: 31-day temporal, 24h diurnal, & weekday trends.
- `public/data/explorer_records.json`: Dictionary-compressed 45,185 records for instant client-side search & CSV export.

---

## 📜 License & Credits

- **Original Dataset**: [luanaassis/TwitchDataset](https://github.com/luanaassis/TwitchDataset) created by **Luana Assis**.
- **Data APIs Used in Origin**: Twitch Helix API & IGDB v4 API.
- **License**: [GNU General Public License v3.0 (GPL-3.0)](https://www.gnu.org/licenses/gpl-3.0).
