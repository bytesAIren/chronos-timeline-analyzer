import './style.css';
import { SAMPLE_DISPUTE_TEXT } from './data/sampleDispute.js';
import { analyzeGaps, extractTimelineAndBottlenecks } from './services/geminiService.js';

let appState = {
  theme: 'dark',
  inputText: '',
  gapData: null,
  analysisData: null,
  activeActorFilter: 'ALL'
};

// DOM Elements
const btnThemeToggle = document.getElementById('btn-theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const themeLabel = document.getElementById('theme-label');

const inputDispute = document.getElementById('input-dispute');
const btnLoadSample = document.getElementById('btn-load-sample');
const btnAnalyzeCase = document.getElementById('btn-analyze-case');

const surfaceVerification = document.getElementById('surface-verification');
const reasoningLog = document.getElementById('reasoning-log');
const gapActionBox = document.getElementById('gap-action-box');
const missingGapsList = document.getElementById('missing-gaps-list');
const btnProceedAnyway = document.getElementById('btn-proceed-anyway');

const surfaceDashboard = document.getElementById('surface-dashboard');
const timelineContainer = document.getElementById('timeline-container');
const bottlenecksContainer = document.getElementById('bottlenecks-container');
const recommendationsContainer = document.getElementById('recommendations-container');
const actorFiltersContainer = document.getElementById('actor-filters');

const btnCopySummary = document.getElementById('btn-copy-summary');
const btnExportPdf = document.getElementById('btn-export-pdf');
const modalExport = document.getElementById('modal-export');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnTriggerPrint = document.getElementById('btn-trigger-print');
const btnTutorial = document.getElementById('btn-tutorial');

// Theme Toggle
btnThemeToggle.addEventListener('click', () => {
  appState.theme = appState.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', appState.theme);
  themeIcon.textContent = appState.theme === 'dark' ? '🌙' : '☀️';
  themeLabel.textContent = appState.theme === 'dark' ? 'Dark Mode' : 'Light Mode';
});

// Tutorial Button
btnTutorial.addEventListener('click', () => {
  alert('Tutorial Video: This link will open your official Devpost Hackathon Demo Video!');
});

// Load Sample Dispute Case
btnLoadSample.addEventListener('click', () => {
  inputDispute.value = SAMPLE_DISPUTE_TEXT;
  appState.inputText = SAMPLE_DISPUTE_TEXT;
});

// Phase 1: Analyze Case & Verify Gaps
btnAnalyzeCase.addEventListener('click', async () => {
  const text = inputDispute.value.trim();
  if (!text) {
    alert('Please paste or load dispute text first.');
    return;
  }

  appState.inputText = text;
  surfaceVerification.classList.remove('hidden');
  reasoningLog.innerHTML = '<div class="reasoning-item"><span>⏳</span> Analyzing document structure and temporal markers...</div>';

  try {
    const result = await analyzeGaps(text);
    appState.gapData = result;

    let logHtml = '<div class="reasoning-item"><span class="badge-ok">[✓]</span> Document parsing initialized.</div>';
    logHtml += '<div class="reasoning-item"><span class="badge-ok">[✓]</span> Temporal markers evaluated.</div>';

    if (result.has_gaps) {
      logHtml += '<div class="reasoning-item"><span class="badge-warn">[!]</span> Missing context references identified in communication timeline.</div>';
      reasoningLog.innerHTML = logHtml;

      missingGapsList.innerHTML = result.missing_references.map(ref => `<li>${ref}</li>`).join('');
      gapActionBox.classList.remove('hidden');
    } else {
      logHtml += '<div class="reasoning-item"><span class="badge-ok">[✓]</span> Context complete. Proceeding to forensic analysis...</div>';
      reasoningLog.innerHTML = logHtml;
      await runPhase2Analysis();
    }
  } catch (err) {
    reasoningLog.innerHTML += `<div class="reasoning-item" style="color: #f87171;">❌ Verification Error: ${err.message}</div>`;
  }
});

// Proceed Anyway Handler
btnProceedAnyway.addEventListener('click', async () => {
  await runPhase2Analysis();
});

// Phase 2: Run Forensic Dashboard Extraction
async function runPhase2Analysis() {
  surfaceDashboard.classList.remove('hidden');
  timelineContainer.innerHTML = '<div style="padding: 1rem; color: var(--text-secondary);">Extracting chronological timeline and root-cause bottlenecks...</div>';
  
  try {
    const data = await extractTimelineAndBottlenecks(appState.inputText);
    appState.analysisData = data;
    renderDashboard(data);
  } catch (err) {
    timelineContainer.innerHTML = `<div style="color: #f87171;">Error rendering dashboard: ${err.message}</div>`;
  }
}

// Render Dual-Panel Forensic Dashboard
function renderDashboard(data) {
  // Extract Unique Actors for Filters
  const actors = ['ALL', ...new Set(data.timeline.map(item => item.actor.split(' ')[0]))];
  renderActorFilters(actors);
  renderTimeline(data.timeline);
  renderBottlenecks(data.bottlenecks);
  renderRecommendations(data.recommendations);
}

// Render Actor Filter Pills
function renderActorFilters(actors) {
  actorFiltersContainer.innerHTML = actors.map(actor => `
    <button class="pill-filter ${appState.activeActorFilter === actor ? 'active' : ''}" data-actor="${actor}">
      ${actor === 'ALL' ? 'Show All Actors' : actor}
    </button>
  `).join('');

  actorFiltersContainer.querySelectorAll('.pill-filter').forEach(btn => {
    btn.addEventListener('click', (e) => {
      appState.activeActorFilter = e.target.dataset.actor;
      renderActorFilters(actors);
      filterTimeline();
    });
  });
}

// Filter Timeline Events by Actor
function filterTimeline() {
  if (!appState.analysisData) return;
  if (appState.activeActorFilter === 'ALL') {
    renderTimeline(appState.analysisData.timeline);
  } else {
    const filtered = appState.analysisData.timeline.filter(item => 
      item.actor.toLowerCase().includes(appState.activeActorFilter.toLowerCase())
    );
    renderTimeline(filtered);
  }
}

// Render Timeline Feed
function renderTimeline(timeline) {
  if (!timeline || timeline.length === 0) {
    timelineContainer.innerHTML = '<div style="color: var(--text-secondary);">No events found for this filter.</div>';
    return;
  }

  timelineContainer.innerHTML = timeline.map(item => `
    <div class="timeline-item">
      <div class="timeline-date">${item.date}</div>
      <div class="timeline-actor">${item.actor}</div>
      <div class="timeline-summary">${item.summary}</div>
      <details style="margin-top: 0.5rem; font-size: 0.8rem; color: var(--text-secondary);">
        <summary style="cursor: pointer;">Raw Excerpt</summary>
        <div style="font-family: var(--font-mono); margin-top: 0.3rem; padding: 0.5rem; background: var(--bg-primary); border-radius: 4px;">
          "${item.raw_excerpt}"
        </div>
      </details>
    </div>
  `).join('');
}

// Render Bottleneck Diagnosis Cards
function renderBottlenecks(bottlenecks) {
  bottlenecksContainer.innerHTML = bottlenecks.map(item => `
    <div class="bottleneck-card">
      <div class="bottleneck-title">🚨 [${item.severity}] ${item.title}</div>
      <div style="font-size: 0.875rem; color: var(--text-secondary);">${item.description}</div>
    </div>
  `).join('');
}

// Render Action Plan
function renderRecommendations(recommendations) {
  recommendationsContainer.innerHTML = `
    <ul style="margin-left: 1.25rem; font-size: 0.9rem; color: var(--text-secondary);">
      ${recommendations.map(rec => `<li style="margin-bottom: 0.5rem;">${rec}</li>`).join('')}
    </ul>
  `;
}

// Copy Summary for Teams / Email
btnCopySummary.addEventListener('click', () => {
  if (!appState.analysisData) return;
  const summaryText = `Chronos Forensic Summary:
- Key Bottleneck: ${appState.analysisData.bottlenecks[0]?.title || 'None'}
- Top Action Required: ${appState.analysisData.recommendations[0] || 'None'}
Generated via Chronos Forensic Dashboard.`;

  navigator.clipboard.writeText(summaryText);
  alert('Executive summary copied to clipboard! Ready to paste into Teams or Email.');
});

// PDF Export Modal Handlers
btnExportPdf.addEventListener('click', () => modalExport.classList.remove('hidden'));
btnCloseModal.addEventListener('click', () => modalExport.classList.add('hidden'));

btnTriggerPrint.addEventListener('click', () => {
  modalExport.classList.add('hidden');
  window.print();
});
