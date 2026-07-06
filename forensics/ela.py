"""
forensics/ela.py
Error Level Analysis — detects JPEG tampering by analysing compression residuals.

Algorithm:
  1. Open the original image.
  2. Re-save it at a fixed JPEG quality (95) into a buffer.
  3. Compute the absolute pixel difference between original and re-compressed copy.
  4. Scale the difference for visibility and generate a false-colour heatmap.
  5. Derive a suspicion score from the mean residual and the fraction of
     high-residual pixels.
"""

import io
import os
import numpy as np
from PIL import Image, ImageChops, ImageFilter


# Pixels whose ELA residual (grayscale) exceeds this threshold are
# considered "high-residual" (potentially tampered).
_HIGH_RESIDUAL_THRESHOLD = 25          # 0-255 scale
_JPEG_QUALITY            = 95          # re-compression quality
_SCORE_WEIGHT_MEAN       = 0.50        # contribution from mean residual
_SCORE_WEIGHT_REGION     = 0.50        # contribution from tampered-region %


def _score_from_stats(mean_residual: float, tampered_pct: float) -> float:
    """Convert raw ELA stats into a 0-100 suspicion score."""
    # mean_residual typically ranges 0-40 for unedited images, 40-80+ for edited
    mean_component   = min(100.0, (mean_residual / 40.0) * 100.0)
    region_component = min(100.0, tampered_pct * 2.5)
    return round(_SCORE_WEIGHT_MEAN * mean_component +
                 _SCORE_WEIGHT_REGION * region_component, 1)


def _build_findings(score: float, mean_residual: float,
                    tampered_pct: float, is_png: bool) -> list:
    findings = []

    if is_png:
        findings.append({
            'level': 'info',
            'text': 'File is PNG (lossless) — ELA is most effective on JPEG. '
                    'Results are indicative only.'
        })

    if score >= 60:
        findings.append({
            'level': 'high',
            'text': f'High ELA residual detected (mean {mean_residual:.1f}/255). '
                    f'{tampered_pct:.1f}% of pixels show elevated compression '
                    f'error — consistent with prior image editing.'
        })
    elif score >= 30:
        findings.append({
            'level': 'medium',
            'text': f'Moderate ELA residual (mean {mean_residual:.1f}/255). '
                    f'{tampered_pct:.1f}% of pixels above threshold. '
                    f'Possible local edits or re-saves.'
        })
    else:
        findings.append({
            'level': 'ok',
            'text': f'Low compression residual (mean {mean_residual:.1f}/255). '
                    f'No significant ELA anomalies detected.'
        })
    return findings


def run_ela(file_path: str, ela_output_dir: str, scan_id: str) -> dict:
    """
    Run ELA on an image file.

    Returns:
        dict with keys: score, mean_residual, max_residual, tampered_pct,
                        heatmap_path (absolute), findings, available, error
    """
    result = {
        'available':      True,
        'score':          0.0,
        'mean_residual':  0.0,
        'max_residual':   0.0,
        'tampered_pct':   0.0,
        'heatmap_path':   None,
        'findings':       [],
        'error':          None,
    }

    try:
        original = Image.open(file_path).convert('RGB')
        is_png   = file_path.lower().endswith('.png')

        # Re-compress at known quality
        buf = io.BytesIO()
        original.save(buf, 'JPEG', quality=_JPEG_QUALITY)
        buf.seek(0)
        recompressed = Image.open(buf).convert('RGB')

        # Pixel-wise absolute difference
        diff = ImageChops.difference(original, recompressed)

        # Optionally amplify subtle differences
        diff_arr = np.array(diff, dtype=np.float32)

        mean_residual = float(diff_arr.mean())
        max_residual  = float(diff_arr.max())

        # Grayscale representation of the residual
        diff_gray = diff_arr.mean(axis=2)           # shape (H, W)

        # Scale to 0-255 for visualisation
        scale = 255.0 / max(max_residual, 1.0)
        diff_vis = np.clip(diff_gray * scale, 0, 255).astype(np.uint8)

        # Fraction of pixels exceeding threshold
        tampered_mask = diff_vis > _HIGH_RESIDUAL_THRESHOLD
        tampered_pct  = float(tampered_mask.sum() / tampered_mask.size * 100.0)

        # ── False-colour heatmap (dark-blue → cyan → red) ────────────────────
        # Map grayscale [0,255] to an orange-red heatmap
        r = np.clip(diff_vis * 2.0,          0, 255).astype(np.uint8)
        g = np.clip(diff_vis * 0.6,          0, 255).astype(np.uint8)
        b = np.clip(255 - diff_vis * 1.5,    0, 255).astype(np.uint8)
        heatmap_arr = np.stack([r, g, b], axis=2)
        heatmap_img = Image.fromarray(heatmap_arr)

        # Slight blur to smooth noise
        heatmap_img = heatmap_img.filter(ImageFilter.GaussianBlur(radius=1))

        # Save heatmap
        os.makedirs(ela_output_dir, exist_ok=True)
        heatmap_filename = f'{scan_id}.jpg'
        heatmap_abs      = os.path.join(ela_output_dir, heatmap_filename)
        heatmap_img.save(heatmap_abs, 'JPEG', quality=90)

        score = _score_from_stats(mean_residual, tampered_pct)

        result.update({
            'score':         score,
            'mean_residual': round(mean_residual, 2),
            'max_residual':  round(max_residual,  2),
            'tampered_pct':  round(tampered_pct,  2),
            'heatmap_path':  heatmap_abs,
            'findings':      _build_findings(score, mean_residual,
                                             tampered_pct, is_png),
        })

    except Exception as exc:
        result['available'] = False
        result['error']     = str(exc)
        result['findings']  = [{
            'level': 'info',
            'text':  f'ELA could not be performed: {exc}'
        }]

    return result
