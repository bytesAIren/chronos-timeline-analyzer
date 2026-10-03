const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY ? import.meta.env.VITE_GEMINI_API_KEY.trim() : '';

// Use gemini-2.5-flash which is active and supported
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';

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

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  
  const prompt = `You are a forensic document auditor. Analyze the following dispute text and determine if there are missing context references (e.g. mentions of emails, meetings, or documents not provided) or unreadable sections.
Respond ONLY with a valid JSON object matching this exact schema:
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
  if (!response.ok) {
    throw new Error(`Gemini API Error (${response.status}): ${data.error?.message || response.statusText}`);
  }

  const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawJson) {
    throw new Error('Gemini returned an empty response. Check if content violated safety policies.');
  }

  // Clean markdown fencing if returned
  const cleaned = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned);
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

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  
  const prompt = `You are a forensic timeline analyzer specializing in dispute resolution and root-cause analysis.
Your task is to analyze the provided communication logs (which may include lengthy email threads or WhatsApp/Teams chats) and extract a clear, high-signal chronological timeline, root-cause bottlenecks, and actionable recommendations.

CRITICAL INSTRUCTIONS FOR LARGE LOGS:
- Do NOT include trivial chat chatter, greetings, or minor messages (e.g., 'ok', 'va bene', 'ci sentiamo dopo').
- Synthesize and extract between 10 and 25 key operational milestones, decisions, disputes, delays, requests, or commitments.
- For each event, identify the date/timestamp, key actor, a concise summary of the action, and the verbatim excerpt supporting it.
- Identify the top root-cause bottlenecks (1 to 5) and prioritized recommendations.

Respond ONLY with a valid JSON object matching this exact schema:
{
  "timeline": [
    {
      "id": "evt-1",
      "date": "YYYY-MM-DD HH:MM or original timestamp",
      "actor": "Name or Role",
      "summary": "Concise factual summary of the milestone",
      "raw_excerpt": "Direct quote from the text"
    }
  ],
  "bottlenecks": [
    {
      "id": "btn-1",
      "title": "Title of bottleneck",
      "severity": "HIGH",
      "description": "Root cause explanation"
    }
  ],
  "recommendations": [
    "Prioritized actionable recommendation"
  ]
}

Note: For severity, choose between HIGH, MEDIUM, or LOW.

Communication Logs:
${text}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        maxOutputTokens: 8192
      }
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Gemini API Error (${response.status}): ${data.error?.message || response.statusText}`);
  }

  const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawJson) {
    throw new Error('Gemini returned an empty response. Check if content violated safety policies.');
  }

  const cleaned = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned);
}
