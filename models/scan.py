from models import db
from datetime import datetime
import json


class Scan(db.Model):
    __tablename__ = 'scans'

    id                = db.Column(db.String(36), primary_key=True)   # UUID
    user_id           = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    stored_filename   = db.Column(db.String(255), nullable=False)
    file_type         = db.Column(db.String(10))   # 'image' or 'pdf'
    uploaded_at       = db.Column(db.DateTime, default=datetime.utcnow)

    # Aggregate result
    forgery_score     = db.Column(db.Integer, default=0)   # 0–100
    verdict           = db.Column(db.String(25), default='UNKNOWN')
    # e.g.  CLEAN | SUSPICIOUS | HIGHLY_SUSPICIOUS

    # Per-module scores (0–100, higher = more suspicious)
    ela_score         = db.Column(db.Float, default=0)
    metadata_score    = db.Column(db.Float, default=0)
    integrity_score   = db.Column(db.Float, default=0)
    ocr_score         = db.Column(db.Float, default=0)

    # Full structured report (JSON blob)
    findings_json     = db.Column(db.Text, default='{}')

    # ELA heatmap relative path  e.g. "ela_outputs/<scan_id>.jpg"
    ela_heatmap_path  = db.Column(db.String(255), default='')

    # SHA-256 of the uploaded file
    file_hash         = db.Column(db.String(64), default='')

    # ── helpers ──────────────────────────────────────────────────────────────

    @property
    def findings(self):
        try:
            return json.loads(self.findings_json)
        except Exception:
            return {}

    @property
    def verdict_color(self):
        if self.verdict == 'CLEAN':
            return 'green'
        elif self.verdict == 'SUSPICIOUS':
            return 'amber'
        return 'red'

    @property
    def verdict_label(self):
        mapping = {
            'CLEAN': 'Clean',
            'SUSPICIOUS': 'Suspicious',
            'HIGHLY_SUSPICIOUS': 'Highly Suspicious',
        }
        return mapping.get(self.verdict, 'Unknown')

    @property
    def score_label(self):
        s = self.forgery_score
        if s <= 30:
            return 'Low Risk'
        elif s <= 60:
            return 'Medium Risk'
        return 'High Risk'
