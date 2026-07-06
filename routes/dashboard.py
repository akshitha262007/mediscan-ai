"""
routes/dashboard.py
User dashboard — scan history and summary stats.
"""

from flask import Blueprint, render_template, abort
from flask_login import login_required, current_user

from models.scan import Scan

dashboard_bp = Blueprint('dashboard', __name__)


@dashboard_bp.route('/dashboard')
@login_required
def dashboard():
    scans = (Scan.query
             .filter_by(user_id=current_user.id)
             .order_by(Scan.uploaded_at.desc())
             .all())

    total   = len(scans)
    flagged = sum(1 for s in scans if s.verdict in ('SUSPICIOUS', 'HIGHLY_SUSPICIOUS'))
    clean   = sum(1 for s in scans if s.verdict == 'CLEAN')
    avg_score = (round(sum(s.forgery_score for s in scans) / total, 1)
                 if total else 0)

    stats = {
        'total':     total,
        'flagged':   flagged,
        'clean':     clean,
        'avg_score': avg_score,
    }

    return render_template('dashboard.html', scans=scans, stats=stats)


@dashboard_bp.route('/privacy')
def privacy():
    """Public-facing privacy policy — no login required."""
    return render_template('privacy.html')
