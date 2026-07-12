"""
routes/ai_chat.py
AI assistant chat endpoint — powered by Google Gemini.
"""

from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user

from models.scan import Scan
from forensics.ai_analysis import get_chat_response

chat_bp = Blueprint('chat', __name__)


@chat_bp.route('/chat/<scan_id>', methods=['POST'])
@login_required
def chat(scan_id):
    """
    POST JSON: { "question": "..." }
    Returns  : { "response": "...", "available": bool, "message": "..." }
    """
    scan = Scan.query.get_or_404(scan_id)
    if scan.user_id != current_user.id:
        return jsonify({'error': 'Forbidden'}), 403

    data     = request.get_json(silent=True) or {}
    question = (data.get('question') or '').strip()

    if not question:
        return jsonify({'error': 'No question provided'}), 400

    if len(question) > 1000:
        return jsonify({'error': 'Question too long (max 1000 chars)'}), 400

    report   = scan.findings   # parsed JSON via model property
    result   = get_chat_response(question, report)

    return jsonify(result)
