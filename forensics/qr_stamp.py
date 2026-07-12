"""
forensics/qr_stamp.py
QR code validation, stamp detection, and signature region analysis.
Degrades gracefully when OpenCV or pyzbar is unavailable.
"""

import os
import numpy as np


def run_qr_stamp_analysis(file_path: str, file_type: str) -> dict:
    """
    Detect QR codes, circular stamps, and signature regions in medical documents.

    Returns
    -------
    dict with keys: available, score, findings, qr_codes,
                    stamps_detected, signature_detected, error
    """
    result = {
        'available':          False,
        'score':              0.0,
        'findings':           [],
        'qr_codes':           [],
        'stamps_detected':    False,
        'signature_detected': False,
        'error':              None,
    }

    if file_type == 'pdf':
        result['findings'] = [{
            'level': 'info',
            'text':  'QR / stamp analysis is available for image files (JPG, PNG) only.'
        }]
        return result

    try:
        from PIL import Image
        import cv2

        img        = Image.open(file_path).convert('RGB')
        img_array  = np.array(img)
        gray       = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        score      = 0.0

        # ── QR Code Detection ────────────────────────────────────────────────
        try:
            from pyzbar import pyzbar
            decoded = pyzbar.decode(img)
            if decoded:
                for obj in decoded:
                    data = obj.data.decode('utf-8', errors='ignore')
                    result['qr_codes'].append(data)
                result['findings'].append({
                    'level': 'ok',
                    'text':  (f'{len(decoded)} QR code(s) detected. '
                              f'Data: {", ".join(result["qr_codes"][:2])}')
                })
            else:
                result['findings'].append({
                    'level': 'info',
                    'text':  'No QR codes detected in this document.'
                })
        except ImportError:
            result['findings'].append({
                'level': 'info',
                'text':  'QR code scanning not available (pyzbar not installed).'
            })

        # ── Stamp / Seal Detection (circular Hough transform) ────────────────
        blurred = cv2.GaussianBlur(gray, (9, 9), 2)
        circles = cv2.HoughCircles(
            blurred, cv2.HOUGH_GRADIENT,
            dp=1.2, minDist=60,
            param1=80, param2=28,
            minRadius=18, maxRadius=160,
        )
        if circles is not None:
            result['stamps_detected'] = True
            n = len(circles[0])
            result['findings'].append({
                'level': 'ok',
                'text':  (f'Circular stamp / seal region detected '
                          f'({n} circular element(s) found). '
                          f'Stamp presence is a positive authenticity indicator.')
            })
        else:
            result['findings'].append({
                'level': 'low',
                'text':  ('No circular stamp or seal detected. '
                          'Many authentic medical documents carry an official seal.')
            })
            score += 20

        # ── Signature Region Detection ────────────────────────────────────────
        # Handwritten signatures tend to have high, irregular edge density in
        # the lower portion of the document.
        edges       = cv2.Canny(gray, 40, 140)
        h, w        = edges.shape
        lower_band  = edges[int(h * 0.65):, :]        # bottom 35 %
        edge_density = np.sum(lower_band > 0) / lower_band.size

        if edge_density > 0.018:
            result['signature_detected'] = True
            result['findings'].append({
                'level': 'ok',
                'text':  ('Potential signature region detected — '
                          'handwriting-like content found in the lower document area.')
            })
        else:
            result['findings'].append({
                'level': 'low',
                'text':  ('No clear signature region detected. '
                          'Verify the document carries an authorised signature.')
            })
            score += 20

        # ── Final score ───────────────────────────────────────────────────────
        result['score']     = min(100.0, round(score, 1))
        result['available'] = True

    except Exception as exc:
        result['error']    = str(exc)
        result['findings'] = [{
            'level': 'info',
            'text':  f'QR / stamp analysis could not complete: {exc}'
        }]

    return result
