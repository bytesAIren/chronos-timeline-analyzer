---
doc: prd
status: approved
---

# Chronos — Product Requirements Document

Chronos is an AI-powered forensic tool for commercial managers, legal counsel, and operations specialists that ingests multi-channel communication files, verifies timeline integrity and missing context, and renders an interactive chronological timeline alongside bottleneck root-cause analysis and actionable resolution steps.
Source: `scope.md > The Unique Kernel` and `scope.md > The Core Loop`.

## The Core Journey

1. **Arrival & Orientation**: The user opens Chronos. The top header displays a brief summary box explaining the tool's purpose, alongside a "Tutorial Video" button linking to the hackathon demo.
2. **Data Ingestion**: The user uploads files via drag-and-drop (`.txt`, `.pdf`, `.eml`) or pastes raw chat transcript text into the input box. They can also click "Load Sample Dispute" for a 1-click test case.
3. **Phase 1 — Gap & Context Verification**: Clicking "Analyze Case" triggers Phase 1. Chronos streams real-time reasoning phrases with subtle, typography-matched status badges (`[✓]` for verified, `[!]` for missing context). If gaps exist (e.g. missing Sept 10th email), Chronos prompts the user to supply data or click "Proceed Anyway". If files are unreadable, an alert requests valid input.
4. **Phase 2 — Forensic Dashboard**: Upon verification or forced progress, Chronos opens the single-page dual-panel dashboard:
   - **Left Panel**: Interactive Chronological Timeline with dates, actors, event summaries, expandable details, and Actor Filter pills.
   - **Right Panel**: Bottleneck Root Cause Analysis and Actionable Resolution Steps.
5. **Executive Utility & Export**: The user can click "Copy Summary" for instant Teams/email updates or click "Export PDF Report" to open a modal selecting report sections (`[x] Timeline`, `[x] Bottlenecks`, `[x] Actions`) for clean PDF printing.

## Screens and Layout

Chronos is a responsive, single-page application (SPA) with three main view states:
- **Header Bar**: Title, brief tool summary box, Tutorial Video link, Dark/Light theme toggle.
- **Surface A — Ingestion & Verification**: Upload dropzone, raw text area, sample dataset loader button, live reasoning log box with subtle status indicators.
- **Surface B — Forensic Dashboard**: 
  - Dual-panel grid (expandable on click).
  - Left Panel: Chronological Timeline feed with Actor filters.
  - Right Panel: Bottleneck Diagnosis & Action Plan cards.
  - Action Bar: "Copy Summary for Email/Teams" button and "Export PDF Report" button.

## Look and Feel

- **Theme**: Monochromatic "Forensic & Intelligence Dashboard" aesthetic.
- **Color Palette**: Dark mode (default: deep slate/black background, muted grey text, subtle ice-blue action accents) and Light mode toggle.
- **Status Badges**: Subtle, elegant micro-badges (`[✓]` and `[!]`) matching the typography and color palette—no loud green checks or giant red icons.
- **Typography**: Clean, highly legible sans-serif / monospace hybrid for timestamps and audit logs.

## Features and Behavior

### 1. Ingestion & Gap Detection Agent (Phase 1)
- Supports file upload (`.txt`, `.pdf`, `.eml`) and raw text pasting.
- Includes a "Load Sample Dispute" button pre-loaded with an incomplete email/chat thread.
- Displays streaming reasoning feedback during analysis.
- Detects unreadable files or missing temporal context and flags missing references.
- User Story: *As a commercial manager, I want Chronos to flag missing context before analyzing so that I don't draw conclusions from incomplete data.*
  - [ ] Flag missing email/chat references with subtle `[!]` badges.
  - [ ] Provide "Add Context" box and "Proceed Anyway" button.

### 2. Forensic Dashboard & Interactive Timeline (Phase 2)
- Renders events in strict chronological order with Date/Time, Actor, and Event Summary.
- Expandable event cards showing raw source excerpts.
- Actor Filter pills to isolate specific contributors (e.g. filter by "Tizio" or "Caio").
- User Story: *As a legal specialist, I want an interactive timeline so that I can immediately track who said what and when.*
  - [ ] Render chronological list of events with expandable details.
  - [ ] Filter timeline events by selecting specific actors.

### 3. Bottleneck Analysis & Recommended Actions
- Identifies root causes of project delays (e.g., waiting on approval, missing documentation).
- Displays step-by-step actionable recommendations to unblock the dispute.
- "Copy Summary" button copies a bulleted executive summary to clipboard.
- User Story: *As an operations specialist, I want clear bottleneck diagnoses so that I know exactly how to resolve the delay.*
  - [ ] Display Bottleneck Diagnosis card and Recommended Action Plan card.
  - [ ] Copy formatted summary to clipboard upon clicking "Copy Summary".

### 4. Custom PDF Report Generator
- Clicking "Export PDF Report" opens an export options modal.
- Allows user to toggle sections: `[x] Full Timeline`, `[x] Bottleneck Analysis`, `[x] Recommended Actions`.
- Triggers browser `window.print()` using a dedicated print stylesheet formatted for clean A4 PDF output.

## States and Boundaries

- **First Use / Initial State**: Clean ingestion dropzone with sample case button and tutorial link.
- **Analyzing State**: Live reasoning log with subtle status indicators.
- **Gap Detected State**: Interactive checklist of gaps with option to upload missing info or proceed.
- **Unreadable Input Error State**: Notification stating text lacks dates or readable structure.
- **Results State**: Dual-panel forensic dashboard with active filters and export actions.

## Product Decisions

- **Single-page dual-panel layout**: Selected over multi-page navigation to keep context visible at a glance.
- **Browser-native PDF printing**: Selected over complex PDF libraries to keep the PoC fast, robust, and zero-dependency.
- **Subtle monochromatic status badges**: Chosen over bright green/red icons to maintain a sophisticated forensic aesthetic.

## What We're Building

A fully functional, responsive SPA proof of concept featuring file/text ingestion, AI gap verification, an interactive chronological timeline with actor filtering, bottleneck diagnosis, clipboard copy, and printable PDF report export.

## Deferred From the POC

- Outlook / Teams direct API integration (deferred to keep PoC file-based and instant).
- User authentication and multi-case database storage (deferred for local SPA demo).
- Automatic email sending or notification triggers (deferred to focus on forensic analysis).

## Non-Goals

- Parsing proprietary encrypted binary files.
- Live real-time chat monitoring.

## Open Questions

None. All product requirements and behaviors are established.
