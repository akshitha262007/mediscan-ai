"""
forensics/metadata.py
Metadata extraction and anomaly analysis.

For images : reads EXIF tags via Pillow.
For PDFs   : reads document info via PyPDF2.

Returns a structured dict with a suspicion score and a list of findings.
"""

import os
from datetime import datetime

# ── EXIF tag IDs we care about ────────────────────────────────────────────────
_TAG_SOFTWARE       = 305
_TAG_DATETIME       = 306   # last-modified
_TAG_DATETIME_ORIG  = 36867 # original capture time
_TAG_MAKE           = 271
_TAG_MODEL          = 272
_TAG_GPS_INFO       = 34853

# Tools that suggest the image was edited (not captured from a scanner/camera)
_EDITING_KEYWORDS = [
    'photoshop', 'gimp', 'paint', 'lightroom', 'affinity',
    'canva', 'pixlr', 'preview', 'inkscape', 'illustrator',
    'coreldraw', 'capture one', 'darktable'
]


def _flag_editing_tool(text: str) -> bool:
    t = text.lower()
    return any(kw in t for kw in _EDITING_KEYWORDS)


def _parse_exif_date(date_str: str):
    """Parse EXIF date string 'YYYY:MM:DD HH:MM:SS' → datetime or None."""
    try:
        return datetime.strptime(date_str, '%Y:%m:%d %H:%M:%S')
    except Exception:
        return None


def _analyze_image(file_path: str) -> dict:
    """Extract and analyse EXIF metadata from an image file."""
    from PIL import Image
    from PIL.ExifTags import TAGS

    findings = []
    score    = 0.0

    try:
        img      = Image.open(file_path)
        raw_exif = img._getexif() or {}
    except Exception as exc:
        return {
            'score':    0.0,
            'findings': [{'level': 'info',
                          'text':  f'Could not read image EXIF: {exc}'}],
            'metadata': {}
        }

    meta = {}
    for tag_id, value in raw_exif.items():
        tag_name = TAGS.get(tag_id, tag_id)
        meta[tag_name] = value

    # 1. Software / editing tool
    software = str(raw_exif.get(_TAG_SOFTWARE, '')).strip()
    if software:
        if _flag_editing_tool(software):
            findings.append({
                'level': 'high',
                'text':  f'Image editing software detected in metadata: "{software}". '
                         f'Medical documents should originate from scanners or cameras.'
            })
            score += 45
        else:
            findings.append({
                'level': 'ok',
                'text':  f'Software field: "{software}"'
            })
    else:
        findings.append({
            'level': 'medium',
            'text':  'Software field is absent — metadata may have been stripped.'
        })
        score += 15

    # 2. Date consistency
    dt_original = _parse_exif_date(str(raw_exif.get(_TAG_DATETIME_ORIG, '')))
    dt_modified = _parse_exif_date(str(raw_exif.get(_TAG_DATETIME, '')))

    if dt_original and dt_modified:
        if dt_modified > dt_original:
            delta_days = (dt_modified - dt_original).days
            findings.append({
                'level': 'medium',
                'text':  f'Image was modified {delta_days} day(s) after original '
                         f'capture ({dt_original.date()} → {dt_modified.date()}).'
            })
            score += min(25, delta_days * 2)
    elif not dt_original and not dt_modified:
        findings.append({
            'level': 'low',
            'text':  'No timestamp metadata found in image.'
        })
        score += 5

    # 3. GPS data in a medical document
    if _TAG_GPS_INFO in raw_exif:
        findings.append({
            'level': 'low',
            'text':  'GPS coordinates embedded in image — unusual for a medical document.'
        })
        score += 8

    # 4. Camera make/model (presence is actually a good sign for scans)
    make  = str(raw_exif.get(_TAG_MAKE,  '')).strip()
    model = str(raw_exif.get(_TAG_MODEL, '')).strip()
    if make or model:
        findings.append({
            'level': 'ok',
            'text':  f'Capture device: {make} {model}'.strip()
        })

    if not findings:
        findings.append({'level': 'ok', 'text': 'No metadata anomalies detected.'})

    return {
        'score':    round(min(100.0, score), 1),
        'findings': findings,
        'metadata': {k: str(v)[:120] for k, v in meta.items()
                     if isinstance(v, (str, int, float, bytes))}
    }


def _analyze_pdf(file_path: str) -> dict:
    """Extract and analyse metadata from a PDF file."""
    try:
        from pypdf import PdfReader
    except ImportError:
        try:
            from PyPDF2 import PdfReader
        except ImportError:
            return {
                'score':    0.0,
                'findings': [{'level': 'info',
                              'text':  'PyPDF2/pypdf not installed — PDF metadata skipped.'}],
                'metadata': {}
            }

    findings = []
    score    = 0.0

    try:
        reader = PdfReader(file_path)
        info   = reader.metadata or {}
    except Exception as exc:
        return {
            'score':    0.0,
            'findings': [{'level': 'info', 'text': f'Could not read PDF metadata: {exc}'}],
            'metadata': {}
        }

    meta = {k.lstrip('/'): str(v)[:120] for k, v in info.items()}

    producer = meta.get('Producer', '')
    creator  = meta.get('Creator',  '')
    author   = meta.get('Author',   '')

    # 1. Producer / Creator
    combined = (producer + ' ' + creator).lower()
    if _flag_editing_tool(combined):
        findings.append({
            'level': 'high',
            'text':  f'PDF produced by image/document editing software: '
                     f'"{producer or creator}". Legitimate medical reports are '
                     f'typically generated by clinical software.'
        })
        score += 40
    elif producer or creator:
        findings.append({
            'level': 'ok',
            'text':  f'PDF producer: "{producer or creator}"'
        })
    else:
        findings.append({
            'level': 'medium',
            'text':  'PDF Producer/Creator field is empty — metadata may have been removed.'
        })
        score += 15

    # 2. Creation vs modification date
    creation_date = meta.get('CreationDate', '')
    mod_date      = meta.get('ModDate',      '')

    if creation_date and mod_date and creation_date != mod_date:
        findings.append({
            'level': 'medium',
            'text':  f'PDF was modified after creation '
                     f'(Created: {creation_date[:16]}  |  Modified: {mod_date[:16]}).'
        })
        score += 25
    elif not creation_date:
        findings.append({
            'level': 'low',
            'text':  'No creation date found in PDF metadata.'
        })
        score += 5

    # 3. Author
    if author:
        findings.append({'level': 'ok', 'text': f'Document author: "{author}"'})
    else:
        findings.append({'level': 'low', 'text': 'No author field in PDF metadata.'})
        score += 5

    # 4. Number of pages
    try:
        num_pages = len(reader.pages)
        findings.append({'level': 'ok', 'text': f'Document contains {num_pages} page(s).'})
    except Exception:
        pass

    if not findings:
        findings.append({'level': 'ok', 'text': 'No PDF metadata anomalies detected.'})

    return {
        'score':    round(min(100.0, score), 1),
        'findings': findings,
        'metadata': meta
    }


def analyze_metadata(file_path: str, file_type: str) -> dict:
    """
    Entry point.  file_type is 'image' or 'pdf'.
    Returns { score, findings, metadata }.
    """
    if file_type == 'pdf':
        return _analyze_pdf(file_path)
    return _analyze_image(file_path)
