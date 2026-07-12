"""
routes/compare.py
Document comparison — upload two files, run forensics on both, display side by side.
"""

import os
import uuid

from flask import (Blueprint, render_template, request,
                   redirect, url_for, flash, current_app)
from flask_login import login_required, current_user

from forensics.engine import run_forensics

compare_bp = Blueprint('compare', __name__)

ALLOWED = {'jpg', 'jpeg', 'png', 'pdf'}


def _allowed(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED


@compare_bp.route('/compare')
@login_required
def compare_page():
    return render_template('compare.html')


@compare_bp.route('/compare/upload', methods=['POST'])
@login_required
def compare_upload():
    file_a = request.files.get('file_a')
    file_b = request.files.get('file_b')

    if not file_a or not file_b or file_a.filename == '' or file_b.filename == '':
        flash('Please upload both documents to compare.', 'error')
        return redirect(url_for('compare.compare_page'))

    if not _allowed(file_a.filename) or not _allowed(file_b.filename):
        flash('Unsupported file type. Upload PDF, JPG, or PNG.', 'error')
        return redirect(url_for('compare.compare_page'))

    upload_dir = current_app.config['UPLOAD_FOLDER']
    ela_dir    = current_app.config['ELA_FOLDER']
    os.makedirs(upload_dir, exist_ok=True)
    os.makedirs(ela_dir,    exist_ok=True)

    results = []
    for label, f in [('A', file_a), ('B', file_b)]:
        scan_id = str(uuid.uuid4())
        ext     = f.filename.rsplit('.', 1)[1].lower()
        path    = os.path.join(upload_dir, f'{scan_id}.{ext}')
        f.save(path)
        try:
            report = run_forensics(path, ext, scan_id, ela_dir)
        except Exception as exc:
            flash(f'Forensic analysis of Document {label} failed: {exc}', 'error')
            return redirect(url_for('compare.compare_page'))

        results.append({
            'label':    label,
            'filename': f.filename,
            'report':   report,
        })

    # Similarity insight
    score_diff = abs(results[0]['report']['forgery_score'] -
                     results[1]['report']['forgery_score'])
    if score_diff <= 5:
        similarity = 'Very similar risk profiles — documents may be versions of the same original.'
    elif score_diff <= 20:
        similarity = 'Moderate difference in risk scores — one document shows higher suspicion.'
    else:
        similarity = 'Significant difference in risk scores — documents have very different authenticity profiles.'

    return render_template(
        'compare.html',
        results    = results,
        similarity = similarity,
        compared   = True,
    )
