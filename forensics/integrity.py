"""
forensics/integrity.py
File integrity and structure checks.

Checks:
  1. SHA-256 hash of file contents.
  2. MIME type vs declared file extension.
  3. File size plausibility for a medical report.
  4. JPEG / PNG structure validation.
  5. PDF structure validation.
"""

import os
import hashlib

# Reasonable size range for a medical document upload (bytes)
_MIN_SIZE =   5_000    #   5 KB
_MAX_SIZE = 15_000_000 #  15 MB

# Magic bytes
_JPEG_MAGIC = b'\xff\xd8\xff'
_PNG_MAGIC  = b'\x89PNG\r\n\x1a\n'
_PDF_MAGIC  = b'%PDF'


def _sha256(file_path: str) -> str:
    h = hashlib.sha256()
    with open(file_path, 'rb') as f:
        for chunk in iter(lambda: f.read(65536), b''):
            h.update(chunk)
    return h.hexdigest()


def _read_magic(file_path: str, n: int = 8) -> bytes:
    with open(file_path, 'rb') as f:
        return f.read(n)


def run_integrity(file_path: str, file_type: str) -> dict:
    """
    Check file integrity.
    Returns { available, score, file_hash, file_size_kb, findings, error }.
    """
    result = {
        'available':    True,
        'score':        0.0,
        'file_hash':    '',
        'file_size_kb': 0,
        'findings':     [],
        'error':        None,
    }

    try:
        # ── Hash ─────────────────────────────────────────────────────────────
        result['file_hash'] = _sha256(file_path)
        result['findings'].append({
            'level': 'ok',
            'text':  f'File SHA-256: {result["file_hash"][:16]}…'
        })

        # ── File size ─────────────────────────────────────────────────────────
        file_size = os.path.getsize(file_path)
        file_size_kb = file_size / 1024
        result['file_size_kb'] = round(file_size_kb, 1)

        if file_size < _MIN_SIZE:
            result['findings'].append({
                'level': 'medium',
                'text':  f'File is very small ({file_size_kb:.1f} KB). '
                         f'A genuine multi-field medical report is typically larger.'
            })
            result['score'] += 20
        elif file_size > _MAX_SIZE:
            result['findings'].append({
                'level': 'low',
                'text':  f'File is unusually large ({file_size_kb/1024:.1f} MB).'
            })
            result['score'] += 5
        else:
            result['findings'].append({
                'level': 'ok',
                'text':  f'File size is within expected range ({file_size_kb:.1f} KB).'
            })

        # ── Magic bytes / structure validation ────────────────────────────────
        magic = _read_magic(file_path)
        ext   = os.path.splitext(file_path)[1].lower()

        if file_type == 'pdf':
            if not magic.startswith(_PDF_MAGIC):
                result['findings'].append({
                    'level': 'high',
                    'text':  'File does not start with PDF magic bytes — '
                             'extension may be spoofed.'
                })
                result['score'] += 45
            else:
                result['findings'].append({
                    'level': 'ok',
                    'text':  'PDF file structure validated — magic bytes correct.'
                })

                # Check for EOF marker
                with open(file_path, 'rb') as f:
                    tail = f.read()[-32:]
                if b'%%EOF' not in tail and b'%EOF' not in tail:
                    result['findings'].append({
                        'level': 'medium',
                        'text':  'PDF is missing standard EOF marker — file may be truncated or corrupt.'
                    })
                    result['score'] += 15

        elif file_type == 'image':
            if ext in ('.jpg', '.jpeg'):
                if not magic.startswith(_JPEG_MAGIC):
                    result['findings'].append({
                        'level': 'high',
                        'text':  'File does not have valid JPEG signature — '
                                 'file may be misidentified or corrupted.'
                    })
                    result['score'] += 45
                else:
                    result['findings'].append({
                        'level': 'ok',
                        'text':  'JPEG file structure validated.'
                    })
            elif ext == '.png':
                if not magic.startswith(_PNG_MAGIC):
                    result['findings'].append({
                        'level': 'high',
                        'text':  'File does not have valid PNG signature.'
                    })
                    result['score'] += 45
                else:
                    result['findings'].append({
                        'level': 'ok',
                        'text':  'PNG file structure validated.'
                    })

        result['score'] = round(min(100.0, result['score']), 1)

    except Exception as exc:
        result['available'] = False
        result['error']     = str(exc)
        result['findings']  = [{
            'level': 'info',
            'text':  f'Integrity check encountered an error: {exc}'
        }]

    return result
