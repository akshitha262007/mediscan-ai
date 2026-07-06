"""
routes/scan.py
File upload, forensic processing, result display, and PDF report download.
"""

import os
import json
import uuid
from datetime import datetime

from flask import (Blueprint, render_template, request, redirect,
                   url_for, flash, current_app, abort, send_file)
from flask_login import login_required, current_user

from models import db
from models.scan import Scan
from forensics.engine import run_forensics

scan_bp = Blueprint('scan', __name__)

ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'pdf'}


def _allowed(filename: str) -> bool:
    return ('.' in filename and
            filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS)


@scan_bp.route('/scan')
@login_required
def scan_page():
    return render_template('scan.html')


@scan_bp.route('/scan/upload', methods=['POST'])
@login_required
def upload():
    if 'file' not in request.files:
        flash('No file attached to the request.', 'error')
        return redirect(url_for('scan.scan_page'))

    file = request.files['file']

    if not file or file.filename == '':
        flash('No file selected.', 'error')
        return redirect(url_for('scan.scan_page'))

    if not _allowed(file.filename):
        flash('Unsupported file type. Please upload PDF, JPG, or PNG.', 'error')
        return redirect(url_for('scan.scan_page'))

    # ── Generate IDs and paths ────────────────────────────────────────────────
    scan_id = str(uuid.uuid4())
    ext     = file.filename.rsplit('.', 1)[1].lower()
    stored  = f'{scan_id}.{ext}'

    upload_dir = current_app.config['UPLOAD_FOLDER']
    ela_dir    = current_app.config['ELA_FOLDER']
    os.makedirs(upload_dir, exist_ok=True)
    os.makedirs(ela_dir,    exist_ok=True)

    file_path = os.path.join(upload_dir, stored)
    file.save(file_path)

    # ── Run forensics ─────────────────────────────────────────────────────────
    try:
        report = run_forensics(file_path, ext, scan_id, ela_dir)
    except Exception as exc:
        flash(f'Forensic analysis failed: {exc}', 'error')
        return redirect(url_for('scan.scan_page'))

    # ── Persist result ────────────────────────────────────────────────────────
    scan = Scan(
        id                = scan_id,
        user_id           = current_user.id,
        original_filename = file.filename,
        stored_filename   = stored,
        file_type         = 'pdf' if ext == 'pdf' else 'image',
        forgery_score     = report['forgery_score'],
        verdict           = report['verdict'],
        ela_score         = report['modules']['ela']['score'],
        metadata_score    = report['modules']['metadata']['score'],
        integrity_score   = report['modules']['integrity']['score'],
        ocr_score         = report['modules']['ocr']['score'],
        findings_json     = json.dumps(report),
        ela_heatmap_path  = report['modules']['ela'].get('heatmap_url') or '',
        file_hash         = report.get('file_hash', ''),
    )
    db.session.add(scan)
    db.session.commit()

    return redirect(url_for('scan.result', scan_id=scan_id))


@scan_bp.route('/scan/result/<scan_id>')
@login_required
def result(scan_id):
    scan = Scan.query.get_or_404(scan_id)

    if scan.user_id != current_user.id:
        abort(403)

    report = scan.findings   # property → parsed JSON

    return render_template('result.html', scan=scan, report=report)


@scan_bp.route('/scan/report/<scan_id>/pdf')
@login_required
def download_pdf(scan_id):
    scan = Scan.query.get_or_404(scan_id)
    if scan.user_id != current_user.id:
        abort(403)

    reports_dir = current_app.config['REPORTS_FOLDER']
    os.makedirs(reports_dir, exist_ok=True)
    pdf_path = os.path.join(reports_dir, f'{scan_id}.pdf')

    # Generate if not already cached
    if not os.path.exists(pdf_path):
        _generate_pdf(scan, pdf_path, current_app.config['ELA_FOLDER'])

    return send_file(
        pdf_path,
        as_attachment=True,
        download_name=f'MediScan_Report_{scan.original_filename}.pdf',
        mimetype='application/pdf',
    )


def _generate_pdf(scan: Scan, output_path: str, ela_dir: str):
    """Generate a forensic report PDF using ReportLab."""
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import cm
    from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer,
                                    Table, TableStyle, HRFlowable, Image as RLImage)
    from reportlab.lib.enums import TA_CENTER, TA_LEFT

    report = scan.findings
    doc    = SimpleDocTemplate(output_path, pagesize=A4,
                               leftMargin=2*cm, rightMargin=2*cm,
                               topMargin=2*cm, bottomMargin=2*cm)

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle('Title', parent=styles['Title'],
                                 fontSize=22, textColor=colors.HexColor('#0a0e1a'),
                                 spaceAfter=6)
    h2_style    = ParagraphStyle('H2', parent=styles['Heading2'],
                                 fontSize=13, textColor=colors.HexColor('#0a0e1a'),
                                 spaceBefore=14, spaceAfter=6)
    body_style  = ParagraphStyle('Body', parent=styles['Normal'],
                                 fontSize=10, leading=14)
    mono_style  = ParagraphStyle('Mono', parent=styles['Normal'],
                                 fontName='Courier', fontSize=8,
                                 textColor=colors.HexColor('#374151'))

    LEVEL_COLORS = {
        'high':   colors.HexColor('#ef4444'),
        'medium': colors.HexColor('#f59e0b'),
        'low':    colors.HexColor('#3b82f6'),
        'ok':     colors.HexColor('#22c55e'),
        'info':   colors.HexColor('#6b7280'),
    }

    VERDICT_COLORS = {
        'CLEAN':             colors.HexColor('#22c55e'),
        'SUSPICIOUS':        colors.HexColor('#f59e0b'),
        'HIGHLY_SUSPICIOUS': colors.HexColor('#ef4444'),
    }

    story = []

    # ── Header ────────────────────────────────────────────────────────────────
    story.append(Paragraph('MediScan AI', title_style))
    story.append(Paragraph('Forensic Document Analysis Report',
                            ParagraphStyle('Sub', parent=styles['Normal'],
                                           fontSize=12,
                                           textColor=colors.HexColor('#6b7280'),
                                           spaceAfter=4)))
    story.append(HRFlowable(width='100%', thickness=1,
                             color=colors.HexColor('#e5e7eb'), spaceAfter=12))

    # ── Scan metadata table ───────────────────────────────────────────────────
    meta_data = [
        ['File Name',    scan.original_filename],
        ['Scan ID',      scan.id],
        ['Analysed',     scan.uploaded_at.strftime('%d %b %Y %H:%M UTC')],
        ['Analysed by',  f'{scan.user.username} / {scan.user.organization or "—"}'],
        ['File Hash',    scan.file_hash[:32] + '…' if scan.file_hash else '—'],
    ]
    meta_table = Table(meta_data, colWidths=[4*cm, 13*cm])
    meta_table.setStyle(TableStyle([
        ('FONTNAME',    (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE',    (0, 0), (-1, -1), 9),
        ('TEXTCOLOR',   (0, 0), (0, -1), colors.HexColor('#374151')),
        ('ROWBACKGROUNDS', (0, 0), (-1, -1),
         [colors.HexColor('#f9fafb'), colors.white]),
        ('TOPPADDING',  (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 0.4*cm))

    # ── Verdict ───────────────────────────────────────────────────────────────
    verdict_color = VERDICT_COLORS.get(scan.verdict, colors.gray)
    verdict_label = scan.verdict_label
    verdict_para  = Paragraph(
        f'<b>Verdict: {verdict_label}</b>  —  '
        f'Forgery Risk Score: <b>{scan.forgery_score}/100</b>',
        ParagraphStyle('Verdict', parent=styles['Normal'],
                       fontSize=13, textColor=verdict_color, spaceAfter=8)
    )
    story.append(verdict_para)
    story.append(HRFlowable(width='100%', thickness=1,
                             color=colors.HexColor('#e5e7eb'), spaceAfter=10))

    # ── Module score table ────────────────────────────────────────────────────
    story.append(Paragraph('Module Scores', h2_style))
    modules = report.get('modules', {})
    mod_data = [['Module', 'Score', 'Rating', 'Available']]
    for name, m in [('Error Level Analysis', modules.get('ela', {})),
                    ('Metadata Analysis',    modules.get('metadata', {})),
                    ('File Integrity',       modules.get('integrity', {})),
                    ('OCR Consistency',      modules.get('ocr', {}))]:
        mod_data.append([
            name,
            f"{m.get('score', 0):.0f}/100",
            m.get('label', '—'),
            '✓' if m.get('available') else '✗',
        ])
    mod_table = Table(mod_data, colWidths=[6*cm, 3*cm, 3*cm, 5*cm])
    mod_table.setStyle(TableStyle([
        ('BACKGROUND',  (0, 0), (-1, 0), colors.HexColor('#0a0e1a')),
        ('TEXTCOLOR',   (0, 0), (-1, 0), colors.white),
        ('FONTNAME',    (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE',    (0, 0), (-1, -1), 9),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1),
         [colors.HexColor('#f9fafb'), colors.white]),
        ('TOPPADDING',  (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('GRID',        (0, 0), (-1, -1), 0.25, colors.HexColor('#e5e7eb')),
    ]))
    story.append(mod_table)
    story.append(Spacer(1, 0.4*cm))

    # ── ELA Heatmap ───────────────────────────────────────────────────────────
    heatmap_url = modules.get('ela', {}).get('heatmap_url')
    if heatmap_url:
        heatmap_abs = os.path.join(
            os.path.dirname(os.path.dirname(output_path)),  # project root
            'static', heatmap_url.replace('/', os.sep)
        )
        if os.path.exists(heatmap_abs):
            story.append(Paragraph('ELA Heatmap', h2_style))
            story.append(RLImage(heatmap_abs, width=12*cm, height=8*cm))
            story.append(Spacer(1, 0.3*cm))

    # ── All Findings ──────────────────────────────────────────────────────────
    story.append(Paragraph('Findings', h2_style))
    for f in report.get('all_findings', []):
        level = f.get('level', 'info')
        color = LEVEL_COLORS.get(level, colors.gray)
        bullet = {'high': '⚠ HIGH', 'medium': '▲ MEDIUM',
                  'low': '● LOW', 'ok': '✓ OK', 'info': 'ℹ INFO'}.get(level, level.upper())
        story.append(Paragraph(
            f'<font color="{color.hexval() if hasattr(color, "hexval") else "#6b7280"}">'
            f'<b>[{bullet}]</b></font>  {f.get("text", "")}',
            ParagraphStyle('Finding', parent=body_style, spaceAfter=4,
                           leftIndent=10)
        ))

    story.append(Spacer(1, 0.5*cm))
    story.append(HRFlowable(width='100%', thickness=0.5,
                             color=colors.HexColor('#e5e7eb'), spaceAfter=8))

    # DISCLAIMER
    disclaimer_style = ParagraphStyle(
        'Disclaimer', parent=body_style,
        fontSize=8, textColor=colors.HexColor('#6b7280'),
        borderColor=colors.HexColor('#f59e0b'),
        borderWidth=0.5, borderPadding=8,
        backColor=colors.HexColor('#fffbeb'),
        spaceAfter=6
    )
    story.append(Paragraph(
        '<b>IMPORTANT — FORENSIC SUPPORT TOOL ONLY</b>',
        ParagraphStyle('DisclaimerTitle', parent=body_style,
                       fontSize=9, textColor=colors.HexColor('#92400e'),
                       spaceAfter=4)
    ))
    story.append(Paragraph(
        'This report is generated by MediScan AI for investigative support purposes only. '
        'The findings, scores, and heatmaps presented herein are derived from automated '
        'digital forensic techniques (Error Level Analysis, metadata inspection, file '
        'integrity checks, and OCR consistency analysis) and <b>do not constitute legal '
        'evidence of fraud or document tampering</b>. This report should not be used as '
        'the sole basis for any clinical, legal, insurance, or administrative determination. '
        'All results must be independently reviewed and validated by a qualified forensic '
        'expert or authorised professional before any action is taken.',
        ParagraphStyle('Disclaimer', parent=body_style,
                       fontSize=8, textColor=colors.HexColor('#374151'),
                       spaceAfter=6)
    ))
    story.append(Paragraph(
        'The developers of MediScan AI (CREOVATORS OF SVCE) accept no liability for '
        'decisions made on the basis of this report. Use of this platform is subject '
        'to the Terms of Use and Privacy Policy available at the MediScan AI platform.',
        ParagraphStyle('Disclaimer2', parent=body_style,
                       fontSize=8, textColor=colors.HexColor('#6b7280'))
    ))

    story.append(Spacer(1, 0.3*cm))
    story.append(HRFlowable(width='100%', thickness=0.5,
                             color=colors.HexColor('#e5e7eb'), spaceAfter=6))
    story.append(Paragraph(
        f'Generated by MediScan AI  •  CREOVATORS OF SVCE  •  '
        f'{datetime.utcnow().strftime("%d %b %Y %H:%M")} UTC  •  '
        'Built with open-source technology (Flask, Pillow, Tesseract, ReportLab)',
        ParagraphStyle('Footer', parent=body_style,
                       fontSize=7, textColor=colors.HexColor('#9ca3af'),
                       alignment=TA_CENTER)
    ))

    doc.build(story)
