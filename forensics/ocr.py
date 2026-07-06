"""
forensics/ocr.py
OCR extraction and basic text-consistency analysis.

Uses pytesseract (wrapper around Tesseract).  If Tesseract is not available
the module degrades gracefully — the scan continues without OCR.
"""

import os
import re
import shutil

# Production servers (Railway/Render) install Tesseract via apt/nixpacks — it's
# on PATH. The env var lets ops override. On Windows dev we fall back to the
# known install location.
_TESS_ENV = os.environ.get('TESSERACT_PATH', '')
TESSERACT_PATH = (
    _TESS_ENV if _TESS_ENV
    else r'C:\Program Files\Tesseract-OCR\tesseract.exe'
)

# Regex patterns for common medical document fields
_PATTERNS = {
    'date':        re.compile(
        r'\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}-\d{2}-\d{2})\b'
    ),
    'patient_id':  re.compile(r'\b(MR|PT|PID|ID)[\s:#\-]?\d{4,12}\b', re.I),
    'doctor_reg':  re.compile(r'\b(REG|DR|MCI|NMC)[\s:#\-]?\d{4,10}\b', re.I),
    'phone':       re.compile(r'\b(\+91|0)?[6-9]\d{9}\b'),
}

# Minimum word count expected in a real medical report
_MIN_WORD_COUNT = 20


def _tesseract_available() -> bool:
    """Return True if Tesseract can be found — either on PATH or at the known path."""
    if shutil.which('tesseract'):          # Linux/Mac: on PATH
        return True
    return os.path.isfile(TESSERACT_PATH)  # Windows: hardcoded path


def _extract_text_from_image(file_path: str) -> str:
    import pytesseract
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH
    from PIL import Image
    img = Image.open(file_path)
    return pytesseract.image_to_string(img, lang='eng')


def _extract_text_from_pdf(file_path: str) -> str:
    """Extract text from PDF — try pypdf first, then image-based OCR on page 1."""
    text = ''
    try:
        try:
            from pypdf import PdfReader
        except ImportError:
            from PyPDF2 import PdfReader

        reader = PdfReader(file_path)
        for page in reader.pages:
            text += (page.extract_text() or '')
    except Exception:
        pass

    # If no text extracted (scanned PDF), fall back to image OCR on page 1
    if not text.strip() and _tesseract_available():
        try:
            from pdf2image import convert_from_path  # optional dependency
            images = convert_from_path(file_path, first_page=1, last_page=1)
            if images:
                import pytesseract
                pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH
                text = pytesseract.image_to_string(images[0], lang='eng')
        except Exception:
            pass

    return text


def _analyse_text(text: str) -> dict:
    """Derive a suspicion score and findings from extracted text."""
    findings = []
    score    = 0.0

    words      = text.split()
    word_count = len(words)

    # 1. Volume check
    if word_count < _MIN_WORD_COUNT:
        findings.append({
            'level': 'medium',
            'text':  f'Extracted text is unusually short ({word_count} words). '
                     f'Document may be mostly graphical or text may have been removed.'
        })
        score += 20
    else:
        findings.append({
            'level': 'ok',
            'text':  f'Text extraction successful — {word_count} words extracted.'
        })

    # 2. Medical pattern presence
    matched_patterns = []
    for name, pattern in _PATTERNS.items():
        if pattern.search(text):
            matched_patterns.append(name)

    if matched_patterns:
        findings.append({
            'level': 'ok',
            'text':  f'Medical document patterns found: {", ".join(matched_patterns)}.'
        })
    else:
        findings.append({
            'level': 'low',
            'text':  'No standard medical field patterns (date, patient ID, '
                     'doctor registration) found in extracted text.'
        })
        score += 10

    # 3. All-caps anomaly (sometimes indicates copy-pasted or synthesised text)
    if word_count > 30:
        caps_words  = [w for w in words if w.isupper() and len(w) > 3]
        caps_ratio  = len(caps_words) / word_count
        if caps_ratio > 0.4:
            findings.append({
                'level': 'low',
                'text':  f'{caps_ratio*100:.0f}% of words are ALL-CAPS — '
                         f'unusual formatting detected.'
            })
            score += 8

    return {
        'score':      round(min(100.0, score), 1),
        'findings':   findings,
        'word_count': word_count,
        'text_sample': text[:400].strip() if text.strip() else ''
    }


def run_ocr(file_path: str, file_type: str) -> dict:
    """
    Entry point for OCR module.
    Returns { available, score, findings, word_count, text_sample, error }.
    """
    result = {
        'available':   True,
        'score':       0.0,
        'findings':    [],
        'word_count':  0,
        'text_sample': '',
        'error':       None,
    }

    if not _tesseract_available():
        result['available'] = False
        result['findings']  = [{
            'level': 'info',
            'text':  'Tesseract OCR not found — OCR analysis skipped.'
        }]
        return result

    try:
        if file_type == 'pdf':
            text = _extract_text_from_pdf(file_path)
        else:
            text = _extract_text_from_image(file_path)

        analysis = _analyse_text(text)
        result.update(analysis)

    except Exception as exc:
        result['available'] = False
        result['error']     = str(exc)
        result['findings']  = [{
            'level': 'info',
            'text':  f'OCR encountered an error: {exc}'
        }]

    return result
