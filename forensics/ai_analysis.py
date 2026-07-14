"""
forensics/ai_analysis.py
AI-powered medical document analysis via Google Gemini.

When GEMINI_API_KEY is not set the functions return graceful placeholder
responses — the full UI is built and works; it activates the moment a key
is added to the Railway environment variables.

KEY FIX: API key is read fresh on every call (os.environ.get inside the
function) so redeploying after adding the key always picks it up correctly.
Supports both google-generativeai >=0.7 (new genai.Client style) and
older versions (GenerativeModel style) with automatic fallback.
"""

import os
import json
import re

# ── Prompt templates ──────────────────────────────────────────────────────────

_SUMMARY_PROMPT = """\
You are a medical document analysis assistant. Analyze the following OCR text
from a medical document and return a JSON object with these exact keys:

  document_type  : string  — type of document (Prescription / Lab Report /
                             Discharge Summary / Radiology Report / Other)
  key_findings   : list    — up to 5 key medical findings or diagnoses (strings)
  abnormal_values: list    — each item is a dict with "test", "value", "normal_range",
                             "plain_english" (simple explanation for a patient)
  medications    : list    — medication names mentioned (strings)
  summary        : string  — 2–3 sentence plain-language summary a patient can understand

OCR Text:
{ocr_text}

Return ONLY valid JSON. No markdown, no explanation outside the JSON.
"""

_CHAT_SYSTEM = """\
You are the MediScan AI Assistant, helping users understand a medical document
that has already been analysed for authenticity.

=== FORENSIC CONTEXT ===
Forgery Risk Score : {forgery_score}/100
Verdict            : {verdict}
Top Findings       : {findings_summary}

=== DOCUMENT CONTENT (OCR excerpt) ===
{ocr_text}

=== AI MEDICAL SUMMARY ===
{medical_summary}

Your responsibilities:
• Answer questions about this specific document clearly and compassionately.
• Explain medical terms in simple language.
• Answer general medical knowledge questions to help the user understand their health.
• NEVER diagnose, prescribe, or give specific treatment advice.
• At the end of every response that touches on health decisions, add the
  line: "⚕ Always consult a qualified doctor before making any medical decision."
"""


# ── Core helper: generate text with robust SDK version handling ───────────────

def _generate(prompt: str) -> str:
    """
    Send a prompt to Gemini and return the response text.
    Reads API key fresh each call so Railway env vars are always current.
    Tries the new google-genai Client API first, falls back to the older
    google.generativeai GenerativeModel style.
    """
    api_key = os.environ.get('GEMINI_API_KEY', '').strip()
    if not api_key:
        raise RuntimeError('GEMINI_API_KEY not set')

    # ── Attempt 1: new google-genai SDK (>=1.0)  ─────────────────────────────
    try:
        import google.genai as genai  # noqa: F401
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt,
        )
        return response.text
    except (ImportError, AttributeError):
        pass  # fall through to legacy SDK

    # ── Attempt 2: legacy google-generativeai SDK (0.7–0.8) ─────────────────
    import google.generativeai as genai_legacy
    genai_legacy.configure(api_key=api_key)
    model = genai_legacy.GenerativeModel('gemini-1.5-flash')
    return model.generate_content(prompt).text


# ── Public API ────────────────────────────────────────────────────────────────

def analyze_medical_content(ocr_text: str) -> dict:
    """
    Extract and summarize medical information from OCR text using Gemini.
    Returns a structured dict regardless of whether the key is present.
    """
    _placeholder = {
        'available':       False,
        'document_type':   'Unknown',
        'key_findings':    [],
        'abnormal_values': [],
        'medications':     [],
        'summary':         (
            'AI medical analysis will activate once the Gemini API key is '
            'configured. Add GEMINI_API_KEY to your Railway environment variables.'
        ),
        'error': 'GEMINI_API_KEY not configured',
    }

    api_key = os.environ.get('GEMINI_API_KEY', '').strip()
    if not api_key:
        return _placeholder

    if not ocr_text or len(ocr_text.strip()) < 30:
        _placeholder['summary'] = ('Not enough text was extracted from this '
                                   'document to perform medical analysis.')
        _placeholder['error']   = 'Insufficient OCR text'
        return _placeholder

    try:
        prompt = _SUMMARY_PROMPT.format(ocr_text=ocr_text[:4000])
        text   = _generate(prompt).strip()

        # Strip markdown code fences if present
        text = re.sub(r'^```(?:json)?\s*', '', text)
        text = re.sub(r'\s*```$', '', text)

        data = json.loads(text)
        data['available'] = True
        return data

    except Exception as exc:
        _placeholder['available'] = False
        _placeholder['error']     = str(exc)
        _placeholder['summary']   = f'AI analysis encountered an error: {exc}'
        return _placeholder


def get_chat_response(question: str, report_context: dict) -> dict:
    """
    Generate an AI chat response about a specific scan report.

    Parameters
    ----------
    question       : user's question string
    report_context : the full findings dict stored with the scan

    Returns
    -------
    dict with keys: available (bool), response (str|None), message (str|None)
    """
    api_key = os.environ.get('GEMINI_API_KEY', '').strip()

    if not api_key:
        return {
            'available': False,
            'response':  None,
            'message':   (
                '🔑 AI Assistant is not yet activated. '
                'Add GEMINI_API_KEY to your Railway environment variables '
                'and redeploy to enable this feature.'
            ),
        }

    try:
        findings = report_context.get('all_findings', [])
        findings_summary = ' | '.join(
            f['text'][:120] for f in findings[:6]
        ) or 'No findings available.'

        ocr_text = (
            report_context.get('modules', {})
                          .get('ocr', {})
                          .get('text_sample', 'OCR text not available.')
        )
        medical_summary = (
            report_context.get('ai_summary', {})
                          .get('summary', 'Medical summary not available.')
        )

        system = _CHAT_SYSTEM.format(
            forgery_score    = report_context.get('forgery_score', 'N/A'),
            verdict          = report_context.get('verdict', 'N/A'),
            findings_summary = findings_summary,
            ocr_text         = ocr_text[:2000],
            medical_summary  = medical_summary,
        )

        full_prompt = f"{system}\n\nUser: {question}"
        answer = _generate(full_prompt)

        return {
            'available': True,
            'response':  answer,
            'message':   None,
        }

    except Exception as exc:
        return {
            'available': False,
            'response':  None,
            'message':   f'AI error: {str(exc)}',
        }
