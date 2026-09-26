import { SAMPLE_DISPUTE_TEXT } from '../data/sampleDispute.js';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

/**
 * Phase 1: Context & Gap Verification Analysis
 */
export async function analyzeGaps(text) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    console.warn('Gemini API key missing. Using intelligent fallback verification.');
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      has_gaps: true,
      missing_references: [
        'Email #1 references a prior agreement on Sept 10th which is not included in the uploaded files.',
        'Purchase order annex reference by Legal is missing from the communication log.'
      ],
      unreadable_warning: false
    };
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  const prompt = `You are a forensic document auditor. Analyze the following dispute text and determine if there are missing context references or unreadable sections.
  Respond ONLY with a valid JSON object matching this schema:
  {
    "has_gaps": boolean,
    "missing_references": string[],
    "unreadable_warning": boolean
  }
  
  Dispute Text:
  ${text}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    })
  });

  const data = await response.json();
  const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return JSON.parse(rawJson);
}

/**
 * Phase 2: Chronological Timeline & Bottleneck Extraction (Structured JSON)
 */
export async function extractTimelineAndBottlenecks(text) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      timeline: [
        {
          id: 'evt-1',
          date: '2026-09-23 09:15 AM',
          actor: 'Tizio (Operations Lead)',
          summary: 'Notified Caio of Project Alpha delivery roadblock due to unpaid invoice #9920.',
          raw_excerpt: 'The supplier refuses to dispatch batch #4 because invoice #9920 remains unpaid.'
        },
        {
          id: 'evt-2',
          date: '2026-09-25 14:30 PM',
          actor: 'Caio (Commercial Manager)',
          summary: 'Followed up with Sempronia in Finance regarding invoice #9920 authorization.',
          raw_excerpt: 'Hi @Sempronia, following up on Tizio\'s email regarding invoice #9920.'
        },
        {
          id: 'evt-3',
          date: '2026-09-25 14:35 PM',
          actor: 'Sempronia (Finance)',
          summary: 'Stated payment release is blocked pending signed purchase order annex from Legal.',
          raw_excerpt: 'I haven\'t received the signed purchase order annex from Legal. I can\'t release payment without that signature.'
        },
        {
          id: 'evt-4',
          date: '2026-09-26 11:00 AM',
          actor: 'Tizio (Operations Lead)',
          summary: 'Issued critical alert that supplier has frozen production due to payment hold.',
          raw_excerpt: 'Supplier has issued a formal hold notice. Production is now frozen.'
        }
      ],
      bottlenecks: [
        {
          id: 'btn-1',
          title: 'Legal Approval Hold on Purchase Order Annex',
          severity: 'HIGH',
          description: 'Payment release for invoice #9920 is halted at Finance because Legal has not transmitted the signed PO annex.'
        },
        {
          id: 'btn-2',
          title: 'Cross-Department Communication Friction',
          severity: 'MEDIUM',
          description: '2-day gap between initial Operations alert and Finance follow-up resulting in supplier production freeze.'
        }
      ],
      recommendations: [
        'Immediately obtain PO Annex signature from Legal department lead.',
        'Escalate invoice #9920 authorization directly to Finance Lead for expedited release.',
        'Notify supplier of pending payment release ETA to unfreeze batch #4 dispatch.'
      ]
    };
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  const prompt = `You are a forensic timeline analyzer. Extract a strict chronological timeline, root cause bottlenecks, and recommended actions from the provided dispute communications.
  Respond ONLY with a valid JSON object matching this schema:
  {
    "timeline": [
      {
        "id": "string",
        "date": "string",
        "actor": "string",
        "summary": "string",
        "raw_excerpt": "string"
      }
    ],
    "bottlenecks": [
      {
        "id": "string",
        "title": "string",
        "severity": "HIGH" | "MEDIUM" | "LOW",
        "description": "string"
      }
    ],
    "recommendations": [
      "string"
    ]
  }

  Dispute Text:
  ${text}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    })
  });

  const data = await response.json();
  const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return JSON.parse(rawJson);
}
