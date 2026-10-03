import './style.css';
import { icon, mountIcons } from './icons.js';

mountIcons();
import { analyzeGaps, extractTimelineAndBottlenecks } from './services/geminiService.js';

// =============================================
//  APPLICATION STATE
// =============================================
let appState = {
  theme: 'dark',
  allText: '',           // combined text from all sources
  uploadedFiles: [],     // list of {name, text} objects
  pastedText: '',
  gapData: null,
  analysisData: null,
  activeActorFilter: 'ALL'
};

// =============================================
//  DOM ELEMENTS
// =============================================
const btnThemeToggle  = document.getElementById('btn-theme-toggle');
const themeIcon       = document.getElementById('theme-icon');
const themeLabel      = document.getElementById('theme-label');
const btnTutorial     = document.getElementById('btn-tutorial');

const dropZone        = document.getElementById('drop-zone');
const fileUploadInput = document.getElementById('file-upload');
const fileListEl      = document.getElementById('file-list');

const inputDispute    = document.getElementById('input-dispute');
const btnLoadSample   = document.getElementById('btn-load-sample');
const btnAnalyzeCase  = document.getElementById('btn-analyze-case');

const surfaceVerification = document.getElementById('surface-verification');
const reasoningLog        = document.getElementById('reasoning-log');
const gapActionBox        = document.getElementById('gap-action-box');
const missingGapsList     = document.getElementById('missing-gaps-list');
const btnProceedAnyway    = document.getElementById('btn-proceed-anyway');

const surfaceDashboard        = document.getElementById('surface-dashboard');
const timelineContainer       = document.getElementById('timeline-container');
const bottlenecksContainer    = document.getElementById('bottlenecks-container');
const recommendationsContainer = document.getElementById('recommendations-container');
const actorFiltersContainer   = document.getElementById('actor-filters');

const btnCopySummary  = document.getElementById('btn-copy-summary');
const btnExportPdf    = document.getElementById('btn-export-pdf');
const modalExport     = document.getElementById('modal-export');
const btnCloseModal   = document.getElementById('btn-close-modal');
const btnTriggerPrint = document.getElementById('btn-trigger-print');

// =============================================
//  THEME TOGGLE
// =============================================
btnThemeToggle.addEventListener('click', () => {
  appState.theme = appState.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', appState.theme);
  themeIcon.innerHTML = icon(appState.theme === 'dark' ? 'sun' : 'moon');
  themeLabel.textContent = appState.theme === 'dark' ? 'Light Mode' : 'Dark Mode';
});

// Tutorial link (placeholder — replace with actual video URL)
btnTutorial.addEventListener('click', () => {
  alert('Tutorial Video: Replace this with your Devpost demo video URL!');
});

// =============================================
//  FILE UPLOAD — drag & drop + browse
// =============================================

// Read a file object and return its text
function readFileAsText(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result || '');
    reader.onerror = () => resolve('');
    // For .eml, .msg, .txt: read as text
    // For .pdf: basic text extraction via readAsText (works for text-based PDFs)
    reader.readAsText(file, 'UTF-8');
  });
}

// Add a file to the uploaded files list and render chips
async function addFile(file) {
  const text = await readFileAsText(file);
  appState.uploadedFiles.push({ name: file.name, text });
  renderFileChips();
}

function renderFileChips() {
  if (appState.uploadedFiles.length === 0) {
    fileListEl.classList.add('hidden');
    return;
  }
  fileListEl.classList.remove('hidden');
  fileListEl.innerHTML = appState.uploadedFiles.map((f, i) => `
    <div class="file-chip">
      ${icon('file')} ${f.name}
      <button data-idx="${i}" title="Remove" aria-label="Remove file">${icon('close')}</button>
    </div>
  `).join('');
  fileListEl.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.currentTarget.dataset.idx);
      appState.uploadedFiles.splice(idx, 1);
      renderFileChips();
    });
  });
}

// Browse button
fileUploadInput.addEventListener('change', async (e) => {
  for (const file of e.target.files) {
    await addFile(file);
  }
  e.target.value = ''; // reset so same file can be re-added
});

// Drag & Drop
dropZone.addEventListener('click', (e) => {
  if (e.target.tagName !== 'LABEL') fileUploadInput.click();
});
dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', async (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  for (const file of e.dataTransfer.files) {
    await addFile(file);
  }
});

// =============================================
//  LOAD SAMPLE DISPUTE (from sample_case/ folder)
// =============================================
btnLoadSample.addEventListener('click', async () => {
  try {
    // Fetch sample files relative to the application base URL
    const base = import.meta.env.BASE_URL || './';
    const [emailResp, teamsResp, emlResp] = await Promise.all([
      fetch(`${base}sample_case/email_thread.txt`),
      fetch(`${base}sample_case/teams_chat.txt`),
      fetch(`${base}sample_case/legal_request.eml`)
    ]);
    const [emails, teams, eml] = await Promise.all([
      emailResp.text(),
      teamsResp.text(),
      emlResp.text()
    ]);

    // Load as virtual files
    appState.uploadedFiles = [
      { name: 'email_thread.txt', text: emails },
      { name: 'teams_chat.txt', text: teams },
      { name: 'legal_request.eml', text: eml }
    ];
    renderFileChips();
    inputDispute.value = '';
    alert('Sample case loaded: 2 emails + 1 Teams chat + 1 EML file. Click "Analyze Case" to proceed.');
  } catch (err) {
    alert('Could not load sample files: ' + err.message);
  }
});

// =============================================
//  COMBINE ALL TEXT SOURCES
// =============================================
function buildCombinedText() {
  const parts = [];
  for (const f of appState.uploadedFiles) {
    parts.push(`\n\n=== FILE: ${f.name} ===\n${f.text}`);
  }
  const pasted = inputDispute.value.trim();
  if (pasted) parts.push(`\n\n=== PASTED TEXT ===\n${pasted}`);
  return parts.join('\n').trim();
}

// =============================================
//  PHASE 1: ANALYZE CASE
// =============================================
btnAnalyzeCase.addEventListener('click', async () => {
  const combined = buildCombinedText();
  if (!combined) {
    alert('Please upload files or paste text before analyzing.');
    return;
  }

  appState.allText = combined;

  // Show verification surface and reset state
  surfaceVerification.classList.remove('hidden');
  gapActionBox.classList.add('hidden');
  surfaceDashboard.classList.add('hidden');
  reasoningLog.innerHTML = `<div class="reasoning-item">${icon('loader')} Parsing document sources...</div>`;

  // Scroll to verification section
  surfaceVerification.scrollIntoView({ behavior: 'smooth', block: 'start' });

  try {
    const isMock = !import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY === 'your_gemini_api_key_here';
    if (isMock) {
      appendLog('warn', 'Demo Mode: Running in offline simulation. Results reflect the reference Sample Dispute Case.');
    }

    // Simulate step-by-step reasoning log
    await delay(400);
    appendLog('ok', `${appState.uploadedFiles.length} file(s) + pasted text parsed successfully.`);
    await delay(500);
    appendLog('ok', 'Document structure and formatting evaluated.');
    await delay(600);
    appendLog('ok', 'Scanning for temporal markers, actors, and references...');
    await delay(300);

    const result = await analyzeGaps(combined);
    appState.gapData = result;

    if (result.unreadable_warning) {
      appendLog('warn', 'Warning: No readable dates or temporal context detected. Analysis may be incomplete.');
    }

    if (result.has_gaps && result.missing_references.length > 0) {
      appendLog('warn', `${result.missing_references.length} missing context reference(s) identified.`);
      missingGapsList.innerHTML = result.missing_references.map(ref => `<li>${ref}</li>`).join('');
      gapActionBox.classList.remove('hidden');
    } else {
      appendLog('ok', 'Context complete. No missing references detected.');
      await delay(300);
      appendLog('ok', 'Proceeding to forensic analysis...');
      await delay(400);
      await runPhase2Analysis();
    }
  } catch (err) {
    appendLog('error', `Analysis Error: ${err.message}`);
    console.error(err);
  }
});

// Utility: append a line to reasoning log
function appendLog(type, message) {
  const div = document.createElement('div');
  div.className = 'reasoning-item';
  const badge = type === 'ok'
    ? `<span class="badge-ok">${icon('check')}</span>`
    : type === 'warn'
    ? `<span class="badge-warn">${icon('alert')}</span>`
    : `<span class="badge-error">${icon('close')}</span>`;
  div.innerHTML = `${badge} ${message}`;
  reasoningLog.appendChild(div);
  reasoningLog.scrollTop = reasoningLog.scrollHeight;
}

// Utility: simple delay
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// Proceed Anyway
btnProceedAnyway.addEventListener('click', async () => {
  gapActionBox.classList.add('hidden');
  appendLog('ok', 'User chose to proceed. Running forensic extraction...');
  await runPhase2Analysis();
});

// =============================================
//  PHASE 2: FORENSIC EXTRACTION & DASHBOARD
// =============================================
async function runPhase2Analysis() {
  surfaceDashboard.classList.remove('hidden');
  timelineContainer.innerHTML = `<div style="padding: 1.5rem; color: var(--text-secondary); font-family: var(--font-mono); font-size: 0.85rem; line-height: 1.6;">${icon('loader')} <strong>Extracting chronological timeline and bottlenecks...</strong><br><span style="font-size: 0.78rem; opacity: 0.8;">Processing large dataset with Gemini 2.5 Flash. For voluminous logs (thousands of lines), extraction may take 30–60 seconds...</span></div>`;
  surfaceDashboard.scrollIntoView({ behavior: 'smooth', block: 'start' });

  try {
    const data = await extractTimelineAndBottlenecks(appState.allText);
    appState.analysisData = data;
    renderDashboard(data);
    appendLog('ok', 'Forensic dashboard rendered successfully.');
  } catch (err) {
    timelineContainer.innerHTML = `<div style="color: var(--danger-color);">Error: ${err.message}</div>`;
    appendLog('error', `Dashboard Error: ${err.message}`);
  }
}

// =============================================
//  DASHBOARD RENDERING
// =============================================
function renderDashboard(data) {
  const actors = ['ALL', ...new Set(data.timeline.map(e => e.actor.split(' ')[0]))];
  renderActorFilters(actors, data.timeline);
  renderTimeline(data.timeline);
  renderBottlenecks(data.bottlenecks);
  renderRecommendations(data.recommendations);
}

function renderActorFilters(actors, timeline) {
  actorFiltersContainer.innerHTML = actors.map(actor => `
    <button class="pill-filter ${appState.activeActorFilter === actor ? 'active' : ''}" data-actor="${actor}">
      ${actor === 'ALL' ? 'All Actors' : actor}
    </button>
  `).join('');
  actorFiltersContainer.querySelectorAll('.pill-filter').forEach(btn => {
    btn.addEventListener('click', (e) => {
      appState.activeActorFilter = e.currentTarget.dataset.actor;
      renderActorFilters(actors, timeline);
      const filtered = appState.activeActorFilter === 'ALL'
        ? timeline
        : timeline.filter(ev => ev.actor.toLowerCase().includes(appState.activeActorFilter.toLowerCase()));
      renderTimeline(filtered);
    });
  });
}

function renderTimeline(timeline) {
  if (!timeline || timeline.length === 0) {
    timelineContainer.innerHTML = '<div style="color: var(--text-secondary); font-size: 0.85rem;">No events found for this filter.</div>';
    return;
  }
  timelineContainer.innerHTML = timeline.map(item => `
    <div class="timeline-item">
      <div class="timeline-date">${item.date}</div>
      <div class="timeline-actor">${item.actor}</div>
      <div class="timeline-summary">${item.summary}</div>
      ${item.raw_excerpt ? `
      <details>
        <summary>View source excerpt</summary>
        <div class="timeline-excerpt">${item.raw_excerpt}</div>
      </details>` : ''}
    </div>
  `).join('');
}

function renderBottlenecks(bottlenecks) {
  bottlenecksContainer.innerHTML = bottlenecks.map(item => `
    <div class="bottleneck-card">
      <div class="bottleneck-title">[${item.severity}] ${item.title}</div>
      <div class="bottleneck-desc">${item.description}</div>
    </div>
  `).join('');
}

function renderRecommendations(recommendations) {
  recommendationsContainer.innerHTML = `
    <ul class="recommendations-list">
      ${recommendations.map((rec, i) => `
        <li><span class="rec-num">${i + 1}</span><span>${rec}</span></li>
      `).join('')}
    </ul>
  `;
}

// =============================================
//  UTILITY ACTIONS
// =============================================
btnCopySummary.addEventListener('click', () => {
  if (!appState.analysisData) { alert('No analysis available yet.'); return; }
  const { bottlenecks, recommendations } = appState.analysisData;
  const text = [
    'Chronos Forensic Summary',
    '',
    'Key Bottlenecks:',
    ...bottlenecks.map(b => `  • [${b.severity}] ${b.title}: ${b.description}`),
    '',
    'Recommended Actions:',
    ...recommendations.map((r, i) => `  ${i + 1}. ${r}`),
    '',
    'Generated by Chronos Forensic Analyzer'
  ].join('\n');

  navigator.clipboard.writeText(text).then(() => {
    alert('Summary copied to clipboard — ready to paste into Teams or Email!');
  }).catch(() => {
    alert('Clipboard not available. Please copy manually from the dashboard.');
  });
});

btnExportPdf.addEventListener('click', () => modalExport.classList.remove('hidden'));
btnCloseModal.addEventListener('click', () => modalExport.classList.add('hidden'));
btnTriggerPrint.addEventListener('click', () => {
  const sections = ['timeline', 'bottlenecks', 'actions'];
  const selected = sections.filter(name => document.getElementById(`chk-pdf-${name}`).checked);
  if (selected.length === 0) {
    alert('Select at least one section to export.');
    return;
  }
  sections.forEach(name => {
    document.getElementById(`report-${name}`).classList.toggle('print-excluded', !selected.includes(name));
  });
  document.getElementById('report-findings').classList.toggle(
    'print-excluded', !selected.includes('bottlenecks') && !selected.includes('actions')
  );
  modalExport.classList.add('hidden');
  window.print();
});
