---
doc: spec
status: approved
---

# Chronos — Technical Specification

## How This Works, In Plain Language

Chronos is a single-page web application built with HTML5, CSS, and Vanilla JavaScript using Vite. When a user uploads communication files or pastes text, Chronos sends the data to Google's Gemini API. 

In Phase 1, Gemini evaluates context completeness and returns any missing references or unreadable text warnings. In Phase 2, Gemini uses a **Structured JSON Output Schema** to extract an exact, zero-hallucination timeline and bottleneck diagnosis. The frontend renders this structured data into an interactive dual-panel forensic dashboard with actor filtering and print-to-PDF export.

## The Core Journey Through the System

PRD Ref: `prd.md > The Core Journey`.

1. **User Input (`index.html` -> `src/main.js`)**: User drops files or pastes text into the ingestion surface (or clicks "Load Sample Dispute" from `src/data/sampleDispute.js`).
2. **Phase 1 Gap Analysis (`src/services/geminiService.js`)**: Clicking "Analyze Case" sends raw text to Gemini API with gap-detection prompt. `src/main.js` streams live reasoning badges (`[✓]`, `[!]`).
3. **User Confirmation (`src/main.js`)**: If gaps are flagged, user either adds text or clicks "Proceed Anyway".
4. **Phase 2 Forensic Extraction (`src/services/geminiService.js`)**: Chronos calls Gemini with a strict JSON Schema (`responseSchema`) requesting Timeline events, Bottlenecks, and Action Recommendations.
5. **Dashboard Rendering (`src/main.js`)**: Structured JSON populates the dual-panel grid (Left: Timeline with Actor filters; Right: Bottleneck cards & Recommendations).
6. **Export & Sharing (`src/main.js` & `src/style.css`)**: User clicks "Copy Summary" (clipboard copy) or "Export PDF Report" (opens section selection modal and triggers browser `window.print()` with `@media print` CSS rules).

## Stack

- **Frontend Core**: HTML5, Vanilla JavaScript (ES6+), CSS3 (Tailwind CSS via CDN / custom CSS).
- **Build Tool / Dev Server**: [Vite](https://vitejs.dev/) (`vite` v5+).
- **AI SDK / API**: [Google Gen AI SDK](https://www.npmjs.com/package/@google/genai) (`@google/genai` v0.1+) or REST API calls to Google Gemini 2.5 Flash (`gemini-2.5-flash`).
- **Icons & Badges**: SVG Inline Icons & Monospace Status Badges (`[✓]`, `[!]`).

## Where It Runs and How Someone Tries It

- **Runtime**: Runs locally in modern desktop browsers (Chrome, Edge, Firefox, Safari).
- **Environment Requirements**: Node.js (v18+) & `npm`. Requires a Google Gemini API Key stored in `.env` as `VITE_GEMINI_API_KEY`.
- **Start Command**:
  ```bash
  npm install
  npm run dev
  ```
  Open `http://localhost:5173` in the browser for testing and demo recording.

## Look and Feel

Implements `prd.md > Look and Feel`.
- **Theme**: Monochromatic "Forensic & Intelligence Dashboard".
- **Color Palette**: Dark mode default (`#0F172A` Slate background, `#E2E8F0` text, muted ice-blue `#38BDF8` accents) with Light mode toggle (`#F8FAFC` background, `#1E293B` text).
- **Typography**: Inter / System Sans-serif for UI; JetBrains Mono / Monospace for timestamps, audit logs, and status badges (`[✓]`, `[!]`).

## Components

### 1. Ingestion & Header Bar (`index.html`)
Header with tool summary, Tutorial Video link (pointing to Devpost demo), and theme toggle. Input zone with file dropzone, text area, and 1-click Sample Dispute Loader.
PRD Ref: `prd.md > Screens and Layout`.

### 2. Verification Agent Component (`src/main.js` & `src/services/geminiService.js`)
Handles Phase 1 reasoning log display with subtle `[✓]` / `[!]` badges and missing-context prompt UI.
PRD Ref: `prd.md > Ingestion & Gap Detection Agent (Phase 1)`.

### 3. Dual-Panel Forensic Dashboard (`src/main.js`)
- Left Panel: Interactive Chronological Timeline, expandable event details, Actor Filter pills.
- Right Panel: Bottleneck Diagnosis cards and Action Recommendations list.
PRD Ref: `prd.md > Forensic Dashboard & Interactive Timeline (Phase 2)`.

### 4. Executive Utility & PDF Export Modal (`src/main.js` & `src/style.css`)
Handles clipboard copying of executive summary and PDF Export modal with section selection checkboxes and `@media print` CSS.
PRD Ref: `prd.md > Custom PDF Report Generator`.

## Data Model

```json
{
  "gap_analysis": {
    "has_gaps": true,
    "missing_references": ["Email referenced on Sept 10th is missing"],
    "unreadable_warning": false
  },
  "timeline": [
    {
      "id": "evt-1",
      "date": "2026-09-23T09:00:00Z",
      "actor": "Tizio (Operations)",
      "summary": "Sent initial dispute notification to Caio.",
      "raw_excerpt": "Caio, please see attached invoice discrepancy..."
    }
  ],
  "bottlenecks": [
    {
      "id": "btn-1",
      "title": "Approval Stalled at Legal",
      "severity": "high",
      "description": "Caio forwarded to Sempronia on Sept 25th but received no reply."
    }
  ],
  "recommendations": [
    "Escalate to Sempronia's team lead regarding invoice approval."
  ]
}
```

## File Structure

```
my_project/
├── index.html                   # Main SPA container & layout
├── package.json                 # Project dependencies and scripts
├── vite.config.js               # Vite configuration
├── .env.example                 # Environment variables template
├── .gitignore                   # Excludes .env, node_modules, build outputs
├── src/
│   ├── main.js                  # Application controller & DOM management
│   ├── style.css                # Forensic theme styling & print CSS
│   ├── services/
│   │   └── geminiService.js     # Gemini API calls & JSON Schema definitions
│   └── data/
│       └── sampleDispute.js     # 1-click sample dispute data for demo
└── devpost/                     # Hackathon planning workspace
    ├── learner-profile.md
    ├── scope.md
    ├── prd.md
    └── spec.md
```

## External Services and Dependencies

- **Google Gemini API (`gemini-2.5-flash`)**:
  - Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`
  - Docs: [Google AI Gemini API Documentation](https://ai.google.dev/docs)
  - Keys Required: `VITE_GEMINI_API_KEY` (passed via `.env`).
  - Usage: Phase 1 Gap Detection & Phase 2 Structured JSON Timeline/Bottleneck Extraction.

## Important Failure Modes

- **Invalid / Missing API Key** -> Displays clear banner: *"Gemini API Key missing. Please set VITE_GEMINI_API_KEY in your .env file."*
- **Unreadable / Empty Input Files** -> Verification agent returns warning: *"Unreadable text or no dates detected. Please provide valid communication logs."*
- **Network / API Timeout** -> Displays retry button: *"Analysis request timed out. Click to retry."*

## What Was Simplified and Why

- **Browser-native `@media print` PDF Export** instead of server-side PDF generators like Puppeteer or PDFKit — keeps the app 100% client-side, fast, and dependency-free.
- **Local file/text ingestion** instead of direct Outlook/Teams OAuth integrations — eliminates complex authentication setup while remaining 100% effective for the demo.

## Decisions and Open Issues

- **Learner Choice**: Web-native Vite + JS + Gemini API stack selected over Streamlit to achieve a crisp, custom monochromatic forensic dashboard layout.
- **Learner Choice**: Structured JSON Output Schema selected for 0-hallucination, deterministic timeline parsing.
- **Uncertainty Clarified**: Explained Gemini's `responseSchema` mechanism for deterministic JSON parsing, ensuring complete confidence in the timeline generator.
