# Chronos — Timeline & Bottleneck Analyzer ⏳🔍

> **Forensic Communication Intelligence Dashboard**  
> *Ingest multi-channel dispute communications (emails, WhatsApp, Teams, PDFs) to audit timeline continuity, detect missing context, and diagnose root-cause bottlenecks with zero-hallucination structured outputs.*

---

## ⚠️ Security & Data Privacy Notice (PoC Disclaimer)

> **Important:** This project is a functional Proof of Concept (PoC) built for the **Build with AI: Basics** hackathon.  
> In this client-side prototype, text is sent directly from your browser to Google AI Studio's Gemini API (`gemini-2.5-flash`).  
> **Do not upload confidential corporate agreements, privileged legal documents, or unmasked Personally Identifiable Information (PII)** when using public free-tier API keys.

### 🛡️ Enterprise Security & LLM-Agnostic Roadmap
To transition Chronos into an enterprise-ready, GDPR-compliant production deployment:
1. **Local Pre-Flight PII Redaction:** Implement client-side or backend tokenization (e.g., via Microsoft Presidio or local regex/NER) to replace sensitive entities (`Mario Rossi` → `[ACTOR_1]`, `IBAN IT02...` → `[BANK_DATA_1]`, `€45,000` → `[AMOUNT_1]`) *before* any text leaves the corporate firewall.
2. **Sovereign Cloud & Zero Data Retention (ZDR):** Connect to Google Cloud Vertex AI (EU Regions: Frankfurt/Milan) with contractual Zero Data Retention guarantees and Customer-Managed Encryption Keys (CMEK).
3. **100% Air-Gapped / LLM-Agnostic Engine:** Chronos is architecturally LLM-agnostic: by pointing the API client to an OpenAI-compatible endpoint, the engine can run entirely offline on local open-weight models (e.g., Gemma 2, Llama 3 via Ollama/vLLM) without sending any data over the internet.

---

## 📌 Why Chronos?

In business operations, procurement, and legal disputes, the ground truth is rarely in one clean document. Critical information is scattered across email threads, Teams messages, WhatsApp chats, and PDF letters.

Standard AI assistants or single-channel summaries (like Teams Copilot or Slack AI):
- Only look at a single platform.
- Hallucinate dates or smooth over conflicting statements.
- Never audit whether a cited document is missing.

**Chronos solves this through a dual-phase forensic pipeline:**
1. **Phase 1 — Verification & Gap Detection:** Audits the submitted records for continuity breaks (e.g., *"Email #2 references a contract agreed on Sept 10th, but no record for Sept 10th was provided"*).
2. **Phase 2 — Dual-Panel Forensic Dashboard:** Extracts a strict chronological timeline with actor filtering, isolates operational bottlenecks categorized by severity (`[HIGH]`, `[MEDIUM]`, `[LOW]`), and delivers actionable next steps.

---

## ✨ Features

- **Multi-Source Ingestion:** Drag-and-drop support for `.txt`, `.eml`, `.msg`, and `.pdf` files, plus a direct paste zone for instant chat transcript analysis.
- **Built-in Sample Case:** One-click loading of a realistic procurement dispute with multi-channel records in `public/sample_case/`.
- **Noise Filtering Engine:** Optimized prompt pipeline that strips conversational noise from massive chat logs (tested on 15,000+ line exports) while extracting 10–25 high-signal milestones.
- **Actor Filter Pills:** Isolate specific actors in the timeline with a single click.
- **Forensic Monochromatic UI:** Deep slate aesthetic, JetBrains Mono typography, status badges (`[✓]`, `[!]`), and an instant **Dark / Light theme switch**.
- **One-Click Export & Reporting:** 
  - *Copy Summary:* Formats executive findings directly for Teams or Email.
  - *Export PDF:* Uses print-ready CSS (`@media print`) to generate clean, printable A4 dispute audit reports.

---

## 🚀 Quickstart Guide

### Prerequisites
- Node.js (v18+)
- A Google Gemini API Key (from [Google AI Studio](https://aistudio.google.com/))

### 1. Clone & Install
```bash
git clone https://github.com/bytesAIren/chronos-timeline-analyzer.git
cd chronos-timeline-analyzer
npm install
```

### 2. Configure Environment
Create a `.env` file in the root directory (you can copy `.env.example`):
```bash
# In your .env file:
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```
*(Note: If no API key is provided, Chronos automatically runs in an intelligent fallback simulation mode for safe demonstration).*

### 3. Start Development Server
```bash
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🧪 Testing the Application

1. **Test with the Built-in Sample:** Click **"📋 Load Sample Dispute Case"** to load pre-staged procurement dispute records. Click **"🔍 Analyze Case"** to view Phase 1 Gap Detection and proceed to the dashboard.
2. **Test with Real Logs:** Paste any conversational log (WhatsApp, Teams export, or customer support thread) or drag in `.txt`/`.eml` files.
3. **Actor Filtering:** Click on any actor name pill above the timeline to filter events for that specific person.
4. **Printable Audit Report:** Click **"📄 Export PDF Report"** to preview and print the executive summary.

---

## 🛠️ Architecture & Tech Stack

- **Frontend:** Vanilla JavaScript (ES Modules) + Vite (Zero heavy UI framework bloat, sub-second load times)
- **Styling:** Custom Forensic Design System with CSS Custom Properties and `@media print` rules
- **LLM Engine:** Google Gemini 2.5 Flash (`gemini-2.5-flash`) via direct REST API with JSON Structured Output (`responseMimeType: "application/json"`)
- **Process & Rigor:** Built following a plan-first methodology (Scope → PRD → Technical Spec → Step-by-Step Verified Slices).

---

## 📄 License
MIT License. Created for the **Build with AI: Basics** Hackathon.
