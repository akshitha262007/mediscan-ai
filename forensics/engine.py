"""
forensics/engine.py
Forensic orchestrator — runs all modules and returns a unified ForensicReport.

Scoring weights:
  ELA        35%   (strongest signal for image tampering)
  Metadata   30%   (software traces, date manipulation)
  Integrity  20%   (file structure, size plausibility)
  OCR        15%   (text consistency, medical patterns)

Verdict thresholds:
  0  – 30  →  CLEAN
  31 – 60  →  SUSPICIOUS
  61 – 100 →  HIGHLY_SUSPICIOUS
"""

import os
import json

from forensics.ela       import run_ela
from forensics.metadata  import analyze_metadata
from forensics.ocr       import run_ocr
from forensics.integrity import run_integrity

_WEIGHTS = {
    'ela':       0.35,
    'metadata':  0.30,
    'integrity': 0.20,
    'ocr':       0.15,
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
    Run all forensic checks on *file_path* and return a unified report dict.

    Parameters
    ----------
    file_path      : absolute path to the uploaded file
    ext            : lowercase extension without dot  ('jpg', 'png', 'pdf')
    scan_id        : UUID string for this scan
    ela_output_dir : directory to write ELA heatmaps into

    Returns
    -------
    A dict that maps directly to what the result template expects.
    """
    file_type = 'pdf' if ext == 'pdf' else 'image'

    # ── Run modules ──────────────────────────────────────────────────────────
    ela_result       = run_ela(file_path, ela_output_dir, scan_id) \
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

    metadata_result  = analyze_metadata(file_path, file_type)
    integrity_result = run_integrity(file_path, file_type)
    ocr_result       = run_ocr(file_path, file_type)

    # ── Weighted aggregate score ──────────────────────────────────────────────
    ela_score       = ela_result['score']       if ela_result.get('available')       else 0.0
    metadata_score  = metadata_result['score']
    integrity_score = integrity_result['score']
    ocr_score       = ocr_result['score']       if ocr_result.get('available')       else 0.0

    # When ELA is unavailable (PDF), redistribute its weight to metadata
    if not ela_result.get('available'):
        ela_weight      = 0.0
        metadata_weight = _WEIGHTS['metadata'] + _WEIGHTS['ela']
    else:
        ela_weight      = _WEIGHTS['ela']
        metadata_weight = _WEIGHTS['metadata']

    forgery_score = int(round(
        ela_score       * ela_weight      +
        metadata_score  * metadata_weight +
        integrity_score * _WEIGHTS['integrity'] +
        ocr_score       * _WEIGHTS['ocr']
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
    ]:
        for f in module_result.get('findings', []):
            all_findings.append({**f, 'module': module_name})

    all_findings.sort(key=lambda f: _severity_rank(f['level']), reverse=True)

    # ── Assemble final report ─────────────────────────────────────────────────
    report = {
        'scan_id':       scan_id,
        'forgery_score': forgery_score,
        'verdict':       verdict,
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
                'score':       round(integrity_score, 1),
                'label':       _label_from_score(integrity_score),
                'available':   True,
                'findings':    integrity_result.get('findings', []),
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
        },
        'all_findings': all_findings,
        'file_hash':    integrity_result.get('file_hash', ''),
    }

    return report
