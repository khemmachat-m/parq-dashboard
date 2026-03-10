/**
 * PARQ Dashboard Generator – main.js v8
 *
 * Outputs per session:
 *   1. ⚡ Generate Dashboard      → weekly HTML report (selected week, opens in new tab)
 *   2. 📥 Download Enriched CSV  → full enriched CSV (all rows, all dates) — local download
 *   3. ☁️ Save to GitHub          → commits enriched CSV to public/enriched/ in the repo
 */
import './style.css';
import Papa from 'papaparse';

import {
  loadAllMasters, saveOverride, deleteOverride,
  BUNDLED_FILES, fmtStoredDate,
} from './storage/masterStore.js';

import { buildMasters }  from './enrichment/masterData.js';
import { enrichCWO }     from './enrichment/enrichCWO.js';
import { enrichCases }   from './enrichment/enrichCases.js';
import { enrichPPM }     from './enrichment/enrichPPM.js';

import {
  getAvailableWeeks, getWeekBounds, sliceWeek, fmtDate,
} from './utils/date.js';
import { buildComparison } from './utils/stats.js';
import { rowsToCsv, downloadCsv } from './utils/csv.js';

import { cwoStats }  from './processors/cwo.js';
import { caseStats } from './processors/cases.js';
import { ppmStats }  from './processors/ppm.js';

import { generateCWOHtml }  from './generators/cwoHtml.js';
import { generateCaseHtml } from './generators/caseHtml.js';
import { generatePPMHtml }  from './generators/ppmHtml.js';

// ── GitHub config ─────────────────────────────────────────────────────────────
const GH_OWNER  = 'Khemmachat-m';
const GH_REPO   = 'parq-dashboard';
const GH_BRANCH = 'main';
const GH_FOLDER = 'public/enriched';
const PAT_KEY   = 'parq_gh_pat';

function getStoredPat() { return localStorage.getItem(PAT_KEY) || ''; }
function savePat(pat)   { if (pat) localStorage.setItem(PAT_KEY, pat); else localStorage.removeItem(PAT_KEY); }

// ── Master slots ──────────────────────────────────────────────────────────────
const MASTER_SLOTS = [
  { key: 'priorityRows',        label: 'Priorities',         icon: '⭐', hint: 'MZ_PARQ_Priorities_*.csv',        usedBy: 'CWO · Case · PPM', required: true  },
  { key: 'locationRows',        label: 'Locations',          icon: '📍', hint: 'MZ_PARQ_Locations_*.csv',         usedBy: 'CWO · Case · PPM', required: true  },
  { key: 'assetRows',           label: 'Assets',             icon: '🔩', hint: 'MZ_PARQ_Assets_*.csv',            usedBy: 'CWO · Case · PPM', required: false },
  { key: 'problemTypeRows',     label: 'Problem Types',      icon: '🔍', hint: 'MZ_PARQ_Event Types*.csv',        usedBy: 'CWO only',         required: false },
  { key: 'eventTypeRows',       label: 'Event Types',        icon: '🏷️', hint: 'MZ_PARQ_Event Types*.csv',       usedBy: 'Case only',        required: false },
  { key: 'serviceCategoryRows', label: 'Service Categories', icon: '🗂️', hint: 'MZ_PARQ_ServiceCategories.csv',  usedBy: 'PPM only',         required: false },
  { key: 'frequencyTypeRows',   label: 'Frequency Types',    icon: '🔁', hint: 'MZ_PARQ_FrequencyTypes.csv',      usedBy: 'PPM only',         required: false },
];

const TAB_REQUIRED = {
  cwo:  ['priorityRows', 'locationRows'],
  case: ['priorityRows', 'locationRows'],
  ppm:  ['locationRows'],
};

// ── Tabs ──────────────────────────────────────────────────────────────────────
const TABS = [
  {
    id: 'cwo', label: 'Corrective Work Orders', shortLabel: 'CWO',
    icon: '🔧', theme: 'cwo',
    txHint:      'MZ_PARQ_Corrective Work Orders_*.csv',
    out:         'PARQ_CWO_Weekly_Report.html',
    outEnriched: 'PARQ_CWO_Enriched.csv',
    enrich:  (rows, masters) => enrichCWO(rows, masters),
    process: (rows, lwEnd) => {
      const b = getWeekBounds(rows, 'CreatedOn', lwEnd);
      if (!b) throw new Error('Cannot find CreatedOn dates in the CSV.');
      const lw  = cwoStats(sliceWeek(rows, b.lwStart, b.lwEnd));
      const pw  = cwoStats(sliceWeek(rows, b.pwStart, b.pwEnd));
      const cmp = buildComparison(lw.events, pw.events);
      return { html: generateCWOHtml(lw, pw, cmp, b.lwStart, b.lwEnd, b.pwStart, b.pwEnd, b.reportDate), lwCount: lw.total, pwCount: pw.total };
    },
  },
  {
    id: 'case', label: 'Case Management', shortLabel: 'Case',
    icon: '📋', theme: 'case',
    txHint:      'MZ_PARQ_Cases_*.csv',
    out:         'PARQ_Case_Weekly_Report.html',
    outEnriched: 'PARQ_Case_Enriched.csv',
    enrich:  (rows, masters) => enrichCases(rows, masters),
    process: (rows, lwEnd) => {
      const b = getWeekBounds(rows, 'CreatedOn', lwEnd);
      if (!b) throw new Error('Cannot find CreatedOn dates in the CSV.');
      const lw  = caseStats(sliceWeek(rows, b.lwStart, b.lwEnd));
      const pw  = caseStats(sliceWeek(rows, b.pwStart, b.pwEnd));
      const cmp = buildComparison(lw.events, pw.events);
      return { html: generateCaseHtml(lw, pw, cmp, b.lwStart, b.lwEnd, b.pwStart, b.pwEnd, b.reportDate), lwCount: lw.total, pwCount: pw.total };
    },
  },
  {
    id: 'ppm', label: 'PPM Work Orders', shortLabel: 'PPM',
    icon: '🗓️', theme: 'ppm',
    txHint:      'MZ_PARQ_PPM Work Orders_*.csv',
    out:         'PARQ_PPM_Weekly_Report.html',
    outEnriched: 'PARQ_PPM_Enriched.csv',
    enrich:  (rows, masters) => enrichPPM(rows, masters),
    process: (rows, lwEnd) => {
      const b = getWeekBounds(rows, 'CreatedOn', lwEnd);
      if (!b) throw new Error('Cannot find CreatedOn dates in the CSV.');
      const lw  = ppmStats(sliceWeek(rows, b.lwStart, b.lwEnd));
      const pw  = ppmStats(sliceWeek(rows, b.pwStart, b.pwEnd));
      const cmp = buildComparison(lw.categories, pw.categories);
      return { html: generatePPMHtml(lw, pw, cmp, b.lwStart, b.lwEnd, b.pwStart, b.pwEnd, b.reportDate), lwCount: lw.total, pwCount: pw.total };
    },
  },
];

// ── State ─────────────────────────────────────────────────────────────────────
let state = {
  activeTab:        'cwo',
  txFile:           null,
  txRows:           null,
  enrichedRows:     null,
  availableWeeks:   [],
  selectedWeekIdx:  0,
  masters:          {},
  masterPanelOpen:  false,
  ghPanelOpen:      false,
  ghPat:            getStoredPat(),
  ghPatInput:       getStoredPat(),
  loading:          true,
  status:           'idle',      // idle | enriching | processing | uploading | success | error
  lastAction:       null,        // 'dashboard' | 'csv' | 'github'
  error:            '',
  lwCount:          0,
  pwCount:          0,
  enrichedRowCount: 0,
  ghCommitUrl:      '',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function parseCSVText(text, label) {
  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true, skipEmptyLines: true,
      transformHeader: h => h.trim(),
      complete: ({ data }) => resolve(data),
      error: err => reject(new Error(`Parse error in ${label}: ${err.message}`)),
    });
  });
}
function readFileText(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload  = e => resolve(e.target.result);
    r.onerror = () => reject(new Error(`Could not read ${file.name}`));
    r.readAsText(file, 'utf-8');
  });
}
function getBaseUrl() { return import.meta.env.BASE_URL || '/'; }

async function buildMastersFromState() {
  const raws = {};
  for (const slot of MASTER_SLOTS) {
    const m = state.masters[slot.key];
    raws[slot.key] = m ? await parseCSVText(m.csvText, slot.label) : [];
  }
  return buildMasters(raws);
}

// ── Boot ──────────────────────────────────────────────────────────────────────
async function boot() {
  state.loading = true;
  render();
  try {
    const { merged } = await loadAllMasters(getBaseUrl());
    state.masters         = merged;
    state.masterPanelOpen = Object.keys(merged).length === 0;
  } catch (e) {
    console.warn('Master load error:', e);
    state.masterPanelOpen = true;
  }
  state.loading = false;
  render();
}

// ── Week picker helpers ───────────────────────────────────────────────────────
function selectedWeek() {
  return state.availableWeeks[state.selectedWeekIdx] || null;
}
function weekSummaryHtml(week) {
  if (!week) return '';
  return `
    <div class="week-summary">
      <div class="week-summary-row">
        <div class="week-summary-cell selected-week">
          <div class="wsum-label">Selected Week (Last Week)</div>
          <div class="wsum-dates">${fmtDate(week.lwStart)} – ${fmtDate(week.lwEnd)}</div>
        </div>
        <div class="week-summary-arrow">→</div>
        <div class="week-summary-cell prev-week">
          <div class="wsum-label">Previous Week (Comparison)</div>
          <div class="wsum-dates">${fmtDate(week.pwStart)} – ${fmtDate(week.pwEnd)}</div>
        </div>
      </div>
    </div>`;
}

// ── GitHub settings panel HTML ────────────────────────────────────────────────
function ghPanelHtml() {
  const hasPat = !!state.ghPat;
  const isOpen = state.ghPanelOpen;
  return `
    <div class="master-panel-header" id="ghPanelToggle">
      <div class="master-panel-left">
        <div class="master-panel-icon">☁️</div>
        <div>
          <div class="master-panel-title">GitHub Upload Settings</div>
          <div class="master-panel-sub">
            ${hasPat
              ? `<span class="status-dot dot-green"></span> PAT saved — Save to GitHub is enabled`
              : `<span class="status-dot dot-yellow"></span> No PAT — enter one to enable GitHub upload`}
          </div>
        </div>
      </div>
      <div class="master-panel-right">
        ${hasPat
          ? `<span class="stored-badge">✓ Ready</span>`
          : `<span class="stored-badge badge-missing">Setup needed</span>`}
        <div class="chevron ${isOpen ? 'chevron-open' : ''}">▾</div>
      </div>
    </div>

    <div class="master-panel-body ${isOpen ? 'panel-open' : 'panel-closed'}">
      <div class="master-panel-note">
        Enter a GitHub <strong>Personal Access Token (PAT)</strong> with <strong>repo</strong> scope.<br>
        Saved only in <strong>your browser</strong> (localStorage) — never sent anywhere except GitHub.<br>
        Target repo: <code>${GH_OWNER}/${GH_REPO}</code> → folder: <code>${GH_FOLDER}/</code>
      </div>
      <div class="gh-pat-row">
        <input
          type="password"
          id="ghPatInput"
          class="gh-pat-input"
          placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
          value="${state.ghPatInput}"
          autocomplete="off"
        />
        <button class="btn-gh-save" id="ghPatSaveBtn">💾 Save PAT</button>
        ${hasPat ? `<button class="btn-gh-clear" id="ghPatClearBtn">✕ Clear</button>` : ''}
      </div>
      <div class="gh-pat-hint">
        Create at: <strong>GitHub → Settings → Developer settings → Personal access tokens</strong><br>
        Required scope: <strong>repo</strong> (read &amp; write files to the repository)
      </div>
    </div>
  `;
}

// ── Render ────────────────────────────────────────────────────────────────────
function render() {
  const tab      = TABS.find(t => t.id === state.activeTab);
  const required = TAB_REQUIRED[state.activeTab];
  const missingRequired = required.filter(key => !state.masters[key]);
  const week     = selectedWeek();
  const busy     = state.status === 'processing' || state.status === 'enriching'
                || state.status === 'uploading'  || state.loading;

  const canGenerate    = state.txFile && state.txRows && week && missingRequired.length === 0 && !busy;
  const canEnrichedCsv = state.txFile && state.txRows && missingRequired.length === 0 && !busy;
  const canGitHub      = canEnrichedCsv && !!state.ghPat;

  const bundledCount  = Object.values(state.masters).filter(m => m.source === 'bundled').length;
  const overrideCount = Object.values(state.masters).filter(m => m.source === 'override').length;
  const totalCount    = Object.keys(state.masters).length;

  document.getElementById('app').setAttribute('data-theme', tab.theme);
  document.getElementById('app').innerHTML = `

    <div class="site-badge">JLL · THE PARQ · JOB152</div>
    <h1 class="site-title">PARQ Dashboard<br>Generator</h1>
    <p class="site-sub">Select your report week, upload a Mozart CSV, and download the HTML dashboard or the full enriched CSV.</p>

    <div class="tabs">
      ${TABS.map(t => `
        <button class="tab-btn ${state.activeTab === t.id ? `active-${t.theme}` : ''}" data-tab="${t.id}">
          ${t.icon} ${t.label}
        </button>`).join('')}
    </div>

    <div class="card">

      <!-- ══ MASTER DATA PANEL ══════════════════════════════════════════════ -->
      <div class="master-panel-header" id="masterPanelToggle">
        <div class="master-panel-left">
          <div class="master-panel-icon">🗄️</div>
          <div>
            <div class="master-panel-title">Master Data</div>
            <div class="master-panel-sub">
              ${state.loading
                ? `<span class="status-dot dot-yellow"></span> Loading from repository…`
                : totalCount === 0
                  ? `<span class="status-dot dot-red"></span> Not loaded — check connection or upload manually`
                  : `<span class="status-dot dot-green"></span>
                     ${bundledCount} from repository${overrideCount > 0 ? ` · ${overrideCount} override${overrideCount > 1 ? 's' : ''}` : ''}
                     · ${totalCount}/${MASTER_SLOTS.length} ready`}
            </div>
          </div>
        </div>
        <div class="master-panel-right">
          ${state.loading
            ? `<span class="stored-badge badge-loading">Loading…</span>`
            : totalCount >= 2
              ? `<span class="stored-badge">✓ Ready</span>`
              : `<span class="stored-badge badge-missing">Action needed</span>`}
          <div class="chevron ${state.masterPanelOpen ? 'chevron-open' : ''}">▾</div>
        </div>
      </div>

      <div class="master-panel-body ${state.masterPanelOpen ? 'panel-open' : 'panel-closed'}">
        <div class="master-panel-note">
          <strong>Auto-loaded from repository</strong> — shared with all users automatically.<br>
          Use the slots below to <strong>override</strong> any file temporarily in your browser.
        </div>
        <div class="master-grid">
          ${MASTER_SLOTS.map(slot => {
            const m = state.masters[slot.key];
            const isOverride = m?.source === 'override';
            const isBundled  = m?.source === 'bundled';
            return `
            <div class="master-slot ${m ? (isOverride ? 'slot-override' : 'slot-bundled') : ''}" data-slot="${slot.key}">
              <input type="file" class="master-input" data-slot="${slot.key}" accept=".csv" />
              <div class="slot-top">
                <span class="slot-icon">${isOverride ? '🔄' : isBundled ? '✅' : slot.icon}</span>
                <span class="slot-label">${slot.label}</span>
                <span class="slot-badge ${slot.required ? 'badge-req' : 'badge-opt'}">${slot.required ? 'req' : 'opt'}</span>
              </div>
              <div class="slot-usedby">${slot.usedBy}</div>
              ${m
                ? `<div class="slot-filename">${m.fileName}</div>
                   <div class="slot-source ${isOverride ? 'source-override' : 'source-bundled'}">
                     ${isOverride ? `🔄 Override · ${fmtStoredDate(m.updatedAt)}` : '📦 From repository'}
                   </div>
                   ${isOverride
                     ? `<button class="slot-clear" data-slot="${slot.key}">✕ Remove override</button>`
                     : `<div class="slot-upload-hint">Click/drop to override</div>`}`
                : `<div class="slot-hint">${slot.hint}</div>
                   <div class="slot-drop-cue">Not in repo — upload manually</div>`}
            </div>`;
          }).join('')}
        </div>
      </div>

      <div class="card-divider"></div>

      <!-- ══ GITHUB SETTINGS PANEL ══════════════════════════════════════════ -->
      ${ghPanelHtml()}

      <div class="card-divider"></div>

      <!-- ══ STEP 1: Transaction file ═══════════════════════════════════════ -->
      <div class="step-header">
        <div class="step-num">1</div>
        <div class="step-info">
          <div class="step-title">Transaction File <span class="badge-req">Required</span></div>
          <div class="step-hint">${tab.txHint}</div>
        </div>
      </div>

      <div class="drop-zone${state.txFile ? ' has-file' : ''}" id="txDropZone">
        <input type="file" id="txFileInput" accept=".csv" />
        ${state.txFile
          ? `<div class="drop-icon">✅</div>
             <div class="file-name">${state.txFile.name}</div>
             <div class="file-meta">${(state.txFile.size/1024).toFixed(1)} KB · ${state.txRows ? state.txRows.length.toLocaleString() + ' rows loaded' : 'Reading…'} · Click to change</div>`
          : `<div class="drop-icon">📂</div>
             <div class="drop-text">Drop this week's Mozart CSV here or <strong>click to browse</strong></div>`}
      </div>

      <!-- ══ STEP 2: Week selector ═══════════════════════════════════════════ -->
      ${state.txRows ? `
        <div class="step-header" style="margin-top:22px;">
          <div class="step-num">2</div>
          <div class="step-info">
            <div class="step-title">Select Report Week</div>
            <div class="step-hint">Choose which week to report on — the previous week is set automatically</div>
          </div>
        </div>

        <div class="week-picker">
          <div class="week-picker-inner">
            <label class="week-picker-label">Report Week (Last Week ends on)</label>
            <select id="weekSelect" class="week-select">
              ${state.availableWeeks.map((w, i) => `
                <option value="${i}" ${i === state.selectedWeekIdx ? 'selected' : ''}>
                  ${w.label}${i === 0 ? '  (most recent)' : ''}
                </option>`).join('')}
            </select>
          </div>
          ${week ? weekSummaryHtml(week) : ''}
        </div>
      ` : ''}

      <!-- Status messages -->
      <div style="margin-top:14px;">
        ${missingRequired.length > 0 && !state.loading
          ? `<div class="msg msg-warn">⚠️ Master data required for ${tab.shortLabel}:
               <strong>${missingRequired.map(k => MASTER_SLOTS.find(s => s.key===k)?.label).join(', ')}</strong> not loaded.</div>`
          : `<div class="info-bar">
               ⬇️ &nbsp;<strong>Generate Dashboard</strong> downloads the HTML report and opens it in a new tab.<br>
               &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong>Download Enriched CSV</strong> saves the enriched file locally.<br>
               &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong>Save to GitHub</strong> commits the enriched CSV to the repo for shared access.
             </div>`}
      </div>

      ${state.status === 'error' ? `
        <div class="msg msg-error">
          <div class="msg-title">⚠️ Error</div>
          <div class="msg-detail">${state.error}</div>
        </div>` : ''}

      ${state.status === 'success' && state.lastAction === 'dashboard' ? `
        <div class="msg msg-success">
          <div class="msg-title">✅ Dashboard downloaded &amp; opened!</div>
          <div class="msg-detail">
            Last Week: <strong>${state.lwCount}</strong> records ·
            Previous Week: <strong>${state.pwCount}</strong> records<br>
            File: <strong>${tab.out}</strong> — also opened in a new browser tab
          </div>
        </div>` : ''}

      ${state.status === 'success' && state.lastAction === 'csv' ? `
        <div class="msg msg-success">
          <div class="msg-title">✅ Enriched CSV downloaded!</div>
          <div class="msg-detail">
            <strong>${state.enrichedRowCount.toLocaleString()}</strong> rows exported with all master data joined<br>
            File: <strong>${tab.outEnriched}</strong>
          </div>
        </div>` : ''}

      ${state.status === 'success' && state.lastAction === 'github' ? `
        <div class="msg msg-success">
          <div class="msg-title">✅ Saved to GitHub!</div>
          <div class="msg-detail">
            <strong>${state.enrichedRowCount.toLocaleString()}</strong> rows committed to the repository<br>
            Path: <strong>${GH_FOLDER}/${tab.outEnriched}</strong><br>
            ${state.ghCommitUrl
              ? `<a href="${state.ghCommitUrl}" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline;">View commit on GitHub →</a>`
              : ''}
          </div>
        </div>` : ''}

      <!-- ══ ACTION BUTTONS ══════════════════════════════════════════════════ -->
      <div class="btn-row">

        <!-- Primary: Generate HTML dashboard -->
        <button class="btn-generate btn-${tab.theme}" id="generateBtn" ${canGenerate ? '' : 'disabled'}>
          ${state.status === 'processing'
            ? `<span class="spinner"></span> Generating…`
            : state.loading
              ? `<span class="spinner"></span> Loading…`
              : `⚡ Generate ${tab.shortLabel} Dashboard`}
        </button>

        <!-- Secondary: Download full enriched CSV -->
        <button class="btn-enriched" id="enrichedCsvBtn" ${canEnrichedCsv ? '' : 'disabled'}>
          ${state.status === 'enriching'
            ? `<span class="spinner spinner-dark"></span> Enriching…`
            : `📥 Download Enriched CSV`}
        </button>

        <!-- Tertiary: Save enriched CSV to GitHub -->
        <button class="btn-github" id="githubBtn" ${canGitHub ? '' : 'disabled'}
          title="${!state.ghPat ? 'Enter a GitHub PAT in the settings panel above to enable this' : 'Commit enriched CSV to GitHub repository'}">
          ${state.status === 'uploading'
            ? `<span class="spinner spinner-dark"></span> Uploading…`
            : `☁️ Save to GitHub`}
        </button>

      </div>

    </div>

    <p class="site-footer">Vite + Vanilla JS · Smart City OB · The PARQ · <strong>JOB152</strong></p>
  `;

  attachEvents();
}

// ── Events ────────────────────────────────────────────────────────────────────
function attachEvents() {
  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn =>
    btn.addEventListener('click', () => {
      if (btn.dataset.tab === state.activeTab) return;
      state = { ...state, activeTab: btn.dataset.tab, txFile: null, txRows: null,
        enrichedRows: null, availableWeeks: [], selectedWeekIdx: 0, status: 'idle', error: '' };
      render();
    })
  );

  // Master panel toggle
  document.getElementById('masterPanelToggle').addEventListener('click', () => {
    state.masterPanelOpen = !state.masterPanelOpen;
    render();
  });

  // GitHub panel toggle
  document.getElementById('ghPanelToggle').addEventListener('click', () => {
    state.ghPanelOpen = !state.ghPanelOpen;
    render();
  });

  // PAT input — track live value
  const patInput = document.getElementById('ghPatInput');
  if (patInput) patInput.addEventListener('input', e => { state.ghPatInput = e.target.value; });

  // Save PAT
  const patSaveBtn = document.getElementById('ghPatSaveBtn');
  if (patSaveBtn) {
    patSaveBtn.addEventListener('click', () => {
      const pat = state.ghPatInput.trim();
      savePat(pat);
      state = { ...state, ghPat: pat, ghPanelOpen: false, status: 'idle' };
      render();
    });
  }

  // Clear PAT
  const patClearBtn = document.getElementById('ghPatClearBtn');
  if (patClearBtn) {
    patClearBtn.addEventListener('click', () => {
      savePat('');
      state = { ...state, ghPat: '', ghPatInput: '', status: 'idle' };
      render();
    });
  }

  // Master file overrides
  document.querySelectorAll('.master-input').forEach(input =>
    input.addEventListener('change', e => handleMasterFile(input.dataset.slot, e.target.files[0]))
  );
  document.querySelectorAll('.master-slot').forEach(slot => {
    slot.addEventListener('dragover',  e => { e.preventDefault(); slot.classList.add('drag-over'); });
    slot.addEventListener('dragleave', ()  => slot.classList.remove('drag-over'));
    slot.addEventListener('drop', e => {
      e.preventDefault(); slot.classList.remove('drag-over');
      handleMasterFile(slot.dataset.slot, e.dataTransfer.files[0]);
    });
  });
  document.querySelectorAll('.slot-clear').forEach(btn =>
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      await deleteOverride(btn.dataset.slot).catch(() => {});
      const { merged } = await loadAllMasters(getBaseUrl());
      state = { ...state, masters: merged, enrichedRows: null };
      render();
    })
  );

  // Transaction file
  const txInput = document.getElementById('txFileInput');
  const txDrop  = document.getElementById('txDropZone');
  txInput.addEventListener('change', e => handleTxFile(e.target.files[0]));
  txDrop.addEventListener('dragover',  e => { e.preventDefault(); txDrop.classList.add('drag-over'); });
  txDrop.addEventListener('dragleave', ()  => txDrop.classList.remove('drag-over'));
  txDrop.addEventListener('drop', e => {
    e.preventDefault(); txDrop.classList.remove('drag-over'); handleTxFile(e.dataTransfer.files[0]);
  });

  // Week selector
  const weekSelect = document.getElementById('weekSelect');
  if (weekSelect) {
    weekSelect.addEventListener('change', e => {
      state = { ...state, selectedWeekIdx: +e.target.value, status: 'idle' };
      render();
    });
  }

  // Action buttons
  const generateBtn = document.getElementById('generateBtn');
  if (generateBtn && !generateBtn.disabled) generateBtn.addEventListener('click', generateDashboard);

  const enrichedBtn = document.getElementById('enrichedCsvBtn');
  if (enrichedBtn && !enrichedBtn.disabled) enrichedBtn.addEventListener('click', downloadEnrichedCsv);

  const githubBtn = document.getElementById('githubBtn');
  if (githubBtn && !githubBtn.disabled) githubBtn.addEventListener('click', saveToGitHub);
}

// ── File handlers ─────────────────────────────────────────────────────────────
async function handleTxFile(file) {
  if (!file?.name.toLowerCase().endsWith('.csv')) {
    state = { ...state, status: 'error', error: 'Please upload a .csv file.' };
    render(); return;
  }
  state = { ...state, txFile: file, txRows: null, enrichedRows: null,
    availableWeeks: [], selectedWeekIdx: 0, status: 'idle', error: '' };
  render();
  try {
    const text  = await readFileText(file);
    const rows  = await parseCSVText(text, file.name);
    const weeks = getAvailableWeeks(rows);
    if (!weeks.length) throw new Error('No valid dates found. Check the CSV contains a CreatedOn column.');
    state = { ...state, txRows: rows, availableWeeks: weeks, selectedWeekIdx: 0 };
  } catch (err) {
    state = { ...state, status: 'error', error: err.message };
  }
  render();
}

async function handleMasterFile(slotKey, file) {
  if (!file?.name.toLowerCase().endsWith('.csv')) {
    state = { ...state, status: 'error', error: `${file?.name || 'File'} is not a CSV.` };
    render(); return;
  }
  try {
    const csvText = await readFileText(file);
    const record  = await saveOverride(slotKey, file.name, csvText);
    state = { ...state,
      masters:      { ...state.masters, [slotKey]: { ...record, source: 'override' } },
      enrichedRows: null,
      status: 'idle', error: '',
    };
  } catch (err) {
    state = { ...state, status: 'error', error: `Could not save ${file.name}: ${err.message}` };
  }
  render();
}

// ── Shared enrichment ─────────────────────────────────────────────────────────
async function ensureEnriched() {
  const tab = TABS.find(t => t.id === state.activeTab);
  if (state.enrichedRows) return state.enrichedRows;
  const masters  = await buildMastersFromState();
  const enriched = tab.enrich(state.txRows, masters);
  state.enrichedRows = enriched;
  return enriched;
}

// ── Generate HTML Dashboard ───────────────────────────────────────────────────
async function generateDashboard() {
  const tab  = TABS.find(t => t.id === state.activeTab);
  const week = selectedWeek();
  state = { ...state, status: 'processing', lastAction: 'dashboard' };
  render();
  try {
    const enriched = await ensureEnriched();
    const { html, lwCount, pwCount } = tab.process(enriched, week.lwEnd);

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url  = URL.createObjectURL(blob);

    const a = Object.assign(document.createElement('a'), { href: url, download: tab.out });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);

    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 10000);

    state = { ...state, status: 'success', lwCount, pwCount };
  } catch (err) {
    state = { ...state, status: 'error', error: err.message };
  }
  render();
}

// ── Download Full Enriched CSV ────────────────────────────────────────────────
async function downloadEnrichedCsv() {
  const tab = TABS.find(t => t.id === state.activeTab);
  state = { ...state, status: 'enriching', lastAction: 'csv' };
  render();
  try {
    const enriched = await ensureEnriched();
    const csvText  = rowsToCsv(enriched);
    downloadCsv(csvText, tab.outEnriched);
    state = { ...state, status: 'success', enrichedRowCount: enriched.length };
  } catch (err) {
    state = { ...state, status: 'error', error: err.message };
  }
  render();
}

// ── Save Enriched CSV to GitHub ───────────────────────────────────────────────
async function saveToGitHub() {
  const tab = TABS.find(t => t.id === state.activeTab);
  const pat = state.ghPat;
  if (!pat) {
    state = { ...state, status: 'error', error: 'No GitHub PAT saved. Open GitHub Upload Settings and save your token.' };
    render(); return;
  }

  state = { ...state, status: 'uploading', lastAction: 'github' };
  render();

  try {
    const enriched = await ensureEnriched();
    const csvText  = rowsToCsv(enriched);

    const filePath = `${GH_FOLDER}/${tab.outEnriched}`;
    const apiUrl   = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${filePath}`;
    const headers  = {
      'Authorization':        `Bearer ${pat}`,
      'Accept':               'application/vnd.github+json',
      'Content-Type':         'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    };

    // 1. Check if file exists to get its SHA (required for update)
    let existingSha = null;
    const getRes = await fetch(apiUrl, { headers });
    if (getRes.ok) {
      existingSha = (await getRes.json()).sha;
    } else if (getRes.status !== 404) {
      const err = await getRes.json();
      throw new Error(`GitHub API ${getRes.status}: ${err.message}`);
    }

    // 2. Base64-encode the CSV
    const b64Content = btoa(unescape(encodeURIComponent(csvText)));

    // 3. Commit (create or update)
    const today = new Date().toISOString().slice(0, 10);
    const body  = {
      message: `Update ${tab.outEnriched} (${today})`,
      content: b64Content,
      branch:  GH_BRANCH,
      ...(existingSha ? { sha: existingSha } : {}),
    };

    const putRes = await fetch(apiUrl, { method: 'PUT', headers, body: JSON.stringify(body) });
    if (!putRes.ok) {
      const err = await putRes.json();
      throw new Error(`GitHub API ${putRes.status}: ${err.message}`);
    }

    const result    = await putRes.json();
    const commitUrl = result?.commit?.html_url || '';

    state = { ...state, status: 'success', enrichedRowCount: enriched.length, ghCommitUrl: commitUrl };
  } catch (err) {
    state = { ...state, status: 'error', error: `GitHub upload failed: ${err.message}` };
  }
  render();
}

// ── Boot ──────────────────────────────────────────────────────────────────────
boot();
