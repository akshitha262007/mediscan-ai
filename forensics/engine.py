"""
forensics/engine.py
Forensic orchestrator — runs all modules and returns a unified ForensicReport.

Scoring weights (v2.0):
  ELA        30%   (strongest signal for image tampering)
  Metadata   25%   (software traces, date manipulation)
  Integrity  20%   (file structure, size plausibility)
  OCR        15%   (text consistency, medical patterns)
  QR/Stamp   10%   (seal and signature presence)

Verdict thresholds:
  0  – 30  →  CLEAN
  31 – 60  →  SUSPICIOUS
  61 – 100 →  HIGHLY_SUSPICIOUS
"""

import os

from forensics.ela        import run_ela
from forensics.metadata   import analyze_metadata
from forensics.ocr        import run_ocr
from forensics.integrity  import run_integrity
from forensics.qr_stamp   import run_qr_stamp_analysis
from forensics.ai_analysis import analyze_medical_content

_WEIGHTS = {
    'ela':       0.30,
    'metadata':  0.25,
    'integrity': 0.20,
    'ocr':       0.15,
    'qr_stamp':  0.10,
}


def _verdict(score: int) -> str:
    if score <= 30:
        return 'CLEAN'
    if score <= 60:
        return 'SUSPICIOUS'
    return 'HIGHLY_SUSPICIOUS'


def _severity_rank(level: str) -> int:
    return {'high': 3, 'medium': 2, 'low': 1, 'ok': 0, 'info': 0}.get(level, 0)


def _label_from_score(score: float) -> str:
    if score <= 30:
        return 'Low'
    if score <= 60:
        return 'Medium'
    return 'High'


def run_forensics(file_path: str, ext: str, scan_id: str,
                  ela_output_dir: str) -> dict:
    """
    Run all forensic checks and return a unified report dict.
    """
    file_type = 'pdf' if ext == 'pdf' else 'image'

    # ── Run modules ───────────────────────────────────────────────────────────
    ela_result = run_ela(file_path, ela_output_dir, scan_id) \
                 if file_type == 'image' \
                 else {
                     'available':     False,
                     'score':         0.0,
                     'mean_residual': 0.0,
                     'max_residual':  0.0,
                     'tampered_pct':  0.0,
                     'heatmap_path':  None,
                     'findings':      [{'level': 'info',
                                        'text':  'ELA is not performed on PDF files. '
                                                 'Upload a JPEG or PNG for pixel-level analysis.'}],
                     'error':         None,
                 }

    metadata_result   = analyze_metadata(file_path, file_type)
    integrity_result  = run_integrity(file_path, file_type)
    ocr_result        = run_ocr(file_path, file_type)
    qr_stamp_result   = run_qr_stamp_analysis(file_path, file_type)

    # ── AI Medical Analysis ───────────────────────────────────────────────────
    ocr_text     = ocr_result.get('text_sample', '')
    ai_summary   = analyze_medical_content(ocr_text)

    # ── Weighted aggregate score ──────────────────────────────────────────────
    ela_score       = ela_result['score']      if ela_result.get('available')      else 0.0
    metadata_score  = metadata_result['score']
    integrity_score = integrity_result['score']
    ocr_score       = ocr_result['score']      if ocr_result.get('available')      else 0.0
    qr_score        = qr_stamp_result['score'] if qr_stamp_result.get('available') else 0.0

    # When ELA is unavailable (PDF), redistribute its weight
    if not ela_result.get('available'):
        ela_w  = 0.0
        meta_w = _WEIGHTS['metadata'] + _WEIGHTS['ela']
    else:
        ela_w  = _WEIGHTS['ela']
        meta_w = _WEIGHTS['metadata']

    forgery_score = int(round(
        ela_score       * ela_w                  +
        metadata_score  * meta_w                 +
        integrity_score * _WEIGHTS['integrity']  +
        ocr_score       * _WEIGHTS['ocr']        +
        qr_score        * _WEIGHTS['qr_stamp']
    ))

    verdict = _verdict(forgery_score)

    # ── Heatmap URL (relative to static/) ────────────────────────────────────
    heatmap_rel = None
    if ela_result.get('heatmap_path'):
        heatmap_rel = 'ela_outputs/' + os.path.basename(ela_result['heatmap_path'])

    # ── Collate all findings, sorted by severity ──────────────────────────────
    all_findings = []
    for module_name, module_result in [
        ('ELA',       ela_result),
        ('Metadata',  metadata_result),
        ('Integrity', integrity_result),
        ('OCR',       ocr_result),
        ('QR/Stamp',  qr_stamp_result),
    ]:
        for f in module_result.get('findings', []):
            all_findings.append({**f, 'module': module_name})

    all_findings.sort(key=lambda f: _severity_rank(f['level']), reverse=True)

    # ── Final report ──────────────────────────────────────────────────────────
    return {
        'scan_id':       scan_id,
        'forgery_score': forgery_score,
        'verdict':       verdict,
        'ai_summary':    ai_summary,
        'modules': {
            'ela': {
                'score':         round(ela_score, 1),
                'label':         _label_from_score(ela_score),
                'available':     ela_result.get('available', False),
                'findings':      ela_result.get('findings', []),
                'mean_residual': ela_result.get('mean_residual', 0),
                'tampered_pct':  ela_result.get('tampered_pct', 0),
                'heatmap_url':   heatmap_rel,
            },
            'metadata': {
                'score':    round(metadata_score, 1),
                'label':    _label_from_score(metadata_score),
                'available': True,
                'findings': metadata_result.get('findings', []),
                'raw_meta': metadata_result.get('metadata', {}),
            },
            'integrity': {
                'score':        round(integrity_score, 1),
                'label':        _label_from_score(integrity_score),
                'available':    True,
                'findings':     integrity_result.get('findings', []),
                'file_size_kb': integrity_result.get('file_size_kb', 0),
            },
            'ocr': {
                'score':       round(ocr_score, 1),
                'label':       _label_from_score(ocr_score),
                'available':   ocr_result.get('available', False),
                'findings':    ocr_result.get('findings', []),
                'word_count':  ocr_result.get('word_count', 0),
                'text_sample': ocr_result.get('text_sample', ''),
            },
            'qr_stamp': {
                'score':              round(qr_score, 1),
                'label':              _label_from_score(qr_score),
                'available':          qr_stamp_result.get('available', False),
                'findings':           qr_stamp_result.get('findings', []),
                'qr_codes':           qr_stamp_result.get('qr_codes', []),
                'stamps_detected':    qr_stamp_result.get('stamps_detected', False),
                'signature_detected': qr_stamp_result.get('signature_detected', False),
            },
        },
        'all_findings': all_findings,
        'file_hash':    integrity_result.get('file_hash', ''),
    }
