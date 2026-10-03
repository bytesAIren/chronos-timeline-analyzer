---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [x] **1. Scaffold Vite SPA & Forensic Dark/Light UI Shell with Sample Loader**
  Becomes usable: A running local Vite web app displaying the header, theme toggle, tutorial video link, ingestion dropzone, raw text area, and a working "Load Sample Dispute" button that populates the input.
  Why now: Establishes project scaffolding, Vite build, CSS styling, theme toggle, and UI shell so all AI verification and dashboard components have a solid landing zone.
  PRD ref: `prd.md > Screens and Layout`, `prd.md > Look and Feel`
  Spec ref: `spec.md > Stack`, `spec.md > Components > 1. Ingestion & Header Bar`, `spec.md > File Structure`
  Build: Initialize Vite project, create package.json, index.html, src/style.css with dark/light themes, src/main.js, and src/data/sampleDispute.js with sample text.
  Verify (mechanical): Run dev server and confirm it starts at http://localhost:5173 with no errors; click "Load Sample Dispute" and verify text populates textarea.
  Learner check: Open http://localhost:5173, toggle Dark/Light theme, click "Load Sample Dispute" and verify sample text populates the area.
  Commit: `Scaffold Vite SPA shell and sample dispute loader`

- [x] **2. Phase 1 — Verification Agent (Gap & Missing Context Detection)**
  Becomes usable: Clicking "Analyze Case" calls Gemini API to evaluate missing context/dates, rendering live reasoning feedback with subtle status badges (`[✓]`, `[!]`) and an interactive gap-resolution prompt with a "Proceed Anyway" button.
  Why now: Implements Phase 1 of the core loop and proves Gemini API connectivity early with real verification feedback.
  PRD ref: `prd.md > Features and Behavior > 1. Ingestion & Gap Detection Agent (Phase 1)`
  Spec ref: `spec.md > Components > 2. Verification Agent Component`, `spec.md > External Services and Dependencies`
  Build: Implement src/services/geminiService.js Phase 1 prompt, handle API key loading from .env, stream reasoning UI state in src/main.js, render gap checklist & proceed action.
  Verify (mechanical): Call Gemini API gap test with incomplete sample dataset and verify `has_gaps: true` and missing reference items return in JSON.
  Learner check: Click "Analyze Case" on sample data, observe live reasoning status badges, and see the flagged missing context prompt appear.
  Commit: `Add Phase 1 verification agent for missing context detection`

- [x] **3. Phase 2 — Dual-Panel Forensic Dashboard & Interactive Timeline with Actor Filtering**
  Becomes usable: Completing verification or clicking "Proceed Anyway" renders the dual-panel Forensic Dashboard (Left Panel: Chronological Timeline with expandable events & Actor Filter pills; Right Panel: Bottleneck Diagnosis cards & Action Recommendations).
  Why now: Delivers the core kernel of Chronos—the zero-hallucination interactive timeline and bottleneck analysis.
  PRD ref: `prd.md > Features and Behavior > 2. Forensic Dashboard & Interactive Timeline`, `prd.md > 3. Bottleneck Analysis & Recommended Actions`
  Spec ref: `spec.md > Components > 3. Dual-Panel Forensic Dashboard`, `spec.md > Data Model`
  Build: Implement geminiService.js Phase 2 Structured JSON Output Schema (`responseSchema`), build dual-panel renderer in src/main.js with expandable cards and active Actor Filter pills.
  Verify (mechanical): Trigger Phase 2 analysis, inspect JSON schema output, and verify timeline events and bottlenecks render in the dual-panel layout.
  Learner check: Explore the dual-panel dashboard, expand event cards, and click an Actor pill (e.g. "Tizio") to filter timeline events.
  Commit: `Implement dual-panel forensic dashboard with interactive timeline and actor filters`

- [x] **4. Executive Utility Actions & Printable PDF Report Export**
  Becomes usable: Clicking "Copy Summary" copies formatted bulleted text to clipboard; clicking "Export PDF Report" opens the export options modal (`[x] Timeline`, `[x] Bottlenecks`, `[x] Actions`) and triggers clean A4 PDF print preview via `@media print` CSS.
  Why now: Completes all remaining PRD features and acceptance criteria.
  PRD ref: `prd.md > Features and Behavior > 4. Custom PDF Report Generator`
  Spec ref: `spec.md > Components > 4. Executive Utility & PDF Export Modal`, `spec.md > Look and Feel`
  Build: Add clipboard copy handler in src/main.js, add PDF Export modal, implement `@media print` rules in src/style.css.
  Verify (mechanical): Click "Copy Summary" and verify clipboard content; open PDF Export modal, toggle checkboxes, trigger print view and verify layout.
  Learner check: Test copying summary to clipboard and opening the PDF export print preview.
  Commit: `Add clipboard summary copy and custom PDF print report export`

## Hands-on Checkpoints

- [x] Early usable behavior explored — Slice 2 (Phase 1 Verification Agent)
- [x] Final kick-the-tires exploration and feedback completed

## Final Review

- [x] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [x] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [x] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [x] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: Tested with real 15k-line WhatsApp chat. Investigated and fixed prompt timeout by enforcing noise filtering and synthesis of 10-25 milestone events. Discussed privacy/GDPR enterprise architecture and LLM-agnostic abstraction.
Route and stops: src/main.js (UI state & ingestion) -> src/services/geminiService.js (AI engine & JSON schema) -> src/style.css (forensic styling & print media)
Edit outcome: Handled model upgrade to gemini-2.5-flash, maxOutputTokens, and multi-file drag & drop.
Reflection: Discussed plan-first vs vibe-coding, enterprise GDPR compliance roadmap, and LLM-agnostic design.
Activity mode: focused alternative

## Revisions

