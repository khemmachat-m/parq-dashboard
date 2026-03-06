# PARQ Dashboard Generator

**JLL · The PARQ · JOB152**

A client-side Vite + Vanilla JavaScript web app that reads Mozart CMMS enriched CSV exports and generates self-contained weekly HTML dashboards — no server required.

---

## Dashboards

| Tab | Input CSV | Output |
|---|---|---|
| 🔧 Corrective Work Orders | `MZ_PARQ_CWO_Enriched.csv` | `PARQ_CWO_Weekly_Report.html` |
| 📋 Case Management | `MZ_PARQ_Cases_Enriched.csv` | `PARQ_Case_Weekly_Report.html` |
| 🗓️ PPM Work Orders | `MZ_PARQ_PPM_Enriched.csv` | `PARQ_PPM_Weekly_Report.html` |

---

## Project Structure

```
parq-dashboard/
├── index.html
├── package.json
├── vite.config.js
├── .gitignore
├── README.md
├── .github/
│   └── workflows/
│       └── deploy.yml          ← GitHub Pages auto-deploy
└── src/
    ├── main.js                 ← Entry point & UI
    ├── style.css               ← All app styles
    ├── utils/
    │   ├── date.js             ← Date parsing & week bounds
    │   └── stats.js            ← topN, buildComparison, pctOf
    ├── processors/
    │   ├── cwo.js              ← CWO categorisation & stats
    │   ├── cases.js            ← Case stats
    │   └── ppm.js              ← PPM categorisation & stats
    └── generators/
        ├── shared.js           ← Shared CSS & HTML fragments
        ├── cwoHtml.js          ← CWO HTML report builder
        ├── caseHtml.js         ← Case HTML report builder
        └── ppmHtml.js          ← PPM HTML report builder
```

---

## Local Development

### Prerequisites
- Node.js 18 or newer
- npm 9 or newer

### Setup

```bash
# 1. Navigate into the project folder
cd parq-dashboard

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Build for Production

```bash
npm run build
```

The output is placed in `dist/`. Open `dist/index.html` directly in a browser, or serve with:

```bash
npm run preview
```

---

## Deploy to GitHub Pages

### One-time setup

1. **Create a GitHub repository** (e.g. `parq-dashboard`).

2. **Push this project** to the `main` branch:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/parq-dashboard.git
   git push -u origin main
   ```

3. **Enable GitHub Pages** in your repository:
   - Go to **Settings → Pages**
   - Under *Source*, select **GitHub Actions**
   - Click **Save**

4. **Update the repo name** in `.github/workflows/deploy.yml`:
   ```yaml
   # Change "parq-dashboard" to your actual repository name
   run: VITE_BASE_URL=/parq-dashboard/ npm run build
   ```

5. **Push any change** to `main` to trigger the first deployment.
   The Actions tab will show the build progress.
   Your app will be live at: `https://YOUR_USERNAME.github.io/parq-dashboard/`

### Subsequent deployments

Every `git push` to `main` automatically rebuilds and redeploys via GitHub Actions.

```bash
git add .
git commit -m "Update dashboard logic"
git push
```

---

## How It Works

1. User selects a dashboard type (CWO / Case / PPM)
2. User uploads the matching enriched CSV from the Mozart Export folder
3. The app parses the CSV with **PapaParse** entirely in the browser
4. Detects the last two rolling 7-day weeks from `CreatedOn` dates
5. Computes statistics for each week
6. Renders a self-contained HTML report (with embedded Chart.js charts)
7. Triggers an automatic download of the HTML file

No data ever leaves the browser.

---

## Input File Notes

| Column | Used for |
|---|---|
| `CreatedOn` | Week detection and slicing |
| `StatusId` | Resolved / Active / Cancelled / Overdue flags |
| `Priority_Name` / `PriorityId` | Priority breakdown |
| `TopLocation_Name` / `Location_Name` | Location breakdown |
| `Asset_Name` | Top assets (CWO only) |
| `Description` | Keyword-based event categorisation (CWO) |
| `EventType_Description` | Event type (Case) |
| `MasterWorkOrderTitle` | Task categorisation & zone extraction (PPM) |
| `FrequencyTypeId` / `FrequencyType_Name` | Frequency breakdown (PPM) |
| `ServiceCategoryId` | Category fallback (PPM) |
| `ActualCompletionDateTime` + `SlatoResolve` | SLA pass/fail (CWO & Case) |

Enriched columns (`*_Name`) take priority; raw ID columns are used as fallback when enriched CSVs are not available.

---

## Dependencies

| Package | Version | Purpose |
|---|---|---|
| `vite` | ^5.4 | Build tool & dev server |
| `papaparse` | ^5.4 | CSV parsing |

Chart.js is loaded from CDN inside the *generated* HTML reports — it is not a project dependency.

---

*Smart City OB · The PARQ · JOB152*
